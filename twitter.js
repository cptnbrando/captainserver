// Function to extract the "entries" array
function getEntriesFromTimelineAdd(json) {
    const instructions = json?.data?.user?.result?.timeline_v2?.timeline?.instructions;

    if (instructions && Array.isArray(instructions)) {
        for (const instruction of instructions) {
            if (instruction.type === "TimelineAddEntries") {
                return instruction.entries; // Return the "entries" array
            }
        }
    }

    return null; // Return null if no matching instruction is found
}

// Assuming 'entries' is the array of Entry objects
function parseTweetEntries(entries) {
    return entries.map(entry => {
        const tweet = entry.content?.itemContent?.tweet_results?.result?.legacy;
        const views = entry.content?.itemContent?.tweet_results?.result?.views;
        const userCore = entry.content?.itemContent?.tweet_results?.result?.core?.user_results?.result?.legacy;

        const myUrl = `https://x.com/${userCore.screen_name}/status/${entry.entryId.split('tweet-')[1]}`;
        
        return {
            entryId: entry.entryId,
            screenName: userCore?.screen_name,
            url: myUrl,
            entryType: entry.content?.entryType,
            itemType: entry.content?.itemContent?.itemType,
            createdAt: tweet?.created_at,
            bookmarkCount: tweet?.bookmark_count,
            viewCount: views?.count,
            fullText: tweet?.full_text,
            favoriteCount: tweet?.favorite_count,
            quoteCount: tweet?.quote_count,
            replyCount: tweet?.reply_count,
            retweetCount: tweet?.retweet_count,
            possiblySensitive: tweet?.possibly_sensitive
        };
    });
}

// Function to parse and sort tweet entries by the createdAt date
function sortTweetsByDate(tweets) {
    return tweets.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateA - dateB; // Sorts from earliest to latest
    });
}

module.exports = {
    getEntriesFromTimelineAdd, 
    parseTweetEntries, 
    sortTweetsByDate
};