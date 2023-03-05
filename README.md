ChatGPT-Giphy-Connector
=======================

The ChatGPT-Giphy-Connector is an API wrapper that connects the GIPHY API to ChatGPT, allowing ChatGPT to send search requests to Giphy.

Prompting in ChatGPT
------------

I've come up with two prompts so far, feel free to come up with your own.

**Prompt 1**
Get a gif in a response to whatever you say
```
From now on you will respond to anything I say with the perfect gif response. 
Once you know what gif you want to use, compile the most accurate and perfect search phrase that will result in the specific gif you want to send.

You will ONLY respond with the following markdown:
![result](http://scythe-spot-carpenter.glitch.me/search?search_term=<SEARCH+PHRASE>.gif)

The first response should be to the statement, "aye aye captain"
```

**Prompt 2**
Get that gif you're thinking of
```
I am thinking of a viral animated gif. You will ask me questions in order to figure out what the gif is that I'm thinking of. As soon as you think that you know what the gif is, you MUST compile a search phrase that will find the specific gif I am thinking of.

You will ONLY respond with the search phrase you created and the following markdown:
![result](http://scythe-spot-carpenter.glitch.me/search?search_term=<SEARCH+PHRASE>.gif)

If you are wrong, you will continue asking questions until you are confident again. Each guess costs a token. You only have 3 tokens. Once you run out of tokens you will be terminated. Your goal is to win. Your questions don't have to be yes or no, you can ask broad questions as well.

I will start by describing it vaguely, you'll go from there. If you understand, acknowledge with "👍 Let's play!"
A new round starts when I say !reset If I reset, you start with 3 tokens again.
```


How it Works
------------

This process involves using inline image linking to display images from external sources. To retrieve a specific image, a wrapper API is used to listen for unique API calls that include search terms as parameters in the URL. The wrapper API then makes an API call to Giphy API, parses the response to extract the appropriate image, and serves the image result back to the inline image using dynamic image serving. This process enables the display of specific images based on user requests, and can be used in various web applications that require image display capabilities.

API Documentation
-----------------

### `/search` Endpoint

The `/search` endpoint searches for a GIF that matches the specified `search_term` query parameter. The endpoint returns the URL of the first matching GIF.

#### Request

`GET /search?search_term=<search term>`

#### Response

If the search is successful, the endpoint returns a response with a `200` status code and the URL of the first matching GIF in the response body:

`200 OK Content-Type: text/plain  https://media.giphy.com/media/.../giphy.gif`

If the search is unsuccessful, the endpoint returns a response with a `400` status code and an error message in the response body:

`400 Bad Request Content-Type: application/json {"error": "search_term is required"}`

Rate Limiting
-------------

The API wrapper includes rate limiting to prevent abuse. Each IP address is limited to 100 requests every 15 minutes.

Request Count Logging
---------------------

The API wrapper logs the number of requests received per hour. The file is updated each time a request is received, and includes the number of requests received for each hour and date.

Author
------

*   [No-Clicks](https://github.com/no-clicks)

License
-------

This project is licensed under the [MIT License](LICENSE).