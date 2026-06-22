# CS50-YouTube-Redirect

<p>
  English | <a href="./README-zh-CN.md">中文</a>
</p>

<p>
  <a href="https://github.com/AnicSuny/CS50-YouTube-Redirect/releases">
    <img alt="Version" src="https://img.shields.io/badge/version-1.2.0-8A2BE2?style=plastic&logo=github">
  </a>
  <a href="https://raw.githubusercontent.com/AnicSuny/CS50-YouTube-Redirect/main/CS50-YouTube-Redirect.user.js">
    <img alt="Install" src="https://img.shields.io/badge/install-userscript-2ea44f?style=plastic&logo=tampermonkey&logoColor=white">
  </a>
  <a href="https://cs50.harvard.edu/x/">
    <img alt="CS50x" src="https://img.shields.io/badge/CS50x-supported-A51C30?style=plastic">
  </a>
  <a href="https://www.tampermonkey.net/">
    <img alt="Tampermonkey" src="https://img.shields.io/badge/Tampermonkey-compatible-00485B?style=plastic">
  </a>
  <a href="./LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=plastic">
  </a>
</p>

A Tampermonkey userscript that shows a quick resource panel for CS50x section and shorts pages.

When browsing CS50x, section and shorts pages often provide related resources such as slides, subtitles, transcripts, and YouTube videos. This script lets you **hover over a supported CS50x section or shorts link, press `Alt`, and quickly open the related resources in new tabs**.

## Preview

```text
Hover a CS50x section or shorts link
        ↓
Press Alt
        ↓
CS50 Resources panel appears
        ↓
Open Slides / Subtitles / Transcript / YouTube
```

Example supported link:

```text
https://cs50.harvard.edu/x/shorts/structures/
```

The resource panel may show:

```text
Slides
Subtitles
Transcript
YouTube
```

Resources are displayed in the same order as they appear on the original CS50 page.

## Features

- Shows a resource panel for CS50x section and shorts links.
- Works only on `https://cs50.harvard.edu/x/*`.
- Supports:
  - `https://cs50.harvard.edu/x/sections/...`
  - `https://cs50.harvard.edu/x/shorts/...`
- Triggered by hovering a supported link and then pressing `Alt`.
- Opens selected resources in new tabs.
- Extracts only the following resources:
  - Slides
  - Subtitles
  - Transcript
  - YouTube
- Displays resources in the original order from the CS50 page.
- Shows missing resources as `Not found`.
- Avoids scanning sidebar, header, footer, and navigation areas.
- Normalizes supported YouTube URLs to `https://www.youtube.com/watch?v=...`.
- Uses in-memory caching to avoid repeated requests.
- Provides a `Refresh` button to reload resources for the current link.
- Preserves normal browser behavior for regular clicks, modifier clicks, middle clicks, and right-click actions.

## Installation

### Install from GitHub Raw

1. Install [Tampermonkey](https://www.tampermonkey.net/) or another compatible userscript manager.
2. Click the install badge above, or open:

```text
https://raw.githubusercontent.com/AnicSuny/CS50-YouTube-Redirect/main/CS50-YouTube-Redirect.user.js
```

3. Tampermonkey should detect the userscript automatically.
4. Click **Install**.
5. Visit [CS50x](https://cs50.harvard.edu/x/).

### Manual Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open the Tampermonkey dashboard.
3. Create a new userscript.
4. Paste the contents of `CS50-YouTube-Redirect.user.js`.
5. Save the script.

## Usage

1. Visit a CS50x page.
2. Move your mouse over a supported section or shorts link.
3. Press `Alt`.
4. A resource panel will appear.
5. Click a resource to open it in a new tab.

```text
Hover link → Press Alt → Choose resource
```

The `Alt` key is only used to trigger the panel. After the panel appears, you can release `Alt`. The panel remains visible until your mouse leaves both the original link and the panel.

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

### Normal Clicks

The script does not intercept normal clicks.

When you normal left-click a supported CS50x section or shorts link, the browser opens the original CS50 page as usual.

### Resource Panel

When you hover over a supported link and press `Alt`, the script:

1. Fetches the target CS50 page.
2. Parses the page HTML.
3. Searches the main content area.
4. Extracts supported resource links.
5. Displays them in a floating resource panel.
6. Opens the selected resource in a new tab.

### Modifier Clicks and Manual Opening

The script does not interfere with:

```text
Ctrl + Click
Cmd + Click
Shift + Click
Alt + Click
middle click
right click → open in new tab
```

Use these actions normally when you want the browser's default behavior.

## Resource Types

The script only extracts these resources:

```text
Slides
Subtitles
Transcript
YouTube
```

Resources are shown in the same order as they appear on the original CS50 page.

If a resource is missing from the page, the panel displays it under:

```text
Not found
```

The script does not try to guess missing resource URLs and does not fetch missing resources separately.

## Link Resolution Strategy

The script scans only the main content area of the target CS50 page.

It ignores:

```text
nav
aside
header
footer
```

The script looks for links whose text matches one of:

```text
Slides
Subtitles
Transcript
YouTube
```

For YouTube links, supported URL formats are normalized.

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

## Caching

The script uses in-memory caching for resolved resources.

This means:

- Resource data is cached only in the current page session.
- Refreshing the CS50 page clears the cache.
- Closing the tab clears the cache.
- No cache is stored in `localStorage` or sent anywhere.

The resource panel includes a `Refresh` button. Clicking it clears the cache for the current hovered link and fetches the target CS50 page again.

## Userscript Metadata

```javascript
// ==UserScript==
// @name         CS50-YouTube-Redirect
// @namespace    https://cs50.harvard.edu/
// @version      1.2.0
// @description  Show CS50x section/shorts resources in a hover panel and open them in new tabs.
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
- Only handles section and shorts links under CS50x.
- Does not support other CS50 course paths yet.
- Depends on CS50 pages exposing supported resource links in the page content.
- Does not guess or construct missing resource URLs.
- If CS50 significantly changes its page structure, the selector logic may need to be updated.

## Privacy

This script:

- Does not collect data.
- Does not track users.
- Does not send data to third-party servers.
- Only fetches CS50 target pages that you hover and trigger.
- Only runs on `https://cs50.harvard.edu/x/*`.
- Stores resource cache only in memory for the current page session.

## License

MIT License.
