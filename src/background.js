// Timer-based site blocking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'blockTwitter') {
        const now = Date.now();
        const blockUntilTime = now + message.minutes * 60 * 1000;
        chrome.storage.local.set({ blockUntil: blockUntilTime }, () => {
            console.log(`Twitter blocking until ${new Date(blockUntilTime)}`);
            blockTwitterTabs(true, blockUntilTime);
            sendTimerStatusToContentScripts(true);
        });
    }
    // Listen for keyword updates from popup
    if (message.action === 'updateKeywords') {
        // Keywords are already saved in storage by popup.js
        // Notify content scripts to re-filter
        notifyContentScriptsKeywordsUpdated(message.keywords);
    }
    // Listen for blocked user updates from popup
    if (message.action === 'updateBlockedUsers') {
        // Usernames are already saved in storage by popup.js
        // Notify content scripts to re-filter
        notifyContentScriptsBlockedUsersUpdated(message.blockedUsernames);
    }
    // Listen for content filter updates from popup
    if (message.action === 'updateContentFilters') {
        notifyContentScriptsContentFiltersUpdated(message.contentFilters);
    }
    // Listen for unlock message
    if (message.action === 'unlockTwitter') {
        chrome.storage.local.remove('blockUntil', () => {
            console.log('Twitter block timer cleared.');
            blockTwitterTabs(false); // This will now see no blockUntil and tell content scripts to unblock
            // Optionally, explicitly tell content scripts site is unblocked
            sendTimerStatusToContentScripts(false);
        });
    }
});

function sendTimerStatusToContentScripts(isBlocked) {
    chrome.tabs.query({ url: ["*://twitter.com/*", "*://x.com/*"] }, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'twitterTimerBlockStatus', isBlocked });
        });
    });
}

function notifyContentScriptsKeywordsUpdated(keywords) {
    chrome.tabs.query({ url: ["*://twitter.com/*", "*://x.com/*"] }, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'updateKeywords', keywords });
        });
    });
}

function notifyContentScriptsBlockedUsersUpdated(blockedUsernames) {
    chrome.tabs.query({ url: ["*://twitter.com/*", "*://x.com/*"] }, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'updateBlockedUsers', blockedUsernames });
        });
    });
}

function notifyContentScriptsContentFiltersUpdated(contentFilters) {
    chrome.tabs.query({ url: ["*://twitter.com/*", "*://x.com/*"] }, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'updateContentFilters', contentFilters });
        });
    });
}

// Function to apply blocking to current and future Twitter tabs
function blockTwitterTabs(isStartingBlock, blockUntilTime) {
    chrome.storage.local.get(['blockUntil'], (result) => {
        const currentBlockUntil = isStartingBlock ? blockUntilTime : result.blockUntil;

        if (!currentBlockUntil || Date.now() > currentBlockUntil) {
            if (!isStartingBlock) {
                // Means timer expired naturally, tell content scripts to unblock page scrolling
                sendTimerStatusToContentScripts(false);
            }
            chrome.storage.local.remove('blockUntil'); // Clean up storage
            return; // Not blocked or timer expired
        }

        // If blocking is active, find all Twitter tabs and apply redirection/blocking content
        chrome.tabs.query({ url: ["*://twitter.com/*", "*://x.com/*"] }, (tabs) => {
            for (const tab of tabs) {
                injectBlockContent(tab.id);
            }
        });
    });
}

function injectBlockContent(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
            document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-size:2em;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;font-family:Poppins,sans-serif;text-align:center;padding:20px;">Twitter is Blocked! <br> Focus on your grind.</div>';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    });
}

// Check on tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && (tab.url.startsWith('https://twitter.com') || tab.url.startsWith('https://x.com'))) {
        blockTwitterTabs(false); // Pass false as it's not the initial call
    }
});

// Check on tab activation
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, tab => {
        if (tab.url && (tab.url.startsWith('https://twitter.com') || tab.url.startsWith('https://x.com'))) {
            blockTwitterTabs(false);
        }
    });
});

// Periodically check if the block time has expired
setInterval(() => {
    blockTwitterTabs(false);
}, 5000); // Check every 5 seconds

console.log("Twitter Detoxifier background script loaded.");