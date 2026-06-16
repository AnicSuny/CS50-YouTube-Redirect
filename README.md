# CS50-YouTube-Redirect

<p>
  <a href="https://github.com/AnicSuny/CS50-YouTube-Redirect/releases">
    <img alt="Version" src="https://img.shields.io/badge/version-1.1.0-8A2BE2?style=for-the-badge&logo=github">
  </a>
  <a href="https://raw.githubusercontent.com/AnicSuny/CS50-YouTube-Redirect/main/CS50-YouTube-Redirect.user.js">
    <img alt="Install" src="https://img.shields.io/badge/install-userscript-2ea44f?style=for-the-badge&logo=tampermonkey&logoColor=white">
  </a>
  <a href="https://cs50.harvard.edu/x/">
    <img alt="CS50x" src="https://img.shields.io/badge/CS50x-supported-A51C30?style=for-the-badge">
  </a>
  <a href="https://www.tampermonkey.net/">
    <img alt="Tampermonkey" src="https://img.shields.io/badge/Tampermonkey-compatible-00485B?style=for-the-badge">
  </a>
  <a href="./LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge">
  </a>
</p>
English | [中文](./README-zh-CN.md)

A Tampermonkey userscript that opens CS50x section and shorts videos directly on YouTube.

When browsing CS50x, section and shorts videos are usually embedded inside the CS50 website. This script lets you **normal left-click a CS50 section or shorts link and open the corresponding YouTube video directly in a new tab**.

## Preview

```text
Normal left-click:

https://cs50.harvard.edu/x/shorts/structures/
        ↓
https://www.youtube.com/watch?v=...
```

If you want to open the original CS50 page for slides, subtitles, transcripts, or other course resources, use `Ctrl + Click`, `Cmd + Click`, middle click, or right-click open in new tab.

## Features

- Redirects CS50x section and shorts links to YouTube.
- Works only on `https://cs50.harvard.edu/x/*`.
- Handles normal left-clicks only.
- Preserves default browser behavior for:
  - `Ctrl + Click`
  - `Cmd + Click`
  - `Shift + Click`
  - `Alt + Click`
  - middle click
  - right click → open in new tab
- Reads YouTube links from the CS50 page content area.
- Avoids scanning sidebar, header, footer, and navigation areas.
- Falls back to opening the original CS50 page if no YouTube link is found.
- Normalizes supported YouTube URLs to `https://www.youtube.com/watch?v=...`.
- Shows a small loading page while resolving the target video.

## Installation

### Install from GitHub Raw

1. Install [Tampermonkey](https://www.tampermonkey.net/) or another compatible userscript manager.
2. Click the install badge above, or open:

```text
https://raw.githubusercontent.com/AnicSuny/CS50-YouTube-Redirect/main/CS50-YouTube-Redirect.user.js
```

3. Tampermonkey should detect the userscript automatically.
4. Click **Install**.
5. Visit [CS50x](https://cs50.harvard.edu/x/) and normal left-click a section or shorts link.

### Manual Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open the Tampermonkey dashboard.
3. Create a new userscript.
4. Paste the contents of `CS50-YouTube-Redirect.user.js`.
5. Save the script.

## Supported Links

Currently supported:

```text
https://cs50.harvard.edu/x/sections/...
https://cs50.harvard.edu/x/shorts/...
```

Examples:

```text
https://cs50.harvard.edu/x/sections/5/
https://cs50.harvard.edu/x/shorts/structures/
```

Other CS50 paths are intentionally not handled yet, such as:

```text
https://cs50.harvard.edu/college/...
https://cs50.harvard.edu/extension/...
https://cs50.harvard.edu/x/2025/...
```

Support for additional CS50 course paths may be added later if needed.

## Behavior

### Normal Left-Click

When you normal left-click a supported CS50x section or shorts link, the script:

1. Opens a new tab immediately.
2. Fetches the target CS50 page.
3. Finds the official YouTube link in the page content.
4. Redirects the new tab to the YouTube video.

### Modifier Clicks and Manual Opening

The script does not interfere with:

```text
Ctrl + Click
Cmd + Click
Shift + Click
Alt + Click
middle click
right click → open link in new tab
```

Use these actions when you want to open the original CS50 page to view slides, subtitles, transcripts, source code, or other course resources.

## How It Works

The script listens for click events on CS50x pages.

When a supported link is clicked, it:

1. Checks whether the clicked link points to a CS50x `sections` or `shorts` page.
2. Ignores the click if modifier keys are used.
3. Opens a blank new tab immediately to avoid popup blocking.
4. Fetches the target CS50 page.
5. Parses the page HTML.
6. Searches the main content area for a YouTube link.
7. Redirects the new tab to the resolved YouTube video.
8. Falls back to the original CS50 page if resolution fails.

## Link Resolution Strategy

The script prioritizes YouTube links in this order:

1. A YouTube link in the main content area whose text is exactly `YouTube`.
2. A YouTube link in the main content area whose text contains `YouTube`.
3. The first YouTube link found in the main content area.
4. A YouTube iframe source as a fallback.
5. The original CS50 page if no YouTube URL is found.

Navigation, sidebar, header, and footer areas are ignored.

## YouTube URL Normalization

The script normalizes common YouTube URL formats:

```text
https://youtu.be/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
https://www.youtube.com/shorts/VIDEO_ID
https://www.youtube.com/live/VIDEO_ID
```

into:

```text
https://www.youtube.com/watch?v=VIDEO_ID
```

Already valid `youtube.com/watch?v=...` links are preserved in standard watch URL form.

## Userscript Metadata

```javascript
// ==UserScript==
// @name         CS50-YouTube-Redirect
// @namespace    https://cs50.harvard.edu/
// @version      1.1.0
// @description  Open CS50x sections/shorts links directly in YouTube when left-clicked.
// @match        https://cs50.harvard.edu/x/*
// @icon         https://cs50.harvard.edu/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==
```

## Compatibility

Tested with:

```text
Tampermonkey
Modern Chromium-based browsers
CS50x pages under https://cs50.harvard.edu/x/
```

It should also work with other userscript managers that support standard userscript metadata and browser APIs.

## Limitations

- Only supports `https://cs50.harvard.edu/x/*`.
- Only redirects when clicking links from CS50x pages.
- Does not automatically redirect when directly visiting a section or shorts page.
- Depends on CS50 pages exposing a YouTube link or YouTube iframe in the page content.
- If CS50 significantly changes its page structure, the selector logic may need to be updated.

## Privacy

This script:

- Does not collect data.
- Does not track users.
- Does not send data to third-party servers.
- Only fetches CS50 target pages that you click.
- Only runs on `https://cs50.harvard.edu/x/*`.

## License

MIT License.
