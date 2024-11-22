let isSearchBoxVisible = false;

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggleSearchBox();
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

    // Create a results container
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

    if (results.length === 0) {
        resultContainer.innerHTML = 'No matches found.';
    } else {
        results.forEach((result) => {
            const resultItem = document.createElement('div');
            resultItem.textContent = `${formatTimestamp(result.start)}: ${result.text}`;
            resultItem.style.cursor = 'pointer';
            resultItem.style.padding = '5px 0';
            resultItem.style.borderBottom = '1px solid #eee';

            // Click to navigate to timestamp
            resultItem.addEventListener('click', () => {
                const videoPlayer = document.querySelector('video');
                videoPlayer.currentTime = parseFloat(result.start);
            });

            resultContainer.appendChild(resultItem);
        });
    }

    document.body.appendChild(resultContainer);
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