class Results {
    constructor() {
        this.isVisible = false;
        this.currentSelectedIndex = -1;
        this.element = null;
    }

    create(results, searchTerms) {
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
            
            // Create the text content with highlights
            let textContent = result.text;
            searchTerms.forEach(term => {
                const regex = new RegExp(`(${term})`, 'gi');
                textContent = textContent.replace(regex, '<span class="highlight">$1</span>');
            });
            
            resultDiv.innerHTML = `<span style="color: #2196F3">${formatTimestamp(timestamp)}</span> - ${textContent}`;
            
            resultDiv.onclick = () => {
                if (!isNaN(timestamp)) {
                    navigateToTimestamp(timestamp);
                }
            };
            resultContainer.appendChild(resultDiv);
        });

        this.element = resultContainer;
        this.setupStyles(colors);
        this.addExportButton();
        this.isVisible = true;
        this.currentSelectedIndex = -1;

        // Add initial highlight for first result
        const resultElements = document.querySelectorAll('.subtitle-result');
        if (resultElements.length > 0) {
            this.currentSelectedIndex = 0;
            this.highlightResult(resultElements);
        }

        return resultContainer;
    }

    setupStyles(colors) {
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
    }

    addExportButton() {
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

        this.element.appendChild(exportBtn);
    }

    highlightResult(results) {
        results.forEach((result, index) => {
            if (index === this.currentSelectedIndex) {
                result.classList.add('selected');
                result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                result.classList.remove('selected');
            }
        });
    }

    remove() {
        if (this.element) {
            this.element.remove();
            this.element = null;
            this.isVisible = false;
            this.currentSelectedIndex = -1;
        }
    }
} 