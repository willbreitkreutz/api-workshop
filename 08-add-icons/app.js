// SET UP THE MAP

var mapProjection = new ol.proj.Projection({
  code: 'EPSG:3857',
  extent: [-20037508, -20037508, 20037508, 20037508.34]
})
var geoProjection = new ol.proj.Projection({
  code: 'EPSG:4326',
  extent: [-180, -180, 180, 180]
})

var map = new ol.Map({
  layers:[
    new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoid2lsbC1icmVpdGtyZXV0eiIsImEiOiItMTJGWEF3In0.HEvuRMMVxBVR5-oDYvudxw'
      })
    })
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.transform([-96, 39], geoProjection, mapProjection),
    zoom: 5
  })
});

// SETUP APPLICATION LOGIC HERE

var app = {
  mapzenKey: 'mapzen-CpAANqF', 
  activeSearch: 'from',
  options: [],
  selection: {
    from: {},
    to: {}
  },
  routeLayer: new ol.layer.Vector({
    map: map,
    opacity: 0.6,
    visible: true,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#2196F3',
        width: 5
      })
    }),
    source: new ol.source.Vector({
      features: []
    })
  }),

  typeAhead: function(e){
    var el = e.target;
    var val = el.value;
    if(val.length > 2){
      app.queryAutocomplete(val, function(err, data){
        if(err) return console.log(err);
        if(data.features) app.options = data.features;
        app.renderResultsList();
      })
    }else{
      app.clearList();
    }
  },

  queryAutocomplete: throttle(function(text, callback){
    $.ajax({
      url: 'https://search.mapzen.com/v1/autocomplete?text=' + text + '&api_key=' + app.mapzenKey, 
      success: function(data, status, req){
        callback(null, data);
      },
      error: function(req, status, err){
        callback(err)
      }
    })
  }, 150),

  renderResultsList: function(){
    var resultsList = $('#results-list');
    resultsList.empty();

    var results = app.options.map(function(feature){
      var li = $('<li class="results-list-item">' + feature.properties.label + '</li>');
      li.on('click', function(){
        app.selectItem(feature);
      })
      return li;
    })

    resultsList.append(results);

    if(app.options.length > 0){
      resultsList.removeClass('hidden');
    }else{
      resultsList.addClass('hidden');
    }
  },

  selectItem: function(feature){
    app.selection[app.activeSearch] = feature;
    var elId = '#search-' + app.activeSearch + '-input';
    $(elId).val(feature.properties.label);
    app.clearList();
    if(app.selection.from.hasOwnProperty('geometry') && app.selection.to.hasOwnProperty('geometry')){
      app.queryMobility(app.displayRoute);
    }
  },

  clearList: function(e){
    app.options = [];
    app.trip = {};
    app.renderResultsList();
    app.renderDirectionsList();
    app.routeLayer.setSource(null);
  },

  clearSearch: function(e){
    var elId = '#search-' + e.data.input + '-input';
    $(elId).val('').trigger('keyup');
    app.selection[e.data.input] = {};
  },

  queryMobility: function(callback){
    var json = {
      locations:[
        {
          lat:app.selection.from.geometry.coordinates[1],
          lon:app.selection.from.geometry.coordinates[0],
          type:'break'
        },
        {
          lat:app.selection.to.geometry.coordinates[1],
          lon:app.selection.to.geometry.coordinates[0],
          type:'break'
        }
      ],
      costing:'auto',
      directions_options:{
        units:'miles'
      }
    }
    $.ajax({
      url: 'https://valhalla.mapzen.com/route?json=' + JSON.stringify(json) + '&api_key=' + app.mapzenKey,
      success: function(data, status, req){
        app.trip = data.trip;
        var coords = polyline.decode(data.trip.legs[0].shape);
        callback(null, coords);
      },
      error: function(req, status, err){
        callback(err);
      }
    })
  },

  displayRoute: function(err, coords){
    if(err){
      console.log(err);
    }else{
      var route = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords
        }
      }

      app.routeLayer.setSource( new ol.source.Vector({
        features: (new ol.format.GeoJSON({featureProjection: mapProjection})).readFeatures(route)
      }))

      map.getView().fit(
        app.routeLayer.getSource().getExtent(),
        map.getSize()
      )      

      app.renderDirectionsList();
    }
  },

  renderDirectionsList: function(err){
    var sidebar = $('#sidebar');
    var directionsList = $('#directions-list');
    directionsList.empty();
    if(app.trip && app.trip.legs){
      var directions = app.trip.legs[0].maneuvers.map(function(man){
        var li = $('<li class="directions-list-item"></li>');
        var instructionContainer = $('<div class="directions-list-instruction-container"></div>');
        var instruction = $('<div class="directions-list-item-direction">' + man.instruction + '</div>');
        var iconContainer = $('<div class="directions-list-icon-container"></div>')
        var icon = app.getIconEl('icon-maneuver-' + leftPad(man.type, 2, '0'));
        iconContainer.append(icon);
        instructionContainer.append(instruction);
        if(man.hasOwnProperty('verbal_post_transition_instruction')){
          var then = $('<div class="directions-then">Then ' + man.verbal_post_transition_instruction + '</div>')
          instructionContainer.append(then)
        }
        li.append(iconContainer);
        li.append(instructionContainer);
        return li;
      })
      directionsList.append(directions);
      directionsList.removeClass('hidden');
      sidebar.addClass('sidebar-expanded');
    }else{
      directionsList.addClass('hidden');
      sidebar.removeClass('sidebar-expanded');
    }
  },

  getIconEl: function(id){
    var svgContainerEl = document.getElementById('svg');
    var svg = svgContainerEl.querySelectorAll('symbol');
    var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'http://www.w3.org/1999/svg');
    svgEl.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    var useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    useEl.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + id);
    svgEl.appendChild(useEl);
    svgEl.classList.add('directions-list-icon');
    return svgEl;
  }

}

// SETUP EVENT BINDING HERE

$('#search-from-input').on('keyup', {input:'from'}, app.typeAhead);
$('#clear-from-search').on('click', {input:'from'}, app.clearSearch);
$('#search-from-input').on('focus', function(){app.activeSearch = 'from'});

$('#search-to-input').on('keyup', {input:'to'}, app.typeAhead);
$('#search-to-input').on('focus', function(){app.activeSearch = 'to'});
$('#clear-to-search').on('click', {input:'to'}, app.clearSearch);
