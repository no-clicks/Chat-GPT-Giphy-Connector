const fs = require("fs");
const rateLimit = require("express-rate-limit");
const express = require("express");
const fetch = require("node-fetch");
const chartJs = require('chart.js');
const chartScript = fs.readFileSync(__dirname + '/chart.js', 'utf8');

const app = express();


const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

// Create a rate limiter middleware function that limits each IP address to 100 requests every 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware function to log request count
const logRequestCount = (req, res, next) => {
  const now = new Date();
  const hour = now.getHours();
  const date = now.toISOString().slice(0, 10); // Use ISO date format (YYYY-MM-DD)

  // Read the current request count for this hour from the file
  const filePath = `requests.log`;
  let requestCounts = {};
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    if (fileData) {
      requestCounts = JSON.parse(fileData);
    }
  }

  // Increment the request count for this hour and date
  if (!requestCounts[date]) {
    requestCounts[date] = {};
  }
  if (!requestCounts[date][hour]) {
    requestCounts[date][hour] = 0;
  }
  requestCounts[date][hour]++;

  // Write the updated request counts to the file
  fs.writeFileSync(filePath, JSON.stringify(requestCounts));

  next();
};

// Apply middleware to log incoming requests to the console and track request count
app.use(logRequestCount);
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Define the /search endpoint
app.get("/search", limiter, async (req, res) => {
  // Extract the search term from the request query parameters
  let searchTerm = req.query.search_term;

  // Remove the .gif extension from the search term, if present
  searchTerm = searchTerm.replace(/\.gif$/i, "");

  // Replace spaces and commas with "+" characters, and remove any other characters that aren't letters, numbers, "+", or "-"
  searchTerm = searchTerm
    .replace(/[, ]+/g, "+")
    .replace(/[^a-zA-Z0-9+\-]/g, "");

  // Log the search term to the console
  console.log(`Search term: ${searchTerm}`);

  // Check that a valid search term is present
  if (!searchTerm) {
    res.status(400).json({ error: "search_term is required" });
    return;
  }

  // Construct the GIPHY API URL for the search term
  const apiUrl = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${searchTerm}&limit=1`;

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

    // Make a request to the GIPHY API for the GIF URL
    const gifResponse = await fetch(gifUrl);

    // Throw an error if the response from the GIPHY API

    if (!gifResponse.ok) {
      throw new Error("Failed to fetch GIF from GIPHY");
    }

    // Pipe the response from the GIPHY API for the GIF URL to the response object for this endpoint
    gifResponse.body.pipe(res);
  } catch (error) {
    // Log any errors that occur and return a 500 error response to the user
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Redirect to GitHub on root route
//app.get("/", (req, res) => {
//  res.redirect("https://github.com/no-clicks/Chat-GPT-Giphy-Connector");
//});

app.get('/', (req, res) => {
  // Read the readme.md file
  const readmeFile = fs.readFileSync(__dirname + '/README.md', 'utf8');

  // Add the chart.js script to the readme.md file
  const updatedReadmeFile = readmeFile.replace('</body>', `<script>${chartScript}</script></body>`);

  // Send the updated readme.md file as the response
  res.send(updatedReadmeFile);
});

// Handle 404 errors by redirecting to GitHub
app.use((req, res) => {
  res.redirect("https://github.com/no-clicks/Chat-GPT-Giphy-Connector");
});

// Start the server
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
