let isSearchBoxVisible = false;
let isResultsVisible = false;
let currentSelectedIndex = -1;

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
        // Create search box if it doesn't exist
        createSearchBox();
        isSearchBoxVisible = true;
    } else {
        // Toggle visibility
        if (isSearchBoxVisible) {
            searchBox.style.display = 'none';
            isSearchBoxVisible = false;
        } else {
            searchBox.style.display = 'block';
            searchBox.focus();
            isSearchBoxVisible = true;
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
    searchBox.placeholder = 'Type keyword to search subtitles...';
    
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
        outline: 'none' // Remove default focus outline
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

    // Add Enter key listener
    searchBox.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            const query = searchBox.value.trim();
            if (query) {
                const results = await searchSubtitles(query);
                displayResults(results);
            }
        }
    });
}

async function fetchSubtitles() {
    try {
        // Find all scripts on the page
        const scripts = Array.from(document.querySelectorAll('script:not([src])'));

        // Locate the script containing ytInitialPlayerResponse
        let playerResponseScript = scripts.find((script) =>
            script.textContent.includes('ytInitialPlayerResponse')
        );

        if (!playerResponseScript) {
            alert('Unable to find video metadata. Ensure the video has captions.');
            return null;
        }

        // Extract ytInitialPlayerResponse from the script
        const playerResponseMatch = playerResponseScript.textContent.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/);

        if (!playerResponseMatch) {
            alert('Unable to parse video metadata.');
            return null;
        }

        const playerResponse = JSON.parse(playerResponseMatch[1]);

        // Check for captions
        const captionTracks =
            playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (!captionTracks || captionTracks.length === 0) {
            alert('No subtitles available for this video.');
            return null;
        }

        // Fetch the subtitles (use the first track by default)
        const subtitleUrl = captionTracks[0].baseUrl;
        const response = await fetch(subtitleUrl);
        const subtitles = await response.text();

        // Parse XML subtitles
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

    const results = subtitles.filter((sub) => sub.text.toLowerCase().includes(keyword.toLowerCase()));
    return results;
}

function displayResults(results) {
    // Remove existing results
    let existingResults = document.getElementById('subtitleResults');
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
        resultDiv.innerHTML = `${formatTimestamp(timestamp)} - ${result.text}`;
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
            isSearchBoxVisible = false;
        }
        
        const results = document.getElementById('subtitleResults');
        if (results) {
            results.remove();
            isResultsVisible = false;
            currentSelectedIndex = -1; // Reset the selected index
        }
    }
}