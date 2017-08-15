# What exactly is an API?

API stands for Application Programming Interface and has a pretty good definition when we look it up on [Wikipedia](https://en.wikipedia.org/wiki/Application_programming_interface):

> In computer programming, an Application Programming Interface (API) is a set of subroutine definitions, protocols, and tools for building application software. In general terms, it is a set of clearly defined methods of communication between various software components.

That last sentence is the heart of what an API is, I think of it as a contract between one piece of software (or firmware) and another describing how they can communicate between each other.  There are a number of types of API, describing how to communicate with hardware, a software library or web services.  That last one, the Web API will be what we're concentrating on in this workshop.

# Exploring an API, the first step

To use a 3rd party API in your tool you should first explore the API and learn all you can about how it works.  You need to understand what it expects from you and what to expect to get in return.

Basically, it's time to read the docs.

[Mapzen API Documentation](https://mapzen.com/documentation/)

[Mapzen API Explorer](https://mapzen.com/search/explorer/)

# Understand the workflow

So we know what we want to build, a tool to get driving directions from point a to point b.  We also know a little about the API endpoints available from Mapzen that should be able to accomplish that task.

We now need to wire all that knowledge up into a user workflow that gives our user the functionality they want with as much ease of use as possible.

If we break that down, the major steps look something like this:

1. Search for a start point
2. Search for an end point
3. Query the directions
4. Draw the route on the map
5. Give the user turn-by-turn directions from point a to point b

That doesn't look too bad, if we take it one step at a time we'll get this wired up in no time.  Time for [Lesson 3](/03-Starting-location.md)
