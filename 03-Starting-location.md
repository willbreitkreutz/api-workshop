# Searching for a starting location

The first step in our workflow was to search for the starting location.  We remember that one of the end-points that Mapzen offers is called autocomplete.  This end-point allows us to send partial queries to the database and get a set of likely candidate results so the user doesn't have to type the full name of their starting location, or get that full name exactly right.

So now we need a place for the user to start typing and then we can send that input to the autocomplete end-point.

In `index.html` we need to add an input for the user to start typing in.

After the `<div id="map" class="map"></div>` but before the `app.js` import we're going to start adding our user interface components.

``` html
<div id="sidebar" class="sidebar">
  <div id="search-bar-container" class="directions-mode">
    <span id="search-from" class="search-bar">
      <input id="search-from-input" class="search-input" type="text"></input>
      <button id="clear-from-search" class="search-button">X</button>
    </span>
  </div>
</div>
```

We're going to add a sidebar that will take care of positioning our interface to the right side of the page and set our dimensions for the components.  Inside the sidebar we'll add a search-bar-container, all of the search bar stuff will go in here.

The search bar is a span with a basic form input element and a clear button so that the user can click the X to clear the input.

If we refresh our browser we should see an input floating in the upper-right corner of our map, nice.  Now how do we make it do something?

### Handling user input

Looking at `app.js` there isn't much there yet, let's change that.  

To start, I like to organize my application by creating an app object that contains most of the functional logic that will be used as well as the state of the application at any given time.  

> Note: This isn't the "right" way to structure the app, or even the way I would necessarily build it out in production, but it makes sense for an app of this scale and makes it easy to reason about as part of this workshop.  The best/worst thing about JavaScript is that there is very rarely a "right" way to do things.

Let's add the app object to `app.js`:

``` javascript
// SETUP APPLICATION LOGIC HERE

var app = {
  mapzenKey: 'mapzen-CpAANqF', // feel free to add your key if you want
  activeSearch: 'from'
}

```

We'll add a couple attributes to the app object to keep track of our API Key as well as which search is currently active, right now we only have the `from` search, but this will make more sense when we add the `to` search functionality.

Next we'll add the function that will handle user input into the search bar.  We can add a function to our app object just like we did with the attributes above:

``` javascript
// SETUP APPLICATION LOGIC HERE

var app = {
  mapzenKey: 'mapzen-CpAANqF', 
  activeSearch: 'from',

  typeAhead: function(e){
    var el = e.target;
    var val = el.value;
    console.log(val);
  }
}

```

Then to wire up our input to the typeAhead function, we'll use a little JQuery event binding by adding the following line after the app object in the event binding section of `app.js`:

``` javascript
$('#search-from-input').on('keyup', {input:'from'}, app.typeAhead);
```

Now if we type into the input we should see our text echoed back to us in the console of the developer tools (F12 on Windows or option+command+I in Mac).

### Query autocomplete

Now that we can capture what the user is typing, lets send that to the Mapzen autocomplete end-point and see what happens.

We can add a method to our app object to send the request to mapzen by adding another function to the object.  Add the following function below the typeAhead function on the app object:

``` javascript
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
  }, 150)
```

[Side note on the throttle function call](add url)

In order to actually call the `queryAutocomplete` function, we should add a call inside the `typeAhead` function.  We can pass the text that the user is typing as well as a callback function to handle the results when they come back, in this case let's just log them to the console.

``` javascript
  typeAhead: function(e){
    var el = e.target;
    var val = el.value;
    app.queryAutocomplete(val, function(err, data){
      console.log(data);
    })
  },
```

Thats pretty neat, but if we look at the results that we're getting for the first couple letters that we type they don't make much sense as far as getting to a specific feature, city, state or anything.  We can handle that by only firing the request when the user types at least 3 characters into the input.

``` javascript
  typeAhead: function(e){
    var el = e.target;
    var val = el.value;
    
    if(val.length > 2){
      app.queryAutocomplete(val, function(err, data){
        console.log(data);
      })
    }
  },
```

### Render some results to choose from

Ok, now if our user types, we get a list of results, we need to present them to the user so they can see what options they have.

Let's add a list of results below the search bar in the HTML.  Add the following tag inside the sidebar div but below the search-bar span:

``` html
<ul id="results-list" class="results-list hidden"></ul>
```

Now we have a nice place to put our results as we get them back from the API.

We need to add a couple things to our app object to get the results to render in the list.  First we need an array to put the results into, so we'll add an options array to app as well as another method that will take our options and render them into the list:

``` javascript
var app = {
  mapzenKey: 'mapzen-CpAANqF', 
  activeSearch: 'from',
  options: [],
  ...
```

``` javascript
  renderResultsList: function(){
    // step 1
    var resultsList = $('#results-list');
    resultsList.empty();

    // step 2
    var results = app.options.map(function(feature){
      var li = $('<li class="results-list-item">' + feature.properties.label + '</li>');
      return li;
    })

    // step 3
    resultsList.append(results);

    // step 4
    if(app.options.length > 0){
      resultsList.removeClass('hidden');
    }else{
      resultsList.addClass('hidden');
    }
  }
```

1.  The first step to rendering the list of results is to clear it in case there happens to already be results in the list.

2.  Next we iterate through the results collection and create a list item for each one.  We know to use the label property from our research into the API earlier.

3.  Then we can append the list to the `resultsList` element.

4.  Lastly we check to see if there were actually any options in the options array, if there were we can remove the hidden class to show the list in case it was hidden, otherwise we can hide it. 

Now to wire our render function up to the data that get returned let's edit our typeahead function and alter the callback that we send to the query slightly:

``` javascript
  typeAhead: function(e){
    var el = e.target;
    var val = el.value;
    if(val.length > 2){
      app.queryAutocomplete(val, function(err, data){
        // step 1
        if(err) return console.log(err);

        // step 2
        if(data.features) app.options = data.features;

        // step 3
        app.renderResultsList();
      })
    }
  }
```

The lines that we added do 3 things:

1.  Take care of some simple error handling in case our  `queryAutocomplete` function returns an error.

2.  Add the features returned in the API call to our options array.

3.  Call `app.renderResultsList()` to add our features to the list below the search bar.

### Select a starting location from the list

Cool, now our user gets a list of options to choose from as they type into the search bar.

Let's set it up so that they can click one of the options and lock it in as the "FROM" value for our directions app.

Let's start by adding a click handler to each list item as they are getting generated that will call a new method that sets our selection to the feature associated with that list item:

``` javascript
  var results = app.options.map(function(feature){
    var li = $('<li class="results-list-item">' + feature.properties.label + '</li>');
    li.on('click', function(){
      app.selectItem(feature);
    })
    return li;
  })
```

Before we build `app.selectItem` let's add a place to the app to store our selected items, both for the from and to searches.  Add the following to the app object toward the top under the options array:

``` javascript 
  selection: {
    from: {},
    to: {}
  },
```

Now we can add the `selectItem` method to our app object:

``` javascript
  selectItem: function(feature){
    // step 1
    app.selection[this.activeSearch] = feature;

    // step 2
    var elId = '#search-' + app.activeSearch + '-input';
    $(elId).val(feature.properties.label);

    // step 3
    app.clearList();
  }
```

There are a couple things here that might make it look confusing but they are there to make the method a little more generic and work for both the from and to selections.  When a user selects a feature from the list we'll follow these steps:

1.  Set the feature that's passed in as the active feature on either the `from` or `to` keys of the selection object, depending on the current `activeSearch` attribute.

2.  Grab the DOM element for the active search bar, again using the `activeSearch` attribute of the app.  Set the search bar content to the label property of the selected feature to show that it was set as our from location.

3.  Clear the results list since we found the location that we're looking for.  Oh, that method isn't defined yet, let's get to the clean up phase then.

### Clean up

There's a couple clean up methods that we need to add to make the workflow go smooth.

First we need to handle the call to `app.clearList()` that we added in the last step.

`app.clearList()` should reset our app state so that the search results are cleared and the list is closed.  To do that we can set our options to an empty array and call `app.renderResultsList()` which will handle hiding the list if there are no results to render.

``` javascript
  clearList: function(e){
    app.options = [];
    app.renderResultsList();
  }
```

Now let's go ahead and wire up the button that clears the user input as well, this should clear the input value as well as any selected feature in case we're showing a selected feature's name instead of user input.

``` javascript
  clearSearch: function(e){
    var elId = '#search-' + e.data.input + '-input';
    $(elId).val('').trigger('keyup');
    app.selection[e.data.input] = {};
  }
```

We're writing this in a generic form so that it will work for both the from and to inputs, saving us work, which is always nice.

Notice the second line of `clearSearch`, we're firing the `keyup` event on our input, without any input, this won't do anything, right?  Well, let's set it up so that if the user has fewer than 3 characters in the input we go ahead and clear the results list in case some results are being displayed when a user hits backspace or the clear button.  Since we already wrote the `clearList` function let's call it in `typeAhead`:

``` javascript
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
  }
```

Lastly we can add the event listener that will fire `app.clearSearch` when the user clicks on the clear button.  Add this to the listeners section toward the bottom of `app.js`:

``` javascript
  $('#clear-from-search').on('click', {input:'from'}, app.clearSearch);
```

Awesome!  We've got step one in the bag.  And that's actually almost half the app right there.  Let's move on to [lesson 4]() and wire up the destination search.

