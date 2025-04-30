# Chrome Device AI

A Chrome extension that uses AI to enhance your browsing experience with features like article summarization, event extraction, and page translation.

## Features

- **Article Summarization**: Quickly get a concise summary of any article or webpage you're reading
- **Event Extraction**: Automatically extract event details from articles and add them to your calendar
- **Page Translation**: Translate webpage content directly in your browser
- **Retro UI**: Nostalgic NES-style interface for a unique user experience

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/SherlockHomer/chrome-device-ai.git
   ```

2. Navigate to `chrome://extensions/` in Chrome

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the project directory

5. The extension should now be installed and visible in your extensions list

## Usage

1. Click on the extension icon to open the side panel
2. Use the "Summarize the article" button to generate a summary of the current page
3. For articles containing airdrop events, use "Add airdrop time to calendar" to extract event details
4. Use "Translate Page" to translate the current webpage

## Development

### Prerequisites

- Node.js and pnpm installed

### Setup

1. Install dependencies:
   ```
   pnpm install
   ```

2. Build the extension:
   ```
   pnpm build
   ```

3. For development with hot-reloading:
   ```
   pnpm dev
   ```

## Technical Details

- Built with React
- Uses Chrome extension APIs for browser integration
- Implements AI capabilities for text processing
- Features optimized textarea handling to prevent UI flickering during scrolling

## License

[MIT License](LICENSE) 