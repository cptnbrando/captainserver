const express = require('express');
const puppeteer = require('puppeteer');

const { getEntriesFromTimelineAdd, parseTweetEntries, sortTweetsByDate } = require('./twitter');

const app = express();
const PORT = 3000;

app.get('/fetch-tweets', async (req, res) => {
    let jsonResponse = null;

    // Access query parameters
    const user = req.query.user || 'captainbrandoo'; // Default to page 1 if not provided

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Set up Puppeteer's request interception to listen for network requests
        page.on('response', async (response) => {
            try {
                const url = response.url();

                // Skip preflight requests and requests without a body
                if (url.includes('UserTweets') && response.request().method() !== 'OPTIONS') {
                    jsonResponse = await response.json(); // Get the JSON response
                }
            } catch (err) {
                console.error('Error parsing response:', err);
            }
        });

        // Navigate to the target URL
        await page.goto(`https://x.com/${user}`, { waitUntil: 'networkidle2' });

        // Wait for a reasonable amount of time for the request to be captured
        await new Promise(resolve => setTimeout(resolve, 5000));

        await browser.close();

        if (jsonResponse) {
            // Get the "entries" array
            const entries = getEntriesFromTimelineAdd(jsonResponse);
            const tweets = parseTweetEntries(entries);
            const sortedTweets = sortTweetsByDate(tweets);
            res.json(sortedTweets); // Send the captured data as the response
            // res.json(jsonResponse);
        } else {
            res.status(404).json({ error: 'UserTweets not found' });
        }
    } catch (err) {
        console.error('Error fetching tweets:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

