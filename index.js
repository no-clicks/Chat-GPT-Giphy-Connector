const fs = require("fs");
const rateLimit = require("express-rate-limit");
const express = require("express");
const fetch = require("node-fetch");
const validator = require("validator");

const app = express();

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// log request count middleware
const logRequestCount = (req, res, next) => {
  const now = new Date();
  const hour = now.getHours();
  const date = now.toISOString().slice(0, 10);
  const filePath = `requests.log`;
  let requestCounts = {};

  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    if (fileData) {
      requestCounts = JSON.parse(fileData);
    }
  }

  if (!requestCounts[date]) {
    requestCounts[date] = {};
  }
  if (!requestCounts[date][hour]) {
    requestCounts[date][hour] = 0;
  }
  requestCounts[date][hour]++;

  fs.writeFileSync(filePath, JSON.stringify(requestCounts));

  next();
};

app.use(logRequestCount);
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Set content security policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' https://media.giphy.com; script-src 'self'");
  next();
});

app.get("/search", limiter, async (req, res) => {
  // Extract the search term from the request query parameters
  let searchTerm = req.query.search_term;

  // Remove the .gif extension from the search term, if present
  searchTerm = searchTerm.replace(/\.gif$/i, "");

  // Sanitize the search term
  searchTerm = validator.escape(searchTerm);

  // Replace spaces and commas with "+" characters, and remove any other characters that aren't letters, numbers, "+", or "-"
  searchTerm = searchTerm.replace(/[, ]+/g, "+").replace(/[^a-zA-Z0-9+\-]/g, "");

  // Log the search term to the console
  console.log(`Search term: ${searchTerm}`);

  // Check that a valid search term is present
  if (!searchTerm) {
    res.status(400).json({ error: "search_term is required" });
    return;
  }

  // Construct the GIPHY API URL for the search term
  const apiUrl = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${searchTerm}&limit=1&sort=relevant`;

  try {
    // Make a request to the GIPHY API for the search term
    const response = await fetch(apiUrl);

    // Throw an error if the response from the GIPHY API is not successful
    if (!response.ok) {
      throw new Error("GIPHY API request failed");
    }

    // Parse the JSON response from the GIPHY API and extract the URL for the first GIF
    const json = await response.json();
    const gifUrl = json.data[0].images.original.url;

    // Make a request to the GIPHY API for the GIF and pipe the response to the client
    const gifResponse = await fetch(gifUrl);
    gifResponse.body.pipe(res);
  } catch (error) {
    // Log any errors that occur and return a 500 error response to the user
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/requests", (req, res) => {
  const filePath = `requests.log`;

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.status(200).send(data);
    }
  });
});

app.get("/", (req, res) => {
  res.redirect("https://github.com/no-clicks/Chat-GPT-Giphy-Connector");
});

app.use((req, res) => {
  res.redirect("https://github.com/no-clicks/Chat-GPT-Giphy-Connector");
});

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});