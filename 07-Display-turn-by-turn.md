# Display The Turn-by-turn Directions

If we look closely at the legs array that we get back, each leg has an array of `maneuvers` that one has to follow to get from point A to point B.  Each of the maneuvers contains a lot of information about what the user should do at a given place on the route.  W're going to concentrate on a few of the pieces of information, the `type`, `instruction`, `verbal_post_transition_instruction` the `begin_shape_index` and the `end_shape_index`.  These are all the information that the GPS device we use when driving around tells us where to go, so we're going to give our user the same information, but in text form.

As a first step, we're going to store the directions we get from the API on our `app` object so we can refer to them later.  In our `queryMobility` methods `success` callback, let's attach the data object to `app.directions`:

``` javascript
  success: function(data, status, req){
    app.trip = data.trip;
    var coords = polyline.decode(data.trip.legs[0].shape);
    callback(null, coords);
  }
```

Now we can get to the directions in any of the other methods called after this point.

Let's add the directions list to the same area below the search bars as our results lists go.  But instead of rendering them into the same DOM area as the results list, we'll create another list element so we can keep any styling separated.

In `index.html` let's add a `<ul>` for our directions at the bottom of our sidebar `div`:

``` html
  <!DOCTYPE html>
  <html>
    <head>
      <title>API Workshop</title>
      <link rel="stylesheet" href="https://openlayers.org/en/v3.19.1/css/ol.css" type="text/css">
      <script src="https://openlayers.org/en/v3.19.1/build/ol.js"></script>
      <script src="https://code.jquery.com/jquery-3.1.1.min.js"
        crossorigin="anonymous"></script>
      <script src="./util.js"></script>
      <script src="./decode.js"></script>
      <link rel="stylesheet" href="./app.css" type="text/css">
    </head>
    <body>
      <div id="map" class="map"></div>

      <div id="sidebar" class="sidebar">
        <div id="search-bar-container" class="directions-mode">
          <span id="search-from" class="search-bar">
            <input id="search-from-input" class="search-input" type="text"></input>
            <button id="clear-from-search" class="search-button">X</button>
          </span>
          <span id="search-to" class="search-bar">
            <input id="search-to-input" class="search-input" type="text"></input>
            <button id="clear-to-search" class="search-button">X</button>
          </span>
        </div>
        <ul id="results-list" class="results-list hidden"></ul>
        <ul id="directions-list" class="directions-list styled-scrollbar hidden"></ul>
      </div>
      <script src="./app.js"></script>
    </body>
  </html>
```

Let's create a `renderDirectionsList` method similar to our `renderResultsList` method, where we build out the DOM elements that make up our directions list and add them to the page.  This method gets a little verbose so take a look at the comments below for some explanation on what we're doing:

``` javascript
  renderDirectionsList: function(err){
    // grab references to the sidebar and directions list DOM elements so we can manipulate them
    var sidebar = $('#sidebar');
    var directionsList = $('#directions-list');

    // empty the directions list in case it already had information inside it
    directionsList.empty();
    
    // make sure that we actually have data on the trip object in app
    if(app.trip && app.trip.legs){
      
      // use the array.map method to iterate through all maneuvers 
      // in the first leg and add the results to an array called directions
      var directions = app.trip.legs[0].maneuvers.map(function(man){
        
        // create our list item element
        var li = $('<li class="directions-list-item"></li>');
        
        // create a container for the instructions to go in
        var instructionContainer = $('<div class="directions-list-instruction-container"></div>');

        // create the actual instruction element with our text from the maneuver
        var instruction = $('<div class="directions-list-item-direction">' + man.instruction + '</div>');

        // append the instruction into the instruction container
        instructionContainer.append(instruction);

        // if our maneuver has the verbal post transition instruction let's add that as a little subtext
        if(dir.hasOwnProperty('verbal_post_transition_instruction')){
          var then = $('<div class="directions-then">Then ' + man.verbal_post_transition_instruction + '</div>')
          instructionContainer.append(then)
        }

        // ready to add the instruction container to the list item
        li.append(instructionContainer);

        // return the list item to become part of the directions array of DOM elements
        return li;
      })

      // add the directions array of elements to the directions list
      directionsList.append(directions);

      // show the list
      directionsList.removeClass('hidden');

      // add the expanded class to sidebar, it just makes it almost full-page-height
      sidebar.addClass('sidebar-expanded');
    }else{
      // if we don't have any directions hide the list and remove the expanded class
      directionsList.addClass('hidden');
      sidebar.removeClass('sidebar-expanded');
    }
  }
```

WHEW! that was a lot, but we got it all in there and we now just need to call it somewhere to display our directions in the sidebar.  Let's add that call to the `displayRoute` method so we show the directions after we draw the route:

``` javascript
  displayRoute: function(err, coords){
    console.log('should be working')
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
  }
```

Awesome, now we get directions to show up, but arrgh, they never go away!

Let's add a couple lines to our `clearList` function to get rid of the directions when the user clears either the starting or destination location from the inputs:

``` javascript
  clearList: function(e){
    app.options = [];
    app.trip = {};
    app.renderResultsList();
    app.renderDirectionsList();
  }
```

We can set `app.trip` to an empty object and then call `app.renderDirectionsList()` to hide the list (remember what we did in the `if` statement when `app.trip` has no legs).

Ugh, now the route stays on the map as well, let's clean that up by adding one more line to set the source to `null` which makes our route disappear:

``` javascript
  clearList: function(e){
    app.options = [];
    app.trip = {};
    app.renderResultsList();
    app.renderDirectionsList();
    app.routeLayer.setSource(null);
  }
```

Alright, we're getting close to an app with some functionality, we just need to pretty it up a little bit and add some more interaction.  In [lesson 8]() we'll add icons based on the maneuver type to the list then later we'll even add them to the map.