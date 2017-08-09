# Query Mapzen Mobility API for Turn-by-turn directions

So we've integrated the Autocomplete API to allow our users to search for starting and destination locations, now let's use those locations to query the Mobility API and get them some driving directions.

The first thing we do is read up on the Mobility API to figure out what we need to provide the API in order to get results that make sense.

So, by reading the [docs](https://mapzen.com/documentation/mobility/turn-by-turn/api-reference/) we learn that

> The route request takes the form of https://valhalla.mapzen.com/route?json={}&api_key=, where the JSON inputs inside the {} include location information, name and options for the costing model, and output options. 

Let's break that down a little bit.  In order to get a good route back we need to give the API some locations, it looks like they support a minimum of two `break` locations (start and finish) with the option for `through` locations to pin the route along the way.  Each of the locations has a set of optional parameters that can be added, it looks like `lat`, `lon` and `type` are required so we'll use those (take a look at the docs if you're interested in the others).

So far our json inputs object looks like this: (don't worry about where this goes in the code yet)

``` javascript
{
  locations: [
    {
      lat:...,
      lon:...,
      type: 'break'
    },{
      lat:...,
      lon:...,
      type: 'break'
    }
  ]
}
```

The next bit of information that the API asks for is the costing model.  Mapzen Mobility offers an awesome array of options for routing, we can ask for route using automobile, bike, bus, pedestrian and other modes, if we had more time we could give those options to the user and let them pick the mode that works best for them, but for our workshop we're going to use the automobile costing model.

Each costing model has a number of options, but we're going to use the default settings, feel free to play around with options to really optimize your routing tool as extra credit.

The last bit of information that we're going to give the API is that we want the directions to include distances in miles instead of kilometers, since I have a hard time thinking in KM when thinking about distances...

Our json input should end up looking something like this:

``` javascript
{
  locations: [
    {
      lat:...,
      lon:...,
      type: 'break'
    },{
      lat:...,
      lon:...,
      type: 'break'
    }
  ],
  costing: 'auto',
  directions_options:{
    units: 'miles'
  }
}
```

### Send the query

Now that we understand how we're going to talk to the API, let's wire up a method to call the Mobility API.  We can add a method to our `app` object to handle the call just like we did for the typeahead.  We can add a new function to `app` called `queryMobility` that looks like this:

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
        callback(null, data);
      },
      error: function(req, status, err){
        callback(err);
      }
    })
  }
```

Since we set our selection `from` and `to` elements to geojson features, we can grab the break location lat and lon information from them and add it to our json parameter.

This function by itself won't do anything with the results, we're going to pass them back to a callback for some other function to deal with.  

If we think about our workflow, we want to fire the request for directions when the user selects both a starting and a destination location, so we need to keep an eye out for when we have a valid location for both and then only fire the query at that point.  

The easiest way to do this is to add a little code to our `selectItem` function that gets fired when the user selects a location from the typeahead list.  Let's add this little block to the end of the `selectItem` function:

``` javascript
  if(app.selection.from.hasOwnProperty('geometry') && app.selection.to.hasOwnProperty('geometry')){
    app.queryMobility(function(err, data){
      console.log(err, data)
    });
  }
```

This let's us check to see if we have a feature selected for `from` and `to` and if so we'll fire `app.queryMobility`.  For now let's just pass an anonymous function that logs whatever we get back to the console.

Now that we can query the Mobility API, how about we show the user what the resulting route looks like on the map!

Let's go to [Lesson 6]() and get mapping.