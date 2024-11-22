let isSearchBoxVisible = false;
let isResultsVisible = false;
let currentSelectedIndex = -1;

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggleSearchBox();
        // Also hide results when search box is hidden
        if (!isSearchBoxVisible) {
            const results = document.getElementById('subtitleResults');
            if (results) {
                results.remove();
                isResultsVisible = false;
                currentSelectedIndex = -1;
            }
        }
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
});

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
    // Remove existing results if any
    let existingResults = document.getElementById('subtitleResults');
    if (existingResults) existingResults.remove();

    const resultContainer = document.createElement('div');
    resultContainer.id = 'subtitleResults';
    resultContainer.style.position = 'fixed';
    resultContainer.style.top = '20%';
    resultContainer.style.left = '50%';
    resultContainer.style.transform = 'translateX(-50%)';
    resultContainer.style.background = '#fff';
    resultContainer.style.border = '1px solid #ccc';
    resultContainer.style.padding = '10px';
    resultContainer.style.zIndex = '10000';
    resultContainer.style.width = '300px';
    resultContainer.style.maxHeight = '300px';
    resultContainer.style.overflowY = 'scroll';

    results.forEach((result, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'subtitle-result';
        resultDiv.dataset.timestamp = result.timestamp;
        resultDiv.innerHTML = `${formatTimestamp(result.timestamp)} - ${result.text}`;
        resultDiv.style.padding = '5px';
        resultDiv.style.cursor = 'pointer';
        resultDiv.onclick = () => navigateToTimestamp(result.timestamp);
        resultContainer.appendChild(resultDiv);
    });

    document.body.appendChild(resultContainer);
    isResultsVisible = true;
    currentSelectedIndex = -1;

    // Add styles for selected state
    const style = document.createElement('style');
    style.textContent = `
        .subtitle-result.selected {
            background-color: #e6f3ff;
            border-left: 3px solid #0066cc;
        }
        .subtitle-result:hover {
            background-color: #f0f0f0;
        }
    `;
    document.head.appendChild(style);
}

function highlightResult(results) {
    results.forEach((result, index) => {
        if (index === currentSelectedIndex) {
            result.classList.add('selected');
            result.scrollIntoView({ block: 'nearest' });
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
    video.currentTime = timestamp;
    video.play();
}