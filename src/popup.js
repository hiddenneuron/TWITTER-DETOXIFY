// Timer blocking logic
const hoursSelect = document.getElementById('hours');
const minutesSelect = document.getElementById('minutes');
const blockBtn = document.getElementById('blockBtn');
const unlockBtn = document.getElementById('unlockBtn');
const statusEl = document.getElementById('status');

// Populate dropdowns
for (let i = 0; i <= 23; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i.toString().padStart(2, '0');
    hoursSelect.appendChild(option);
}
hoursSelect.value = "0"; // Default to 0 hours

for (let i = 0; i <= 59; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i.toString().padStart(2, '0');
    minutesSelect.appendChild(option);
}
minutesSelect.value = "30"; // Default to 30 minutes

blockBtn.addEventListener('click', () => {
    const hours = parseInt(hoursSelect.value, 10);
    const minutes = parseInt(minutesSelect.value, 10);
    const totalMinutes = (hours * 60) + minutes;

    if (isNaN(totalMinutes) || totalMinutes < 1) {
        statusEl.textContent = 'Please select a valid duration.';
        statusEl.className = 'status-error';
        return;
    }
    chrome.runtime.sendMessage({ action: 'blockTwitter', minutes: totalMinutes });
    statusEl.textContent = `Site will be blocked for ${hours}h ${minutes}m.`;
    statusEl.className = '';
    updateTimerDisplayStatus(); // Update UI immediately
});

unlockBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'unlockTwitter' });
    statusEl.textContent = 'Site unlocked.';
    statusEl.className = 'status-success';
    updateTimerDisplayStatus(); // Update UI immediately
    setTimeout(() => {
        // Re-check status after a delay in case another operation changed it
        updateTimerDisplayStatus();
    }, 3000);
});

// Keyword filtering logic
const keywordsTextarea = document.getElementById('keywords');
const saveKeywordsBtn = document.getElementById('saveKeywordsBtn');
const keywordsStatusEl = document.getElementById('keywordsStatus');

// Load saved keywords when popup opens
chrome.storage.local.get(['blockedKeywords'], (result) => {
    if (result.blockedKeywords && Array.isArray(result.blockedKeywords)) {
        keywordsTextarea.value = result.blockedKeywords.join('\n');
    }
});

saveKeywordsBtn.addEventListener('click', () => {
    const keywords = keywordsTextarea.value.split('\n').map(k => k.trim()).filter(k => k);
    chrome.storage.local.set({ blockedKeywords: keywords }, () => {
        keywordsStatusEl.textContent = 'Keywords saved!';
        keywordsStatusEl.className = 'status-success';
        // Send message to background/content scripts to update rules
        chrome.runtime.sendMessage({ action: 'updateKeywords', keywords });
        setTimeout(() => keywordsStatusEl.textContent = '', 3000);
    });
});

// Display current blocking status (timer)
function updateTimerDisplayStatus() {
    chrome.storage.local.get(['blockUntil'], (result) => {
        if (result.blockUntil && result.blockUntil > Date.now()) {
            const remainingMs = result.blockUntil - Date.now();
            const remainingTotalMinutes = Math.ceil(remainingMs / (60 * 1000));
            const remainingHours = Math.floor(remainingTotalMinutes / 60);
            const remainingMinutesInHour = remainingTotalMinutes % 60;
            statusEl.textContent = `Site blocked. ${remainingHours}h ${remainingMinutesInHour}m remaining.`;
            statusEl.className = 'status-blocked';
            blockBtn.style.display = 'none';
            unlockBtn.style.display = 'block';
        } else {
            statusEl.textContent = 'Twitter is not currently site-blocked.';
            statusEl.className = '';
            blockBtn.style.display = 'block';
            unlockBtn.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Timer elements
    const hoursSelect = document.getElementById('hours');
    const minutesSelect = document.getElementById('minutes');
    const blockBtn = document.getElementById('blockBtn');
    const unlockBtn = document.getElementById('unlockBtn');
    const statusEl = document.getElementById('status');

    // Keyword elements
    const keywordsTextarea = document.getElementById('keywords');
    const saveKeywordsBtn = document.getElementById('saveKeywordsBtn');
    const keywordsStatusEl = document.getElementById('keywordsStatus');

    // Blocked User elements
    const blockedUsersTextarea = document.getElementById('blockedUsers');
    const saveBlockedUsersBtn = document.getElementById('saveBlockedUsersBtn');
    const blockedUsersStatusEl = document.getElementById('blockedUsersStatus');

    // Content Filter elements
    const hideImagesCheckbox = document.getElementById('hideImages');
    const hideVideosCheckbox = document.getElementById('hideVideos');
    const saveContentFiltersBtn = document.getElementById('saveContentFiltersBtn');
    const contentFiltersStatusEl = document.getElementById('contentFiltersStatus');

    // Detoxification Summary elements
    const keywordsCountEl = document.getElementById('keywordsCount');
    const usersCountEl = document.getElementById('usersCount');
    const imagesCountEl = document.getElementById('imagesCount');
    const videosCountEl = document.getElementById('videosCount');
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    const statsStatusEl = document.getElementById('statsStatus');

    // --- Timer Logic --- 
    function populateDropdowns() {
        for (let i = 0; i <= 23; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i.toString().padStart(2, '0');
            hoursSelect.appendChild(option);
        }
        hoursSelect.value = "0";

        for (let i = 0; i <= 59; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i.toString().padStart(2, '0');
            minutesSelect.appendChild(option);
        }
        minutesSelect.value = "30";
    }

    function updateTimerDisplayStatus() {
        chrome.storage.local.get(['blockUntil'], (result) => {
            if (result.blockUntil && result.blockUntil > Date.now()) {
                const remainingMs = result.blockUntil - Date.now();
                const remainingTotalMinutes = Math.ceil(remainingMs / (60 * 1000));
                const remainingHours = Math.floor(remainingTotalMinutes / 60);
                const remainingMinutesInHour = remainingTotalMinutes % 60;
                statusEl.textContent = `Site blocked. ${remainingHours}h ${remainingMinutesInHour}m remaining.`;
                statusEl.className = 'status-blocked';
                blockBtn.style.display = 'none';
                unlockBtn.style.display = 'block';
            } else {
                statusEl.textContent = 'Twitter is not currently site-blocked.';
                statusEl.className = '';
                blockBtn.style.display = 'block';
                unlockBtn.style.display = 'none';
            }
        });
    }

    blockBtn.addEventListener('click', () => {
        const hours = parseInt(hoursSelect.value, 10);
        const minutes = parseInt(minutesSelect.value, 10);
        const totalMinutes = (hours * 60) + minutes;

        if (isNaN(totalMinutes) || totalMinutes < 1) {
            statusEl.textContent = 'Please select a valid duration.';
            statusEl.className = 'status-error';
            return;
        }
        chrome.runtime.sendMessage({ action: 'blockTwitter', minutes: totalMinutes });
        statusEl.textContent = `Site will be blocked for ${hours}h ${minutes}m.`;
        statusEl.className = '';
        updateTimerDisplayStatus(); // Update UI immediately
    });

    unlockBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'unlockTwitter' });
        statusEl.textContent = 'Site unlocked.';
        statusEl.className = 'status-success';
        updateTimerDisplayStatus(); // Update UI immediately
        setTimeout(() => {
            // Re-check status after a delay in case another operation changed it
            updateTimerDisplayStatus();
        }, 3000);
    });

    // --- Keyword Filtering Logic ---
    function loadKeywords() {
        chrome.storage.local.get(['blockedKeywords'], (result) => {
            if (result.blockedKeywords && Array.isArray(result.blockedKeywords)) {
                keywordsTextarea.value = result.blockedKeywords.join('\n');
            }
        });
    }
    saveKeywordsBtn.addEventListener('click', () => {
        const keywords = keywordsTextarea.value.split('\n').map(k => k.trim()).filter(k => k);
        chrome.storage.local.set({ blockedKeywords: keywords }, () => {
            keywordsStatusEl.textContent = 'Keywords saved!';
            keywordsStatusEl.className = 'status-success';
            chrome.runtime.sendMessage({ action: 'updateKeywords', keywords });
            setTimeout(() => {
                keywordsStatusEl.textContent = '';
                keywordsStatusEl.className = '';
            }, 3000);
        });
    });

    // --- User & Account Blocking Logic ---
    function loadBlockedUsers() {
        chrome.storage.local.get(['blockedUsernames'], (result) => {
            if (result.blockedUsernames && Array.isArray(result.blockedUsernames)) {
                blockedUsersTextarea.value = result.blockedUsernames.join('\n');
            }
        });
    }
    saveBlockedUsersBtn.addEventListener('click', () => {
        const users = blockedUsersTextarea.value.split('\n')
            .map(u => u.trim().replace(/^@/, ''))
            .filter(u => u);
        chrome.storage.local.set({ blockedUsernames: users }, () => {
            blockedUsersStatusEl.textContent = 'Blocked users list saved!';
            blockedUsersStatusEl.className = 'status-success';
            chrome.runtime.sendMessage({ action: 'updateBlockedUsers', blockedUsernames: users });
            setTimeout(() => {
                blockedUsersStatusEl.textContent = '';
                blockedUsersStatusEl.className = '';
            }, 3000);
        });
    });

    // --- Content-Type Filtering Logic ---
    function loadContentFilters() {
        chrome.storage.local.get(['contentFilters'], (result) => {
            if (result.contentFilters) {
                hideImagesCheckbox.checked = !!result.contentFilters.hideImages;
                hideVideosCheckbox.checked = !!result.contentFilters.hideVideos;
            }
        });
    }
    saveContentFiltersBtn.addEventListener('click', () => {
        const filters = {
            hideImages: hideImagesCheckbox.checked,
            hideVideos: hideVideosCheckbox.checked
        };
        chrome.storage.local.set({ contentFilters: filters }, () => {
            contentFiltersStatusEl.textContent = 'Content filters applied!';
            contentFiltersStatusEl.className = 'status-success';
            chrome.runtime.sendMessage({ action: 'updateContentFilters', contentFilters: filters });
            setTimeout(() => {
                contentFiltersStatusEl.textContent = '';
                contentFiltersStatusEl.className = '';
            }, 3000);
        });
    });

    // --- Detoxification Summary Logic ---
    function updateStatsDisplay(stats) {
        keywordsCountEl.textContent = stats.keywords;
        usersCountEl.textContent = stats.users;
        imagesCountEl.textContent = stats.images;
        videosCountEl.textContent = stats.videos;
    }

    function loadAndDisplayStats() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'getDetoxStats' }, (response) => {
                    if (chrome.runtime.lastError) {
                        // Handle error, e.g., content script not yet injected or tab not on Twitter
                        console.error("Error getting stats:", chrome.runtime.lastError.message);
                        statsStatusEl.textContent = 'Stats not available (visit Twitter page).';
                        statsStatusEl.className = 'status-error';
                    } else if (response) {
                        updateStatsDisplay(response);
                        statsStatusEl.textContent = ''; // Clear status on success
                        statsStatusEl.className = '';
                    } else {
                        // No response could mean content script didn't send one for getDetoxStats
                        statsStatusEl.textContent = 'Stats not available.';
                        statsStatusEl.className = 'status-error';
                    }
                });
            } else {
                statsStatusEl.textContent = 'Stats not available (open a Twitter page).';
                statsStatusEl.className = 'status-error';
            }
        });
    }

    resetStatsBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'resetDetoxStats' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error resetting stats:", chrome.runtime.lastError.message);
                        statsStatusEl.textContent = 'Failed to reset stats.';
                        statsStatusEl.className = 'status-error';
                    } else if (response && response.success) {
                        updateStatsDisplay({ keywords: 0, users: 0, images: 0, videos: 0 }); // Update display immediately
                        statsStatusEl.textContent = 'Stats reset!';
                        statsStatusEl.className = 'status-success';
                        setTimeout(() => {
                            statsStatusEl.textContent = '';
                            statsStatusEl.className = '';
                        }, 3000);
                    } else {
                        statsStatusEl.textContent = 'Failed to reset stats.';
                        statsStatusEl.className = 'status-error';
                    }
                });
            } else {
                statsStatusEl.textContent = 'Cannot reset stats (open a Twitter page).';
                statsStatusEl.className = 'status-error';
            }
        });
    });

    // Initial population and loading
    populateDropdowns();
    updateTimerDisplayStatus();
    loadKeywords();
    loadBlockedUsers();
    loadContentFilters();
    loadAndDisplayStats(); // Load and display stats when popup opens
});