# AU Spark Transcript Importer - Edge Extension

This extension allows you to import your transcript directly from AU Spark into the Course Cross Checker.

## Installation (Microsoft Edge)

1. Open Edge and go to `edge://extensions/`
2. Enable **Developer mode** (toggle in the bottom-left corner)
3. Click **Load unpacked**
4. Select the `extension` folder from this project
5. The extension icon (⚡) will appear in your toolbar

## How to Use

1. Go to the Course Cross Checker page and select your major
2. Click the **"Import From AU Spark"** button (or click the extension icon)
3. AU Spark will open in a new tab
4. **Login with your university Microsoft account** as usual
5. Navigate to your **grades/transcript page**
6. Click the orange **"Import to Cross Checker"** button that appears on the page
7. Return to the Cross Checker tab - your courses will be loaded automatically!

## How It Works

- The extension runs a content script on AU Spark pages
- When you click "Import", it reads the page text and extracts course data
- Data is sent back to the Cross Checker via browser messaging
- **Your credentials are never stored** - you login directly on AU Spark

## Troubleshooting

### "No transcript found" error
- Make sure you're on the correct grades/transcript page in AU Spark
- The page must show your course codes and credits
- Try scrolling to load all content before clicking Import

### Extension not working
- Check that the extension is enabled in `edge://extensions/`
- Refresh both the AU Spark page and the Cross Checker page
- Check the browser console for error messages

## Files

- `manifest.json` - Extension configuration
- `content.js` - Runs on AU Spark pages, handles scraping
- `background.js` - Service worker for messaging
- `popup.html/js` - Extension popup UI
- `icons/` - Extension icons

## Security

- This extension only has access to `auspark.au.edu` pages
- No data is sent to external servers
- Your login credentials stay with Microsoft/AU Spark
- Transcript data is only stored temporarily in browser memory
