# Searching for a destination

Now that we have a starting location, we need to give the user the ability to search for a destination.  Since we thought ahead when we coded some of the application functions earlier, we can use a lot of the same code that we wrote for the starting location and just add another search bar.

To start let's add another search bar to the HTML under the starting location search bar:

``` html
  <span id="search-to" class="search-bar">
    <input id="search-to-input" class="search-input" type="text"></input>
    <button id="clear-to-search" class="search-button">X</button>
  </span>
```

Then to wire up the typeahead functionality, we can add a new event listener for the `keyup` event on the new input:

``` javascript
  $('#search-to-input').on('keyup', {input:'to'}, app.typeAhead);
```

If we think back to when we set up the app object, we added the activeSearch key and set it to `from`, that worked out fine until now when we have a `to` search as well... Let's add a listener to each of the inputs' focus events to set the active search every time the user clicks into one or the other inputs.  For good measure, let's go ahead and wire up the clear button for the destination search bar while we're at it. The event listener section of `app.js` should now look something like this:

``` javascript
  $('#search-from-input').on('keyup', {input:'from'}, app.typeAhead);
  $('#clear-from-search').on('click', {input:'from'}, app.clearSearch);
  $('#search-from-input').on('focus', function(){app.activeSearch = 'from'});

  $('#search-to-input').on('keyup', {input:'to'}, app.typeAhead);
  $('#search-to-input').on('focus', function(){app.activeSearch = 'to'});
  $('#clear-to-search').on('click', {input:'to'}, app.clearSearch);
```

Ok, let's give that a try and see if we can set both starting and destination locations.

Nice, if that works it's time to take those locations that the user selects and get a route between the two.  Let's move on to [lesson 5](/05-Query-mobility-api.md).