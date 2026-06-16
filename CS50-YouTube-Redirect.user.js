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

(() => {
    'use strict';

    const SCRIPT_NAME = 'CS50-YouTube-Redirect';

    function isTargetCs50Page(url) {
        try {
            const u = new URL(url, location.href);

            return (
                u.hostname === 'cs50.harvard.edu' &&
                u.pathname.startsWith('/x/') &&
                (
                    u.pathname.includes('/sections/') ||
                    u.pathname.includes('/shorts/')
                )
            );
        } catch {
            return false;
        }
    }

    function isYoutubeUrl(url) {
        try {
            const u = new URL(url, location.href);
            const host = u.hostname.replace(/^www\./, '');

            return (
                host === 'youtu.be' ||
                host === 'youtube.com' ||
                host.endsWith('.youtube.com')
            );
        } catch {
            return false;
        }
    }

    function normalizeYoutubeUrl(rawUrl) {
        try {
            const u = new URL(rawUrl, location.href);
            const host = u.hostname.replace(/^www\./, '');

            let videoId = '';

            if (host === 'youtu.be') {
                videoId = u.pathname.split('/').filter(Boolean)[0] || '';
            } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
                if (u.pathname === '/watch') {
                    videoId = u.searchParams.get('v') || '';
                } else if (u.pathname.startsWith('/embed/')) {
                    videoId = u.pathname.split('/').filter(Boolean)[1] || '';
                } else if (u.pathname.startsWith('/shorts/')) {
                    videoId = u.pathname.split('/').filter(Boolean)[1] || '';
                } else if (u.pathname.startsWith('/live/')) {
                    videoId = u.pathname.split('/').filter(Boolean)[1] || '';
                }
            }

            // 如果已经是有效 watch 链接，仍然统一输出为标准 watch URL。
            if (!videoId) return u.href;

            const out = new URL('https://www.youtube.com/watch');
            out.searchParams.set('v', videoId);

            // 保留常见有用参数。
            for (const key of ['t', 'start', 'list', 'index']) {
                const value = u.searchParams.get(key);
                if (value) out.searchParams.set(key, value);
            }

            return out.toString();
        } catch {
            return rawUrl;
        }
    }

    function isInsideNonContentArea(el) {
        return Boolean(el.closest('nav, aside, header, footer'));
    }

    function findPreferredYoutubeLink(root) {
        const links = [...root.querySelectorAll('a[href]')]
        .filter((a) => !isInsideNonContentArea(a))
        .filter((a) => isYoutubeUrl(a.href));

        if (!links.length) return null;

        // 优先级 1：正文里文本就是 YouTube 的官方入口。
        const exactYoutubeText = links.find((a) => {
            const text = a.textContent.trim().toLowerCase();
            return text === 'youtube';
        });

        if (exactYoutubeText) {
            return normalizeYoutubeUrl(exactYoutubeText.href);
        }

        // 优先级 2：文本中包含 YouTube 的链接。
        const containsYoutubeText = links.find((a) => {
            const text = a.textContent.trim().toLowerCase();
            return text.includes('youtube');
        });

        if (containsYoutubeText) {
            return normalizeYoutubeUrl(containsYoutubeText.href);
        }

        // 优先级 3：main 正文中的第一个 YouTube 链接。
        return normalizeYoutubeUrl(links[0].href);
    }

    function findYoutubeIframe(root) {
        const iframe = [...root.querySelectorAll('iframe[src]')]
        .filter((el) => !isInsideNonContentArea(el))
        .find((el) => isYoutubeUrl(el.src));

        return iframe ? normalizeYoutubeUrl(iframe.src) : null;
    }

    function findYoutubeUrlInDoc(doc) {
        const root =
        doc.querySelector('main') ||
        doc.querySelector('article') ||
        doc.body;

        if (!root) return null;

        // CS50 页面正文里通常已有 YouTube 链接，优先读这个。
        const linkUrl = findPreferredYoutubeLink(root);
        if (linkUrl) return linkUrl;

        // 兜底：如果页面只有嵌入 iframe，则读 iframe src。
        const iframeUrl = findYoutubeIframe(root);
        if (iframeUrl) return iframeUrl;

        return null;
    }

    function renderLoadingPage(tab, targetUrl) {
        try {
            tab.document.write(`
            <title>${SCRIPT_NAME}</title>
            <div style="
            min-height:100vh;
            box-sizing:border-box;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#0f172a;
            color:#e5e7eb;
            font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            padding:24px;
            ">
            <div style="
            width:min(520px,100%);
            border:1px solid #334155;
            border-radius:16px;
            background:#111827;
            box-shadow:0 20px 60px rgba(0,0,0,.35);
            padding:22px;
            ">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
            <div style="
            width:42px;
            height:42px;
            border-radius:10px;
            background:#a51c30;
            color:white;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:800;
            letter-spacing:.5px;
            ">CS</div>
            <div>
            <div style="font-size:18px;font-weight:750;">${SCRIPT_NAME}</div>
            <div style="font-size:13px;color:#9ca3af;">Resolving CS50 video link...</div>
            </div>
            </div>

            <div style="
            border:1px solid #374151;
            border-radius:10px;
            padding:12px;
            background:#0f172a;
            font-size:13px;
            line-height:1.55;
            word-break:break-all;
            color:#cbd5e1;
            ">
            ${targetUrl}
            </div>

            <div style="margin-top:14px;font-size:13px;color:#9ca3af;">
            正在读取页面正文中的 YouTube 链接。如果未找到，将打开原 CS50 页面。
            </div>
            </div>
            </div>
            `);
            tab.document.close();
        } catch {
            // 如果写入 loading 页失败，不影响后续跳转。
        }
    }

    async function resolveAndOpen(targetUrl, newTab) {
        try {
            const res = await fetch(targetUrl, {
                credentials: 'include',
                cache: 'no-store',
            });

            if (!res.ok) {
                newTab.location.replace(targetUrl);
                return;
            }

            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const youtubeUrl = findYoutubeUrlInDoc(doc);

            newTab.location.replace(youtubeUrl || targetUrl);
        } catch {
            newTab.location.replace(targetUrl);
        }
    }

    document.addEventListener(
        'click',
        (e) => {
            // 只处理普通左键。
            if (e.button !== 0) return;

            // 保留 Ctrl/Cmd/Shift/Alt 点击的浏览器默认行为。
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

            const a = e.target.closest?.('a[href]');
            if (!a) return;

            const targetUrl = a.href;
            if (!isTargetCs50Page(targetUrl)) return;

            e.preventDefault();
            e.stopPropagation();

            // 必须在用户点击同步阶段打开新标签页，避免被浏览器拦截。
            const newTab = window.open('about:blank', '_blank');

            if (!newTab) {
                // 如果弹窗被拦截，则回退为当前页打开原链接。
                location.href = targetUrl;
                return;
            }

            renderLoadingPage(newTab, targetUrl);
            resolveAndOpen(targetUrl, newTab);
        },
        true
    );
})();
