let isSearchBoxVisible = false;
let isResultsVisible = false;
let currentSelectedIndex = -1;
let lastSearch = '';

document.addEventListener('keydown', (event) => {
    // Check for Ctrl+K or Cmd+K (Mac)
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        event.stopPropagation();
        
        toggleSearchBox();
        // Hide results when search box is hidden
        if (!isSearchBoxVisible) {
            const results = document.getElementById('subtitleResults');
            if (results) {
                results.remove();
                isResultsVisible = false;
                currentSelectedIndex = -1;
            }
        }
        return false;
    }

    // Handle arrow navigation when results are visible
    if (isResultsVisible) {
        const results = document.querySelectorAll('.subtitle-result');
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            currentSelectedIndex = Math.min(currentSelectedIndex + 1, results.length - 1);
            highlightResult(results);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            currentSelectedIndex = Math.max(currentSelectedIndex - 1, 0);
            highlightResult(results);
        } else if (event.key === 'Enter' && currentSelectedIndex !== -1) {
            event.preventDefault();
            event.stopPropagation(); // Add this to prevent event bubbling
            const selectedResult = results[currentSelectedIndex];
            const timestamp = selectedResult.dataset.timestamp;
            navigateToTimestamp(timestamp);
            
            // Explicitly handle cleanup here
            const searchBox = document.getElementById('subtitleSearchBox');
            if (searchBox) {
                searchBox.style.display = 'none';
                isSearchBoxVisible = false;
            }
            
            const resultsList = document.getElementById('subtitleResults');
            if (resultsList) {
                resultsList.remove();
                isResultsVisible = false;
                currentSelectedIndex = -1;
            }
        }
    }
}, true); // Added 'true' for event capturing phase

function toggleSearchBox() {
    let searchBox = document.getElementById('subtitleSearchBox');
    
    if (!searchBox) {
        createSearchBox();
        isSearchBoxVisible = true;
    } else {
        if (isSearchBoxVisible) {
            searchBox.style.display = 'none';
            isSearchBoxVisible = false;
            searchBox.value = ''; // Clear the input value but keep lastSearch
        } else {
            searchBox.style.display = 'block';
            searchBox.value = ''; // Clear the input value
            searchBox.placeholder = lastSearch || 'Type keyword to search subtitles...';
            searchBox.focus();
            isSearchBoxVisible = true;
            
            // Clear any existing results
            const existingResults = document.getElementById('subtitleResults');
            if (existingResults) {
                existingResults.remove();
                isResultsVisible = false;
                currentSelectedIndex = -1;
            }
        }
    }
}

function getThemeColors() {
    // Try multiple methods to detect theme
    const html = document.documentElement;
    const isDark = document.querySelector('html[dark]') !== null || 
                  getComputedStyle(html).getPropertyValue('--yt-spec-base-background').trim() === '#0f0f0f' ||
                  window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
        // Search box colors
        searchBackground: isDark ? '#272727' : '#ffffff',
        searchText: isDark ? '#ffffff' : '#000000',
        searchBorder: isDark ? '1px solid #3f3f3f' : '1px solid #dadce0',
        searchPlaceholder: isDark ? '#999999' : '#5f6368',
        
        // Results colors
        resultBackground: isDark ? '#272727' : '#ffffff',
        resultText: isDark ? '#ffffff' : '#000000',
        resultBorder: isDark ? '#3f3f3f' : '#dadce0',
        resultHover: isDark ? '#3a3a3a' : '#f5f5f5',
        resultSelected: isDark ? '#3f3f3f' : '#e6f3ff',
        resultSelectedBorder: isDark ? '#4f4f4f' : '#1a73e8',
        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.1)'
    };
}

function createSearchBox() {
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.id = 'subtitleSearchBox';
    searchBox.placeholder = lastSearch || 'Type keyword to search subtitles...';
    
    const colors = getThemeColors();

    Object.assign(searchBox.style, {
        position: 'fixed',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px',
        zIndex: '10000',
        width: '300px',
        borderRadius: '4px',
        display: 'block',
        background: colors.searchBackground,
        color: colors.searchText,
        border: colors.searchBorder,
        boxShadow: colors.boxShadow,
        outline: 'none'
    });

    // Add placeholder color
    const placeholderStyle = document.createElement('style');
    placeholderStyle.textContent = `
        #subtitleSearchBox::placeholder {
            color: ${colors.searchPlaceholder};
            opacity: 1;
        }
    `;
    document.head.appendChild(placeholderStyle);

    document.body.appendChild(searchBox);
    searchBox.focus();

    // Add event listeners
    searchBox.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const query = searchBox.value.trim();
            if (query) {
                lastSearch = query;
                const results = await searchSubtitles(query);
                displayResults(results);
                if (results.length > 0) {
                    isResultsVisible = true;
                    currentSelectedIndex = 0;
                    highlightResult(document.querySelectorAll('.subtitle-result'));
                }
            }
        } else if (event.key === 'Tab') {
            event.preventDefault();
            if (lastSearch && !searchBox.value) {
                searchBox.value = lastSearch;
            }
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            const query = searchBox.value.trim();
            const historyContainer = document.getElementById('searchHistory');
            
            if (!query && searchHistory.length > 0) {
                event.preventDefault();
                
                if (!historyContainer) {
                    showSearchHistory();
                    currentSelectedIndex = event.key === 'ArrowDown' ? 0 : searchHistory.length - 1;
                } else {
                    if (event.key === 'ArrowDown') {
                        currentSelectedIndex = currentSelectedIndex === -1 ? 0 :
                            Math.min(currentSelectedIndex + 1, searchHistory.length - 1);
                    } else {
                        currentSelectedIndex = currentSelectedIndex === -1 ? 
                            searchHistory.length - 1 : 
                            Math.max(currentSelectedIndex - 1, 0);
                    }
                }
                
                const historyItems = document.querySelectorAll('.history-item');
                historyItems.forEach((item, index) => {
                    if (index === currentSelectedIndex) {
                        item.classList.add('history-selected');
                        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                        searchBox.value = item.textContent;
                    } else {
                        item.classList.remove('history-selected');
                    }
                });
            } else if (isResultsVisible) {
                // Existing results navigation code
                event.preventDefault();
                const results = document.querySelectorAll('.subtitle-result');
                if (event.key === 'ArrowDown') {
                    currentSelectedIndex = Math.min(currentSelectedIndex + 1, results.length - 1);
                } else {
                    currentSelectedIndex = Math.max(currentSelectedIndex - 1, 0);
                }
                highlightResult(results);
            }
        } else if (event.key === 'Escape') {
            // Handle Escape key
            const historyContainer = document.getElementById('searchHistory');
            if (historyContainer) {
                historyContainer.remove();
                searchBox.value = '';
                currentSelectedIndex = -1;
            }
        }
    });

    // Update the input event listener
    searchBox.addEventListener('input', () => {
        const existingResults = document.getElementById('subtitleResults');
        if (existingResults) {
            existingResults.remove();
            isResultsVisible = false;
            currentSelectedIndex = -1;
        }
    });

    // Add focus event to show history when search box is empty
    searchBox.addEventListener('focus', () => {
        if (!searchBox.value.trim() && searchHistory.length > 0) {
            showSearchHistory();
            currentSelectedIndex = -1;
        }
    });
}

async function fetchSubtitles() {
    try {
        const scripts = Array.from(document.querySelectorAll('script:not([src])'));
        const playerResponseScript = scripts.find((script) =>
            script.textContent.includes('ytInitialPlayerResponse')
        );

        if (!playerResponseScript) {
            alert('Unable to find video metadata. Ensure the video has captions.');
            return null;
        }

        const playerResponseMatch = playerResponseScript.textContent.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/);

        if (!playerResponseMatch) {
            alert('Unable to parse video metadata.');
            return null;
        }

        const playerResponse = JSON.parse(playerResponseMatch[1]);

        const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        
        if (captionTracks && captionTracks.length > 1) {
            const languageSelect = document.createElement('select');
            languageSelect.id = 'subtitleLanguageSelect';
            languageSelect.style.position = 'fixed';
            languageSelect.style.top = 'calc(10% - 30px)';
            languageSelect.style.left = '50%';
            languageSelect.style.transform = 'translateX(-50%)';
            languageSelect.style.zIndex = '10000';

            captionTracks.forEach((track, index) => {
                const option = document.createElement('option');
                option.value = track.baseUrl;
                option.text = track.name.simpleText;
                languageSelect.appendChild(option);
            });

            document.body.appendChild(languageSelect);
        }

        if (!captionTracks || captionTracks.length === 0) {
            alert('No subtitles available for this video.');
            return null;
        }

        const subtitleUrl = captionTracks[0].baseUrl;
        const response = await fetch(subtitleUrl);
        const subtitles = await response.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(subtitles, 'text/xml');
        const texts = Array.from(xmlDoc.getElementsByTagName('text')).map((node) => ({
            start: node.getAttribute('start'),
            duration: node.getAttribute('dur'),
            text: node.textContent,
        }));

        return texts;
    } catch (error) {
        console.error('Error fetching subtitles:', error);
        alert('Unable to fetch subtitles.');
        return null;
    }
}


async function searchSubtitles(keyword) {
    const subtitles = await fetchSubtitles();
    if (!subtitles) return [];

    // Convert keyword to lowercase and trim any extra spaces
    const searchTerms = keyword.toLowerCase().trim().split(/\s+/);
    
    // Filter subtitles that contain all search terms
    const results = subtitles.filter((sub) => {
        const subtitleText = sub.text.toLowerCase();
        return searchTerms.every(term => subtitleText.includes(term));
    });
    
    return results;
}

function displayResults(results) {
    const existingResults = document.getElementById('subtitleResults');
    if (existingResults) existingResults.remove();

    const resultContainer = document.createElement('div');
    resultContainer.id = 'subtitleResults';

    const colors = getThemeColors();

    Object.assign(resultContainer.style, {
        position: 'fixed',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        maxHeight: '50vh',
        overflowY: 'auto',
        borderRadius: '4px',
        zIndex: '10000',
        width: '60%',
        background: colors.resultBackground,
        border: `1px solid ${colors.resultBorder}`,
        boxShadow: colors.boxShadow,
        color: colors.resultText
    });

    results.forEach((result) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'subtitle-result';
        const timestamp = parseFloat(result.start);
        resultDiv.dataset.timestamp = timestamp;
        
        // Get the search terms from the search box
        const searchTerms = document.getElementById('subtitleSearchBox').value
            .toLowerCase()
            .trim()
            .split(/\s+/);
        
        // Create the text content with highlights
        let textContent = result.text;
        searchTerms.forEach(term => {
            // Create a regex that matches the term with case insensitivity
            const regex = new RegExp(`(${term})`, 'gi');
            textContent = textContent.replace(regex, '<span class="highlight">$1</span>');
        });
        
        // Create separate spans for timestamp and highlighted text
        resultDiv.innerHTML = `<span style="color: #2196F3">${formatTimestamp(timestamp)}</span> - ${textContent}`;
        
        resultDiv.onclick = () => {
            if (!isNaN(timestamp)) {
                navigateToTimestamp(timestamp);
            }
        };
        resultContainer.appendChild(resultDiv);
    });

    document.body.appendChild(resultContainer);
    isResultsVisible = true;
    currentSelectedIndex = -1;

    // Add initial highlight for first result
    const resultElements = document.querySelectorAll('.subtitle-result');
    if (resultElements.length > 0) {
        currentSelectedIndex = 0;
        highlightResult(resultElements);
    }

    // Add theme-aware CSS for results
    const style = document.createElement('style');
    style.textContent = `
        .subtitle-result {
            padding: 8px;
            cursor: pointer;
            border-bottom: 1px solid ${colors.resultBorder};
            color: ${colors.resultText};
            transition: background-color 0.2s ease;
        }
        .subtitle-result:hover {
            background-color: ${colors.resultHover};
        }
        .subtitle-result.selected {
            background-color: ${colors.resultSelected};
            border-left: 3px solid ${colors.resultSelectedBorder};
        }
        .highlight {
            background-color: #ffeb3b;
            color: #000000;
            padding: 0 2px;
            border-radius: 2px;
        }
        #subtitleResults::-webkit-scrollbar {
            width: 8px;
        }
        #subtitleResults::-webkit-scrollbar-track {
            background: ${colors.resultBackground};
        }
        #subtitleResults::-webkit-scrollbar-thumb {
            background: ${colors.resultBorder};
            border-radius: 4px;
        }
        #subtitleResults::-webkit-scrollbar-thumb:hover {
            background: ${colors.resultSelectedBorder};
        }
    `;
    document.head.appendChild(style);

    addExportButton(resultContainer);
}

function highlightResult(results) {
    results.forEach((result, index) => {
        if (index === currentSelectedIndex) {
            result.classList.add('selected');
            result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            result.classList.remove('selected');
        }
    });
}

// Choose one format based on your needs:
function formatTimestamp(seconds) {
    // For videos under 1 hour, use MM:SS format
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
    
    // Uncomment below for HH:MM:SS format if needed
    /*
    const date = new Date(0);
    date.setSeconds(parseFloat(seconds));
    return date.toISOString().substr(11, 8);
    */
}

function navigateToTimestamp(timestamp) {
    const video = document.querySelector('video');
    const time = parseFloat(timestamp);
    if (video && !isNaN(time)) {
        video.currentTime = time;
        video.play();
        
        // Close search box and results after navigation
        const searchBox = document.getElementById('subtitleSearchBox');
        if (searchBox) {
            searchBox.style.display = 'none';
            // Don't clear the lastSearch value, but clear the input value
            searchBox.value = '';
            isSearchBoxVisible = false;
        }
        
        const results = document.getElementById('subtitleResults');
        if (results) {
            results.remove();
            isResultsVisible = false;
            currentSelectedIndex = -1;
        }
    }
}

function addExportButton(resultContainer) {
    const colors = getThemeColors();
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Results';
    
    Object.assign(exportBtn.style, {
        position: 'absolute',
        right: '10px',
        top: '10px',
        padding: '6px 12px',
        backgroundColor: colors.resultSelectedBorder,
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    });
    
    exportBtn.onmouseover = () => {
        exportBtn.style.opacity = '0.9';
    };
    
    exportBtn.onmouseout = () => {
        exportBtn.style.opacity = '1';
    };
    
    exportBtn.onclick = () => {
        const results = Array.from(document.querySelectorAll('.subtitle-result'))
            .map(result => {
                const timestamp = result.querySelector('span').textContent;
                const text = result.textContent.split(' - ')[1];
                return `${timestamp} - ${text}`;
            })
            .join('\n');

        const blob = new Blob([results], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `youtube-subtitles-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    resultContainer.appendChild(exportBtn);
}

function addTimeRangeFilter(searchBox) {
    const rangeContainer = document.createElement('div');
    rangeContainer.style.marginTop = '5px';
    
    const startInput = document.createElement('input');
    startInput.type = 'text';
    startInput.placeholder = 'Start (MM:SS)';
    
    const endInput = document.createElement('input');
    endInput.type = 'text';
    endInput.placeholder = 'End (MM:SS)';
    
    rangeContainer.appendChild(startInput);
    rangeContainer.appendChild(endInput);
    
    searchBox.parentNode.insertBefore(rangeContainer, searchBox.nextSibling);
    
    return {
        getRange: () => ({
            start: parseTimeInput(startInput.value),
            end: parseTimeInput(endInput.value)
        })
    };
}

function parseTimeInput(timeStr) {
    if (!timeStr) return null;
    const [min, sec] = timeStr.split(':').map(Number);
    return min * 60 + (sec || 0);
}

function showKeyboardShortcuts() {
    const shortcuts = document.createElement('div');
    shortcuts.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; 
                    background: ${colors.resultBackground}; padding: 10px; 
                    border-radius: 4px; border: ${colors.resultBorder}">
            <h3>Keyboard Shortcuts</h3>
            <ul>
                <li>Ctrl/⌘ + K: Open search</li>
                <li>↑/↓: Navigate results</li>
                <li>Enter: Go to timestamp</li>
                <li>Tab: Use last search</li>
                <li>Esc: Close search</li>
            </ul>
        </div>
    `;
    document.body.appendChild(shortcuts);
    setTimeout(() => shortcuts.remove(), 3000);
}