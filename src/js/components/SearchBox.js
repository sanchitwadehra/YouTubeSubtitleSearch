class SearchBox {
    constructor(onSearch) {
        this.isVisible = false;
        this.lastSearch = '';
        this.onSearch = onSearch;
        this.element = null;
    }

    create() {
        const searchBox = document.createElement('input');
        searchBox.type = 'text';
        searchBox.id = 'subtitleSearchBox';
        searchBox.placeholder = this.lastSearch || 'Type keyword to search subtitles...';
        
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

        this.element = searchBox;
        this.setupEventListeners();
        return searchBox;
    }

    setupEventListeners() {
        this.element.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const query = this.element.value.trim();
                if (query) {
                    this.lastSearch = query;
                    await this.onSearch(query);
                }
            } else if (event.key === 'Tab') {
                event.preventDefault();
                if (this.lastSearch && !this.element.value) {
                    this.element.value = this.lastSearch;
                }
            }
        });

        this.element.addEventListener('input', () => {
            const existingResults = document.getElementById('subtitleResults');
            if (existingResults) {
                existingResults.remove();
            }
        });
    }

    toggle() {
        if (!this.element) {
            this.create();
            document.body.appendChild(this.element);
            this.isVisible = true;
        } else {
            if (this.isVisible) {
                this.element.style.display = 'none';
                this.isVisible = false;
                this.element.value = '';
                // Hide language selector when search box is hidden
                if (typeof removeLanguageSelector === 'function') {
                    removeLanguageSelector();
                }
            } else {
                this.element.style.display = 'block';
                this.element.value = '';
                this.element.placeholder = this.lastSearch || 'Type keyword to search subtitles...';
                this.element.focus();
                this.isVisible = true;
            }
        }
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.isVisible = false;
            this.element.value = '';
            // Hide language selector when search box is hidden
            if (typeof removeLanguageSelector === 'function') {
                removeLanguageSelector();
            }
        }
    }
} 