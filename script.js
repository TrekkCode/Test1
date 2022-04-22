var transformRequest = (url, resourceType) => {
  var isMapboxRequest =
    url.slice(8, 22) === "api.mapbox.com" ||
    url.slice(10, 26) === "tiles.mapbox.com";
  return {
    url: isMapboxRequest
      ? url.replace("?", "?pluginName=sheetMapper&")
      : url
  };
};
 
mapboxgl.accessToken = 'pk.eyJ1IjoicmZvdiIsImEiOiJja3cxaDNsNmo1OXI1MnVvMDE3MHIyYXAwIn0.zJP6i7HFt95dAWiKbsdiow';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rfov/cl01ici6u000014pglnawwem1',
    bounds: [-108.1, 39.01822070877748, -106.44816482409105, 39.76],
    maxBounds: [-108.1, 39.01822070877748, -106.44816482409105, 39.76],
    //left, bottom, right, top
    transformRequest: transformRequest
});

var nav = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      });

map.addControl(nav, "bottom-right");



$(document).ready(function () {
  $.ajax({
    type: "GET",
    url: 'https://docs.google.com/spreadsheets/d/1EuKui2q6Fdu-uLubAmPEVtazQ12jRpp4XAlLgLE-g-s/gviz/tq?tqx=out:csv&sheet=Sheet1',
    dataType: "text",
    success: function (csvData) { makeGeoJSON(csvData); }
  });



  function makeGeoJSON(csvData) {
    csv2geojson.csv2geojson(csvData, {
      latfield: 'lat',
      lonfield: 'long',
      delimiter: ','
    }, function (err, data) {
      map.on('load', function () {

        map.addLayer({
          'id': 'rfovProjects',
          'type': 'circle',
          'source': {
            'type': 'geojson',
            'data': data
          },
          'paint': {
            'circle-radius': 4,
            'circle-color': "#dcc04c",
            'circle-stroke-color': "#005c51",
            'circle-stroke-width': 2
          }
        });

      });

    });
  };
});

map.on('mouseenter', 'rfovProjects', function () {
  map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'rfovProjects', function () {
  map.getCanvas().style.cursor = '';
});


map.on('click', function(e) {

    if(!e.originalEvent.defaultPrevented) {
      e.originalEvent.preventDefault();
    }

    var features = map.queryRenderedFeatures(e.point, {
        layers: ['rfovProjects']
    });

    if (!features.length) {
        return;
    }

    var feature = features[0];

    var popupContent = '<h3 style="display:inline">' + feature.properties.project + '</h3><br><p style="display:inline"><b>' + feature.properties.date
    popupContent += feature.properties.time ? '</b>, ' + feature.properties.time : '</b>' 
    popupContent +=  '<br>' + feature.properties.description + '<br><i>' + feature.properties.categories + '</i></p><br> <a href=" ' + feature.properties.link + ' " target="_blank" rel="noopener noreferrer">More Info & Register</a> </p>'

    var popup = new mapboxgl.Popup({ offset: [0, 0] })
        .setLngLat(e.lngLat)
        .setHTML(popupContent)
        .addTo(map);
});


//basemap toggles
var tRadio = document.getElementById('topoRadio');
tRadio.addEventListener('change', function() {
  if (this.checked) {
    map.setLayoutProperty('mapbox-satellite', 'visibility', 'none');
  }
});

var iRadio = document.getElementById('imageryRadio');
iRadio.addEventListener('change', function() {
  if (this.checked) {
    map.setLayoutProperty('mapbox-satellite', 'visibility', 'visible');
  }
});
//

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,

    bbox: [-107.89747848205818, 39.01822070877748, -106.44816482409105, 39.76],

    mapboxgl: mapboxgl,

    flyTo: {
      zoom: 12,
      easing: function(t) {
        return t;
      }
    },

    marker: false

  })
);


var filters = {};

function updateFilters() {
  var compositeFilter = ['all'];
  for (let filterValue in filters) {
    if (filters[filterValue]) {
      compositeFilter.push(['==', ['get', filterValue], 'Y']);
    }
  }
  if (compositeFilter.length > 1)
    map.setFilter('rfovProjects', compositeFilter);
  else {
    map.setFilter('rfovProjects', null);
  }
}

var checkbox = document.getElementById('srBox');
checkbox.addEventListener('change', function() {
  filters['SR'] = this.checked;
  updateFilters();
});

var checkbox = document.getElementById('hlBox');
checkbox.addEventListener('change', function() {
  filters['HL'] = this.checked;
  updateFilters();
});

var checkbox = document.getElementById('ovBox');
checkbox.addEventListener('change', function() {
  filters['OV'] = this.checked;
  updateFilters();
});