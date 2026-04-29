# Privacy Policy for TweetHold

Last updated: 2026-04-30

TweetHold is a browser extension that helps users remember recently seen tweets while browsing X/Twitter.

## Overview

TweetHold is designed with a local-first privacy model. The extension stores captured tweet data only on the user's own browser profile using Chrome local storage.

## Data Collected

TweetHold may store the following data for tweets detected in supported feed pages:

- Tweet text
- Tweet URL
- Author display name
- Author username
- Author profile image URL
- Tweet media image URL (if present)
- Local save timestamp

## How Data Is Used

Collected data is used only to:

- Display saved tweet cards in the extension popup
- Allow users to reopen original tweet links
- Keep up to the latest 50 unique tweets in local history

## Storage and Retention

- Storage location: `chrome.storage.local` (on the user's device/browser profile)
- Retention limit: up to 50 latest unique tweets
- User control: users can clear saved history at any time with the **Clear History** button

## Data Sharing and Transfer

TweetHold does not:

- Sell user data
- Share user data with third parties
- Transfer saved data to external servers
- Use remote analytics or tracking services

## Permissions

TweetHold uses:

- `storage` permission to save tweet history locally
- Host permissions for `https://x.com/*` and `https://twitter.com/*` to detect tweets on supported pages

## Children's Privacy

TweetHold is not specifically directed to children under 13 and does not intentionally collect personal information from children.

## Changes to This Policy

This policy may be updated as the extension evolves. Updates will be reflected by changing the "Last updated" date in this document.

## Contact

For questions about this policy, open an issue in this repository:

[https://github.com/baranfilimci/TweetHold/issues](https://github.com/baranfilimci/TweetHold/issues)
