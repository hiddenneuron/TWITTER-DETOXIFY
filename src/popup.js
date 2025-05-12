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
    const clearKeywordsBtn = document.getElementById('clearKeywordsBtn');

    // Blocked User elements
    const blockedUsersTextarea = document.getElementById('blockedUsers');
    const saveBlockedUsersBtn = document.getElementById('saveBlockedUsersBtn');
    const blockedUsersStatusEl = document.getElementById('blockedUsersStatus');
    const clearBlockedUsersBtn = document.getElementById('clearBlockedUsersBtn');

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
    const summaryContentEl = document.getElementById('summaryContent'); // New
    const summaryEmptyStateEl = document.getElementById('summaryEmptyState'); // New


    // --- Helper Function for Button Loading State ---
    function setButtonLoading(button, isLoading, defaultText = null) {
        const textSpan = button.querySelector('.button-text');
        const spinner = button.querySelector('.button-spinner');

        if (isLoading) {
            button.disabled = true;
            if (textSpan) textSpan.textContent = 'Processing...';
            if (spinner) spinner.classList.remove('hidden');
        } else {
            button.disabled = false;
            if (textSpan && defaultText) {
                textSpan.textContent = defaultText;
            } else if (textSpan) {
                 if (button.id === 'blockBtn') textSpan.textContent = 'Start Site Block';
                 else if (button.id === 'unlockBtn') textSpan.textContent = 'Unlock Site Now';
                 else if (button.id === 'saveKeywordsBtn') textSpan.textContent = 'Save Keywords';
                 else if (button.id === 'saveBlockedUsersBtn') textSpan.textContent = 'Save Blocked Users';
                 else if (button.id === 'saveContentFiltersBtn') textSpan.textContent = 'Apply Content Filters';
                 else if (button.id === 'resetStatsBtn') textSpan.textContent = 'Reset Stats';
            }
            if (spinner) spinner.classList.add('hidden');
        }
    }

    function setStatus(element, text, type = 'default') {
        if (!element) return;
        const baseClasses = ['mt-2', 'rounded', 'text-sm', 'text-center', 'font-medium', 'transition-all', 'duration-300', 'ease-in-out', 'overflow-hidden'];
        const typeColorClasses = {
            default: ['bg-slate-700/50', 'text-slate-100'],
            success: ['bg-green-500/20', 'text-green-300'],
            error: ['bg-red-500/20', 'text-red-300'],
            blocked: ['bg-yellow-500/20', 'text-yellow-300'],
        };
        baseClasses.forEach(cls => {
            if (!element.classList.contains(cls)) element.classList.add(cls);
        });
        if (text) {
            element.textContent = text;
            Object.values(typeColorClasses).flat().forEach(cls => element.classList.remove(cls));
            const colors = typeColorClasses[type] || typeColorClasses.default;
            element.classList.add(...colors);
            element.classList.remove('h-0', 'opacity-0', 'p-0');
            element.classList.add('min-h-[32px]', 'p-2');
            requestAnimationFrame(() => {
                 element.classList.add('opacity-100');
            });
        } else {
            element.classList.remove('opacity-100');
            element.classList.add('opacity-0');
            setTimeout(() => {
                if (element.classList.contains('opacity-0')) {
                    element.textContent = '';
                    element.classList.remove('min-h-[32px]', 'p-2');
                    element.classList.add('h-0', 'p-0');
                     Object.values(typeColorClasses).flat().forEach(cls => element.classList.remove(cls));
                }
            }, 300);
        }
    }

    function populateDropdowns() {
        hoursSelect.innerHTML = '';
        minutesSelect.innerHTML = '';
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
            if (chrome.runtime.lastError) {
                console.error("Error getting blockUntil:", chrome.runtime.lastError.message);
                setStatus(statusEl, "Error loading timer status.", "error");
                return;
            }
            if (result.blockUntil && result.blockUntil > Date.now()) {
                const remainingMs = result.blockUntil - Date.now();
                const remainingTotalMinutes = Math.ceil(remainingMs / (60 * 1000));
                const remainingHours = Math.floor(remainingTotalMinutes / 60);
                const remainingMinutesInHour = remainingTotalMinutes % 60;
                const statusText = `Site blocked. ${remainingHours}h ${remainingMinutesInHour}m remaining.`;
                setStatus(statusEl, statusText, 'blocked');
                blockBtn.style.display = 'none';
                unlockBtn.style.display = 'block';
            } else {
                 if (!statusEl.textContent || !statusEl.textContent.includes('not currently site-blocked')) {
                   setStatus(statusEl, 'Twitter is not currently site-blocked.', 'default');
                }
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
            setStatus(statusEl, 'Please select a valid duration.', 'error');
            return;
        }
        chrome.runtime.sendMessage({ action: 'blockTwitter', minutes: totalMinutes });
        setStatus(statusEl, `Site block starting for ${hours}h ${minutes}m...`, 'default');
        updateTimerDisplayStatus();
    });

    unlockBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'unlockTwitter' });
        setStatus(statusEl, 'Site unlocked!', 'success');
        updateTimerDisplayStatus();
    });

    if (clearKeywordsBtn) {
        clearKeywordsBtn.addEventListener('click', () => {
            keywordsTextarea.value = '';
            setStatus(keywordsStatusEl, 'Keywords cleared from input.', 'default');
            setTimeout(() => setStatus(keywordsStatusEl, '', 'default'), 2000);
        });
    }

    function loadKeywords() {
        chrome.storage.local.get(['blockedKeywords'], (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error loading blockedKeywords:", chrome.runtime.lastError.message);
                setStatus(keywordsStatusEl, "Error loading keywords.", "error");
                setTimeout(() => setStatus(keywordsStatusEl, '', 'default'), 3000);
                return;
            }
            if (result.blockedKeywords && Array.isArray(result.blockedKeywords)) {
                keywordsTextarea.value = result.blockedKeywords.join('\n');
            }
        });
        setStatus(keywordsStatusEl, '', 'default');
    }

    saveKeywordsBtn.addEventListener('click', () => {
        setButtonLoading(saveKeywordsBtn, true, 'Save Keywords');
        const keywords = keywordsTextarea.value.split('\n').map(k => k.trim()).filter(k => k);
        chrome.storage.local.set({ blockedKeywords: keywords }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving keywords to storage:", chrome.runtime.lastError.message);
                setButtonLoading(saveKeywordsBtn, false, 'Save Keywords');
                setStatus(keywordsStatusEl, 'Error saving keywords!', 'error');
                setTimeout(() => setStatus(keywordsStatusEl, '', 'default'), 3000);
                return;
            }
            chrome.runtime.sendMessage({ action: 'updateKeywords', keywords }, () => {
                if (chrome.runtime.lastError) {
                    console.warn("Error sending updateKeywords message (but keywords are saved):", chrome.runtime.lastError.message);
                }
                setButtonLoading(saveKeywordsBtn, false, 'Save Keywords');
                setStatus(keywordsStatusEl, 'Keywords saved!', 'success');
                setTimeout(() => setStatus(keywordsStatusEl, '', 'default'), 3000);
            });
        });
    });

     if (clearBlockedUsersBtn) {
        clearBlockedUsersBtn.addEventListener('click', () => {
            blockedUsersTextarea.value = '';
            setStatus(blockedUsersStatusEl, 'Blocked users cleared from input.', 'default');
            setTimeout(() => setStatus(blockedUsersStatusEl, '', 'default'), 2000);
        });
    }

    function loadBlockedUsers() {
        chrome.storage.local.get(['blockedUsernames'], (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error loading blockedUsernames:", chrome.runtime.lastError.message);
                setStatus(blockedUsersStatusEl, "Error loading blocked users.", "error");
                setTimeout(() => setStatus(blockedUsersStatusEl, '', 'default'), 3000);
                return;
            }
            if (result.blockedUsernames && Array.isArray(result.blockedUsernames)) {
                blockedUsersTextarea.value = result.blockedUsernames.join('\n');
            }
        });
        setStatus(blockedUsersStatusEl, '', 'default');
    }

    saveBlockedUsersBtn.addEventListener('click', () => {
        setButtonLoading(saveBlockedUsersBtn, true, 'Save Blocked Users');
        const users = blockedUsersTextarea.value.split('\n')
            .map(u => u.trim().replace(/^@/, ''))
            .filter(u => u);
        chrome.storage.local.set({ blockedUsernames: users }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving blocked users to storage:", chrome.runtime.lastError.message);
                setButtonLoading(saveBlockedUsersBtn, false, 'Save Blocked Users');
                setStatus(blockedUsersStatusEl, 'Error saving blocked users!', 'error');
                setTimeout(() => setStatus(blockedUsersStatusEl, '', 'default'), 3000);
                return;
            }
            chrome.runtime.sendMessage({ action: 'updateBlockedUsers', blockedUsernames: users }, () => {
                 if (chrome.runtime.lastError) {
                    console.warn("Error sending updateBlockedUsers message (but users are saved):", chrome.runtime.lastError.message);
                }
                setButtonLoading(saveBlockedUsersBtn, false, 'Save Blocked Users');
                setStatus(blockedUsersStatusEl, 'Blocked users list saved!', 'success');
                setTimeout(() => setStatus(blockedUsersStatusEl, '', 'default'), 3000);
            });
        });
    });

    function loadContentFilters() {
        chrome.storage.local.get(['contentFilters'], (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error loading contentFilters:", chrome.runtime.lastError.message);
                setStatus(contentFiltersStatusEl, "Error loading filters.", "error");
                setTimeout(() => setStatus(contentFiltersStatusEl, '', 'default'), 3000);
                return;
            }
            if (result.contentFilters) {
                hideImagesCheckbox.checked = !!result.contentFilters.hideImages;
                hideVideosCheckbox.checked = !!result.contentFilters.hideVideos;
            } else {
                hideImagesCheckbox.checked = false;
                hideVideosCheckbox.checked = false;
            }
        });
         setStatus(contentFiltersStatusEl, '', 'default');
    }

    saveContentFiltersBtn.addEventListener('click', () => {
        setButtonLoading(saveContentFiltersBtn, true, 'Apply Content Filters');
        const filters = {
            hideImages: hideImagesCheckbox.checked,
            hideVideos: hideVideosCheckbox.checked
        };
        chrome.storage.local.set({ contentFilters: filters }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving content filters to storage:", chrome.runtime.lastError.message);
                setButtonLoading(saveContentFiltersBtn, false, 'Apply Content Filters');
                setStatus(contentFiltersStatusEl, 'Error saving filters!', 'error');
                setTimeout(() => setStatus(contentFiltersStatusEl, '', 'default'), 3000);
                return;
            }
            chrome.runtime.sendMessage({ action: 'updateContentFilters', contentFilters: filters }, () => {
                if (chrome.runtime.lastError) {
                    console.warn("Error sending updateContentFilters message (but filters are saved):", chrome.runtime.lastError.message);
                }
                setButtonLoading(saveContentFiltersBtn, false, 'Apply Content Filters');
                setStatus(contentFiltersStatusEl, 'Content filters applied!', 'success');
                setTimeout(() => setStatus(contentFiltersStatusEl, '', 'default'), 3000);
            });
        });
    });

    // --- Detoxification Summary Logic ---
    function updateStatsDisplay(stats) {
        const kCount = stats?.keywords ?? 0;
        const uCount = stats?.users ?? 0;
        const iCount = stats?.images ?? 0;
        const vCount = stats?.videos ?? 0;

        keywordsCountEl.textContent = kCount;
        usersCountEl.textContent = uCount;
        imagesCountEl.textContent = iCount;
        videosCountEl.textContent = vCount;

        // Toggle empty state
        if (kCount === 0 && uCount === 0 && iCount === 0 && vCount === 0) {
            summaryContentEl.classList.add('hidden');
            summaryEmptyStateEl.classList.remove('hidden');
        } else {
            summaryContentEl.classList.remove('hidden');
            summaryEmptyStateEl.classList.add('hidden');
        }
    }

    function loadAndDisplayStats() {
         setStatus(statsStatusEl, '', 'default');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab && currentTab.id && currentTab.url && (currentTab.url.startsWith('https://twitter.com') || currentTab.url.startsWith('https://x.com'))) {
                chrome.tabs.sendMessage(currentTab.id, { action: 'getDetoxStats' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.warn("Could not get stats for display:", chrome.runtime.lastError.message);
                         updateStatsDisplay({}); // Show empty state
                    } else if (response) {
                        updateStatsDisplay(response);
                    } else {
                         console.warn("No response when getting stats for display.");
                        updateStatsDisplay({}); // Show empty state
                    }
                });
            } else {
                updateStatsDisplay({}); // Show empty state if not on Twitter/X
            }
        });
    }

    resetStatsBtn.addEventListener('click', () => {
        setButtonLoading(resetStatsBtn, true, 'Reset Stats');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
             const currentTab = tabs[0];
            if (currentTab && currentTab.id && currentTab.url && (currentTab.url.startsWith('https://twitter.com') || currentTab.url.startsWith('https://x.com'))) {
                chrome.tabs.sendMessage(currentTab.id, { action: 'resetDetoxStats' }, (response) => {
                    setButtonLoading(resetStatsBtn, false, 'Reset Stats');
                    if (chrome.runtime.lastError) {
                        console.error("Error resetting stats via message:", chrome.runtime.lastError.message);
                        setStatus(statsStatusEl, 'Failed to reset stats.', 'error');
                         setTimeout(() => setStatus(statsStatusEl, '', 'default'), 3000);
                    } else if (response && response.success) {
                        updateStatsDisplay({ keywords: 0, users: 0, images: 0, videos: 0 });
                        setStatus(statsStatusEl, 'Stats reset!', 'success');
                        setTimeout(() => setStatus(statsStatusEl, '', 'default'), 3000);
                    } else {
                        setStatus(statsStatusEl, 'Failed to reset stats (no success).', 'error');
                         setTimeout(() => setStatus(statsStatusEl, '', 'default'), 3000);
                    }
                });
            } else {
                setButtonLoading(resetStatsBtn, false, 'Reset Stats');
                setStatus(statsStatusEl, 'Cannot reset (visit Twitter/X).', 'error');
                 setTimeout(() => setStatus(statsStatusEl, '', 'default'), 3000);
            }
        });
    });

    // Initial population and loading
    populateDropdowns();
    updateTimerDisplayStatus();
    loadKeywords();
    loadBlockedUsers();
    loadContentFilters();
    loadAndDisplayStats();

    const timerInterval = setInterval(updateTimerDisplayStatus, 5000);
    window.addEventListener('unload', () => {
        clearInterval(timerInterval);
    });
});