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

        // Log the entire script content
        console.log('Found player response script:', playerResponseScript.textContent);

        const playerResponseMatch = playerResponseScript.textContent.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/);

        if (!playerResponseMatch) {
            alert('Unable to parse video metadata.');
            return null;
        }

        const playerResponse = JSON.parse(playerResponseMatch[1]);
        
        // Log the parsed player response
        console.log('Parsed player response:', playerResponse);

        const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        
        // Log available caption tracks
        console.log('Available caption tracks:', captionTracks);
        
        // Remove any existing language selector
        removeLanguageSelector();

        if (!captionTracks || captionTracks.length === 0) {
            alert('No subtitles available for this video.');
            return null;
        }

        const subtitleUrl = captionTracks[0].baseUrl;
        console.log('Selected subtitle URL:', subtitleUrl);
        
        const response = await fetch(subtitleUrl);
        const subtitles = await response.text();
        console.log('Fetched subtitles:', subtitles);

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(subtitles, 'text/xml');
        const texts = Array.from(xmlDoc.getElementsByTagName('text')).map((node) => ({
            start: node.getAttribute('start'),
            duration: node.getAttribute('dur'),
            text: node.textContent,
        }));

        console.log('Processed subtitle texts:', texts);
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

// Keep this function for cleanup purposes
function removeLanguageSelector() {
    const languageSelect = document.getElementById('subtitleLanguageSelect');
    if (languageSelect) {
        languageSelect.remove();
    }
    // Clear the global reference if exists
    if (window.subtitleLanguageSelector) {
        window.subtitleLanguageSelector = null;
    }
} 