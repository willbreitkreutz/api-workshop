# Bonus Time!

Alright, so we've got our routing tool to minimum-viable-product level, but that doesn't mean we have to stop there.

What if our user knows where they want to start or end, but doesn't know what to search for to get that location into our tool?

How about if we let them follow this workflow:

1. Focus (click on) on the start or finish inputs to set the active search value (already done).

2. Long-click on the map to query using coordinates rather than a search string.

3. Pick their location from the list as usual (already done).

First, let's create a way to query the API using what's known as reverse geocoding, querying by location.  Mapzen has an API endpoint made jsut for this! The [`/reverse`](https://mapzen.com/documentation/search/reverse/) endpoint lets us query the same database with a location, returning known features and addresses at or close to that location.  Let's start by adding a query method onto our `app` object that sends the reverse geocode request:

``` javascript
  queryReverse: throttle(function(coords, callback){
    $.ajax({
      url: 'https://search.mapzen.com/v1/reverse?point.lat=' + coords[1] + '&point.lon=' + coords[0] + '&api_key=' + app.mapzenKey, 
      success: function(data, status, req){
        callback(null, data);
      },
      error: function(req, status, err){
        callback(err)
      }
    })
  }, 100)
```

We're going to throttle the call so that we don't send more than 10 per second, probably not a huge concern, but if we enabled the call every time a user clicked then our API calls could start colliding as they are returned.

### Listen for the `longpress` event

So, `longpress` isn't really a thing, but we can make it one:

Create a variable called `app.longpress` to keep track of our `longpress` state, it'll either be true or false, but will start out false.  Add this to the top configuration portion of the `app` object:

``` javascript
  longpress: false,
```

Listen for the actual `mousedown` event on the map element and use that to set `app.longpress` to true when the button has been pressed for 300 ms.  Add this to the event listener section toward the bottom of our script:

``` javascript
  $('#map').on('mousedown', function(){
    app.longpress = false;
    pressTimer = window.setTimeout(function(){
      app.longpress = true;
    },300);
  })
```

If we left the app as is, every click would turn into a `longpress` since we just set `app.longpress` to true 300 ms after the mouse button is clicked and never check to see if the user actually held the button down that long.

Now if we listen for `mouseup` to clear the timer called `pressTimer`, we keep `app.longpress` from being set to true if the button wasn't actually held down for 300 ms.  Let's add this to the listener section of our script:

``` javascript
  $('#map').on('mouseup', function(){
    clearTimeout(pressTimer);
  });
```

All we're doing so far is playing with timers, now we need to listen to any kind of single click on the map, check to see if the `app.longpress` toggle was switched, and if so, add our location to the query input.  OpenLayers lets us listen to the `singleclick` event which gives us access to the coordinates where the user clicked so we'll use that event rather than a JQuery listener on a regular DOM event.

Inside of our `singleclick` listener we can check to see if `lonpress` was set to true, meaning that the click lasted longer than the 300 ms timeout and act accordingly, otherwise we'll ignore the click and move on with our day.   We can make this look just like our `typeahead` handler since it's doing basically the same thing. We'll add this to the bottom of our listeners section:

``` javascript
  map.on('singleclick', function(e){
    if(app.longpress){
      var coords = e.coordinate;
      var geoCoords = ol.proj.toLonLat(coords);
      $('#search-' + app.activeSearch + '-input').val(geoCoords.toString());
      app.queryReverse(geoCoords, function(err, data){
        if(err) return console.log(err);
        if(data.features) app.options = data.features;
        app.renderResultsList();
      });
    }
    app.longpress = false;
  });
```

### Add Route Summary

We've been able to get our route, and turn-by-turn directions, how about we show the user some more useful information about their trip, like total distance and estimated duration.

The summary object that gets returned when we query the Mobility API has all the information we need to display this at the top of the turn-by-turn list, including the total time in seconds and the total distance (in the units that we requested, in this case miles).

If we check out the 

``` html
  <span class="summary-info hidden"></span>
```

``` css
  .directions-list {
    top: 114px;
  }
```

``` javascript
  renderDirectionsList: function(err){
    var sidebar = $('#sidebar');
    var directionsList = $('#directions-list');
    // add the following 2 lines to get the summary span and clear it if it happens to have any left over info
    var summarySpan = $('#summary');
    summarySpan.empty();

    directionsList.empty();
    if(app.trip && app.trip.legs){
      map.addOverlay(app.detailOverlay);
      app.renderOverlay(app.coords[0], 'icon-maneuver-01');
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
        li.on('mouseover', function(){
          app.renderOverlay(app.coords[man.begin_shape_index], 'icon-maneuver-' + leftPad(man.type, 2, '0'));
        })
        li.on('click', function(){
          app.zoomTo(app.coords[man.begin_shape_index]);
        })
        return li;
      })
      directionsList.append(directions);
      directionsList.removeClass('hidden');

      // format the distance by adding the units to the end of the string
      var distance = app.trip.summary.length + ' miles';

      // format the time by using the provided formatDuration function
      var time = formatDuration(app.trip.summary.time);

      // add our summary text to the summary span
      summarySpan.text(distance + ' - ' + time);

      // remove the hidden class to display our summary
      summarySpan.removeClass('hidden');

      sidebar.addClass('sidebar-expanded');
    }else{
      directionsList.addClass('hidden');
      
      // add the hidden class if we don't have anything to show in our summary
      summarySpan.addClass('hidden');
      sidebar.removeClass('sidebar-expanded');
    }
  },
```

### Keep Going!

There are a lot of other small user-friendliness features that could be added, some abstraction taht could be done and other enhancements that you can give this application, you're not done unless you really want to be.  (but the lessons are done for now...)

Thanks for sticking it out, hopefully you found this interesting and helpful, drop me a line or add an issue to this repo if you have any comments or suggestions, thanks!