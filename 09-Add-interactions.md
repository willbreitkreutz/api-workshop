# Add Maneuver Interactions

Add marker element to the html

``` html
  <div id="map" class="map"></div>
  <div id="marker"></div>
```

Add icon overlay to hold the icon on the map, this way we just reuse the same div and don't have to create and distoy a bunch:

``` javascript
  detailOverlay: new ol.Overlay({
    position: null,
    positioning: 'center-center',
    element: document.getElementById('marker'),
    stopEvent: false
  })
```

Create a function to set the position of the overlay and the icon within:

``` javascript
  renderOverlay: function(coord, maneuverType){
    $('#marker').empty().append(app.getIconEl(maneuverType));
    app.detailOverlay.setPosition(ol.proj.fromLonLat(coord));
  }
```

We need to make our coords array available to the whole app so we can pull each maneuver's location our of there:

``` javascript
displayRoute: function(err, coords){
    if(err){
      console.log(err);
    }else{
      // add the coords to app.coords so we can get them later
      app.coords = coords;

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
  }
```

Add the marker to the start location first with the start icon:

``` javascript
  map.addOverlay(app.detailOverlay);
  app.renderOverlay(app.coords[0], 'icon-maneuver-01');
```

Add our mouseover interaction to the list item as it's being created:

``` javascript
  li.on('mouseover', function(){
    app.renderOverlay(app.coords[man.begin_shape_index], 'icon-maneuver-' + leftPad(man.type, 2, '0'));
  })
```

### Click to Zoom to a Maneuver

Create a `zoomTo` method on our `app` object that zooms the map to a location with a set zoom scale:

``` javascript
  zoomTo: function(coord){
    var view = map.getView();
    view.setCenter(ol.proj.fromLonLat(coord));
    view.setResolution(50);
  }
```

Add a click handler on each of our maneuver list items to call `zoomTo` with that maneuvers location:

``` javascript
  li.on('click', function(){
    app.zoomTo(app.coords[man.begin_shape_index]);
  })
```