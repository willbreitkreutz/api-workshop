# Add Maneuver Interactions

In order to add each manouver icon to the map, we're going to use an OpenLayers [overlay](http://openlayers.org/en/latest/apidoc/ol.Overlay.html) which is basically their way of saying popup.  An overlay can render a number of different things, but we're going to use an HTML element as it's content.  We could make and distroy the html for our overlay every time it's rendered, but that can get pretty inefficient so let's create the `div` that we're going to use as our overlay inside of `index.html`, then we can use it and recycle it whenever we want to display our overlay icon:

``` html
  <div id="map" class="map"></div>

  <!-- add the marker div below --> 
  <div id="marker"></div>
```

Now we can add our `detailOverlay` element to our `app` object.  We'll create a new `ol.Overlay` at a null position referencing our marker element created above.  This will add the overlay into the maps bucket of overlays, making it available for rendering, but the null position keeps the overlay from being rendered anywhere on the map just yet.  See the [OpenLayers API Docs](http://openlayers.org/en/latest/apidoc/ol.Overlay.html) for more information about the overlay element:

``` javascript
  detailOverlay: new ol.Overlay({
    position: null,
    positioning: 'center-center',
    element: document.getElementById('marker'),
    stopEvent: false
  })
```

In order to add our overlay to the map we need a method that takes adds it to the map at a given location.  We can add a method to `app` called `renderOverlay` that takes a coordinate pair for a location and the maneuverType that we want to add from our SVG icon set.  Our method should empty the marker `div` and then append the new icon based on the `maneuverType` using the same `getIconEl` method we wrote earlier.  Then we can set the overlay position using the coordinate passed in:

``` javascript
  renderOverlay: function(coord, maneuverType){
    $('#marker').empty().append(app.getIconEl(maneuverType));
    app.detailOverlay.setPosition(ol.proj.fromLonLat(coord));
  }
```

Ok, but how do we get the coordinates when the user mouses over each of the maneuvers?  Right now we lose a reference to our coordinates after the route gets displayed.  We know that each maneuver stores a reference to the index position of the coordinate associated with it from the array of coordinates we get from the trip.  We can make that array accessable by attaching it to our `app` object when we display the route, that way it's always updated when the route updates:

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

Since we have our coordinates available on `app.coords`, let's add the start location as the first icon when the directions list renders.  Inside our `app.renderDirectionsList` method, after we check to make sure that we have a trip and it has legs, let's add the overlay to the map and call `app.renderOverlay` with the first coordinate pair from `app.coords` and the initial maneuver icon, `icon-maneuver-01`:

``` javascript
  ...
  if(app.trip && app.trip.legs){
    map.addOverlay(app.detailOverlay);
    app.renderOverlay(app.coords[0], 'icon-maneuver-01');
    ...
```

We've got our initial maneuver icon on the map now, we can also add a listener to each of the list items displaying our maneuvers in the turn-by-turn directions list.  At the bottom of the `.map` function that we use to render all of our maneuvers, add the listener below to render the overlay for each maneuver as the user mouses over it.  We can pull the `begin_shape_index` and `type` from the maneuver and use those to grab the right coordinate out of `app.coords` and the right icon from our svg:

``` javascript
  li.on('mouseover', function(){
    app.renderOverlay(app.coords[man.begin_shape_index], 'icon-maneuver-' + leftPad(man.type, 2, '0'));
  })
```

### Click to Zoom to a Maneuver

Mousing over the maneuver to display the icon is cool, but let's also let the user click on the maneuver to pan and zoom to the maneuver location.  We can add a `zoomTo` method to our `app` object that takes a coordinate and resets our maps viewport to center on that coordinate at a static zoom level (resoulution in OpenLayers speak):

``` javascript
  zoomTo: function(coord){
    var view = map.getView();
    view.setCenter(ol.proj.fromLonLat(coord));
    view.setResolution(50);
  }
```

Below where we added the handler to listen to `mouseover` on the list item, let's also listen for the `click` event.  On `click` we can pull the same coordinate we used for the overlay constructor above and pass that to the `app.zoomTo` method to zoom to that location:

``` javascript
  li.on('click', function(){
    app.zoomTo(app.coords[man.begin_shape_index]);
  })
```

### Clean Up

The last thing we need to do with our icon overlays is to remove them from the map when the user clears a route off of the map.  We can add the following line to our `clearList` function that gets called to clean up our route data and the turn-by-turn directions:

``` javascript
  map.removeOverlay(app.detailOverlay);
```

If you're still with me and want to continue, there are a couple of bonus features we can add to make the app more user friendly in [lesson 10 - bonus](/10-Bonus.md).