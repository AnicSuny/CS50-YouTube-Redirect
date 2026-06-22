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

(() => {
    'use strict';

    const SCRIPT_NAME = 'CS50-YouTube-Redirect';

    const CONFIG = {
        hoverTriggerKey: 'Alt', // 'Alt' | 'Ctrl' | 'Shift' | 'Meta' | 'None'
        hoverDelay: 250,
        cacheEnabled: true,
        showMissingResources: true,
        showRefreshButton: true,
    };

    const RESOURCE_TYPES = {
        slides: {
            label: 'Slides',
            match: /^slides$/i,
            icon: '▣',
        },
        subtitles: {
            label: 'Subtitles',
            match: /^subtitles$/i,
            icon: 'CC',
        },
        transcript: {
            label: 'Transcript',
            match: /^transcript$/i,
            icon: '¶',
        },
        youtube: {
            label: 'YouTube',
            match: /^youtube$/i,
            icon: '▶',
        },
    };

    const RESOURCE_ORDER = ['slides', 'subtitles', 'transcript', 'youtube'];

    const resourceCache = new Map();

    let currentAnchor = null;
    let currentTargetUrl = null;
    let hoverTimer = null;
    let panel = null;
    let panelVisible = false;
    let pointerInsideAnchor = false;
    let pointerInsidePanel = false;
    let lastMouseEvent = null;

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

    function isTriggerKeyActive(event) {
        if (CONFIG.hoverTriggerKey === 'None') return true;
        if (!event) return false;

        switch (CONFIG.hoverTriggerKey) {
            case 'Alt':
                return event.altKey;
            case 'Ctrl':
                return event.ctrlKey;
            case 'Shift':
                return event.shiftKey;
            case 'Meta':
                return event.metaKey;
            default:
                return false;
        }
    }

    function isTriggerKeyName(key) {
        switch (CONFIG.hoverTriggerKey) {
            case 'Alt':
                return key === 'Alt';
            case 'Ctrl':
                return key === 'Control';
            case 'Shift':
                return key === 'Shift';
            case 'Meta':
                return key === 'Meta';
            case 'None':
                return false;
            default:
                return false;
        }
    }

    function normalizeUrl(rawUrl, baseUrl = location.href) {
        try {
            return new URL(rawUrl, baseUrl).href;
        } catch {
            return rawUrl;
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

            if (!videoId) return u.href;

            const out = new URL('https://www.youtube.com/watch');
            out.searchParams.set('v', videoId);

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

    function getPageTitle(doc, fallbackUrl) {
        const h1 = doc.querySelector('main h1, article h1, h1');
        if (h1?.textContent?.trim()) {
            return h1.textContent.trim();
        }

        const title = doc.querySelector('title');
        if (title?.textContent?.trim()) {
            return title.textContent.trim().replace(/\s*-\s*CS50.*$/i, '').trim();
        }

        try {
            const u = new URL(fallbackUrl);
            const parts = u.pathname.split('/').filter(Boolean);
            return parts.at(-1) || 'CS50 Page';
        } catch {
            return 'CS50 Page';
        }
    }

    function identifyResourceType(anchor) {
        const text = anchor.textContent.trim();

        for (const type of RESOURCE_ORDER) {
            if (RESOURCE_TYPES[type].match.test(text)) {
                return type;
            }
        }

        return null;
    }

    function extractResourcesFromDoc(doc, targetUrl) {
        const root =
        doc.querySelector('main') ||
        doc.querySelector('article') ||
        doc.body;

        const title = getPageTitle(doc, targetUrl);

        const result = {
            title,
            pageUrl: targetUrl,
            resources: [],
            foundTypes: new Set(),
 missingTypes: [],
 fetchedAt: Date.now(),
        };

        if (!root) {
            result.missingTypes = [...RESOURCE_ORDER];
            return result;
        }

        const links = [...root.querySelectorAll('a[href]')]
        .filter((a) => !isInsideNonContentArea(a));

        for (const a of links) {
            const type = identifyResourceType(a);
            if (!type) continue;
            if (result.foundTypes.has(type)) continue;

            let url = normalizeUrl(a.getAttribute('href'), targetUrl);

            if (type === 'youtube') {
                if (!isYoutubeUrl(url)) continue;
                url = normalizeYoutubeUrl(url);
            }

            result.resources.push({
                type,
                label: RESOURCE_TYPES[type].label,
                icon: RESOURCE_TYPES[type].icon,
                url,
            });

            result.foundTypes.add(type);
        }

        result.missingTypes = RESOURCE_ORDER.filter((type) => !result.foundTypes.has(type));

        return result;
    }

    async function fetchResources(targetUrl, options = {}) {
        const forceRefresh = Boolean(options.forceRefresh);

        if (CONFIG.cacheEnabled && !forceRefresh && resourceCache.has(targetUrl)) {
            return resourceCache.get(targetUrl);
        }

        const res = await fetch(targetUrl, {
            credentials: 'include',
            cache: forceRefresh ? 'reload' : 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch CS50 page: ${res.status}`);
        }

        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const data = extractResourcesFromDoc(doc, targetUrl);

        if (CONFIG.cacheEnabled) {
            resourceCache.set(targetUrl, data);
        }

        return data;
    }

    function openInNewTab(url) {
        window.open(url, '_blank', 'noopener');
    }

    function ensurePanel() {
        if (panel) return panel;

        panel = document.createElement('div');
        panel.id = 'cs50-youtube-redirect-resource-panel';
        panel.style.cssText = `
        position: fixed;
        z-index: 2147483647;
        width: 320px;
        max-width: calc(100vw - 24px);
        box-sizing: border-box;
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 14px;
        background: #0f172a;
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 13px;
        line-height: 1.45;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.38);
        padding: 12px;
        display: none;
        `;

        panel.addEventListener('mouseenter', () => {
            pointerInsidePanel = true;
        });

        panel.addEventListener('mouseleave', () => {
            pointerInsidePanel = false;
            scheduleHidePanel();
        });

        document.documentElement.appendChild(panel);

        return panel;
    }

    function escapeHtml(value) {
        return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function renderPanelLoading(targetUrl) {
        const p = ensurePanel();

        p.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="
        width:34px;
        height:34px;
        border-radius:10px;
        background:#a51c30;
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:800;
        letter-spacing:.3px;
        flex:0 0 auto;
        ">CS</div>
        <div style="min-width:0;">
        <div style="font-weight:750;font-size:14px;">CS50 Resources</div>
        <div style="font-size:12px;color:#94a3b8;">Loading...</div>
        </div>
        </div>

        <div style="
        border:1px solid rgba(148,163,184,.2);
        border-radius:10px;
        background:#111827;
        padding:9px;
        color:#cbd5e1;
        font-size:12px;
        word-break:break-all;
        ">
        ${escapeHtml(targetUrl)}
        </div>
        `;
    }

    function renderPanelError(targetUrl) {
        const p = ensurePanel();

        p.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="
        width:34px;
        height:34px;
        border-radius:10px;
        background:#a51c30;
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:800;
        letter-spacing:.3px;
        flex:0 0 auto;
        ">CS</div>
        <div style="min-width:0;">
        <div style="font-weight:750;font-size:14px;">CS50 Resources</div>
        <div style="font-size:12px;color:#fca5a5;">Failed to load resources</div>
        </div>
        </div>

        <button data-action="open-page" style="${buttonStyle()}">
        <span style="${iconStyle()}">↗</span>
        <span style="flex:1;">Open CS50 Page</span>
        </button>

        ${CONFIG.showRefreshButton ? `
            <button data-action="refresh" style="${secondaryButtonStyle()}">
            Refresh
            </button>
            ` : ''}
            `;

            bindPanelActions(targetUrl);
    }

    function buttonStyle() {
        return `
        width:100%;
        box-sizing:border-box;
        border:1px solid rgba(148,163,184,.26);
        border-radius:10px;
        background:#111827;
        color:#e5e7eb;
        display:flex;
        align-items:center;
        gap:9px;
        padding:9px 10px;
        cursor:pointer;
        font:inherit;
        text-align:left;
        margin-top:7px;
        `;
    }

    function secondaryButtonStyle() {
        return `
        width:100%;
        box-sizing:border-box;
        border:1px solid rgba(148,163,184,.18);
        border-radius:10px;
        background:transparent;
        color:#94a3b8;
        padding:7px 10px;
        cursor:pointer;
        font:inherit;
        text-align:center;
        margin-top:9px;
        `;
    }

    function iconStyle() {
        return `
        width:24px;
        height:24px;
        border-radius:7px;
        background:#1e293b;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#bfdbfe;
        font-size:12px;
        font-weight:700;
        flex:0 0 auto;
        `;
    }

    function renderPanelData(data) {
        const p = ensurePanel();

        const resourcesHtml = data.resources.length
        ? data.resources.map((resource) => `
        <button data-resource-url="${escapeHtml(resource.url)}" style="${buttonStyle()}">
        <span style="${iconStyle()}">${escapeHtml(resource.icon)}</span>
        <span style="flex:1;min-width:0;">
        <span style="display:block;font-weight:650;">${escapeHtml(resource.label)}</span>
        <span style="
        display:block;
        margin-top:1px;
        color:#94a3b8;
        font-size:11px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        ">${escapeHtml(resource.url)}</span>
        </span>
        <span style="color:#64748b;font-size:12px;">Open</span>
        </button>
        `).join('')
        : `
        <div style="
        border:1px solid rgba(148,163,184,.2);
        border-radius:10px;
        background:#111827;
        padding:10px;
        color:#cbd5e1;
        margin-top:8px;
        ">
        No supported resources found.
        </div>
        `;

        const missingHtml =
        CONFIG.showMissingResources && data.missingTypes.length
        ? `
        <div style="
        margin-top:9px;
        color:#94a3b8;
        font-size:12px;
        line-height:1.5;
        ">
        Not found: ${escapeHtml(data.missingTypes.map((type) => RESOURCE_TYPES[type].label).join(', '))}
        </div>
        `
        : '';

        p.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="
        width:34px;
        height:34px;
        border-radius:10px;
        background:#a51c30;
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:800;
        letter-spacing:.3px;
        flex:0 0 auto;
        ">CS</div>
        <div style="min-width:0;">
        <div style="font-weight:750;font-size:14px;">CS50 Resources</div>
        <div style="
        font-size:12px;
        color:#94a3b8;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        max-width:240px;
        ">${escapeHtml(data.title || 'CS50 Page')}</div>
        </div>
        </div>

        ${resourcesHtml}

        ${missingHtml}

        <div style="
        display:flex;
        gap:8px;
        margin-top:10px;
        ">
        <button data-action="open-page" style="
        flex:1;
        box-sizing:border-box;
        border:1px solid rgba(148,163,184,.18);
        border-radius:10px;
        background:transparent;
        color:#94a3b8;
        padding:7px 9px;
        cursor:pointer;
        font:inherit;
        text-align:center;
        ">
        Open CS50 Page
        </button>
        <!---->
        ${CONFIG.showRefreshButton ? `
            <button data-action="refresh" style="
            flex:0 0 auto;
            box-sizing:border-box;
            border:1px solid rgba(148,163,184,.18);
            border-radius:10px;
            background:transparent;
            color:#94a3b8;
            padding:7px 9px;
            cursor:pointer;
            font:inherit;
            text-align:center;
            ">
            Refresh
            </button>
            ` : ''}

            </div>


            `;

            bindPanelActions(data.pageUrl);
    }

    function bindPanelActions(targetUrl) {
        const p = ensurePanel();

        p.querySelectorAll('[data-resource-url]').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                const url = button.getAttribute('data-resource-url');
                if (url) openInNewTab(url);
            });
        });

        const openPageButton = p.querySelector('[data-action="open-page"]');
        if (openPageButton) {
            openPageButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                openInNewTab(targetUrl);
            });
        }

        const refreshButton = p.querySelector('[data-action="refresh"]');
        if (refreshButton) {
            refreshButton.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();

                resourceCache.delete(targetUrl);
                renderPanelLoading(targetUrl);

                try {
                    const data = await fetchResources(targetUrl, { forceRefresh: true });

                    if (currentTargetUrl === targetUrl && panelVisible) {
                        renderPanelData(data);
                    }
                } catch {
                    if (currentTargetUrl === targetUrl && panelVisible) {
                        renderPanelError(targetUrl);
                    }
                }
            });
        }
    }

    function positionPanel(anchor) {
        const p = ensurePanel();
        const rect = anchor.getBoundingClientRect();

        p.style.display = 'block';

        const panelRect = p.getBoundingClientRect();

        let left = rect.right + 10;
        let top = rect.top;

        if (left + panelRect.width > window.innerWidth - 12) {
            left = Math.max(12, rect.left);
            top = rect.bottom + 8;
        }

        if (top + panelRect.height > window.innerHeight - 12) {
            top = Math.max(12, window.innerHeight - panelRect.height - 12);
        }

        p.style.left = `${Math.max(12, left)}px`;
        p.style.top = `${Math.max(12, top)}px`;
    }

    function showPanel(anchor, targetUrl) {
        currentAnchor = anchor;
        currentTargetUrl = targetUrl;
        panelVisible = true;

        renderPanelLoading(targetUrl);
        positionPanel(anchor);

        fetchResources(targetUrl)
        .then((data) => {
            if (currentTargetUrl !== targetUrl || !panelVisible) return;
            renderPanelData(data);
            positionPanel(anchor);
        })
        .catch(() => {
            if (currentTargetUrl !== targetUrl || !panelVisible) return;
            renderPanelError(targetUrl);
            positionPanel(anchor);
        });
    }

    function hidePanel() {
        clearTimeout(hoverTimer);
        hoverTimer = null;

        panelVisible = false;
        currentAnchor = null;
        currentTargetUrl = null;

        if (panel) {
            panel.style.display = 'none';
        }
    }

    function scheduleHidePanel() {
        setTimeout(() => {
            if (!pointerInsideAnchor && !pointerInsidePanel) {
                hidePanel();
            }
        }, 120);
    }

    function scheduleShowPanel(anchor) {
        clearTimeout(hoverTimer);

        const targetUrl = anchor.href;
        if (!isTargetCs50Page(targetUrl)) return;

        hoverTimer = setTimeout(() => {
            if (!pointerInsideAnchor) return;
            if (currentAnchor !== anchor) return;

            showPanel(anchor, targetUrl);
        }, CONFIG.hoverDelay);
    }


    document.addEventListener(
        'mouseover',
        (event) => {
            const anchor = event.target.closest?.('a[href]');
            if (!anchor) return;
            if (!isTargetCs50Page(anchor.href)) return;

            currentAnchor = anchor;
            pointerInsideAnchor = true;
            lastMouseEvent = event;

            // 只有配置为 None 时，才允许单纯 hover 触发。
            // Alt/Ctrl/Shift/Meta 模式下，不再支持“先按键后悬停”。
            if (CONFIG.hoverTriggerKey === 'None') {
                scheduleShowPanel(anchor);
            }
        },
        true
    );



    document.addEventListener(
        'mousemove',
        (event) => {
            lastMouseEvent = event;

            const anchor = event.target.closest?.('a[href]');
            if (!anchor || !isTargetCs50Page(anchor.href)) return;

            currentAnchor = anchor;
            pointerInsideAnchor = true;

            // 不在 mousemove 中根据 Alt/Ctrl/Shift/Meta 触发面板。
            // 这样可以避免“先按键后悬停”触发。
            if (!panelVisible && CONFIG.hoverTriggerKey === 'None') {
                scheduleShowPanel(anchor);
            }
        },
        true
    );


    document.addEventListener(
        'mouseout',
        (event) => {
            const anchor = event.target.closest?.('a[href]');
            if (!anchor) return;
            if (!isTargetCs50Page(anchor.href)) return;

            const related = event.relatedTarget;
            if (related && anchor.contains(related)) return;

            pointerInsideAnchor = false;
            clearTimeout(hoverTimer);
            scheduleHidePanel();
        },
        true
    );

    document.addEventListener(
        'keydown',
        (event) => {
            if (event.key === 'Escape') {
                hidePanel();
                return;
            }

            if (!isTriggerKeyName(event.key)) return;
            if (!currentAnchor || !isTargetCs50Page(currentAnchor.href)) return;
            if (!pointerInsideAnchor) return;
            if (panelVisible) return;

            // 新逻辑：
            // 必须先 hover 在目标链接上，再按下触发键。
            scheduleShowPanel(currentAnchor);
        },
        true
    );



    document.addEventListener(
        'click',
        (event) => {
            if (!panelVisible || !panel) return;
            if (panel.contains(event.target)) return;
            hidePanel();
        },
        true
    );

    window.addEventListener(
        'scroll',
        () => {
            hidePanel();
        },
        true
    );

    window.addEventListener(
        'resize',
        () => {
            if (panelVisible && currentAnchor) {
                positionPanel(currentAnchor);
            }
        },
        true
    );
})();
