/* ============================================================
   MathBot — Chat UI Script
   ============================================================ */

// ── State ──────────────────────────────────────────────────
const state = {
    conversations: JSON.parse(localStorage.getItem('mathbot_conversations') || '[]'),
    activeConvId: null,
    isLoading: false,
};

// Each conversation: { id, title, messages: [{role, text}] }

// ── DOM refs ───────────────────────────────────────────────
const messagesArea    = document.getElementById('messages-area');
const welcomeScreen   = document.getElementById('welcome-screen');
const chatInput       = document.getElementById('chat-input');
const sendBtn         = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const chatTitle       = document.getElementById('chat-title');
const historyList     = document.getElementById('chat-history-list');
const newChatBtn      = document.getElementById('new-chat-btn');
const clearChatBtn    = document.getElementById('clear-chat-btn');
const sidebar         = document.getElementById('sidebar');
const sidebarToggle   = document.getElementById('sidebar-toggle');
const mobileMenuBtn   = document.getElementById('mobile-menu-btn');

// ── Helpers ────────────────────────────────────────────────
function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function saveState() {
    localStorage.setItem('mathbot_conversations', JSON.stringify(state.conversations));
}

function getActiveConv() {
    return state.conversations.find(c => c.id === state.activeConvId) || null;
}

function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Markdown + MathJax rendering ──────────────────────────
function renderBotContent(text) {
    // Use marked for markdown, then let MathJax handle LaTeX
    let html = marked.parse(text, { breaks: true, gfm: true });
    return html;
}

async function typeset(el) {
    if (window.MathJax && MathJax.typesetPromise) {
        await MathJax.typesetPromise([el]);
    }
}

// ── Sidebar ────────────────────────────────────────────────
function renderSidebar() {
    historyList.innerHTML = '';
    if (state.conversations.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No chats yet.<br>Start a new conversation!</div>';
        return;
    }

    // Show newest first
    const sorted = [...state.conversations].reverse();
    sorted.forEach(conv => {
        const el = document.createElement('div');
        el.className = 'history-item' + (conv.id === state.activeConvId ? ' active' : '');
        el.textContent = conv.title || 'Untitled Chat';
        el.dataset.id = conv.id;
        el.addEventListener('click', () => loadConversation(conv.id));
        historyList.appendChild(el);
    });
}

function loadConversation(id) {
    state.activeConvId = id;
    const conv = getActiveConv();
    if (!conv) return;

    chatTitle.textContent = conv.title || 'MathBot';

    // Clear messages area (remove all bubbles, keep welcome screen hidden)
    clearMessagesArea();
    welcomeScreen.classList.add('hidden');
    typingIndicator.classList.add('hidden');

    conv.messages.forEach(msg => {
        appendBubble(msg.role, msg.text, msg.ts, false);
    });

    // Typeset all math
    typeset(messagesArea);
    scrollToBottom();
    renderSidebar();
    closeMobileSidebar();
}

function clearMessagesArea() {
    // Remove all message rows but keep welcome screen & typing indicator nodes
    Array.from(messagesArea.children).forEach(child => {
        if (child.id !== 'welcome-screen') {
            child.remove();
        }
    });
    // Re-append typing indicator (it may have been removed)
    if (!messagesArea.contains(typingIndicator)) {
        messagesArea.appendChild(typingIndicator);
    }
}

// ── New chat ───────────────────────────────────────────────
function startNewChat() {
    const id = genId();
    const conv = { id, title: '', messages: [] };
    state.conversations.push(conv);
    state.activeConvId = id;
    saveState();

    chatTitle.textContent = 'MathBot';
    clearMessagesArea();
    welcomeScreen.classList.remove('hidden');
    typingIndicator.classList.add('hidden');
    chatInput.value = '';
    adjustTextareaHeight();
    renderSidebar();
    closeMobileSidebar();
}

// ── Send message ───────────────────────────────────────────
async function sendMessage(text) {
    text = text.trim();
    if (!text || state.isLoading) return;

    // Ensure we have an active conversation
    if (!state.activeConvId) {
        startNewChat();
    }

    const conv = getActiveConv();
    if (!conv) return;

    // Hide welcome
    welcomeScreen.classList.add('hidden');

    // Add user message to state
    const ts = Date.now();
    conv.messages.push({ role: 'user', text, ts });

    // Auto-title from first message
    if (!conv.title) {
        conv.title = text.length > 40 ? text.slice(0, 40) + '…' : text;
        chatTitle.textContent = conv.title;
    }

    saveState();

    // Render user bubble
    appendBubble('user', text, ts, true);

    // Clear input
    chatInput.value = '';
    adjustTextareaHeight();
    sendBtn.disabled = true;

    // Show typing
    state.isLoading = true;
    typingIndicator.classList.remove('hidden');
    scrollToBottom();

    try {
        const payload = {
            messages: conv.messages.map(m => ({ role: m.role, text: m.text }))
        };

        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Server error ${res.status}`);
        }

        const data = await res.json();
        const botText = data.response || 'Sorry, I couldn\'t generate a response.';

        // Save bot message
        const botTs = Date.now();
        conv.messages.push({ role: 'assistant', text: botText, ts: botTs });
        saveState();

        // Hide typing and render bot bubble
        typingIndicator.classList.add('hidden');
        const bubble = appendBubble('assistant', botText, botTs, true);

        // Typeset math in the new bubble
        await typeset(bubble);

    } catch (err) {
        typingIndicator.classList.add('hidden');
        const errTs = Date.now();
        conv.messages.push({ role: 'assistant', text: `⚠️ Error: ${err.message}`, ts: errTs });
        saveState();
        appendBubble('assistant', `⚠️ **Error:** ${escapeHtml(err.message)}`, errTs, true);
    } finally {
        state.isLoading = false;
        renderSidebar();
        scrollToBottom();
    }
}

// ── Bubble builder ─────────────────────────────────────────
function appendBubble(role, text, ts, animate) {
    const isUser = role === 'user';

    const row = document.createElement('div');
    row.className = `message-row ${isUser ? 'user-row' : 'bot-row'}`;
    if (!animate) row.style.animation = 'none';

    let inner = '';

    if (!isUser) {
        inner += `<div class="bot-avatar">∑</div>`;
    }

    const bubbleContent = isUser
        ? escapeHtml(text)
        : renderBotContent(text);

    inner += `
        <div class="msg-col">
            <div class="message-bubble">${bubbleContent}</div>
            <div class="msg-time">${formatTime(ts || Date.now())}</div>
        </div>
    `;

    row.innerHTML = inner;

    // Insert before typing indicator
    if (messagesArea.contains(typingIndicator)) {
        messagesArea.insertBefore(row, typingIndicator);
    } else {
        messagesArea.appendChild(row);
    }

    return row;
}

// ── Scroll ─────────────────────────────────────────────────
function scrollToBottom() {
    messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: 'smooth' });
}

// ── Textarea auto-resize ───────────────────────────────────
function adjustTextareaHeight() {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 160) + 'px';
}

// ── Sidebar toggle ─────────────────────────────────────────
function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
}

function openMobileSidebar() {
    sidebar.classList.add('mobile-open');
}

function closeMobileSidebar() {
    sidebar.classList.remove('mobile-open');
}

// ── Event listeners ────────────────────────────────────────
chatInput.addEventListener('input', () => {
    adjustTextareaHeight();
    sendBtn.disabled = chatInput.value.trim() === '';
});

chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) sendMessage(chatInput.value);
    }
});

sendBtn.addEventListener('click', () => sendMessage(chatInput.value));

newChatBtn.addEventListener('click', startNewChat);

clearChatBtn.addEventListener('click', () => {
    const conv = getActiveConv();
    if (!conv || conv.messages.length === 0) return;
    if (!confirm('Clear this conversation?')) return;
    conv.messages = [];
    conv.title = '';
    chatTitle.textContent = 'MathBot';
    clearMessagesArea();
    welcomeScreen.classList.remove('hidden');
    saveState();
    renderSidebar();
});

sidebarToggle.addEventListener('click', toggleSidebar);
mobileMenuBtn.addEventListener('click', openMobileSidebar);

// Close mobile sidebar when clicking outside
document.addEventListener('click', e => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            closeMobileSidebar();
        }
    }
});

// Suggestion chips
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const msg = chip.dataset.msg;
        if (msg) {
            chatInput.value = msg;
            adjustTextareaHeight();
            sendBtn.disabled = false;
            sendMessage(msg);
        }
    });
});

// ── Add CSS for .msg-col (dynamically used in JS) ─────────
const extraStyle = document.createElement('style');
extraStyle.textContent = `
.msg-col { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.user-row .msg-col { align-items: flex-end; }
`;
document.head.appendChild(extraStyle);

// ── Init ───────────────────────────────────────────────────
function init() {
    renderSidebar();

    // Restore last conversation if exists
    if (state.conversations.length > 0) {
        const lastConv = state.conversations[state.conversations.length - 1];
        if (lastConv.messages.length > 0) {
            loadConversation(lastConv.id);
            return;
        } else {
            state.activeConvId = lastConv.id;
        }
    }

    // Show welcome screen
    welcomeScreen.classList.remove('hidden');
}

init();
