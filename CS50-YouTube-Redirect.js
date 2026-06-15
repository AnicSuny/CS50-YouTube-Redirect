// ==UserScript==
// @name         CS50 Section/Shorts -> YouTube Redirect
// @namespace    https://cs50.harvard.edu/
// @version      1.0.0
// @description  Click CS50 section/shorts links and open the corresponding YouTube video in a new tab.
// @match        https://cs50.harvard.edu/x/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
    'use strict';

    function isTargetCs50Page(url) {
        try {
            const u = new URL(url, location.href);
            return (
                u.hostname === 'cs50.harvard.edu' &&
                u.pathname.startsWith('/x/') &&
                (u.pathname.includes('/sections/') || u.pathname.includes('/shorts/'))
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
            } else if (host.endsWith('youtube.com')) {
                if (u.pathname === '/watch') {
                    videoId = u.searchParams.get('v') || '';
                } else if (u.pathname.startsWith('/embed/')) {
                    videoId = u.pathname.split('/')[2] || '';
                } else if (u.pathname.startsWith('/shorts/')) {
                    videoId = u.pathname.split('/')[2] || '';
                } else if (u.pathname.startsWith('/live/')) {
                    videoId = u.pathname.split('/')[2] || '';
                }
            }

            if (!videoId) return u.href;

            const out = new URL('https://www.youtube.com/watch');
            out.searchParams.set('v', videoId);

            // 保留原有参数，尽量不丢失时间戳等信息
            for (const [k, v] of u.searchParams.entries()) {
                if (k !== 'v') out.searchParams.set(k, v);
            }

            return out.toString();
        } catch {
            return rawUrl;
        }
    }

    function findYoutubeUrlInDoc(doc) {
        const root = doc.querySelector('main') || doc.querySelector('article') || doc.body;
        if (!root) return null;

        const links = [...root.querySelectorAll('a[href]')];

        for (const a of links) {
            // 排除明显的导航/侧边栏/页脚区域
            if (a.closest('nav, aside, header, footer')) continue;

            const href = a.getAttribute('href') || '';
            if (!/youtu\.be|youtube\.com/i.test(href)) continue;

            const normalized = normalizeYoutubeUrl(a.href);
            if (normalized) return normalized;
        }

        return null;
    }

    async function resolveAndOpen(targetUrl, openerTab) {
        try {
            const res = await fetch(targetUrl, {
                credentials: 'include',
                cache: 'no-store',
            });

            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const youtubeUrl = findYoutubeUrlInDoc(doc);

            if (youtubeUrl) {
                openerTab.location.href = youtubeUrl;
            } else {
                openerTab.location.href = targetUrl;
            }
        } catch (err) {
            openerTab.location.href = targetUrl;
        }
    }

    document.addEventListener(
        'click',
        (e) => {
            if (e.button !== 0) return; // 只处理普通左键
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; // 保留组合键默认行为

            const a = e.target.closest?.('a[href]');
            if (!a) return;

            const targetUrl = a.href;
            if (!isTargetCs50Page(targetUrl)) return;

            // 阻止原页面跳转
            e.preventDefault();
            e.stopPropagation();

            // 先开一个新标签页，避免被弹窗拦截
            const newTab = window.open('about:blank', '_blank');
            if (!newTab) {
                // 如果弹窗被拦，至少不破坏原页面行为
                location.href = targetUrl;
                return;
            }

            newTab.document.write(`
            <title>Loading CS50 video...</title>
            <div style="
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background:#0f172a;
            color:#e5e7eb;
            padding:24px;
            line-height:1.6;
            ">
            正在解析视频链接，请稍候...
            </div>
            `);
            newTab.document.close();

            resolveAndOpen(targetUrl, newTab);
        },
        true
    );
})();
