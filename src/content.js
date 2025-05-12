let blockedKeywords = [];
let blockedUsernames = []; // Add a list for blocked usernames
let contentFilters = { hideImages: false, hideVideos: false }; // Add content filters state

// Initialize or load stats
let detoxStats = { keywords: 0, users: 0, images: 0, videos: 0 };
chrome.storage.local.get(['detoxStats'], (result) => {
    if (result.detoxStats) {
        detoxStats = result.detoxStats;
    }
});

// Function to save stats to storage (with a debounce to avoid too many writes)
let saveStatsTimeout = null;

function saveDetoxStats() {
    clearTimeout(saveStatsTimeout);
    saveStatsTimeout = setTimeout(() => {
        chrome.storage.local.set({ detoxStats: detoxStats }, () => {
            // console.log('Detox stats saved:', detoxStats);
        });
    }, 1000); // Save stats after 1 second of no changes
}

// Function to hide tweets containing blocked keywords, from blocked users, or matching content filters
function filterTweets() {
    if (blockedKeywords.length === 0 && blockedUsernames.length === 0 && !contentFilters.hideImages && !contentFilters.hideVideos) {
        // If no filters are active, ensure all tweets are visible
        document.querySelectorAll('article[data-testid="tweet"].detox-hidden-tweet').forEach(tweet => {
            tweet.classList.remove('detox-hidden-tweet');
        });
        return;
    }

    // Twitter's structure changes, this selector might need updates.
    // This selector aims for individual tweet articles.
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');

    tweets.forEach(tweet => {
        // Skip if already processed in this filtering pass
        if (tweet.classList.contains('detox-processed')) return;
        tweet.classList.add('detox-processed'); // Mark as processed

        // Try to find the element containing the main tweet text
        const tweetTextElement = tweet.querySelector('div[data-testid="tweetText"]');
        const tweetText = tweetTextElement ? (tweetTextElement.textContent || tweetTextElement.innerText || "") : "";

        let shouldHide = false;
        let filterReason = null; // To track which filter hid the tweet

        // Check for keywords
        if (!shouldHide && blockedKeywords.length > 0) {
            for (const keyword of blockedKeywords) {
                // Ensure tweetText is not empty before checking
                if (tweetText && tweetText.toLowerCase().includes(keyword.toLowerCase())) {
                    shouldHide = true;
                    filterReason = 'keywords';
                    break;
                }
            }
        }

        // Check for blocked users if not already marked for hiding
        if (!shouldHide && blockedUsernames.length > 0) {
            // Attempt to find the username. This is highly dependent on Twitter's DOM structure.
            // Common pattern: a link within the tweet header with href like "/[username]"
            const userLink = tweet.querySelector('a[href*="/"][dir="ltr"]'); // More specific selector
            if (userLink) {
                const hrefParts = userLink.getAttribute('href').split('/');
                const usernameFromTweet = hrefParts[1]; // Usually the username is the first part after /
                if (usernameFromTweet) {
                    for (const blockedUser of blockedUsernames) {
                        if (usernameFromTweet.toLowerCase() === blockedUser.toLowerCase()) {
                            shouldHide = true;
                            filterReason = 'users';
                            break;
                        }
                    }
                }
            }
        }

        // Check for content types (images/videos)
        if (!shouldHide && contentFilters.hideImages) {
            // Look for image tags within the tweet. Twitter uses complex structures, so this might need refinement.
            // A common indicator is an <img> tag within a div that has a role="link" and contains "photo".
            const imageElement = tweet.querySelector('div[data-testid="tweetPhoto"], div[data-testid="GifPlayer"] img, img[alt="Image"], img[alt*="Embedded image"]');
            if (imageElement) {
                shouldHide = true;
                filterReason = 'images';
            }
        }
        if (!shouldHide && contentFilters.hideVideos) {
            // Look for video tags or specific video player indicators.
            const videoElement = tweet.querySelector('div[data-testid="videoPlayer"], div[data-testid="VideoPlayer"], video');
            if (videoElement) {
                shouldHide = true;
                filterReason = 'videos';
            }
        }

        // Apply hiding and update stats if newly hidden
        const isCurrentlyHidden = tweet.classList.contains('detox-hidden-tweet');

        if (shouldHide) {
            if (!isCurrentlyHidden) {
                tweet.classList.add('detox-hidden-tweet');
                // Increment stat based on the reason
                if (filterReason && detoxStats[filterReason] !== undefined) {
                    detoxStats[filterReason]++;
                    saveDetoxStats(); // Save stats after incrementing
                    // console.log(`Hid tweet (${filterReason}):`, tweetText.substring(0,50) + "...");
                }
            }
        } else {
            // If it was hidden but shouldn't be now (e.g., filter removed), unhide it.
            // Note: Decrementing stats when unhiding is complex and often not needed for a simple count.
            if (isCurrentlyHidden) {
                tweet.classList.remove('detox-hidden-tweet');
            }
        }
    });
    // Remove processed marker after all tweets are checked in this batch
    setTimeout(() => {
        tweets.forEach(tweet => tweet.classList.remove('detox-processed'));
    }, 100); // Give a moment for rendering
}

// Load initial keywords, blocked users, and content filters, then start filtering
chrome.storage.local.get(['blockedKeywords', 'blockedUsernames', 'contentFilters', 'detoxStats'], (result) => {
    if (result.blockedKeywords && Array.isArray(result.blockedKeywords)) {
        blockedKeywords = result.blockedKeywords;
    }
    if (result.blockedUsernames && Array.isArray(result.blockedUsernames)) {
        blockedUsernames = result.blockedUsernames;
    }
    if (result.contentFilters) {
        contentFilters = result.contentFilters;
    }
    if (result.detoxStats) {
        detoxStats = result.detoxStats;
    }
    filterTweets();
});

// Listen for updates from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let needsReFilter = false;
    if (message.action === 'updateKeywords') {
        blockedKeywords = message.keywords || [];
        needsReFilter = true;
    }
    if (message.action === 'updateBlockedUsers') {
        blockedUsernames = message.blockedUsernames || [];
        needsReFilter = true;
    }
    if (message.action === 'updateContentFilters') {
        contentFilters = message.contentFilters || { hideImages: false, hideVideos: false };
        needsReFilter = true;
    }
    // Listen for messages to get current stats from popup
    if (message.action === 'getDetoxStats') {
        sendResponse(detoxStats);
    }
    // Listen for message to reset stats from popup
    if (message.action === 'resetDetoxStats') {
        detoxStats = { keywords: 0, users: 0, images: 0, videos: 0 };
        saveDetoxStats(); // Save the reset stats
        sendResponse({ success: true });
    }

    if (needsReFilter) {
        filterTweets(); // Re-filter with new keywords or users
    }

    // Listener for timer-based blocking (to re-enable scrolling if unblocked)
    if (message.action === 'twitterTimerBlockStatus') {
        if (message.isBlocked) {
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            document.body.style.overflow = 'auto'; // Allow scrolling
        }
    }
});

// Twitter loads content dynamically, so we need to observe changes to the DOM.
const observer = new MutationObserver((mutations) => {
    // We can debounce this if it fires too often
    filterTweets();
});

// Start observing the body for configured mutations
observer.observe(document.body, { childList: true, subtree: true });

// Initial filter run in case content is already there
filterTweets();

console.log("Twitter Detoxifier content script loaded.");