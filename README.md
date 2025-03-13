# YouTube Subtitle Searcher

A Chrome extension that enables quick and efficient searching through YouTube video subtitles, allowing users to easily find and jump to specific moments in videos.

## Features

- **Quick Search Access**: Press `Ctrl+K` (or `Cmd+K` on Mac) to open the search interface
- **Real-time Subtitle Search**: Search through video subtitles while watching
- **Keyboard Navigation**: Use arrow keys to navigate through search results
- **Click-to-Jump**: Click on any search result to jump to that timestamp in the video
- **Timestamp Display**: Each result shows the exact timestamp where the text appears
- **Export Results**: Export search results to a text file
- **Theme Support**: Automatically adapts to YouTube's light/dark theme
- **Keyboard Shortcuts**:
  - `Enter`: Jump to the selected timestamp
  - `↑`: Navigate to previous result
  - `↓`: Navigate to next result
  - `Tab`: Restore last search query

## Technologies
- JavaScript (ES6+)
- HTML
- CSS
- Chrome Extensions API
  - Manifest V3
  - Content Scripts
  - Background Scripts
  - Commands API
  - Scripting API

## Installation

### From Chrome Web Store
(https://chromewebstore.google.com/detail/youtube-subtitle-searcher/lnoiiejflgfpleapnbakamgonhggjphl?pli=1)

### Manual Installation
1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to any YouTube video with subtitles
2. Press `Ctrl+K` (or `Cmd+K` on Mac) to open the search box
3. Type your search query and press Enter
4. Use arrow keys to navigate through results or click directly on a result
5. Press Enter or click to jump to the selected timestamp
6. Click "Export Results" to save search results to a text file

## Technical Details

### Files Structure
```
src/
├── js/
│   ├── components/
│   │   ├── SearchBox.js    # Search input UI component
│   │   └── Results.js      # Results display component
│   ├── services/
│   │   └── subtitleService.js  # Subtitle fetching and searching
│   ├── utils/
│   │   ├── helpers.js      # Utility functions
│   │   └── themeManager.js # Theme management
│   ├── content.js          # Main content script
│   └── background.js       # Background service worker
├── styles/                 # CSS styles (if needed)
└── assets/                # Images and other assets
```

### Permissions Required
- `activeTab`: To interact with the current YouTube tab
- `scripting`: To inject content scripts
- `host_permissions`: Limited to YouTube.com domains

## Requirements

- Google Chrome browser (version 88 or later)
- YouTube videos must have subtitles/closed captions available

## Limitations

- Only works with videos that have subtitles enabled
- Currently supports only the first available subtitle track
- Requires an active internet connection to fetch subtitles

## Development

### Building from Source
1. Clone the repository:
```bash
git clone https://github.com/sanchitwadehra/YouTubeSubtitleSearch.git
```
2. Make your modifications
3. Load the extension in Chrome using Developer mode

### Contributing
1. Fork the repository
2. Create a new branch for your feature
3. Submit a pull request with a clear description of your changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have suggestions for improvements, please open an issue on the GitHub repository.

## Version History

- 1.0.0 (2024): Initial release
  - Basic subtitle search functionality
  - Keyboard navigation
  - Timestamp jumping
  - Theme support
  - Export functionality
  - Modular code structure

The activeTab permission is required to interact with the current YouTube video page. This allows the extension to:
1. Read subtitle/caption data from the current video
2. Insert the search interface when activated
3. Control video playback to jump to specific timestamps when a search result is selected

The extension only activates when explicitly triggered by the user (via Ctrl+K/Cmd+K) and only on YouTube.com video pages.
