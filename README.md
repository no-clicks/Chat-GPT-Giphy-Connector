# ChatGPT-Giphy Connector

This is a simple API wrapper that connects the [OpenAI GPT-3 API](https://beta.openai.com/docs/api-reference/introduction) and the [Giphy API](https://developers.giphy.com/docs/api/) to allow users to generate GIFs based on their messages.

## Usage

To use the API, send a GET request to the `/search` endpoint with a `search_term` query parameter, like so:
'https://your-app-domain.glitch.me/search?search_term=YOUR_SEARCH_TERM'
This will return a GIF that matches the `search_term`. The `search_term` can be any text that you want to search for, like a word, phrase, or sentence.

## Limitations

This API has a rate limit of 100 requests per 15 minutes per IP address. Additionally, the API does not support searching for multiple GIFs or customizing the search results in any way.

## License

This project is licensed under the [MIT License](LICENSE).