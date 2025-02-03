# YouTube Subtitle Searcher

A Chrome extension that enables quick and efficient searching through YouTube video subtitles, allowing users to easily find and jump to specific moments in videos.

## Features

- **Quick Search Access**: Press `Ctrl+K` (or `Cmd+K` on Mac) to open the search interface
- **Real-time Subtitle Search**: Search through video subtitles while watching
- **Keyboard Navigation**: Use arrow keys to navigate through search results
- **Click-to-Jump**: Click on any search result to jump to that timestamp in the video
- **Timestamp Display**: Each result shows the exact timestamp where the text appears
- **Keyboard Shortcuts**:
  - `Enter`: Jump to the selected timestamp
  - `↑`: Navigate to previous result
  - `↓`: Navigate to next result

## Installation

### From Chrome Web Store
*(Coming soon)*

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

## Technical Details

### Files Structure
- `manifest.json`: Extension configuration and permissions
- `content.js`: Main script for subtitle extraction and search functionality
- `background.js`: Handles extension commands and initialization
- `icon.png`: Extension icon

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