# CS50-YouTube-Redirect

<p>
  <a href="./README.md">English</a> | 中文
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

一个 Tampermonkey 用户脚本，用于为 CS50x 的 section 和 shorts 页面显示快捷资源面板。

浏览 CS50x 时，section 和 shorts 页面通常会提供 slides、subtitles、transcript 和 YouTube 视频等相关资源。这个脚本可以让你**将鼠标悬停在受支持的 CS50x section 或 shorts 链接上，然后按下 `Alt`，快速打开对应资源**。

## 预览

```text
鼠标悬停在 CS50x section 或 shorts 链接上
        ↓
按下 Alt
        ↓
显示 CS50 Resources 面板
        ↓
打开 Slides / Subtitles / Transcript / YouTube
```

示例支持链接：

```text
https://cs50.harvard.edu/x/shorts/structures/
```

资源面板可能显示：

```text
Slides
Subtitles
Transcript
YouTube
```

资源会按照它们在原始 CS50 页面中出现的顺序显示。

## 功能

- 为 CS50x section 和 shorts 链接显示资源面板。
- 仅在 `https://cs50.harvard.edu/x/*` 下工作。
- 支持：
  - `https://cs50.harvard.edu/x/sections/...`
  - `https://cs50.harvard.edu/x/shorts/...`
- 触发方式为：鼠标悬停在受支持链接上，然后按下 `Alt`。
- 点击资源后会在新标签页中打开。
- 仅提取以下资源：
  - Slides
  - Subtitles
  - Transcript
  - YouTube
- 资源按照 CS50 原页面中的原始顺序显示。
- 缺失的资源会显示为 `Not found`。
- 避免扫描侧边栏、页眉、页脚和导航区域。
- 将受支持的 YouTube URL 规范化为 `https://www.youtube.com/watch?v=...`。
- 使用内存缓存，避免重复请求。
- 提供 `Refresh` 按钮，用于重新加载当前链接的资源。
- 保留普通点击、修饰键点击、中键点击和右键点击的浏览器默认行为。

## 安装

### 从 GitHub Raw 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或其他兼容的用户脚本管理器。
2. 点击上方的安装 badge，或打开：

```text
https://raw.githubusercontent.com/AnicSuny/CS50-YouTube-Redirect/main/CS50-YouTube-Redirect.user.js
```

3. Tampermonkey 应该会自动识别该用户脚本。
4. 点击 **Install**。
5. 访问 [CS50x](https://cs50.harvard.edu/x/)。

### 手动安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)。
2. 打开 Tampermonkey 控制面板。
3. 创建一个新的用户脚本。
4. 粘贴 `CS50-YouTube-Redirect.user.js` 的内容。
5. 保存脚本。

## 使用方法

1. 访问 CS50x 页面。
2. 将鼠标移动到受支持的 section 或 shorts 链接上。
3. 按下 `Alt`。
4. 资源面板会出现。
5. 点击资源，即可在新标签页中打开。

```text
悬停链接 → 按下 Alt → 选择资源
```

`Alt` 只用于触发面板。面板出现后，可以松开 `Alt`。只要鼠标仍在原链接或面板上，面板就会保持显示。

## 支持的链接

当前支持：

```text
https://cs50.harvard.edu/x/sections/...
https://cs50.harvard.edu/x/shorts/...
```

示例：

```text
https://cs50.harvard.edu/x/sections/5/
https://cs50.harvard.edu/x/shorts/structures/
```

其他 CS50 路径目前有意不处理，例如：

```text
https://cs50.harvard.edu/college/...
https://cs50.harvard.edu/extension/...
https://cs50.harvard.edu/x/2025/...
```

如果以后需要，可能会添加对更多 CS50 课程路径的支持。

## 行为

### 普通点击

脚本不会拦截普通点击。

当你普通左键点击一个受支持的 CS50x section 或 shorts 链接时，浏览器会像往常一样打开原始 CS50 页面。

### 资源面板

当你将鼠标悬停在受支持链接上并按下 `Alt` 时，脚本会：

1. 获取目标 CS50 页面。
2. 解析页面 HTML。
3. 搜索主内容区域。
4. 提取受支持的资源链接。
5. 在悬浮资源面板中显示这些资源。
6. 点击某个资源后，在新标签页中打开它。

### 修饰键点击与手动打开

脚本不会干扰：

```text
Ctrl + Click
Cmd + Click
Shift + Click
Alt + Click
鼠标中键
右键 → 在新标签页中打开
```

这些操作都会保留浏览器默认行为。

## 资源类型

脚本只提取以下资源：

```text
Slides
Subtitles
Transcript
YouTube
```

资源会按照它们在原始 CS50 页面中出现的顺序显示。

如果页面中缺少某个资源，面板会在下方显示：

```text
Not found
```

脚本不会猜测缺失资源的 URL，也不会单独请求缺失资源。

## 链接解析策略

脚本只扫描目标 CS50 页面的主内容区域。

它会忽略：

```text
nav
aside
header
footer
```

脚本会查找文本匹配以下内容的链接：

```text
Slides
Subtitles
Transcript
YouTube
```

对于 YouTube 链接，脚本会进行规范化处理。

## YouTube URL 规范化

脚本会将常见的 YouTube URL 格式规范化：

```text
https://youtu.be/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
https://www.youtube.com/shorts/VIDEO_ID
https://www.youtube.com/live/VIDEO_ID
```

转换为：

```text
https://www.youtube.com/watch?v=VIDEO_ID
```

已经有效的 `youtube.com/watch?v=...` 链接会保留为标准 watch URL 形式。

## 缓存

脚本会使用内存缓存保存解析出的资源。

这意味着：

- 资源数据只会缓存在当前页面会话中。
- 刷新 CS50 页面会清空缓存。
- 关闭标签页会清空缓存。
- 不会写入 `localStorage`。
- 不会将缓存发送到任何地方。

资源面板中包含一个 `Refresh` 按钮。点击它会清除当前悬停链接的缓存，并重新获取目标 CS50 页面。

## 用户脚本元数据

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

## 兼容性

已测试：

```text
Tampermonkey
现代 Chromium 系浏览器
https://cs50.harvard.edu/x/ 下的 CS50x 页面
```

其他支持标准用户脚本元数据和浏览器 API 的用户脚本管理器理论上也应可用。

## 限制

- 仅支持 `https://cs50.harvard.edu/x/*`。
- 仅处理 CS50x 下的 section 和 shorts 链接。
- 暂不支持其他 CS50 课程路径。
- 依赖 CS50 页面在内容区域中暴露受支持的资源链接。
- 不会猜测或构造缺失资源的 URL。
- 如果 CS50 大幅调整页面结构，选择器逻辑可能需要更新。

## 隐私

此脚本：

- 不收集数据。
- 不跟踪用户。
- 不向第三方服务器发送数据。
- 只会获取你悬停并触发的 CS50 目标页面。
- 仅在 `https://cs50.harvard.edu/x/*` 上运行。
- 资源缓存只保存在当前页面会话的内存中。

## 许可证

MIT License.
