document.addEventListener('keydown', async (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const searchBox = document.createElement('div');
      searchBox.style.position = 'fixed';
      searchBox.style.top = '10%';
      searchBox.style.left = '50%';
      searchBox.style.transform = 'translateX(-50%)';
      searchBox.style.zIndex = '9999';
      searchBox.style.background = '#fff';
      searchBox.style.padding = '10px';
      searchBox.style.borderRadius = '8px';
      searchBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      searchBox.innerHTML = `
        <input type="text" id="subtitleSearch" placeholder="Search subtitles..." style="width: 300px; padding: 8px; font-size: 16px;">
        <div id="results" style="max-height: 200px; overflow-y: auto; margin-top: 10px;"></div>
      `;
      document.body.appendChild(searchBox);
  
      const input = searchBox.querySelector('#subtitleSearch');
      const resultsDiv = searchBox.querySelector('#results');
  
      input.addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase();
        if (!query) {
          resultsDiv.innerHTML = '';
          return;
        }
  
        const captions = await fetchSubtitles();
        if (!captions) {
          resultsDiv.innerHTML = '<p>No subtitles found.</p>';
          return;
        }
  
        const matches = captions.filter((item) => item.text.toLowerCase().includes(query));
        resultsDiv.innerHTML = matches
          .map(
            (match) => `
            <div style="cursor: pointer; margin: 5px 0; padding: 5px; border-bottom: 1px solid #ccc;" data-timestamp="${match.start}">
              ${formatTimestamp(match.start)} - ${match.text}
            </div>`
          )
          .join('');
  
        resultsDiv.querySelectorAll('div[data-timestamp]').forEach((div) =>
          div.addEventListener('click', (e) => {
            const timestamp = e.currentTarget.getAttribute('data-timestamp');
            navigateToTimestamp(timestamp);
          })
        );
      });
    }
  });
  
  async function fetchSubtitles() {
    const videoId = new URLSearchParams(window.location.search).get('v');
    const response = await fetch(`https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`);
    if (!response.ok) return null;
  
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');
    const texts = Array.from(xml.getElementsByTagName('text'));
  
    return texts.map((node) => ({
      start: parseFloat(node.getAttribute('start')),
      text: node.textContent,
    }));
  }
  
  function navigateToTimestamp(timestamp) {
    const video = document.querySelector('video');
    video.currentTime = timestamp;
    video.play();
  }
  
  function formatTimestamp(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  }
  