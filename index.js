const express = require("express");
const fetch = require("node-fetch");
const app = express();

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

app.get("/search", async (req, res) => {
  let searchTerm = req.query.search_term;
  
  // Validation and character replacement
  searchTerm = searchTerm.replace(/[, ]+/g, "+").replace(/[^a-zA-Z0-9+\-]/g, "");

  if (!searchTerm) {
    res.status(400).json({ error: "search_term is required" });
    return;
  }

  const apiUrl = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${searchTerm}&limit=1`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("GIPHY API request failed");
    }

    const json = await response.json();
    const gifUrl = json.data[0].images.original.url;

    const gifResponse = await fetch(gifUrl);

    if (!gifResponse.ok) {
      throw new Error("Failed to fetch GIF from GIPHY");
    }

    gifResponse.body.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});