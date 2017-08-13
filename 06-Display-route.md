# Display the route on the map

Let's take a closer look at the response we get from the Mobility API.

Searching for a route between two locations gets us a JSON object that looks something like this:

``` javascript
  {
    trip:{
      language: "en-US",
      legs: [{…}],
      locations:[{…}, {…}],
      status: 0,
      status_message: "Found route between points",
      summary: {max_lon: -71.050323, max_lat: 42.358276, time: 99772, length: 1832.019, min_lat: 38.449535, …},
      units: "miles"
    }
  }
```

According to the Mapzen docs: 

> A `trip` contains one or more `legs`. For n number of `break` locations, there are n-1 legs. `Through` locations do not create    separate legs.

  Each leg of the trip includes a summary, which is comprised of the same information as a trip summary but applied to the single leg of the trip. It also includes a shape, which is an [encoded polyline](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) of the route path, and a list of maneuvers as a JSON array. For more about decoding route shapes, see these [code examples](https://mapzen.com/documentation/mobility/decoding/).

Ok, cool, they're nice enough to give us some references to the methods they used to encode the route line to make it more efficient to transmit across the wire.  But how do we decode that line into something we can use in the map?

Well, they've also included a section in the docs on how to decode the line [here](https://mapzen.com/documentation/mobility/decoding/).

Looking at the code examples we've found a nice decoding function we can use in our app.  Let's copy that code and save it into `decode.js` in our project folder.  This code creates a global polyline object with a decode method we can use to transform the encoded line into coordinates that we can give our map in the form of GeoJSON to display.  Notice that I've already added it to the header of our HTML, so we should be loading the decode script and have it ready to go when we need it.

First, let's go back to the `queryMobility` method we put together.  In the success callback of the ajax call we can decode the line we get from the API and send the coordinates back through to the callback:

``` javascript
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
        var coords = polyline.decode(data.trip.legs[0].shape);
        callback(null, coords);
      },
      error: function(req, status, err){
        callback(err);
      }
    })
  }
```

Since we know our app only allows users to select two `break` locations we can hard-code our function to grab the first leg in the array, in a more complex app, we would want to iterate through the legs and process each of them.

Now if we go back to our `selectItem` method where we call `queryMobility` we could write the logic to display the route inside the callback where we're console.logging the data, but let's decouple that a little bit and create another function on our `app` object to display the route and call that inside `selectItem`:

``` javascript
  selectItem: function(feature){
    app.selection[app.activeSearch] = feature;
    var elId = '#search-' + app.activeSearch + '-input';
    $(elId).val(feature.properties.label);
    app.clearList();
    if(app.selection.from.hasOwnProperty('geometry') && app.selection.to.hasOwnProperty('geometry')){
      app.queryMobility(app.displayRoute);
    }
  }, 

  displayRoute: function(err, coords){
    ...
  }
```

`displayRoute` can then just handle adding our route to the map.  We can't display a raw string of coordinates without doing a little something with it so let's create a GeoJSON object from the coords and then add that to the map using the OpenLayers mapping [API](http://openlayers.org/en/latest/apidoc/):

``` javascript
  displayRoute: function(err, coords){
    if(err){
      // We're going to be pretty simple in our error handling for this workshop
      console.log(err);
    }else{
      // Create a route GeoJSON object, now we can work with that
      var route = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords
        }
      }

      // Add our data as a vector source to app.routeLayer (see below for explanation)
      app.routeLayer.setSource( new ol.source.Vector({
        features: (new ol.format.GeoJSON({featureProjection: mapProjection})).readFeatures(route)
      }))

      // Zoom the map to the route layer
      map.getView().fit(
        app.routeLayer.getSource().getExtent(),
        map.getSize()
      )      
    }
  }
```

One little trick I've learned while playing with the OpenLayers API is that we can create our route layer and add it to the map when the app starts up, then as we get new datasets we can just swap out sources, it makes it easy to manipulate the data that's being displayed in that layer without having to worry about cleaning up the layer over time.

To do this let's add the `app.routeLayer` to the `app` object up toward the top in the configuration portion of the object, feel free to change up any of the styling settings you like to make the route your own:

``` javascript
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
  })
```

Ok, now if we test it out, we should be able to query a route using two locations and have it draw on the map!

What about those turn-by-turn directions that they send us, let's add those so that the user can see all the turns they'll have to make to get from A to B. Time to go to [lesson 7](/07-Display-turn-by-turn).