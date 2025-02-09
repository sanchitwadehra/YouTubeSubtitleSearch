let isSearchBoxVisible = false;
let isResultsVisible = false;
let currentSelectedIndex = -1;

document.addEventListener('keydown', (event) => {
    // Check for Ctrl+K or Cmd+K (Mac)
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        // Prevent default behavior immediately
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
            const selectedResult = results[currentSelectedIndex];
            const timestamp = selectedResult.dataset.timestamp;
            navigateToTimestamp(timestamp);
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

function createSearchBox() {
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.id = 'subtitleSearchBox';
    searchBox.placeholder = 'Type keyword to search subtitles...';
    searchBox.style.position = 'fixed';
    searchBox.style.top = '10%';
    searchBox.style.left = '50%';
    searchBox.style.transform = 'translateX(-50%)';
    searchBox.style.padding = '10px';
    searchBox.style.zIndex = '10000';
    searchBox.style.width = '300px';
    searchBox.style.border = '1px solid #ccc';
    searchBox.style.borderRadius = '4px';
    searchBox.style.background = '#fff';
    searchBox.style.display = 'block';

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
    resultContainer.style.position = 'fixed';
    resultContainer.style.top = '15%';
    resultContainer.style.left = '50%';
    resultContainer.style.transform = 'translateX(-50%)';
    resultContainer.style.maxHeight = '50vh';
    resultContainer.style.overflowY = 'auto';
    resultContainer.style.background = '#fff';
    resultContainer.style.border = '1px solid #ccc';
    resultContainer.style.borderRadius = '4px';
    resultContainer.style.zIndex = '10000';
    resultContainer.style.width = '60%';
    resultContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';

    results.forEach((result) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'subtitle-result';
        // Convert start time to seconds if it's not already
        const timestamp = parseFloat(result.start);
        resultDiv.dataset.timestamp = timestamp;
        resultDiv.innerHTML = `${formatTimestamp(timestamp)} - ${result.text}`;
        resultDiv.style.padding = '8px';
        resultDiv.style.cursor = 'pointer';
        resultDiv.style.borderBottom = '1px solid #eee';
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

    // Add CSS for selected state
    const style = document.createElement('style');
    style.textContent = `
        .subtitle-result {
            padding: 8px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        }
        .subtitle-result.selected {
            background-color: #e6f3ff;
            border-left: 3px solid #0066cc;
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