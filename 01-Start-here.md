# API workshop
## Building on the work of giants, incorporating 3rd party APIs

Welcome to the API workshop, we're going to explore what APIs are, specifically web APIs, and what they can do for us and our web applications.  3rd party API's aren't without their drawbacks though, and we'll also explore some of the things to watch out for.

In this workshop we'll be building out a routing widget for an OpenLayers map.  Mapzen has been building some awesome APIs on top of OpenStreetMap and other data sources and making these APIs available to the wider geospatial community.  We're going to use three of their API end-points and explore the process of learning the ins and outs of an API and building components into our mapping application to work with them.

### Start Here - A Bit of an intro

This workshop is organized into folders numbered by the corresponding lesson page.  For example, this is 01 Start Here, and the application is located in the 01-start-here folder.  

To get started you will want to fork this repository into one of your own under your GitHub account, that way you have a copy of everything and can make edits as we code up our API integration.  One of the cool things about how GitHub works is that they let you set up a branch on a repository to be published as a web-page using a feature called [GH Pages](https://pages.github.com/). The master branch on this repository set up to be a hosted static website and as we progress in our development, we'll also be publishing to the web so we can check out our progress, or you can open the app in any of the pre-staged folders to see what we're going for.

### Building along

Now you could download all of the code for the project to your local machine, make the edits and push it back to GitHub for deployment, that would work. We're going to short cut that workflow and keep all of our work in the browser!

[Prose.io](prose.io) is an awesome little tool that lets you access and edit files hosted in GitHub. It's designed mainly for editing blog posts in Markdown, but works just as well for doing quick edits in your code. I wouldn't use it for building a large application, but for the app we're putting together it will work beautifully. You will need to authorize the Prose app using your GitHub account, but after that access is pretty seamless.

As you follow along through this workshop you should do your coding in the 00-workspace folder, it's a copy of the 01-start-here folder and that way you have your own playground to develop in without losing any of the pre-staged code.

### Ok, let's see what we're starting with

If you look at the 01-start-here folder you'll find a number of files.  The key one here is index.html, this is your main web page and the thing that tells the browser what other files it will need to complete the application.

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
    <link rel="stylesheet" href="./app.css" type="text/css">
  </head>
  <body>
    <div id="map" class="map"></div>
  	<script src="./app.js"></script>
  </body>
</html>
 ```

Index.html is pretty simple, we've got an html element with a header and a body.  In the header we're importing a couple different libraries, OpenLayers and JQuery.  OpenLayers is our mapping library, providing us the underlying map canvas to use and JQuery gives us easy methods for interacting with the DOM (Document Object Model) - the underlying in-memory structure of the web page.

Astute readers will also notice the `util.js` and `app.css` files that are imported.  I went ahead and built out the styles that we'll use in this workshop so we don't have to sit around and build out CSS and `util.js` has some useful functions that you might get from a library like [underscore.js](http://underscorejs.org/) or [lodash](https://lodash.com/), but since we only need a couple functions I pulled them out into a utility module.

## Test out the app

If you open your browser to the github pages __https://<your user name here>.github.io/api-workshop__ for your repo you should see a simple page listing out each of the lessons as well as your workspace as links.  Each of these links should display the map as it should look at the beginning of each of the numbered lessons.

Ok, if everything looks good so far, let's start thinking about how we're going to implement a route finding tool! [Lesson 02](/02-Explore-an-api.md)

