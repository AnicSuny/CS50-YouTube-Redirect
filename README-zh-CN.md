# CS50-YouTube-Redirect

<p>
  <a href="https://github.com/AnicSuny/CS50-YouTube-Redirect/releases">
    <img alt="Version" src="https://img.shields.io/badge/version-1.1.0-8A2BE2?style=plastic&logo=github">
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

<p>
  <a href="./README.md">English</a> | <a href="./README-zh-CN.md">中文</a>
</p>

---

一个 Tampermonkey 用户脚本，用于在 YouTube 上直接打开 CS50x 的 section 和 shorts 视频。

浏览 CS50x 时，section 和 shorts 视频通常以内嵌形式显示在 CS50 网站中。这个脚本可以让你在**普通左键单击 CS50 section 或 shorts 链接时，直接在新标签页中打开对应的 YouTube 视频**。

## 预览

```text
普通左键单击：

https://cs50.harvard.edu/x/shorts/structures/
        ↓
https://www.youtube.com/watch?v=...
```

如果你想打开原始 CS50 页面以查看 slides、subtitles、transcripts 或其他课程资源，请使用 `Ctrl + Click`、`Cmd + Click`、鼠标中键，或右键选择在新标签页中打开。

## 功能

- 将 CS50x section 和 shorts 链接重定向到 YouTube。
- 仅在 `https://cs50.harvard.edu/x/*` 下工作。
- 仅处理普通左键单击。
- 保留以下浏览器默认行为：
  - `Ctrl + Click`
  - `Cmd + Click`
  - `Shift + Click`
  - `Alt + Click`
  - 鼠标中键
  - 右键 → 在新标签页中打开
- 从 CS50 页面内容区域读取 YouTube 链接。
- 避免扫描侧边栏、页眉、页脚和导航区域。
- 如果没有找到 YouTube 链接，则回退为打开原始 CS50 页面。
- 将受支持的 YouTube URL 规范化为 `https://www.youtube.com/watch?v=...`。
- 在解析目标视频时显示一个简洁的加载页面。

## 安装

### 从 GitHub Raw 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或其他兼容的用户脚本管理器。
2. 点击上方的安装 badge，或打开：

```text
https://raw.githubusercontent.com/AnicSuny/CS50-YouTube-Redirect/main/CS50-YouTube-Redirect.user.js
```

3. Tampermonkey 应该会自动识别该用户脚本。
4. 点击 **Install**。
5. 访问 [CS50x](https://cs50.harvard.edu/x/)，并普通左键单击 section 或 shorts 链接。

### 手动安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)。
2. 打开 Tampermonkey 控制面板。
3. 创建一个新的用户脚本。
4. 粘贴 `CS50-YouTube-Redirect.user.js` 的内容。
5. 保存脚本。

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

### 普通左键单击

当你普通左键单击一个受支持的 CS50x section 或 shorts 链接时，脚本会：

1. 立即打开一个新标签页。
2. 获取目标 CS50 页面。
3. 在页面内容中查找官方 YouTube 链接。
4. 将新标签页重定向到 YouTube 视频。

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

当你想打开原始 CS50 页面以查看 slides、subtitles、transcripts、source code 或其他课程资源时，请使用这些操作。

## 工作原理

脚本会监听 CS50x 页面上的点击事件。

当点击受支持的链接时，它会：

1. 检查被点击的链接是否指向 CS50x 的 `sections` 或 `shorts` 页面。
2. 如果使用了修饰键，则忽略该点击。
3. 立即打开一个空白新标签页，以避免被浏览器拦截弹窗。
4. 获取目标 CS50 页面的 HTML。
5. 解析页面 HTML。
6. 在主内容区域中搜索 YouTube 链接。
7. 将新标签页重定向到解析出的 YouTube 视频。
8. 如果解析失败，则回退到原始 CS50 页面。

## 链接解析策略

脚本会按以下顺序优先选择 YouTube 链接：

1. 主内容区域中，文本完全等于 `YouTube` 的 YouTube 链接。
2. 主内容区域中，文本包含 `YouTube` 的 YouTube 链接。
3. 主内容区域中找到的第一个 YouTube 链接。
4. 作为兜底，使用 YouTube iframe 的 source。
5. 如果没有找到 YouTube URL，则打开原始 CS50 页面。

导航栏、侧边栏、页眉和页脚区域会被忽略。

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

## 用户脚本元数据

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
- 仅在从 CS50x 页面点击链接时进行重定向。
- 直接访问 section 或 shorts 页面时不会自动重定向。
- 依赖 CS50 页面在内容区域中暴露 YouTube 链接或 YouTube iframe。
- 如果 CS50 大幅调整页面结构，选择器逻辑可能需要更新。

## 隐私

此脚本：

- 不收集数据。
- 不跟踪用户。
- 不向第三方服务器发送数据。
- 只会获取你点击的 CS50 目标页面。
- 仅在 `https://cs50.harvard.edu/x/*` 上运行。

## 许可证

MIT License.