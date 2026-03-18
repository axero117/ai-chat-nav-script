// ==UserScript==
// @name         AI对话导航增强版
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  支持豆包、DeepSeek、千问和 Kimi 的用户消息导航 + 对话目录，带搜索功能
// @author       Axero
// @match        https://www.doubao.com/*
// @match        https://www.doubao.com/chat/*
// @match        https://chat.deepseek.com/*
// @match        https://deepseek.com/*
// @match        https://www.qianwen.com/chat*
// @match        https://www.qianwen.com/*
// @match        https://www.kimi.com/chat/*
// @match        https://www.kimi.com/*
// @icon         ...
// @grant        none
// @run-at       document-end
// ==/UserScript==

/**
 * AI对话导航增强版 - 优化版本
 * 功能：
 * 1. 消息导航：上下跳转用户消息
 * 2. 对话目录：显示消息和对话列表，支持搜索
 * 3. 内容宽度调整：增加/减小/重置内容宽度
 * 4. 键盘快捷键：提供快捷操作
 * 5. 悬浮侧边栏：可视化操作按钮
 * 6. 对话导出：导出对话历史
 * 7. 暗黑模式：支持网站暗黑模式
 */

(function() {
    'use strict';
    
    const SCRIPT_ID = 'AI_NAV_SCRIPT_' + Date.now();
    if (document.getElementById(SCRIPT_ID)) {
        console.log('[对话导航] 脚本实例已存在，跳过加载');
        return;
    }
    const marker = document.createElement('meta');
    marker.id = SCRIPT_ID;
    document.head.appendChild(marker);

    // ==================== 配置管理 ====================
    const CONFIG = {
        sites: {
            doubao: {
                name: '豆包',
                domains: ['doubao.com'],
                selectors: {
                    userMessage: [
                        '[class*="container-QQkdo4"]',
                        '.container-QQkdo4',
                        '[class*="user-message"]',
                        '.user-message',
                        '[class*="message-user"]',
                        '.message-user'
                    ],
                    conversationItem: [
                        'a._546d736',
                        '._546d736',
                        '[data-testid="chat_list_thread_item"]',
                        '[class*="conversation-item"]',
                        '.chat-list-item',
                        '[class*="chat-item"]',
                        'li[class*="thread"]',
                        'div[class*="thread"]'
                    ],
                    activeConversation: [
                        'a._546d736[aria-current="page"]',
                        '._546d736.active',
                        '[data-testid="chat_list_thread_item"][aria-current="page"]',
                        '[class*="active"]',
                        '[aria-current="page"]',
                        '.active'
                    ],
                    contentContainer: [
                        '.main-content',
                        '#chat-container',
                        '[class*="main-content"]',
                        '[class*="chat-container"]',
                        '[class*="message-list"]',
                        '.message-list'
                    ]
                },
                titleSelector: null
            },
            deepseek: {
                name: 'DeepSeek',
                domains: ['deepseek.com'],
                selectors: {
                    userMessage: [
                        'div.fbb737a4',
                        '.fbb737a4',
                        '[class*="user-message"]',
                        '.user-message',
                        '[class*="message-user"]',
                        '.message-user'
                    ],
                    conversationItem: [
                        'a[href^="/a/chat/s/"]',
                        'a._546d736',
                        '[class*="conversation-item"]',
                        '[class*="chat-item"]',
                        '.chat-list-item',
                        '[data-testid="chat-item"]',
                        'li[class*="thread"]',
                        'div[class*="thread"]'
                    ],
                    activeConversation: [
                        '[class*="active"]',
                        '[aria-current="page"]',
                        '.active'
                    ],
                    contentContainer: [
                        '.main-content',
                        '#chat-container',
                        '[class*="main-content"]',
                        '[class*="chat-container"]',
                        '[class*="message-list"]',
                        '.message-list'
                    ]
                },
                titleSelector: 'div[class*="c08e6e"]'
            },
            qianwen: {
                name: '千问',
                domains: ['qianwen.aliyun.com', 'tongyi.aliyun.com', 'www.qianwen.com'],
                selectors: {
                    userMessage: [
                        'div.bubble-VIVxZ8',
                        '[class*="bubble-"]',
                        '[class*="user-message"]',
                        '.user-message',
                        '[class*="message-user"]',
                        '.message-user'
                    ],
                    conversationItem: [
                        'div[class*="text-ellipsis"]',
                        'div[class*="whitespace-nowrap"]',
                        '[class*="conversation-item"]',
                        '[class*="chat-item"]',
                        '.chat-list-item',
                        'li[class*="thread"]',
                        'div[class*="thread"]'
                    ],
                    activeConversation: [
                        '[class*="active"]',
                        '[aria-current="page"]',
                        '.active'
                    ],
                    contentContainer: [
                        'div.message-list-scroll-container',
                        '#qwen-message-list-area',
                        '.main-content',
                        '#chat-container',
                        '[class*="main-content"]',
                        '[class*="chat-container"]',
                        '[class*="message-list"]',
                        '.message-list'
                    ]
                },
                titleSelector: 'div[class*="text-ellipsis"]'
            },
            kimi: {
                name: 'Kimi',
                domains: ['kimi.com'],
                selectors: {
                    userMessage: [
                        '.user-content',
                        '[class*="user-message"]',
                        '.user-message',
                        '[class*="message-user"]',
                        '.message-user'
                    ],
                    conversationItem: [
                        '[class*="conversation-item"]',
                        '[class*="chat-item"]',
                        '.chat-list-item',
                        '[data-testid="chat-item"]',
                        '[role="listitem"]',
                        'a[href*="/chat/"]',
                        '.chat-name',
                        'li[class*="thread"]',
                        'div[class*="thread"]'
                    ],
                    activeConversation: [
                        '[class*="active"]',
                        '[aria-current="page"]',
                        '.active'
                    ],
                    contentContainer: [
                        '.main-content',
                        '#chat-container',
                        '[class*="message-list"]',
                        '.chat-container',
                        '.message-list'
                    ]
                },
                titleSelector: '.chat-name'
            }
        },
        settings: {
            contentMaxWidth: { default: 900, min: 600, max: 2000, step: 50 },
            storage: { 
                key: 'dialog_nav_settings_v2'
            }
        },
        zIndex: 99999
    };

    // ==================== 状态管理 ====================
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
        tocSearchTimer: null,
        tocRefreshTimer: null,
        messageCache: null,
        messageCacheTime: 0,
        CACHE_DURATION: 2000
    };

    // ==================== 工具函数 ====================
    class Utils {
        /**
         * 选择器查询，支持数组形式的选择器列表
         */
        static querySelector(selector) {
            if (Array.isArray(selector)) {
                for (const s of selector) {
                    try {
                        const el = document.querySelector(s);
                        if (el) return el;
                    } catch (e) {
                        Utils.error('选择器查询错误:', s, e);
                    }
                }
                return null;
            }
            try {
                return document.querySelector(selector);
            } catch (e) {
                Utils.error('选择器查询错误:', selector, e);
                return null;
            }
        }

        /**
         * 多元素选择器查询，支持数组形式的选择器列表
         */
        static querySelectorAll(selector) {
            if (Array.isArray(selector)) {
                for (const s of selector) {
                    try {
                        const els = document.querySelectorAll(s);
                        if (els.length > 0) return els;
                    } catch (e) {
                        Utils.error('选择器查询错误:', s, e);
                    }
                }
                return [];
            }
            try {
                return document.querySelectorAll(selector);
            } catch (e) {
                Utils.error('选择器查询错误:', selector, e);
                return [];
            }
        }

        /**
         * 日志输出
         */
        static log(...args) {
            console.log('[对话导航]', ...args);
        }

        /**
         * 错误输出
         */
        static error(...args) {
            console.error('[对话导航]', ...args);
        }

        /**
         * 防抖函数
         */
        static debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        /**
         * 节流函数
         */
        static throttle(func, limit) {
            let inThrottle;
            return function executedFunction(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }

        /**
         * HTML转义
         */
        static escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        /**
         * 检测当前网站
         */
        static detectSite() {
            const hostname = window.location.hostname;
            Utils.log('检测网站: 当前域名 =', hostname);
            
            for (const [siteKey, siteConfig] of Object.entries(CONFIG.sites)) {
                for (const domain of siteConfig.domains) {
                    Utils.log('检测网站: 检查', siteConfig.name, '- 域名:', domain);
                    if (hostname.includes(domain)) {
                        Utils.log('检测网站: 匹配成功 -', siteConfig.name);
                        return siteKey;
                    }
                }
            }
            
            Utils.log('检测网站: 无匹配网站');
            return null;
        }

        /**
         * 模拟点击
         */
        static simulateClick(el) {
            if (!el) return;
            Utils.log('模拟点击元素:', el);
            try {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                if (el.tagName === 'A') {
                    el.click();
                    return;
                }
                
                const rect = el.getBoundingClientRect();
                const clientX = rect.left + rect.width / 2;
                const clientY = rect.top + rect.height / 2;
                ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(type => {
                    el.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX, clientY }));
                });
            } catch (e) {
                Utils.error('模拟点击错误:', e);
            }
        }

        /**
         * 加载设置
         */
        static loadSettings() {
            try {
                const saved = localStorage.getItem(CONFIG.settings.storage.key);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    state.currentWidth = parsed.contentMaxWidth || CONFIG.settings.contentMaxWidth.default;
                    Utils.log('加载设置:', parsed);
                    return parsed;
                }
            } catch (e) {
                Utils.error('加载设置失败:', e);
            }
            return null;
        }

        /**
         * 保存设置
         */
        static saveSettings() {
            try {
                localStorage.setItem(CONFIG.settings.storage.key, JSON.stringify({
                    contentMaxWidth: state.currentWidth,
                    lastUpdated: Date.now()
                }));
            } catch (e) {
                Utils.error('保存设置失败:', e);
            }
        }





        /**
         * 下载文件
         */
        static downloadFile(content, filename, contentType) {
            try {
                const blob = new Blob([content], { type: contentType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (e) {
                Utils.error('下载文件失败:', e);
                alert('下载失败，请重试');
            }
        }

        /**
         * 安全地获取元素文本
         */
        static getElementText(el) {
            if (!el) return '';
            try {
                return el.textContent || el.innerText || '';
            } catch (e) {
                return '';
            }
        }

        /**
         * 安全地获取元素属性
         */
        static getElementAttribute(el, attr) {
            if (!el) return null;
            try {
                return el.getAttribute(attr);
            } catch (e) {
                return null;
            }
        }
    }

    // ==================== 消息处理 ====================
    class MessageHandler {
        /**
         * 获取消息文本
         */
        static getMessageText(msgEl) {
            if (!msgEl) return '';
            const text = Utils.getElementText(msgEl).trim().replace(/\s+/g, ' ');
            return text.substring(0, 50);
        }

        /**
         * 获取用户消息列表
         */
        static getUserMessages() {
            try {
                const now = Date.now();
                if (state.messageCache && (now - state.messageCacheTime) < state.CACHE_DURATION) {
                    return state.messageCache;
                }
                
                const selectors = CONFIG.sites[state.currentSite].selectors;
                const userMessages = Utils.querySelectorAll(selectors.userMessage);
                state.messageCache = Array.from(userMessages).filter(msg => {
                    try {
                        const rect = msg.getBoundingClientRect();
                        if (rect.width < 50 || rect.height < 20) return false;
                        const text = Utils.getElementText(msg).trim();
                        if (text.length < 3) return false;
                        return true;
                    } catch (e) {
                        return false;
                    }
                });
                state.messageCacheTime = now;
                return state.messageCache;
            } catch (e) {
                Utils.error('获取用户消息失败:', e);
                return [];
            }
        }

        /**
         * 获取当前可见的用户消息
         */
        static getCurrentVisibleUserMessage() {
            const userMessages = MessageHandler.getUserMessages();
            if (!userMessages.length) return null;
            const viewportCenter = window.innerHeight / 2;
            let closestMsg = null;
            let minDistance = Infinity;
            userMessages.forEach(msg => {
                try {
                    const rect = msg.getBoundingClientRect();
                    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
                    const distance = Math.abs((rect.top + rect.height/2) - viewportCenter);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestMsg = msg;
                    }
                } catch (e) {
                    // 忽略错误，继续处理其他消息
                }
            });
            return closestMsg;
        }

        /**
         * 跳转到上一条用户消息
         */
        static jumpToPreviousUserMessage() {
            Utils.log('执行: 上一条用户消息');
            const userMessages = MessageHandler.getUserMessages();
            if (!userMessages.length) {
                alert('未找到用户消息，请确保当前对话有历史记录');
                return;
            }
            const current = MessageHandler.getCurrentVisibleUserMessage();
            if (!current) {
                userMessages[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                MessageHandler.highlightMessage(userMessages[0]);
                return;
            }
            const index = userMessages.indexOf(current);
            if (index > 0) {
                userMessages[index - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                MessageHandler.highlightMessage(userMessages[index - 1]);
            } else {
                userMessages[userMessages.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                MessageHandler.highlightMessage(userMessages[userMessages.length - 1]);
            }
        }

        /**
         * 跳转到下一条用户消息
         */
        static jumpToNextUserMessage() {
            Utils.log('执行: 下一条用户消息');
            const userMessages = MessageHandler.getUserMessages();
            if (!userMessages.length) {
                alert('未找到用户消息，请确保当前对话有历史记录');
                return;
            }
            const current = MessageHandler.getCurrentVisibleUserMessage();
            if (!current) {
                userMessages[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                MessageHandler.highlightMessage(userMessages[0]);
                return;
            }
            const index = userMessages.indexOf(current);
            if (index < userMessages.length - 1) {
                userMessages[index + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                MessageHandler.highlightMessage(userMessages[index + 1]);
            } else {
                userMessages[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                MessageHandler.highlightMessage(userMessages[0]);
            }
        }

        /**
         * 高亮消息
         */
        static highlightMessage(msgEl) {
            if (!msgEl) return;
            try {
                msgEl.style.transition = 'background-color 0.3s';
                const originalBg = msgEl.style.backgroundColor;
                msgEl.style.backgroundColor = 'rgba(250, 173, 20, 0.2)';
                setTimeout(() => { 
                    try {
                        msgEl.style.backgroundColor = originalBg;
                    } catch (e) {}
                }, 1000);
            } catch (e) {
                Utils.error('高亮消息失败:', e);
            }
        }



        /**
         * 导出对话
         */
        static exportConversation() {
            const userMessages = MessageHandler.getUserMessages();
            if (!userMessages.length) {
                alert('未找到对话内容');
                return;
            }
            
            let exportContent = `# ${CONFIG.sites[state.currentSite].name} 对话导出\n\n`;
            exportContent += `导出时间: ${new Date().toLocaleString()}\n\n`;
            
            userMessages.forEach((msg, index) => {
                const text = Utils.getElementText(msg).trim();
                exportContent += `## 消息 ${index + 1}\n${text}\n\n`;
            });
            
            const filename = `${CONFIG.sites[state.currentSite].name}_对话导出_${new Date().toISOString().slice(0, 10)}.md`;
            Utils.downloadFile(exportContent, filename, 'text/markdown');
        }
    }

    // ==================== 对话处理 ====================
    class ConversationHandler {
        /**
         * 获取对话标题
         */
        static getConversationTitle(convEl) {
            if (!convEl) return '';
            const siteConfig = CONFIG.sites[state.currentSite];
            let titleEl = null;
            
            // 针对不同网站优化标题提取
            if (siteConfig.titleSelector) {
                titleEl = convEl.querySelector(siteConfig.titleSelector);
            }
            
            // 通用 fallback
            if (!titleEl) {
                titleEl = convEl.querySelector('[class*="title"], [class*="name"], .chat-name, .conversation-title');
            }
            
            const targetEl = titleEl || convEl;
            let title = Utils.getElementText(targetEl).trim().replace(/\s+/g, ' ');
            if (title.length > 30) title = title.substring(0, 30) + '…';
            return title || '未命名对话';
        }

        /**
         * 获取所有对话
         */
        static getAllConversations() {
            try {
                const selectors = CONFIG.sites[state.currentSite].selectors;
                const convs = Array.from(Utils.querySelectorAll(selectors.conversationItem));
                Utils.log(`获取到 ${convs.length} 个对话 (选择器: ${selectors.conversationItem.join(', ')})`);
                return convs.filter(conv => {
                    try {
                        const rect = conv.getBoundingClientRect();
                        if (rect.width < 10 || rect.height < 10) return false;
                        return true;
                    } catch (e) {
                        return false;
                    }
                });
            } catch (e) {
                Utils.error('获取对话列表失败:', e);
                return [];
            }
        }

        /**
         * 获取当前激活的对话
         */
        static getActiveConversation() {
            try {
                const selectors = CONFIG.sites[state.currentSite].selectors;
                const conversations = Array.from(Utils.querySelectorAll(selectors.conversationItem));
                const currentPath = window.location.pathname;
                
                for (const conv of conversations) {
                    try {
                        if (conv.tagName === 'A' && conv.href) {
                            const hrefPath = new URL(conv.href).pathname;
                            if (hrefPath === currentPath) {
                                return conv;
                            }
                        }
                    } catch (e) {
                        // 忽略错误，继续处理其他对话
                    }
                }
                
                for (const conv of conversations) {
                    try {
                        if (conv.classList.contains('active') || conv.getAttribute('aria-current') === 'page') {
                            return conv;
                        }
                    } catch (e) {
                        // 忽略错误，继续处理其他对话
                    }
                }
            } catch (e) {
                Utils.error('获取激活对话失败:', e);
            }
            
            return null;
        }

        /**
         * 跳转到对话
         */
        static jumpToConversation(item) {
            if (!item) return;
            Utils.log('跳转到对话:', item);
            
            // Kimi 特殊处理：查找可点击的父元素
            if (state.currentSite === 'kimi' && item.classList && item.classList.contains('chat-name')) {
                let parent = item.parentElement;
                while (parent) {
                    try {
                        if (parent.tagName === 'A' || parent.getAttribute('role') === 'button' || /item/i.test(parent.className)) {
                            item = parent;
                            break;
                        }
                    } catch (e) {
                        // 忽略错误，继续查找
                    }
                    parent = parent.parentElement;
                }
            }
            
            try {
                if (item.tagName === 'A' && item.href) {
                    if (item.href === window.location.href) {
                        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        window.location.href = item.href;
                    }
                    return;
                }
                
                setTimeout(() => Utils.simulateClick(item), 300);
            } catch (e) {
                Utils.error('跳转到对话失败:', e);
            }
        }
    }

    // ==================== 目录面板 ====================
    class TocPanel {
        /**
         * 刷新消息项
         */
        static refreshMessageItems() {
            try {
                const userMessages = MessageHandler.getUserMessages();
                state.messageItems = userMessages.map((msg, index) => ({
                    element: msg,
                    text: MessageHandler.getMessageText(msg),
                    index: index + 1
                }));
                Utils.log(`刷新消息列表: ${state.messageItems.length} 条`);
            } catch (e) {
                Utils.error('刷新消息项失败:', e);
                state.messageItems = [];
            }
            return state.messageItems;
        }

        /**
         * 刷新对话项
         */
        static refreshConversationItems() {
            try {
                const conversations = ConversationHandler.getAllConversations();
                state.conversationItems = conversations.map((conv, index) => ({
                    element: conv,
                    text: ConversationHandler.getConversationTitle(conv),
                    index: index + 1
                }));
                Utils.log(`刷新对话列表: ${state.conversationItems.length} 项`);
            } catch (e) {
                Utils.error('刷新对话项失败:', e);
                state.conversationItems = [];
            }
            return state.conversationItems;
        }

        /**
         * 过滤项
         */
        static filterItems(items, keyword) {
            if (!keyword || keyword.trim() === '') return items;
            const lowerKeyword = keyword.toLowerCase().trim();
            return items.filter(item => item.text.toLowerCase().includes(lowerKeyword));
        }

        /**
         * 渲染消息项
         */
        static renderMessageItems(container, filteredItems) {
            if (filteredItems.length === 0) {
                container.innerHTML = `
                    <div style="padding: 20px; color: #999; text-align: center;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🔍</div>
                        <div>未找到匹配的消息</div>
                    </div>
                `;
                return;
            }
            container.innerHTML = '';
            filteredItems.forEach(item => {
                const div = document.createElement('div');
                div.style.cssText = `
                    padding: 10px 15px;
                    border-bottom: 1px solid rgba(0,0,0,0.08);
                    cursor: pointer;
                    font-size: 13px;
                    line-height: 1.4;
                    transition: background-color 0.2s;
                    color: #333;
                `;
                div.innerHTML = `<strong style="color: #1890ff;">#${item.index}</strong> ${Utils.escapeHtml(item.text)}...`;
                div.addEventListener('mouseenter', () => div.style.backgroundColor = 'rgba(24, 144, 255, 0.08)');
                div.addEventListener('mouseleave', () => div.style.backgroundColor = 'transparent');
                div.addEventListener('click', () => {
                    Utils.log('点击消息项跳转:', item.text);
                    item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    MessageHandler.highlightMessage(item.element);
                });
                container.appendChild(div);
            });
        }

        /**
         * 渲染对话项
         */
        static renderConversationItems(container, filteredItems) {
            if (filteredItems.length === 0) {
                container.innerHTML = `
                    <div style="padding: 20px; color: #999; text-align: center;">
                        <div style="font-size: 40px; margin-bottom: 10px;">💬</div>
                        <div>未找到匹配的对话</div>
                    </div>
                `;
                return;
            }
            container.innerHTML = '';
            filteredItems.forEach(item => {
                const div = document.createElement('div');
                div.style.cssText = `
                    padding: 10px 15px;
                    border-bottom: 1px solid rgba(0,0,0,0.08);
                    cursor: pointer;
                    font-size: 13px;
                    line-height: 1.4;
                    transition: background-color 0.2s;
                    color: #333;
                `;
                div.innerHTML = `<strong style="color: #52c41a;">💬</strong> ${Utils.escapeHtml(item.text)}`;
                div.addEventListener('mouseenter', () => div.style.backgroundColor = 'rgba(82, 196, 26, 0.08)');
                div.addEventListener('mouseleave', () => div.style.backgroundColor = 'transparent');
                div.addEventListener('click', () => {
                    Utils.log('点击对话项跳转:', item.text);
                    ConversationHandler.jumpToConversation(item.element);
                    TocPanel.toggleTocPanel();
                });
                container.appendChild(div);
            });
        }



        /**
         * 更新目录计数
         */
        static updateTocCount() {
            const countEl = document.getElementById('dialog-toc-count');
            if (!countEl) return;
            if (state.tocActiveTab === 'message') {
                countEl.textContent = state.messageItems.length;
            } else if (state.tocActiveTab === 'conversation') {
                countEl.textContent = state.conversationItems.length;
            }
        }

        /**
         * 目录搜索输入处理
         */
        static onTocSearchInput() {
            const searchInput = document.getElementById('dialog-toc-search');
            if (!searchInput) return;
            
            const keyword = searchInput.value;
            Utils.log(`搜索输入: "${keyword}" 当前标签: ${state.tocActiveTab}`);
            
            const contentEl = document.getElementById('dialog-toc-content');
            if (!contentEl) return;
            
            Observer.pauseObserver();
            
            let filteredItems;
            if (state.tocActiveTab === 'message') {
                filteredItems = TocPanel.filterItems(state.messageItems, keyword);
                TocPanel.renderMessageItems(contentEl, filteredItems);
            } else if (state.tocActiveTab === 'conversation') {
                filteredItems = TocPanel.filterItems(state.conversationItems, keyword);
                TocPanel.renderConversationItems(contentEl, filteredItems);
            }
            
            Observer.resumeObserver();
        }

        /**
         * 切换标签
         */
        static switchTab(tab) {
            if (tab === state.tocActiveTab) return;
            Utils.log(`切换标签: ${tab}`);
            state.tocActiveTab = tab;
            
            const messageTab = document.getElementById('dialog-tab-message');
            const convTab = document.getElementById('dialog-tab-conversation');
            if (messageTab && convTab) {
                if (tab === 'message') {
                    messageTab.style.background = '#1890ff';
                    messageTab.style.color = 'white';
                    convTab.style.background = 'transparent';
                    convTab.style.color = '#666';
                } else if (tab === 'conversation') {
                    convTab.style.background = '#52c41a';
                    convTab.style.color = 'white';
                    messageTab.style.background = 'transparent';
                    messageTab.style.color = '#666';
                }
            }
            
            if (tab === 'message') {
                TocPanel.refreshMessageItems();
            } else if (tab === 'conversation') {
                TocPanel.refreshConversationItems();
            }
            else {
                Utils.warn('未知标签:', tab);
                tab = 'message';
                TocPanel.refreshMessageItems();
            }
            TocPanel.updateTocCount();
            
            const searchInput = document.getElementById('dialog-toc-search');
            if (searchInput) searchInput.value = '';
            
            const contentEl = document.getElementById('dialog-toc-content');
            if (contentEl) {
                Observer.pauseObserver();
                if (tab === 'message') {
                    TocPanel.renderMessageItems(contentEl, state.messageItems);
                } else if (tab === 'conversation') {
                    TocPanel.renderConversationItems(contentEl, state.conversationItems);
                }
                Observer.resumeObserver();
            }
        }

        /**
         * 创建目录面板
         */
        static createTocPanel() {
            if (document.getElementById('dialog-toc-panel')) {
                Utils.log('目录面板已存在');
                return;
            }
            Utils.log('开始创建目录面板');
            
            const panel = document.createElement('div');
            panel.id = 'dialog-toc-panel';
            panel.style.cssText = `
                position: fixed;
                top: 0;
                right: -320px;
                width: 320px;
                height: 100vh;
                background: rgba(255, 255, 255, 0.98);
                box-shadow: -2px 0 12px rgba(0,0,0,0.15);
                z-index: 99998;
                transition: right 0.3s ease;
                display: flex;
                flex-direction: column;
                border-left: 1px solid rgba(0,0,0,0.08);
                pointer-events: auto;
            `;
            
            const header = document.createElement('div');
            header.style.cssText = `
                padding: 15px;
                background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
                color: white;
                font-weight: bold;
                font-size: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            header.innerHTML = `
                <span>📑 ${CONFIG.sites[state.currentSite].name} 导航</span>
                <span style="cursor: pointer; font-size: 18px;" id="dialog-toc-close">✕</span>
            `;
            panel.appendChild(header);
            
            const tabBar = document.createElement('div');
            tabBar.style.cssText = `
                display: flex;
                border-bottom: 1px solid rgba(0,0,0,0.08);
                background: #fafafa;
            `;
            
            const messageTab = document.createElement('div');
            messageTab.id = 'dialog-tab-message';
            messageTab.textContent = '📝 消息';
            messageTab.style.cssText = `
                flex: 1;
                text-align: center;
                padding: 10px 0;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
                background: #1890ff;
                color: white;
            `;
            messageTab.addEventListener('click', () => TocPanel.switchTab('message'));
            
            const convTab = document.createElement('div');
            convTab.id = 'dialog-tab-conversation';
            convTab.textContent = '💬 对话';
            convTab.style.cssText = `
                flex: 1;
                text-align: center;
                padding: 10px 0;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
                background: transparent;
                color: #666;
            `;
            convTab.addEventListener('click', () => TocPanel.switchTab('conversation'));
            

            
            tabBar.appendChild(messageTab);
            tabBar.appendChild(convTab);
            panel.appendChild(tabBar);
            
            const searchContainer = document.createElement('div');
            searchContainer.style.cssText = `
                padding: 10px 15px;
                background: rgba(0,0,0,0.03);
                border-bottom: 1px solid rgba(0,0,0,0.08);
            `;
            
            const searchInput = document.createElement('input');
            searchInput.id = 'dialog-toc-search';
            searchInput.type = 'text';
            searchInput.placeholder = '🔍 搜索...';
            searchInput.style.cssText = `
                width: 100%;
                padding: 8px 12px;
                border: 1px solid rgba(0,0,0,0.15);
                border-radius: 4px;
                font-size: 13px;
                outline: none;
                box-sizing: border-box;
                background: white;
                color: #333;
            `;
            searchInput.addEventListener('input', Utils.debounce(TocPanel.onTocSearchInput, 300));
            searchInput.addEventListener('click', (e) => e.stopPropagation());
            
            searchContainer.appendChild(searchInput);
            panel.appendChild(searchContainer);
            
            const content = document.createElement('div');
            content.id = 'dialog-toc-content';
            content.style.cssText = `flex: 1; overflow-y: auto; background: white;`;
            panel.appendChild(content);
            
            const footer = document.createElement('div');
            footer.style.cssText = `
                padding: 10px 15px;
                background: rgba(0,0,0,0.03);
                font-size: 12px;
                color: #666;
                border-top: 1px solid rgba(0,0,0,0.08);
            `;
            footer.innerHTML = '<span id="dialog-toc-count">0</span> 条项目';
            panel.appendChild(footer);
            
            document.body.appendChild(panel);
            
            const closeBtn = document.getElementById('dialog-toc-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', TocPanel.toggleTocPanel);
            }
            
            TocPanel.refreshMessageItems();
            TocPanel.refreshConversationItems();
            TocPanel.renderMessageItems(content, state.messageItems);
            TocPanel.updateTocCount();
        }

        /**
         * 切换目录面板
         */
        static toggleTocPanel() {
            state.tocPanelOpen = !state.tocPanelOpen;
            Utils.log(`切换目录面板: ${state.tocPanelOpen ? '打开' : '关闭'}`);
            const panel = document.getElementById('dialog-toc-panel');
            if (!panel) return;
            if (state.tocPanelOpen) {
                panel.style.right = '0';
                Observer.pauseObserver();
                if (state.tocActiveTab === 'message') {
                    TocPanel.refreshMessageItems();
                    TocPanel.renderMessageItems(document.getElementById('dialog-toc-content'), state.messageItems);
                } else if (state.tocActiveTab === 'conversation') {
                    TocPanel.refreshConversationItems();
                    TocPanel.renderConversationItems(document.getElementById('dialog-toc-content'), state.conversationItems);
                }
                TocPanel.updateTocCount();
                Observer.resumeObserver();
            } else {
                panel.style.right = '-320px';
            }
        }
    }

    // ==================== 宽度调整 ====================
    class WidthManager {
        /**
         * 查找目标容器
         */
        static findTargetContainer() {
            if (state.targetContainer && document.contains(state.targetContainer)) {
                return state.targetContainer;
            }
            try {
                const selectors = CONFIG.sites[state.currentSite].selectors;
                const containers = Utils.querySelectorAll(selectors.contentContainer);
                if (containers.length > 0) {
                    let largest = containers[0];
                    let maxArea = 0;
                    containers.forEach(el => {
                        try {
                            const rect = el.getBoundingClientRect();
                            const area = rect.width * rect.height;
                            if (area > maxArea) { maxArea = area; largest = el; }
                        } catch (e) {
                            // 忽略错误，继续处理其他容器
                        }
                    });
                    state.targetContainer = largest;
                    return largest;
                }
            } catch (e) {
                Utils.error('查找目标容器失败:', e);
            }
            return null;
        }

        /**
         * 设置内容最大宽度
         */
        static setContentMaxWidth(width) {
            const min = CONFIG.settings.contentMaxWidth.min;
            const max = CONFIG.settings.contentMaxWidth.max;
            width = Math.max(min, Math.min(max, width));
            state.currentWidth = width;
            Utils.log(`设置内容最大宽度: ${width}px`);
            
            Utils.saveSettings();
            
            let styleSheet = document.getElementById('dialog-width-style');
            if (!styleSheet) {
                styleSheet = document.createElement('style');
                styleSheet.id = 'dialog-width-style';
                document.head.appendChild(styleSheet);
            }
            
            styleSheet.textContent = `
                [class*="message-list"], [class*="chat-content"], [class*="main-content"],
                .main-content, #chat-container, .chat-container {
                    max-width: ${width}px !important;
                    width: 100% !important;
                    margin-left: auto !important;
                    margin-right: auto !important;
                }
                .max-w-3xl, .max-w-4xl, .max-w-5xl, .max-w-6xl {
                    max-width: ${width}px !important;
                }
            `;
            
            const container = WidthManager.findTargetContainer();
            if (container) {
                try {
                    container.style.maxWidth = width + 'px';
                    container.style.width = '100%';
                } catch (e) {
                    Utils.error('设置容器宽度失败:', e);
                }
            }
        }

        /**
         * 增加内容宽度
         */
        static increaseContentWidth() {
            Utils.log('增加宽度');
            WidthManager.setContentMaxWidth(state.currentWidth + CONFIG.settings.contentMaxWidth.step);
        }

        /**
         * 减小内容宽度
         */
        static decreaseContentWidth() {
            Utils.log('减小宽度');
            WidthManager.setContentMaxWidth(state.currentWidth - CONFIG.settings.contentMaxWidth.step);
        }

        /**
         * 重置内容宽度
         */
        static resetContentWidth() {
            Utils.log('重置宽度');
            WidthManager.setContentMaxWidth(CONFIG.settings.contentMaxWidth.default);
        }
    }



    // ==================== 界面创建 ====================
    class UICreator {
        /**
         * 创建按钮
         */
        static createButton(symbol, text, onClick, bgColor, hoverColor) {
            const btn = document.createElement('button');
            btn.innerHTML = `<span style="display:inline-block; width:20px; text-align:center;">${symbol}</span><span class="btn-text" style="margin-left:5px; display:none;">${text}</span>`;
            btn.title = text;
            btn.onclick = (e) => { e.stopPropagation(); onClick(); };
            btn.style.cssText = `
                padding: 10px 5px;
                background-color: ${bgColor};
                color: white;
                border: none;
                border-radius: 4px 0 0 4px;
                cursor: pointer;
                font-size: 16px;
                width: 100%;
                text-align: left;
                white-space: nowrap;
                transition: background-color 0.2s;
                margin: 2px 0;
                box-sizing: border-box;
            `;
            btn.addEventListener('mouseenter', () => btn.style.backgroundColor = hoverColor);
            btn.addEventListener('mouseleave', () => btn.style.backgroundColor = bgColor);
            return btn;
        }

        /**
         * 创建分隔符
         */
        static createSeparator() {
            const sep = document.createElement('div');
            sep.style.cssText = `height: 1px; background: rgba(0,0,0,0.15); margin: 6px 8px;`;
            return sep;
        }

        /**
         * 创建导航UI
         */
        static createNavigationUI() {
            if (document.getElementById('dialog-nav-container')) {
                Utils.log('侧边栏UI已存在');
                return;
            }
            
            Utils.log('开始创建侧边栏UI');
            
            try {
                const container = document.createElement('div');
                container.id = 'dialog-nav-container';
                container.className = 'nav-container';
                container.style.cssText = `
                    position: fixed;
                    top: 50%;
                    right: 0;
                    transform: translateY(-50%);
                    z-index: 99999;
                    display: flex;
                    flex-direction: column;
                    background: rgba(255, 255, 255, 0.98);
                    border-radius: 8px 0 0 8px;
                    box-shadow: -2px 2px 12px rgba(0,0,0,0.15);
                    width: 45px;
                    transition: width 0.3s;
                    padding: 8px 0;
                    border: 1px solid rgba(0,0,0,0.08);
                    overflow: hidden;
                    pointer-events: auto;
                `;
                
                container.addEventListener('mouseenter', () => {
                    container.style.width = '150px';
                    container.querySelectorAll('.btn-text').forEach(span => span.style.display = 'inline');
                });
                container.addEventListener('mouseleave', () => {
                    container.style.width = '45px';
                    container.querySelectorAll('.btn-text').forEach(span => span.style.display = 'none');
                });
                
                container.appendChild(UICreator.createButton('↑', '上一条消息', MessageHandler.jumpToPreviousUserMessage, '#52c41a', '#73d13d'));
                container.appendChild(UICreator.createButton('↓', '下一条消息', MessageHandler.jumpToNextUserMessage, '#52c41a', '#73d13d'));
                container.appendChild(UICreator.createSeparator());
                container.appendChild(UICreator.createButton('📑', '目录', TocPanel.toggleTocPanel, '#722ed1', '#9254de'));
                container.appendChild(UICreator.createButton('📤', '导出', MessageHandler.exportConversation, '#1890ff', '#40a9ff'));
                container.appendChild(UICreator.createSeparator());
                container.appendChild(UICreator.createButton('➕', '加宽', WidthManager.increaseContentWidth, '#faad14', '#ffc53d'));
                container.appendChild(UICreator.createButton('➖', '缩窄', WidthManager.decreaseContentWidth, '#faad14', '#ffc53d'));
                container.appendChild(UICreator.createButton('↻', '重置', WidthManager.resetContentWidth, '#8c8c8c', '#bfbfbf'));
                container.appendChild(UICreator.createSeparator());
                container.appendChild(UICreator.createButton('❓', '快捷键', UICreator.showKeyboardHelp, '#722ed1', '#9254de'));
                
                if (document.body) {
                    document.body.appendChild(container);
                    Utils.log('侧边栏UI已成功添加到页面');
                    state.uiCreated = true;
                } else {
                    Utils.error('创建导航UI失败: document.body不存在');
                }
            } catch (e) {
                Utils.error('创建导航UI失败:', e);
            }
        }

        /**
         * 初始化键盘监听
         */
        static initKeyboardListener() {
            // 防止重复注册
            if (UICreator.keyboardListenerAttached) {
                Utils.log('键盘监听已存在，跳过注册');
                return;
            }
            
            try {
                // 保存监听器引用，方便清理
                UICreator.keyboardHandler = (e) => {
                    // 输入框内不触发快捷键
                    const activeEl = document.activeElement;
                    if (activeEl.tagName === 'INPUT' || 
                        activeEl.tagName === 'TEXTAREA' || 
                        activeEl.isContentEditable) {
                        return;
                    }
                    
                    // 改为 Ctrl+Alt 组合键，避开浏览器默认快捷键
                    if (e.ctrlKey && e.altKey) {
                        const key = e.key.toLowerCase();
                        
                        // 只拦截我们定义的快捷键，避免影响其他 Ctrl+Alt+ 组合
                        const handledKeys = [
                            'arrowup', 'arrowdown',  // 上下消息
                            'd',                      // 目录
                            'e',                      // 导出
                            'arrowleft', 'arrowright', // 宽度调整
                            'r'                       // 重置宽度（已移除 m）
                        ];
                        
                        if (handledKeys.includes(key)) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            switch(key) {
                                // ==================== 消息导航 ====================
                                case 'arrowup':
                                    MessageHandler.jumpToPreviousUserMessage();
                                    break;
                                
                                case 'arrowdown':
                                    MessageHandler.jumpToNextUserMessage();
                                    break;
                                
                                // ==================== 目录面板 ====================
                                case 'd':
                                    TocPanel.toggleTocPanel();
                                    break;
                                
                                // ==================== 对话导出 ====================
                                case 'e':
                                    MessageHandler.exportConversation();
                                    break;
                                
                                // ==================== 宽度调整 ====================
                                case 'arrowleft':
                                    WidthManager.decreaseContentWidth();
                                    break;
                                
                                case 'arrowright':
                                    WidthManager.increaseContentWidth();
                                    break;
                                
                                case 'r':
                                    WidthManager.resetContentWidth();
                                    break;
                                
                                // ==================== 默认处理 ====================
                                default:
                                    Utils.warn('未定义的快捷键:', e.key);
                                    break;
                            }
                        }
                    }
                };
                
                // 注册监听器
                document.addEventListener('keydown', UICreator.keyboardHandler);
                UICreator.keyboardListenerAttached = true;
                
                Utils.log('✅ 键盘监听已初始化 (Ctrl+Alt+ 快捷键)');
                Utils.log('📍 快捷键: Ctrl+Alt+↑↓ 导航, D 目录, E 导出, ←→ 宽度, R 重置');  
                
            } catch (e) {
                Utils.error('初始化键盘监听失败:', e);
            }
        }

        //添加清理函数
        static cleanupKeyboardListener() {
            if (UICreator.keyboardHandler) {
                document.removeEventListener('keydown', UICreator.keyboardHandler);
                UICreator.keyboardHandler = null;
                UICreator.keyboardListenerAttached = false;
            }
        }

        /**
         * 显示键盘快捷键帮助
         */
        static showKeyboardHelp() {
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            `;
            
            // 创建帮助弹窗
            const helpBox = document.createElement('div');
            helpBox.style.cssText = `
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                padding: 24px;
                max-width: 400px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease;
            `;
            
            // 弹窗标题
            const title = document.createElement('div');
            title.style.cssText = `
                font-size: 18px;
                font-weight: 600;
                color: #1890ff;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            `;
            title.innerHTML = `
                <span>🎯 快捷键帮助</span>
                <button id="close-help" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #999;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                ">×</button>
            `;
            
            // 快捷键表格
            const table = document.createElement('div');
            table.style.cssText = `
                margin-bottom: 20px;
            `;
            
            const shortcuts = [
                { key: 'Ctrl+Alt+↑', func: '上一条消息' },
                { key: 'Ctrl+Alt+↓', func: '下一条消息' },
                { key: 'Ctrl+Alt+D', func: '打开/关闭目录' },
                { key: 'Ctrl+Alt+E', func: '导出对话' },
                { key: 'Ctrl+Alt+←', func: '减小宽度' },
                { key: 'Ctrl+Alt+→', func: '增加宽度' },
                { key: 'Ctrl+Alt+R', func: '重置宽度' }
            ];
            
            let tableHTML = `
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 16px;
                ">
            `;
            
            shortcuts.forEach((item, index) => {
                tableHTML += `
                    <div style="
                        background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};
                        padding: 10px 12px;
                        border-radius: 6px;
                        font-size: 14px;
                    ">
                        <div style="font-weight: 500; color: #1890ff;">${item.key}</div>
                    </div>
                    <div style="
                        background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};
                        padding: 10px 12px;
                        border-radius: 6px;
                        font-size: 14px;
                        color: #333;
                    ">
                        ${item.func}
                    </div>
                `;
            });
            
            tableHTML += `</div>`;
            
            // 提示信息
            const tip = document.createElement('div');
            tip.style.cssText = `
                background: #f6ffed;
                border: 1px solid #b7eb8f;
                border-radius: 6px;
                padding: 12px;
                font-size: 13px;
                color: #52c41a;
                margin-top: 16px;
            `;
            tip.innerHTML = `💡 提示：鼠标悬停侧边栏可展开完整菜单`;
            
            // 组装弹窗
            table.innerHTML = tableHTML;
            helpBox.appendChild(title);
            helpBox.appendChild(table);
            helpBox.appendChild(tip);
            overlay.appendChild(helpBox);
            
            // 添加动画样式
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { 
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
            
            // 添加到页面
            document.body.appendChild(overlay);
            
            // 关闭按钮事件
            const closeBtn = document.getElementById('close-help');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    overlay.style.animation = 'fadeIn 0.3s ease reverse';
                    helpBox.style.animation = 'slideIn 0.3s ease reverse';
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                        document.head.removeChild(style);
                    }, 300);
                });
            }
            
            // 点击遮罩层关闭
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.style.animation = 'fadeIn 0.3s ease reverse';
                    helpBox.style.animation = 'slideIn 0.3s ease reverse';
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                        document.head.removeChild(style);
                    }, 300);
                }
            });
        }
    }

    // ==================== 观察器 ====================
    class Observer {
        /**
         * 暂停观察器
         */
        static pauseObserver() {
            if (state.observer && !state.observerPaused) {
                state.observer.disconnect();
                state.observerPaused = true;
                Utils.log('观察器暂停');
            }
        }

        /**
         * 恢复观察器
         */
        static resumeObserver() {
            if (state.observer && state.observerPaused) {
                state.observer.observe(document.body, { childList: true, subtree: true });
                state.observerPaused = false;
                Utils.log('观察器恢复');
            }
        }

        /**
         * 创建观察器
         */
        static createObserver() {
            try {
                Utils.log('开始创建MutationObserver...');
                state.observer = new MutationObserver(Utils.throttle(() => {
                    try {
                        // 检查UI是否存在，如果不存在则创建
                        if (!document.getElementById('dialog-nav-container')) {
                            Utils.log('观察器检测到UI不存在，重新创建...');
                            UICreator.createNavigationUI();
                        }
                        
                        // 处理目录面板刷新
                        if (state.tocPanelOpen && !state.observerPaused) {
                            if (state.tocRefreshTimer) clearTimeout(state.tocRefreshTimer);
                            state.tocRefreshTimer = setTimeout(() => {
                                Observer.pauseObserver();
                                try {
                                    if (state.tocActiveTab === 'message') {
                                        TocPanel.refreshMessageItems();
                                    } else if (state.tocActiveTab === 'conversation') {
                                        TocPanel.refreshConversationItems();
                                    }
                                    TocPanel.updateTocCount();
                                    const searchInput = document.getElementById('dialog-toc-search');
                                    if (searchInput && !searchInput.value) {
                                        const contentEl = document.getElementById('dialog-toc-content');
                                        if (contentEl) {
                                            if (state.tocActiveTab === 'message') {
                                                TocPanel.renderMessageItems(contentEl, state.messageItems);
                                            } else if (state.tocActiveTab === 'conversation') {
                                                TocPanel.renderConversationItems(contentEl, state.conversationItems);
                                            }
                                        }
                                    }
                                } catch (e) {
                                    Utils.error('目录面板刷新错误:', e);
                                } finally {
                                    Observer.resumeObserver();
                                }
                            }, 500);
                        }
                    } catch (e) {
                        Utils.error('观察器回调错误:', e);
                    }
                }, 100));
                
                if (document.body) {
                    state.observer.observe(document.body, { childList: true, subtree: true });
                    Utils.log('观察器已成功创建并开始观察');
                } else {
                    Utils.error('创建观察器失败: document.body不存在');
                }
            } catch (e) {
                Utils.error('创建观察器失败:', e);
            }
        }
    }

    // ==================== 初始化 ====================
    function init() {
        Utils.log('开始初始化...');
        
        // 检测当前网站
        state.currentSite = Utils.detectSite();
        if (!state.currentSite) {
            Utils.log('❌ 不支持的网站');
            return;
        }
        
        Utils.log('✅ 对话导航已启动 - 当前网站:', CONFIG.sites[state.currentSite].name);
        
        // 加载设置
        Utils.log('加载设置...');
        Utils.loadSettings();
        
        // 初始化UI
        Utils.log('初始化UI组件...');
        UICreator.initKeyboardListener();
        
        // 确保DOM已完全加载
        if (document.readyState === 'complete') {
            Utils.log('DOM已完全加载，创建UI...');
            UICreator.createNavigationUI();
            TocPanel.createTocPanel();
        } else {
            Utils.log('等待DOM完全加载...');
            window.addEventListener('load', () => {
                Utils.log('DOM加载完成，创建UI...');
                UICreator.createNavigationUI();
                TocPanel.createTocPanel();
            });
        }
        
        // 设置初始宽度
        setTimeout(() => {
            Utils.log('设置初始宽度...');
            WidthManager.setContentMaxWidth(state.currentWidth);
            TocPanel.refreshMessageItems();
            TocPanel.refreshConversationItems();
        }, 1000);
        
        // 创建观察器
        Utils.log('创建MutationObserver...');
        Observer.createObserver();
        
        Utils.log('初始化完成');
    }

    // 页面加载完成后初始化
    function initWithDelay() {
        Utils.log('开始初始化脚本...');
        setTimeout(init, 1000);
    }
    
    if (document.readyState === 'loading') {
        Utils.log('页面正在加载，等待DOMContentLoaded事件...');
        document.addEventListener('DOMContentLoaded', initWithDelay);
    } else if (document.readyState === 'interactive') {
        Utils.log('DOM已加载，等待页面完全加载...');
        window.addEventListener('load', initWithDelay);
    } else {
        Utils.log('页面已完全加载，立即初始化...');
        initWithDelay();
    }

    // 页面卸载前清理
    window.addEventListener('beforeunload', () => {
        if (state.observer) state.observer.disconnect();
        Utils.log('脚本卸载');
    });

})();
