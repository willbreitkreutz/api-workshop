# Bonus Time!

We've got our route tool to minimum-viable-product level, but that doesn't mean we have to stop there.

What if our user knows where they want to start or end, but doesn't know what to search for to get that location into our tool?

How about if we let them follow this workflow:

1. Focus on the start or finish inputs to set the active search value (already done).

2. Long-click on the map to query using coordinates rather than a search string.

3. Pick their location from the list as usual (already done).

First, let's create a way to query the API using what's known as reverse geocoding, querying by location:

``` javascript
  queryReverse: debounce(function(coords, callback){
    app.options = [];
    $.ajax({
      url: 'https://search.mapzen.com/v1/reverse?point.lat=' + coords[1] + '&point.lon=' + coords[0] + '&api_key=' + app.mapzenKey, 
      success: function(data, status, req){
        app.options = data.features;
        callback(null);
      },
      error: function(req, status, err){
        callback(err)
      }
    })
  }, 100)
```

So, `longpress` isn't really a thing, but we can make it one:

Create a variable called `app.longpress` to keep track of our `longpress` state, it'll either be true or false, but will start out false.  Add this to the top configuration portion of the `app` object:

``` javascript
  longpress: false,
```

Listen for `mousedown` on the map element and use that to set `app.longpress` to true when the 300 ms after the user presses the button down.  Add this to the event listener section toward the bottom of our script:

``` javascript
  $('#map').on('mousedown', function(){
    app.longpress = false;
    pressTimer = window.setTimeout(function(){
      app.longpress = true;
    },300);
  })
```

Now we can listen for `mouseup` to clear the timer called `pressTimer`, this way if we didn't hold it down for more than 300 ms longpress isn't set to true.

``` javascript
  $('#map').on('mouseup', function(){
    clearTimeout(pressTimer);
  });
```

Lastly we can add an OpenLayers event listener on our map for the `singleclick` event which is fired no matter how long the mouse button is held down.

``` javascript
  map.on('singleclick', function(e){
    var coords = e.coordinate;
    var geoCoords = ol.proj.toLonLat(coords);
    if(app.longpress){
      $('#search-' + app.activeSearch + '-input').val(geoCoords.toString());
      app.queryReverse(geoCoords, app.renderResultsList);
    }
  })
```