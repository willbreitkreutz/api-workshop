# Add Turn-by-turn Icons

Verbal instructions are cool and all, but what about adding some more bling, how about we add turn-by-turn icons based on each maneuver type to the list of directions that are displayed.

After a little research we find that Lou Huang at Mapzen has created a GitHub repository containing all of the SVG icons that we need that correspond with the maneuver types that are returned by the API.  

To save a few steps I've already compiled all the svg we need and added it to the repo, it's a little long to show here in the tutorial, but to add it to the site we can add the content of `svg.html` to our `index.html` just above the div with the id of `map`:

``` html
  <div id="svg">...</div>
  <div id="map" class="map"></div>
```

This way we have all of the icons in the page, we can just grab the one we need as we need it and add it to our maneuver detail in the list component.

First, let's create a method on our `app` object for grabbing an svg element from the collection by its ID value:

``` javascript
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
```

Our `getIconEl` method looks pretty verbose, but it's basically just setting a bunch of metadata on the svg tag that we're creating and then grabbing the svg content that we want to use and appending it to the svg tag.  

Now let's create an icon container, grab the icon svg and add it to the container in our `renderDirectionsList` method which should now look like the example below, I've added comments above the lines that we need to add:

``` javascript
  renderDirectionsList: function(err){
    var sidebar = $('#sidebar');
    var directionsList = $('#directions-list');
    directionsList.empty();
    if(app.trip && app.trip.legs){
      var directions = app.trip.legs[0].maneuvers.map(function(man){
        var li = $('<li class="directions-list-item"></li>');
        var instructionContainer = $('<div class="directions-list-instruction-container"></div>');
        var instruction = $('<div class="directions-list-item-direction">' + man.instruction + '</div>');

        // create the container and grab the icon
        // side note, we have to pad the maneuver type with 0's to match the length of the number used in the id
        var iconContainer = $('<div class="directions-list-icon-container"></div>')
        var icon = app.getIconEl('icon-maneuver-' + app.leftPad(man.type, 2, '0'));

        // add the icon to the container
        iconContainer.append(icon);

        instructionContainer.append(instruction);
        if(man.hasOwnProperty('verbal_post_transition_instruction')){
          var then = $('<div class="directions-then">Then ' + man.verbal_post_transition_instruction + '</div>')
          instructionContainer.append(then)
        }

        //append the iconContainer at the start of the list item
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
  }
```

Now we see icons that correspond with the verbal instructions in the maneuver list!

Next in [lesson 9](/09-Add-interactions.md) lets add some interaction to the list so that we can see where on the map each maneuver takes place, and let our user click on a direction to zoom to that location.