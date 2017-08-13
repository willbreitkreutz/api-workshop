# Exploring an API, the first step

To use a 3rd party API in your tool you should first explore the API and learn all you can about how it works.  You need to understand what it expects from you and what to expect to get in return.

Basically, it's time to read the docs.

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
