class SubtitleSearch {
    constructor() {
        this.searchBox = new SearchBox(this.handleSearch.bind(this));
        this.results = new Results();
    }

    async handleSearch(query) {
        const results = await searchSubtitles(query);
        if (results.length > 0) {
            const searchTerms = query.toLowerCase().trim().split(/\s+/);
            const resultsContainer = this.results.create(results, searchTerms);
            document.body.appendChild(resultsContainer);
        }
    }

    handleKeydown(event) {
        // Check for Ctrl+K or Cmd+K (Mac)
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            event.stopPropagation();
            
            this.searchBox.toggle();
            // Hide results when search box is hidden
            if (!this.searchBox.isVisible) {
                this.results.remove();
            }
            return false;
        }

        // Handle arrow navigation when results are visible
        if (this.results.isVisible) {
            const resultElements = document.querySelectorAll('.subtitle-result');
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.results.currentSelectedIndex = Math.min(
                    this.results.currentSelectedIndex + 1,
                    resultElements.length - 1
                );
                this.results.highlightResult(resultElements);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.results.currentSelectedIndex = Math.max(
                    this.results.currentSelectedIndex - 1,
                    0
                );
                this.results.highlightResult(resultElements);
            } else if (event.key === 'Enter' && this.results.currentSelectedIndex !== -1) {
                event.preventDefault();
                event.stopPropagation();
                const selectedResult = resultElements[this.results.currentSelectedIndex];
                const timestamp = selectedResult.dataset.timestamp;
                navigateToTimestamp(timestamp);
                
                // Cleanup
                this.searchBox.hide();
                this.results.remove();
            }
        }
    }

    init() {
        document.addEventListener('keydown', this.handleKeydown.bind(this), true);
        
        // Listen for messages from the background script
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'toggle-search') {
                this.searchBox.toggle();
                if (!this.searchBox.isVisible) {
                    this.results.remove();
                }
            }
        });
    }
}

// Initialize the extension
const subtitleSearch = new SubtitleSearch();
subtitleSearch.init();