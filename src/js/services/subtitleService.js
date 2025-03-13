export async function fetchSubtitles() {
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
            createLanguageSelector(captionTracks);
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

export async function searchSubtitles(keyword) {
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

function createLanguageSelector(captionTracks) {
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