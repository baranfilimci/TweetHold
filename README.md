# TweetHold

Never miss a tweet again. TweetHold is a Chrome Extension (Manifest V3) that remembers the latest tweets you scroll past on X/Twitter.

## What it does

- Tracks tweets on `x.com` and `twitter.com` while you browse feed pages.
- Saves the latest 50 unique tweets locally (text, tweet URL, optional image thumbnail).
- Shows saved tweets in a popup list.
- Lets you open any saved tweet in a new tab.
- Includes a **Clear History** button.

## Privacy

- No external network requests are made by the extension.
- Data is stored only in `chrome.storage.local` on your browser profile.

## Install from source (GitHub clone)

1. Clone the repository:

   ```bash
   git clone https://github.com/baranfilimci/TweetHold.git
   ```

2. Go to Chrome extensions page:
   - Open `chrome://extensions`
   - Enable **Developer mode**

3. Load unpacked extension:
   - Click **Load unpacked**
   - Select the project folder you cloned

4. Open `https://x.com/home` (or `https://twitter.com/home`) and scroll.

5. Click the extension icon to view saved tweets.

## How to use

- Browse Home, Lists, or Explore feeds on X/Twitter.
- TweetHold automatically captures newly seen tweets.
- Open popup to see the latest 50 saved tweets.
- Click any row to open the original tweet.
- Use **Clear History** when you want to reset.

## Project files

- `manifest.json` - Extension configuration (MV3).
- `content.js` - Tweet detection and local storage logic.
- `popup.html` - Popup UI layout and styles.
- `popup.js` - Popup rendering, live updates, clear history action.
- `icons/` - Extension icons in required sizes.

## Local development

When you change source files:

1. Go back to `chrome://extensions`
2. Click **Reload** on TweetHold
3. Refresh X/Twitter tab if needed

