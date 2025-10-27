# Copy as Org-Mode - Edge/Chrome Extension

A browser extension that allows you to copy selected web page content as Org-mode formatted text. This is a refactored version of the original Firefox extension, adapted for Edge and Chrome browsers using Manifest V3.

## Features

- Copy selected text as Org-mode format
- Copy current page title and URL as Org-mode link
- Copy individual links as Org-mode format
- Context menu integration
- Keyboard shortcut support (Ctrl+Alt+O / Cmd+Alt+O on Mac)

## Installation

### Development Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the extension in Edge/Chrome:
   - Open Edge/Chrome and go to `edge://extensions/` or `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Production Installation

The extension will be available on the Microsoft Edge Add-ons store and Chrome Web Store once published.

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Build Commands

- `npm run build` - Build for production
- `npm run dev` - Build and watch for changes during development
- `npm run clean` - Clean the dist directory

### Project Structure

```
src/
├── background.ts      # Service worker (Manifest V3)
├── content.ts         # Content script for page interaction
├── options.ts         # Options page functionality
├── converter/         # HTML to Org-mode conversion logic
├── html2org/          # Core conversion utilities
└── options_ui/        # Options page UI components
```

## Differences from Firefox Version

This Edge/Chrome version includes several adaptations:

1. **Manifest V3 Compatibility**: Updated from Manifest V2 to V3
2. **Service Worker**: Background script converted to service worker
3. **Chrome APIs**: Uses Chrome extension APIs instead of WebExtensions
4. **Scripting API**: Uses the newer `chrome.scripting` API for content injection
5. **Clipboard API**: Modern clipboard API with fallback support

## Original Project

This extension is based on the excellent work by ono ono (kuanyui):
- Original Firefox extension: https://github.com/kuanyui/copy-as-org-mode
- Forked repository: https://github.com/sethjano/copy-as-org-mode

## License

MPL-2.0 - Same as the original project

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in both Edge and Chrome
5. Submit a pull request

## Known Issues

- Full HTML to Org-mode conversion is still being adapted from the original codebase
- Some advanced formatting options may not be fully implemented yet

## Roadmap

- [ ] Complete HTML to Org-mode converter adaptation
- [ ] Add comprehensive options page
- [ ] Implement all original formatting features
- [ ] Add comprehensive testing
- [ ] Publish to browser extension stores
