// ==UserScript==
// @name         AI 对话导航增强
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  对话导航增强：支持 ChatGPT、Gemini、豆包、DeepSeek、千问、Kimi。
// @author       Axero
// @match        https://chatgpt.com/*
// @match        https://www.chatgpt.com/*
// @match        https://gemini.google.com/*
// @match        https://*.deepseek.com/*
// @match        https://deepseek.com/*
// @match        https://www.doubao.com/*
// @match        https://www.qianwen.com/*
// @match        https://chat.qianwen.aliyun.com/*
// @match        https://www.kimi.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const SCRIPT_ID = 'AI_NAV_ENHANCER_V2_2';
    if (document.getElementById(SCRIPT_ID) || window[SCRIPT_ID]) return;
    const marker = document.createElement('meta');
    marker.id = SCRIPT_ID;
    document.head.appendChild(marker);
    window[SCRIPT_ID] = true;

    const STYLES = `
    .nav-container { position: fixed; top: 50%; right: 0; transform: translateY(-50%); z-index: 2147483647 !important; display: flex; flex-direction: column; background: rgba(255,255,255,0.98); border-radius: 8px 0 0 8px; box-shadow: -2px 2px 12px rgba(0,0,0,0.15); width: 45px; transition: width 0.28s; padding: 8px 0; border: 1px solid rgba(0,0,0,0.08); overflow: hidden; pointer-events: auto; }
    .nav-container:hover { width: 150px; }
    .nav-container:hover .btn-text { display: inline; }
    .nav-btn { padding: 10px 6px; color: white; border: none; border-radius: 4px 0 0 4px; cursor: pointer; font-size: 14px; width: 100%; text-align: left; white-space: nowrap; margin: 4px 0; box-sizing: border-box; }
    .nav-btn .btn-text { margin-left: 8px; display: none; }
    .nav-btn .btn-icon { display: inline-block; width: 20px; text-align: center; }
    .btn-green { background-color: #52c41a; } .btn-green:hover { background-color: #73d13d; }
    .btn-purple { background-color: #722ed1; } .btn-purple:hover { background-color: #9254de; }
    .btn-blue { background-color: #1890ff; } .btn-blue:hover { background-color: #40a9ff; }
    .btn-yellow { background-color: #faad14; } .btn-yellow:hover { background-color: #ffc53d; }
    .btn-gray { background-color: #8c8c8c; } .btn-gray:hover { background-color: #bfbfbf; }
    .nav-separator { height: 1px; background: rgba(0,0,0,0.08); margin: 6px 8px; }
    .toc-panel { position: fixed; top: 0; right: -340px; width: 340px; height: 100vh; background: rgba(255,255,255,0.98); box-shadow: -2px 0 18px rgba(0,0,0,0.12); z-index: 2147483646 !important; transition: right 0.28s ease; display: flex; flex-direction: column; border-left: 1px solid rgba(0,0,0,0.06); pointer-events: auto; }
    .toc-panel.open { right: 0; }
    .toc-header { padding: 14px; background: linear-gradient(135deg,#1890ff 0%,#096dd9 100%); color: #fff; font-weight: 600; font-size: 15px; display:flex; justify-content:space-between; align-items:center; }
    .toc-tab-bar { display: flex; padding: 6px; background: #f0f0f0; gap: 6px; }
    .toc-tab { flex: 1; text-align: center; padding: 8px 0; cursor: pointer; font-size: 13px; border-radius: 6px; background: #e0e0e0; color: #666; transition: all 0.2s; font-weight: 500; }
    .toc-tab.active { background: #1890ff; color: #ffffff; box-shadow: 0 2px 4px rgba(24,144,255,0.2); }
    .toc-tab:hover:not(.active) { background: #d0d0d0; }
    .toc-search-container { padding:10px 12px; border-bottom:1px solid rgba(0,0,0,0.06); background:transparent; }
    .toc-search-input { width:100%; padding:8px 10px; border-radius:6px; border:1px solid rgba(0,0,0,0.08); font-size:13px; box-sizing:border-box; }
    .toc-content { flex:1; overflow:auto; background:#fff; }
    .toc-item { padding: 12px; margin: 8px 10px; background: #ffffff; border: 1px solid #e8e8e8; border-radius: 6px; cursor: pointer; font-size: 13px; color: #333; line-height: 1.5; transition: all 0.2s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .toc-item:hover { background: #f0f7ff; border-color: #1890ff; transform: translateX(-2px); }
    .item-index { font-weight: bold; color: #1890ff; margin-right: 8px; }
    .toc-empty { padding:24px; text-align:center; color:#888; }
    .toc-footer { padding:10px 12px; border-top:1px solid rgba(0,0,0,0.04); font-size:12px; color:#666; background:#fafafa; }
    `;

    const CONFIG = {
        sites: {
            chatgpt: {
                name: 'ChatGPT',
                domains: ['chatgpt.com'],
                selectors: {
                    conversationItem: ['a[href^="/c/"]', 'nav a'],
                    titleSelector: ['.truncate', 'div.flex-1.text-ellipsis', 'span[dir="auto"]'],
                    userMessage: ['div.whitespace-pre-wrap', '[class*="user-message-bubble-color"]'],
                    aiMessage: ['[data-message-author-role="assistant"]', '[class*="assistant"]', 'div[class*="prose"]', 'div.markdown'],
                    activeConversation: ['nav a[aria-current="page"]', '[aria-current="page"]', '.active'],
                    contentContainer: ['main', '#main']
                }
            },
            doubao: {
                name: '豆包',
                domains: ['doubao.com'],
                selectors: {
                    userMessage: ['[class*="container-QQkdo4"]', '.container-QQkdo4', '[class*="user-message"]', '.user-message', '[class*="message-user"]', '.message-user'],
                    conversationItem: ['a._546d736', '._546d736', '[data-testid="chat_list_thread_item"]', '[class*="conversation-item"]', '.chat-list-item', '[class*="chat-item"]', 'li[class*="thread"]', 'div[class*="thread"]'],
                    activeConversation: ['a._546d736[aria-current="page"]', '._546d736.active', '[data-testid="chat_list_thread_item"][aria-current="page"]', '[class*="active"]', '[aria-current="page"]', '.active'],
                    contentContainer: ['.main-content', '#chat-container', '[class*="main-content"]', '[class*="chat-container"]', '[class*="message-list"]', '.message-list']
                }，
                titleSelector: null
            },
            deepseek: {
                name: 'DeepSeek',
                domains: ['deepseek.com'],
                selectors: {
                    userMessage: ['div.fbb737a4', '.fbb737a4', '[class*="user-message"]', '.user-message', '[class*="message-user"]', '.message-user'],
                    conversationItem: ['a[href^="/a/chat/s/"]', 'a._546d736', '[class*="conversation-item"]', '[class*="chat-item"]', '.chat-list-item', '[data-testid="chat-item"]', 'li[class*="thread"]', 'div[class*="thread"]'],
                    activeConversation: ['[class*="active"]', '[aria-current="page"]', '.active'],
                    contentContainer: ['.main-content', '#chat-container', '[class*="main-content"]', '[class*="chat-container"]', '[class*="message-list"]', '.message-list']
                },
                titleSelector: ['div[class*="c08e6e"]']
            },
            qianwen: {
                name: '千问',
                domains: ['qianwen.aliyun.com', 'tongyi.aliyun.com', 'www.qianwen.com'],
                selectors: {
                    userMessage: ['div.bubble-VIVxZ8', '[class*="bubble-"]', '[class*="user-message"]', '.user-message', '[class*="message-user"]', '.message-user'],
                    conversationItem: ['div.group.flex.justify-between.py-\\[0\\.375rem\\].pl-3.items-center.cursor-pointer'],
                    activeConversation: ['[class*="active"]', '[aria-current="page"]', '.active'],
                    contentContainer: ['div.message-list-scroll-container', '#qwen-message-list-area', '.main-content', '#chat-container', '[class*="main-content"]', '[class*="chat-container"]', '[class*="message-list"]', '.message-list']
                },
                titleSelector: ['div[class*="text-ellipsis"]']
            },
            kimi: {
                name: 'Kimi',
                domains: ['kimi.com'],
                selectors: {
                    userMessage: ['.user-content', '[class*="user-message"]', '.user-message', '[class*="message-user"]', '.message-user'],
                    conversationItem: ['[class*="conversation-item"]', '[class*="chat-item"]', '.chat-list-item', '[data-testid="chat-item"]', '[role="listitem"]', 'a[href*="/chat/"]', '.chat-name', 'li[class*="thread"]', 'div[class*="thread"]'],
                    activeConversation: ['[class*="active"]', '[aria-current="page"]', '.active'],
                    contentContainer: ['.main-content', '#chat-container', '[class*="message-list"]', '.chat-container', '.message-list']
                },
                titleSelector: ['.chat-name']
            },
            gemini: {
                name: 'Gemini',
                domains: ['gemini.google.com'],
                selectors: {
                    userMessage: ['.user-query-bubble-with-background', '.query-text', 'gemini-chat-app'],
                    conversationItem: ['a[data-test-id="conversation"]', '.conversation-item'],
                    activeConversation: ['a.active', '[aria-selected="true"]', '[class*="active"]'],
                    contentContainer: ['main', 'gemini-chat-app', '.chat-history', 'body']
                },
                titleSelector: ['.conversation-title', '[class*="title"]']
            }
        },
        settings: {
            contentMaxWidth: { default: 900, min: 600, max: 2000, step: 50 },
            storageKey: 'ai_nav_settings_v2'
        }
    };

    const state = {
        currentSite: null,
        currentWidth: CONFIG.settings.contentMaxWidth.default,
        observer: null,
        observerPaused: false,
        uiCreated: false,
        targetContainer: null,
        tocPanelOpen: false,
        tocActiveTab: 'message',
        messageItems: [],
        conversationItems: [],
        domVersion: 0,
        messageCache: null,
        messageCacheVersion: -1
    };

    class Utils {
        static injectStyles() {
            try {
                let s = document.getElementById('ai-nav-styles');
                if (!s) {
                    s = document.createElement('style');
                    s.id = 'ai-nav-styles';
                    document。head.appendChild(s);
                }
                s.textContent = STYLES;
            } catch (e) { console.error('[对话导航] 注入样式失败', e); }
        }
        static querySelectorAll(selector) {
            if (!selector) return [];
            if (Array.isArray(selector)) {
                for (const s of selector) {
                    try {
                        const els = document.querySelectorAll(s);
                        if (els && els.length) return els;
                    } catch (e) {}
                }
                return [];
            }
            try { return document.querySelectorAll(selector) || []; } catch (e) { return []; }
        }
        static querySelector(selector) {
            if (!selector) return null;
            if (Array.isArray(selector)) {
                for (const s of selector) {
                    try {
                        const el = document.querySelector(s);
                        if (el) return el;
                    } catch (e) {}
                }
                return null;
            }
            try { return document.querySelector(selector); } catch (e) { return null; }
        }
        static getText(el) {
            if (!el) return '';
            try {
                // 克隆节点，避免污染原DOM
                const clone = el.cloneNode(true);

                // 删除所有 visually-hidden
                clone.querySelectorAll('.cdk-visually-hidden').forEach(n => n.remove());

                return (clone.innerText || clone.textContent || '')
                    .trim()
                    .replace(/\s+/g, ' ');
            } catch (e) {
                return '';
            }
        }
        static throttle(fn, wait) {
            let last = 0;
            return (...args) => {
                const now = Date.now();
                if (now - last >= wait) { last = now; fn(...args); }
            };
        }
        static debounce(fn, wait) {
            let t;
            return (...args) => {
                clearTimeout(t);
                t = setTimeout(() => fn(...args), wait);
            };
        }
        static downloadFile(content, filename) {
            try {
                const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (e) { console.error('[对话导航] 下载失败', e); alert('下载失败'); }
        }
        static simulateClick(el) {
            if (!el) return;
            try {
                if (el.tagName === 'A' && el.href) { el.click(); return; }
                el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            } catch (e) { console.error('[对话导航] 模拟点击失败', e); }
        }
        static saveSettings() {
            try { localStorage.setItem(CONFIG.settings.storageKey, JSON.stringify({ contentMaxWidth: state.currentWidth })); } catch (e) {}
        }
        static loadSettings() {
            try {
                const raw = localStorage.getItem(CONFIG.settings.storageKey);
                if (raw) {
                    const p = JSON.parse(raw);
                    if (p && p.contentMaxWidth) state.currentWidth = p.contentMaxWidth;
                }
            } catch (e) {}
        }
        static escapeHtml(str) {
            if (!str) return '';
            const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
        }
        // 安全清空元素内容（兼容 Trusted Types）
        static clearElement(el) {
            if (!el) return;
            try {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            } catch (e) {
                el.textContent = '';
            }
        }
    }

    function detectSite() {
        const h = window.location.hostname || '';
        for (const [key, cfg] of Object.entries(CONFIG.sites)) {
            for (const d of cfg.domains) {
                if (h === d || h.includes(d)) return key;
            }
        }
        return null;
    }

    class MessageHandler {
        static getSiteSelectors(key) {
            if (!state.currentSite) return [];
            const s = CONFIG.sites[state.currentSite];
            if (!s || !s.selectors) return [];
            return s.selectors[key] || [];
        }

        static normalizeUserMessageNode(node) {
            if (!node || !(node instanceof Element)) return null;
            if (state.currentSite === 'chatgpt') {
                const bubble = node.closest('[class*="user-message-bubble-color"]');
                if (bubble) return bubble;
            }
            return node;
        }

        static isWithinContentContainer(node, mainContainer) {
            if (!node || !(node instanceof Element) || !mainContainer) return false;
            return node === mainContainer || mainContainer.contains(node);
        }

        static getUserMessages() {
            if (state.messageCache && state.messageCacheVersion === state.domVersion) return state.messageCache;
            
            const selectors = MessageHandler.getSiteSelectors('userMessage');
            let nodes = [];

            if (selectors && selectors.length) {
                for (const sel of selectors) {
                    try {
                        const els = document.querySelectorAll(sel);
                        if (els && els.length) {
                            nodes.push(...els); 
                        }
                    } catch (e) {}
                }
            }

            const contentSels = CONFIG.sites[state.currentSite]?.selectors?.contentContainer || [];
            const mainContainer = Utils.querySelector(contentSels) || document.body;
            nodes = nodes.map(n => MessageHandler.normalizeUserMessageNode(n)).filter(Boolean);

            nodes = nodes.filter(n => {
                try {
                    if (!MessageHandler.isWithinContentContainer(n, mainContainer)) return false;
                    if (n.closest('button') || n.closest('a') || n.closest('nav') || n.closest('header')) return false;
                    const welcomeArea = n.closest('[class*="welcome"], [class*="suggestion"], [class*="capabilities"], [class*="empty-state"]');
                    if (welcomeArea) return false;
                    if (state.currentSite === 'chatgpt') {
                        const isUserBubble = n.matches('[class*="user-message-bubble-color"]') || !!n.closest('[class*="user-message-bubble-color"]');
                        const inMessageArea = !!n.closest('main, #main, article, [data-message-author-role], [class*="conversation"], [class*="thread"]');
                        if (!isUserBubble || !inMessageArea) return false;
                    }
                    if (state.currentSite === 'gemini') {
                        if (n.classList.contains('cdk-visually-hidden')) return false;
                        if (!n.closest('.user-query-bubble-with-background')) return false;
                    }
                    const text = Utils.getText(n);
                    return text.length >= 2 && text.length < 3000;
                } catch (e) { return false; }
            });

            nodes = Array.from(new Set(nodes));

            state.messageCache = nodes;
            state.messageCacheVersion = state.domVersion;
            return nodes;
        }

        static getMessageText(el) {
            let text = Utils.getText(el);
            if (state.currentSite === 'gemini') {
                text = text.replace(/^你说(?:\s|:|：)*/u, '').trim();
            }
            return text;
        }

        static isAIMessage(el) {
            if (!el || !(el instanceof Element)) return false;
            try {
                const selectors = MessageHandler.getSiteSelectors('aiMessage');
                for (const s of selectors) {
                    try { if (el.matches && el.matches(s)) return true; } catch (e) {}
                    try { if (el.querySelector && el.querySelector(s)) return true; } catch (e) {}
                }
                const cls = (el.className || '').toLowerCase();
                if (cls.includes('assistant') || cls.includes('ai')) return true;
                if (el.querySelector && (el.querySelector('.prose') || el.querySelector('.markdown') || el.querySelector('code'))) return true;
                return Utils.getText(el).length >= 2;
            } catch (e) { return false; }
        }

        static findAIReply(userEl) {
            if (!userEl) return null;
            try {
                let el = userEl.nextElementSibling;
                let safety = 0;
                while (el && safety++ < 50) {
                    if (MessageHandler.isAIMessage(el)) return el;
                    el = el.nextElementSibling;
                }
                let parent = userEl.parentElement;
                safety = 0;
                while (parent && safety++ < 8) {
                    let sib = userEl.nextElementSibling;
                    while (sib) {
                        if (MessageHandler.isAIMessage(sib)) return sib;
                        sib = sib.nextElementSibling;
                    }
                    parent = parent.parentElement;
                }
            } catch (e) { console.error('[对话导航] findAIReply 错误', e); }
            return null;
        }

        static exportConversation() {
            const users = MessageHandler.getUserMessages();
            if (!users.length) { alert('未找到用户消息'); return; }
            let out = `# 对话导出 (${CONFIG.sites[state.currentSite]?.name || 'site'})\n导出时间: ${new Date().toLocaleString()}\n\n`;
            users.forEach((u, i) => {
                out += `## ${i+1} 用户:\n${MessageHandler.getMessageText(u)}\n\n`;
                const ai = MessageHandler.findAIReply(u);
                out += `## ${i+1} AI:\n${ai ? Utils.getText(ai) : '（未找到对应 AI 回复）'}\n\n`;
            });
            Utils.downloadFile(out, `${(CONFIG.sites[state.currentSite]?.name||'chat')}_对话_${new Date().toISOString().slice(0,10)}.md`);
        }

        static highlightMessage(el) {
            if (!el) return;
            try {
                const prev = el.style.backgroundColor;
                el.style.transition = 'background-color 0.3s';
                el.style.backgroundColor = 'rgba(250,173,20,0.18)';
                setTimeout(() => { try { el.style.backgroundColor = prev; } catch (e) {} }, 900);
            } catch (e) {}
        }

        static getCurrentVisibleUserMessage() {
            const msgs = MessageHandler.getUserMessages();
            if (!msgs.length) return null;
            const center = window.innerHeight / 2;
            let best = null, minD = Infinity;
            msgs.forEach(m => {
                try {
                    const r = m.getBoundingClientRect();
                    if (r.bottom < 0 || r.top > window.innerHeight) return;
                    const d = Math.abs((r.top + r.height/2) - center);
                    if (d < minD) { minD = d; best = m; }
                } catch (e) {}
            });
            return best;
        }

        static jumpToPreviousUserMessage() {
            const msgs = MessageHandler.getUserMessages();
            if (!msgs.length) { alert('未找到用户消息'); return; }
            const cur = MessageHandler.getCurrentVisibleUserMessage();
            if (!cur) { msgs[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); MessageHandler.highlightMessage(msgs[0]); return; }
            const i = msgs.indexOf(cur);
            const target = i > 0 ? msgs[i-1] : msgs[msgs.length-1];
            target.scrollIntoView({ behavior: 'smooth', block: 'center' }); MessageHandler.highlightMessage(target);
        }
        static jumpToNextUserMessage() {
            const msgs = MessageHandler.getUserMessages();
            if (!msgs.length) { alert('未找到用户消息'); return; }
            const cur = MessageHandler.getCurrentVisibleUserMessage();
            if (!cur) { msgs[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); MessageHandler.highlightMessage(msgs[0]); return; }
            const i = msgs.indexOf(cur);
            const target = i < msgs.length - 1 ? msgs[i+1] : msgs[0];
            target.scrollIntoView({ behavior: 'smooth', block: 'center' }); MessageHandler.highlightMessage(target);
        }
    }

    class ConversationHandler {
        static getConversationTitle(convEl) {
            if (!convEl) return '';
            if (state.currentSite === 'qianwen') {
                const titleNode = convEl.matches('div[class*="text-ellipsis"]')
                    ? convEl
                    : convEl.querySelector('div[class*="text-ellipsis"]');
                const qwenTitle = Utils.getText(titleNode);
                if (qwenTitle) return qwenTitle.length > 40 ? qwenTitle.slice(0,40)+'...' : qwenTitle;
                return '';
            }
            const selectors = CONFIG.sites[state.currentSite]?.selectors?.titleSelector || [];
            for (const sel of selectors) {
                try {
                    const t = convEl.querySelector(sel);
                    if (t) {
                        const text = Utils.getText(t);
                        if (text) return text.length > 40 ? text.slice(0,40)+'…' : text;
                    }
                } catch (e) {}
            }
            const fallback = Utils.getText(convEl).split('\n')[0] || '';
            return fallback.length > 40 ? fallback.slice(0,40)+'…' : (fallback || '未命名对话');
        }

        static isQwenConversationItem(conv) {
            if (!conv || !(conv instanceof Element)) return false;
            const container = conv.matches('div.group.flex.justify-between.py-\\[0\\.375rem\\].pl-3.items-center.cursor-pointer')
                ? conv
                : conv.closest('div.group.flex.justify-between.py-\\[0\\.375rem\\].pl-3.items-center.cursor-pointer');
            if (!container) return false;

            const titleNode = container.querySelector('div[class*="text-ellipsis"]');
            if (!titleNode) return false;

            const title = Utils.getText(titleNode);
            if (!title) return false;

            const nestedInteractive = conv.closest('button, [role="menu"], [role="menuitem"], [aria-haspopup="menu"]');
            if (nestedInteractive && nestedInteractive !== container) return false;

            return true;
        }

        static normalizeConversationItem(conv) {
            if (!conv || !(conv instanceof Element)) return null;
            if (state.currentSite === 'qianwen') {
                return conv.matches('div.group.flex.justify-between.py-\\[0\\.375rem\\].pl-3.items-center.cursor-pointer')
                    ? conv
                    : conv.closest('div.group.flex.justify-between.py-\\[0\\.375rem\\].pl-3.items-center.cursor-pointer');
            }
            return conv;
        }

        static getAllConversations() {
            try {
                if (state.currentSite === 'qianwen') {
                    const qwenSelector = 'div.group.flex.justify-between.py-\\[0\\.375rem\\].pl-3.items-center.cursor-pointer';
                    const seenTitles = new Set();
                    return Array.from(document.querySelectorAll(qwenSelector)).filter(conv => {
                        try {
                            if (!ConversationHandler.isQwenConversationItem(conv)) return false;
                            const title = ConversationHandler.getConversationTitle(conv).trim().toLowerCase();
                            const isBlacklisted = /settings|help|api|feedback|activity|faq/i.test(title);
                            if (!title || isBlacklisted || seenTitles.has(title)) return false;
                            seenTitles.add(title);
                            return true;
                        } catch (e) { return false; }
                    });
                }

                const selectors = CONFIG.sites[state.currentSite]?.selectors?.conversationItem || [];
                let raw = selectors.flatMap(s => Array.from(document.querySelectorAll(s)));
                raw = raw
                    .map(conv => ConversationHandler.normalizeConversationItem(conv))
                    .filter(n => n instanceof Element);
                raw = Array.from(new Set(raw));

                return raw.filter(conv => {
                    try {
                        const href = conv.getAttribute('href') || '';
                        const title = ConversationHandler.getConversationTitle(conv).toLowerCase();
                        const isBlacklisted = /settings|help|api|feedback|activity|faq/i.test(title);
                        if (state.currentSite === 'chatgpt') {
                            const isChatPath = /\/c\/[a-z0-9-]{10,}/i.test(href) || (href.startsWith('/c/') && href.length > 5);
                            return isChatPath && !isBlacklisted;
                        }
                        if (state.currentSite === 'gemini') {
                            return href.includes('/app/') && !isBlacklisted;
                        }
                        if (state.currentSite === 'qianwen') {
                            return ConversationHandler.isQwenConversationItem(conv) && !isBlacklisted;
                        }
                        return title.length > 0 && !isBlacklisted;
                    } catch (e) { return false; }
                });
            } catch (e) { return []; }
        }

        static jumpToConversation(convEl) {
            if (!convEl) return;
            try {
                if (convEl.tagName === 'A' && convEl.href) {
                    if (convEl.href === window.location.href) convEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    else window.location.href = convEl.href;
                    return;
                }
                Utils.simulateClick(convEl);
            } catch (e) { console.error('[对话导航] jumpToConversation 失败', e); }
        }
    }

    class TocPanel {
        static refreshMessageItems() {
            const msgs = MessageHandler.getUserMessages();
            state.messageItems = msgs.map((m, i) => ({ element: m, text: MessageHandler.getMessageText(m), index: i+1 }));
            return state.messageItems;
        }
        static refreshConversationItems() {
            const convs = ConversationHandler.getAllConversations();
            state.conversationItems = convs.map((c,i) => ({ element: c, text: ConversationHandler.getConversationTitle(c), index: i+1 }));
            return state.conversationItems;
        }
        
        static renderMessageItems(container, items) {
            if (!container) return;
            // 使用安全方式清空容器
            Utils.clearElement(container);
            
            if (!items.length) { 
                const empty = document.createElement('div');
                empty.className = 'toc-empty';
                empty.textContent = '未找到消息';
                container.appendChild(empty);
                return; 
            }
            items.forEach(it => {
                const d = document.createElement('div'); 
                d.className = 'toc-item';
                const indexSpan = document.createElement('span');
                indexSpan.className = 'item-index';
                indexSpan.textContent = '#' + it.index + ' ';
                const textSpan = document.createElement('span');
                textSpan.textContent = Utils.escapeHtml(it.text);
                d.appendChild(indexSpan);
                d.appendChild(textSpan);
                d.addEventListener('click', () => {
                    it.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    MessageHandler.highlightMessage(it.element);
                });
                container.appendChild(d);
            });
        }
        
        static renderConversationItems(container, items) {
            if (!container) return;
            // 使用安全方式清空容器
            Utils.clearElement(container);
            
            if (!items.length) { 
                const empty = document.createElement('div');
                empty.className = 'toc-empty';
                empty.textContent = '未找到对话';
                container.appendChild(empty);
                return; 
            }
            items.forEach(it => {
                const d = document.createElement('div'); 
                d.className = 'toc-item';
                const indexSpan = document.createElement('span');
                indexSpan.className = 'item-index';
                indexSpan.textContent = '#' + it.index + ' ';
                const textSpan = document.createElement('span');
                textSpan.textContent = Utils.escapeHtml(it.text);
                d.appendChild(indexSpan);
                d.appendChild(textSpan);
                d.addEventListener('click', () => {
                    ConversationHandler.jumpToConversation(it.element);
                    TocPanel.toggle();
                });
                container.appendChild(d);
            });
        }

        static createPanel() {
            if (document.getElementById('ai-toc-panel')) return;
            const panel = document.createElement('div'); 
            panel.id = 'ai-toc-panel'; 
            panel.className = 'toc-panel';
            
            const header = document.createElement('div'); 
            header.className = 'toc-header';
            const headerTitle = document.createElement('span');
            headerTitle.textContent = '📑 导航';
            const headerClose = document.createElement('span');
            headerClose.id = 'ai-toc-close';
            headerClose.style.cursor = 'pointer';
            headerClose.textContent = '✕';
            header.appendChild(headerTitle);
            header.appendChild(headerClose);
            panel.appendChild(header);
            
            const tabs = document.createElement('div'); 
            tabs.className = 'toc-tab-bar';
            const tabMsg = document.createElement('div'); 
            tabMsg.className = 'toc-tab active'; 
            tabMsg.textContent = '消息'; 
            tabMsg.onclick = () => { state.tocActiveTab='message'; TocPanel.renderCurrent(); };
            const tabConv = document.createElement('div'); 
            tabConv.className = 'toc-tab'; 
            tabConv.textContent = '对话'; 
            tabConv.onclick = () => { state.tocActiveTab='conversation'; TocPanel.renderCurrent(); };
            tabs.appendChild(tabMsg); 
            tabs.appendChild(tabConv); 
            panel.appendChild(tabs);
            
            const searchWrap = document.createElement('div'); 
            searchWrap.className = 'toc-search-container';
            const input = document.createElement('input'); 
            input.id = 'ai-toc-search'; 
            input.className = 'toc-search-input'; 
            input.placeholder = '搜索...';
            input.oninput = Utils.debounce(() => TocPanel.onSearch(input.value), 250);
            searchWrap.appendChild(input); 
            panel.appendChild(searchWrap);
            
            const content = document.createElement('div'); 
            content.id = 'ai-toc-content'; 
            content.className = 'toc-content'; 
            panel.appendChild(content);
            
            const footer = document.createElement('div'); 
            footer.className = 'toc-footer';
            const footerCount = document.createElement('span');
            footerCount.id = 'ai-toc-count';
            footerCount.textContent = '0';
            const footerText = document.createElement('span');
            footerText.textContent = ' 项';
            footer.appendChild(footerCount);
            footer.appendChild(footerText);
            panel.appendChild(footer);
            
            document.body.appendChild(panel);
            document.getElementById('ai-toc-close').onclick = TocPanel.toggle;
            TocPanel.renderCurrent();
        }

        static renderCurrent() {
            const container = document.getElementById('ai-toc-content');
            if (!container) return;
            const tabs = document.querySelectorAll('.toc-tab');
            tabs[0].classList.toggle('active', state.tocActiveTab === 'message');
            tabs[1].classList.toggle('active', state.tocActiveTab === 'conversation');
            if (state.tocActiveTab === 'message') {
                TocPanel.refreshMessageItems(); 
                TocPanel.renderMessageItems(container, state.messageItems);
            } else {
                TocPanel.refreshConversationItems(); 
                TocPanel.renderConversationItems(container, state.conversationItems);
            }
            const countEl = document.getElementById('ai-toc-count');
            if (countEl) countEl.textContent = (state.tocActiveTab === 'message' ? state.messageItems.length : state.conversationItems.length);
        }

        static onSearch(q) {
            const keyword = (q || '').toLowerCase().trim();
            let items = (state.tocActiveTab==='message' ? state.messageItems : state.conversationItems);
            if (!keyword) { TocPanel.renderCurrent(); return; }
            const filtered = items.filter(it => (it.text||'').toLowerCase().includes(keyword));
            const container = document.getElementById('ai-toc-content');
            if (state.tocActiveTab === 'message') TocPanel.renderMessageItems(container, filtered);
            else TocPanel.renderConversationItems(container, filtered);
        }

        static toggle() {
            state.tocPanelOpen = !state.tocPanelOpen;
            const panel = document.getElementById('ai-toc-panel');
            if (!panel) { TocPanel.createPanel(); return; }
            panel.classList.toggle('open', state.tocPanelOpen);
            if (state.tocPanelOpen) TocPanel.renderCurrent();
        }
    }

    class WidthManager {
        static findTargetContainer() {
            if (state.targetContainer && document.contains(state.targetContainer)) return state.targetContainer;
            const sels = CONFIG.sites[state.currentSite]?.selectors?.contentContainer || [];
            const nodes = Utils.querySelectorAll(sels);
            if (nodes && nodes.length) {
                let best = nodes[0], max = 0;
                Array.from(nodes).forEach(n => {
                    try { const r = n.getBoundingClientRect(); const area = r.width * r.height; if (area > max) { max = area; best = n; } } catch(e){}
                });
                state.targetContainer = best;
                return best;
            }
            return document.body;
        }
        static setContentMaxWidth(w) {
            w = Math.max(CONFIG.settings.contentMaxWidth.min, Math.min(CONFIG.settings.contentMaxWidth.max, w));
            state.currentWidth = w;
            Utils.saveSettings();
            let style = document.getElementById('ai-width-style');
            if (!style) { style = document.createElement('style'); style.id = 'ai-width-style'; document.head.appendChild(style); }
            style.textContent = `
                [class*="message-list"], .main-content, #chat-container, .chat-container, main {
                    max-width: ${w}px !important; width: 100% !important; margin: 0 auto !important;
                }
            `;
        }
        static increase() { WidthManager.setContentMaxWidth(state.currentWidth + CONFIG.settings.contentMaxWidth.step); }
        static decrease() { WidthManager.setContentMaxWidth(state.currentWidth - CONFIG.settings.contentMaxWidth.step); }
        static reset() { WidthManager.setContentMaxWidth(CONFIG.settings.contentMaxWidth.default); }
    }

    class UICreator {
        static createButton(icon, text, cb, cls='') {
            const b = document.createElement('button'); 
            b.className = `nav-btn ${cls}`;
            
            const iconSpan = document.createElement('span');
            iconSpan.className = 'btn-icon';
            iconSpan.textContent = icon;
            
            const textSpan = document.createElement('span');
            textSpan.className = 'btn-text';
            textSpan.textContent = text;
            
            b.appendChild(iconSpan);
            b.appendChild(textSpan);
            
            b.title = text;
            b.onclick = (e) => { e.stopPropagation(); cb(); };
            return b;
        }
        static createUI() {
            if (document.getElementById('ai-nav-container')) return;
            const container = document.createElement('div'); 
            container.id = 'ai-nav-container'; 
            container.className = 'nav-container';
            
            container.appendChild(UICreator.createButton('↑','上一条', () => MessageHandler.jumpToPreviousUserMessage(), 'btn-green'));
            container.appendChild(UICreator.createButton('↓','下一条', () => MessageHandler.jumpToNextUserMessage(), 'btn-green'));
            
            const sep1 = document.createElement('div'); 
            sep1.className = 'nav-separator';
            container.appendChild(sep1);
            
            container.appendChild(UICreator.createButton('📑','目录', () => TocPanel.toggle(), 'btn-purple'));
            container.appendChild(UICreator.createButton('📤','导出', () => MessageHandler.exportConversation(), 'btn-blue'));
            
            const sep2 = document.createElement('div'); 
            sep2.className = 'nav-separator';
            container.appendChild(sep2);
            
            container.appendChild(UICreator.createButton('➕','加宽', () => WidthManager.increase(), 'btn-yellow'));
            container.appendChild(UICreator.createButton('➖','缩窄', () => WidthManager.decrease(), 'btn-yellow'));
            container.appendChild(UICreator.createButton('↺','重置', () => WidthManager.reset(), 'btn-gray'));
            
            const sep3 = document.createElement('div'); 
            sep3.className = 'nav-separator';
            container.appendChild(sep3);
            
            container.appendChild(UICreator.createButton('❓','快捷键', () => UICreator.showHelp(), 'btn-purple'));
            
            document.body.appendChild(container);
            state.uiCreated = true;
        }
        static initKeyboard() {
            if (UICreator._inited) return;
            document.addEventListener('keydown', (e) => {
                const active = document.activeElement;
                if (active && (active.tagName==='INPUT' || active.tagName==='TEXTAREA' || active.isContentEditable)) return;
                if (e.ctrlKey && e.altKey) {
                    const k = e.key.toLowerCase();
                    if (k === 'arrowup') { e.preventDefault(); MessageHandler.jumpToPreviousUserMessage(); }
                    if (k === 'arrowdown') { e.preventDefault(); MessageHandler.jumpToNextUserMessage(); }
                    if (k === 'd') { e.preventDefault(); TocPanel.toggle(); }
                    if (k === 'e') { e.preventDefault(); MessageHandler.exportConversation(); }
                    if (k === 'arrowleft') { e.preventDefault(); WidthManager.decrease(); }
                    if (k === 'arrowright') { e.preventDefault(); WidthManager.increase(); }
                }
            });
            UICreator._inited = true;
        }
        static showHelp() {
            if (document.getElementById('ai-help')) return;
            const overlay = document.createElement('div'); 
            overlay.id = 'ai-help'; 
            overlay.style = 'position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000000;display:flex;align-items:center;justify-content:center;';
            
            const box = document.createElement('div'); 
            box.style = 'background:#fff;padding:20px;border-radius:10px;max-width:420px;';
            
            const title = document.createElement('h3');
            title.style = 'margin:0 0 10px 0';
            title.textContent = '快捷键';
            box.appendChild(title);
            
            const content = document.createElement('div');
            const lines = ['Ctrl+Alt+↑ 上一条', 'Ctrl+Alt+↓ 下一条', 'Ctrl+Alt+D 目录', 'Ctrl+Alt+E 导出'];
            lines.forEach(line => {
                const p = document.createElement('div');
                p.textContent = line;
                p.style.marginBottom = '4px';
                content.appendChild(p);
            });
            box.appendChild(content);
            
            const closeWrap = document.createElement('div');
            closeWrap.style = 'text-align:right;margin-top:12px';
            const closeBtn = document.createElement('button');
            closeBtn.id = 'ai-help-close';
            closeBtn.textContent = '关闭';
            closeWrap.appendChild(closeBtn);
            box.appendChild(closeWrap);
            
            overlay.appendChild(box); 
            document.body.appendChild(overlay);
            document.getElementById('ai-help-close').onclick = () => {
                const el = document.getElementById('ai-help');
                if (el) document.body.removeChild(el);
            };
        }
    }

    class Observer {
        static pause() { if (state.observer) { state.observer.disconnect(); state.observerPaused = true; } }
        static resume() {
            if (state.observer) {
                const t = WidthManager.findTargetContainer() || document.body;
                state.observer.observe(t, { childList: true, subtree: true });
                state.observerPaused = false;
            }
        }
        static create() {
            state.observer = new MutationObserver(Utils.debounce(() => {
                if (state.observerPaused) return;
                state.domVersion++;
                if (!document.getElementById('ai-nav-container')) {
                    UICreator.createUI();
                }
                if (state.tocPanelOpen) TocPanel.renderCurrent();
            }, 1000));

            state.observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    function initMain() {
        state.currentSite = detectSite();
        if (!state.currentSite) return;

        Utils.injectStyles();
        Utils.loadSettings();
        UICreator.initKeyboard();
        
        if (!document.getElementById('ai-nav-container')) {
            UICreator.createUI();
            TocPanel.createPanel();
        }
        
        WidthManager.setContentMaxWidth(state.currentWidth);
        
        if (!state.observer) {
            Observer.create();
        }
        console.log('[对话导航] 初始化/热重载完成 - 站点:', state.currentSite);
    }

    let lastUrl = location.href;
    setInterval(() => {
        const currentUrl = location.href;
        const uiExists = document.getElementById('ai-nav-container');
        
        if (currentUrl !== lastUrl || !uiExists) {
            lastUrl = currentUrl;
            initMain();
        }
    }, 1500);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMain);
    } else {
        initMain();
    }
})();
