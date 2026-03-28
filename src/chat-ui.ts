export const chatHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gemma</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f9fc;
        --surface: rgba(255, 255, 255, 0.78);
        --surface-strong: #ffffff;
        --surface-soft: #f1f4fb;
        --border: #dde3ee;
        --text: #1f1f1f;
        --muted: #5f6368;
        --accent: #1a73e8;
        --shadow: 0 10px 28px rgba(60, 64, 67, 0.08);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Google Sans", "Segoe UI", Roboto, Arial, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(26,115,232,0.12), transparent 26%),
          radial-gradient(circle at top right, rgba(66,133,244,0.08), transparent 20%),
          linear-gradient(180deg, #ffffff 0%, var(--bg) 100%);
      }

      .app {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 272px minmax(0, 1fr);
      }

      .rail {
        padding: 18px 14px;
        border-right: 1px solid rgba(221,227,238,0.8);
        background: rgba(255,255,255,0.52);
        backdrop-filter: blur(16px);
        display: flex;
        flex-direction: column;
        gap: 14px;
        align-items: stretch;
      }

      .rail-top {
        display: flex;
        gap: 10px;
        justify-content: center;
      }

      .rail-button,
      .rail-link {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.92);
        display: grid;
        place-items: center;
        color: var(--text);
        text-decoration: none;
        cursor: pointer;
        font-size: 0.95rem;
        box-shadow: var(--shadow);
      }

      .rail-button:hover,
      .rail-link:hover {
        border-color: rgba(26,115,232,0.42);
      }

      .chat-list {
        display: grid;
        gap: 10px;
        align-content: start;
        margin-top: 8px;
        overflow: auto;
      }

      .chat-card {
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.86);
        border-radius: 18px;
        padding: 12px;
        box-shadow: var(--shadow);
        cursor: pointer;
      }

      .chat-card.is-active {
        outline: 2px solid rgba(26,115,232,0.28);
        background: rgba(232,240,254,0.95);
      }

      .chat-card-head {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: flex-start;
      }

      .chat-card-title {
        font-size: 0.9rem;
        font-weight: 600;
        line-height: 1.3;
      }

      .chat-card-meta {
        margin-top: 8px;
        font-size: 0.78rem;
        color: var(--muted);
        line-height: 1.4;
      }

      .chat-delete {
        border: none;
        background: transparent;
        color: var(--muted);
        cursor: pointer;
        padding: 0;
        font-size: 0.8rem;
      }

      .shell {
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
      }

      .topbar {
        padding: 18px 28px 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .brand-mark {
        width: 34px;
        height: 34px;
        border-radius: 12px;
        background: linear-gradient(135deg, #4285f4, #1a73e8);
        color: white;
        display: grid;
        place-items: center;
        font-weight: 700;
      }

      .brand-copy strong {
        display: block;
        font-size: 1rem;
        font-weight: 600;
      }

      .brand-copy span,
      .muted {
        color: var(--muted);
      }

      .topbar-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: flex-end;
      }

      .pill,
      .link-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.92);
        font-size: 0.85rem;
        color: var(--text);
        text-decoration: none;
      }

      .workspace {
        width: min(960px, calc(100vw - 330px));
        margin: 0 auto;
        padding: 8px 0 18px;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        gap: 16px;
      }

      .hero {
        padding: 28px 12px 6px;
        text-align: center;
      }

      .hero h1 {
        margin: 0 0 12px;
        font-size: clamp(2.2rem, 5vw, 3.7rem);
        line-height: 1.05;
        font-weight: 600;
        letter-spacing: -0.03em;
      }

      .hero-gradient {
        background: linear-gradient(90deg, #1a73e8, #5f8cff, #7b61ff);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .hero p {
        width: min(720px, 100%);
        margin: 0 auto;
        color: var(--muted);
        line-height: 1.6;
        font-size: 1rem;
      }

      .objective {
        width: min(760px, 100%);
        margin: 18px auto 0;
        padding: 14px 16px;
        border: 1px solid var(--border);
        border-radius: 22px;
        background: rgba(255,255,255,0.72);
        backdrop-filter: blur(14px);
        box-shadow: var(--shadow);
        text-align: left;
      }

      .objective summary {
        cursor: pointer;
        list-style: none;
        font-weight: 500;
      }

      .objective summary::-webkit-details-marker {
        display: none;
      }

      .objective textarea {
        width: 100%;
        margin-top: 12px;
        min-height: 92px;
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 12px 14px;
        resize: vertical;
        font: inherit;
        color: var(--text);
        background: rgba(255,255,255,0.98);
      }

      .objective-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-top: 10px;
        flex-wrap: wrap;
      }

      .button {
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.95);
        color: var(--text);
        border-radius: 999px;
        padding: 10px 16px;
        font: inherit;
        cursor: pointer;
      }

      .button.primary {
        background: var(--accent);
        border-color: var(--accent);
        color: white;
        font-weight: 600;
      }

      .button[disabled] {
        opacity: 0.65;
        cursor: wait;
      }

      .button.ghost {
        background: transparent;
      }

      .suggestions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        width: min(760px, 100%);
        margin: 18px auto 0;
      }

      .suggestion {
        padding: 16px;
        border-radius: 24px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.82);
        box-shadow: var(--shadow);
        text-align: left;
        cursor: pointer;
      }

      .suggestion strong {
        display: block;
        margin-bottom: 8px;
        font-size: 0.98rem;
      }

      .conversation {
        min-height: 0;
        overflow: auto;
        padding: 0 12px 24px;
        display: grid;
        gap: 18px;
      }

      .empty-state {
        padding-top: 24px;
      }

      .message-row {
        display: flex;
      }

      .message-row.user {
        justify-content: flex-end;
      }

      .message-row.assistant {
        justify-content: flex-start;
      }

      .assistant-wrap {
        width: min(780px, 100%);
        display: grid;
        grid-template-columns: 36px minmax(0, 1fr);
        gap: 12px;
      }

      .assistant-mark {
        width: 36px;
        height: 36px;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(26,115,232,0.15), rgba(123,97,255,0.14));
        border: 1px solid rgba(26,115,232,0.18);
        display: grid;
        place-items: center;
        color: #185abc;
        font-weight: 700;
      }

      .assistant-mark.monitor {
        background: linear-gradient(135deg, rgba(197,34,31,0.12), rgba(251,188,5,0.16));
        border: 1px solid rgba(197,34,31,0.14);
        color: #a50e0e;
      }

      .assistant-body {
        padding-top: 4px;
      }

      .assistant-text {
        white-space: pre-wrap;
        line-height: 1.72;
        font-size: 1rem;
      }

      .assistant-text.pending {
        color: var(--muted);
      }

      .thinking-dots {
        display: inline-flex;
        gap: 4px;
        margin-left: 8px;
        vertical-align: middle;
      }

      .thinking-dots span {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: rgba(26,115,232,0.65);
        animation: pulse 1.2s infinite ease-in-out;
      }

      .thinking-dots span:nth-child(2) {
        animation-delay: 0.15s;
      }

      .thinking-dots span:nth-child(3) {
        animation-delay: 0.3s;
      }

      @keyframes pulse {
        0%, 80%, 100% {
          opacity: 0.25;
          transform: translateY(0);
        }

        40% {
          opacity: 1;
          transform: translateY(-2px);
        }
      }

      .user-bubble {
        max-width: min(720px, 90%);
        padding: 14px 18px;
        border-radius: 24px;
        background: rgba(232,240,254,0.95);
        border: 1px solid rgba(26,115,232,0.12);
        line-height: 1.6;
        white-space: pre-wrap;
      }

      .meta {
        margin-top: 8px;
        font-size: 0.78rem;
        color: var(--muted);
      }

      .composer-wrap {
        width: min(960px, calc(100vw - 330px));
        margin: 0 auto;
        padding: 0 0 24px;
      }

      .composer {
        margin: 0 12px;
        padding: 12px;
        border-radius: 28px;
        background: rgba(255,255,255,0.92);
        border: 1px solid var(--border);
        box-shadow: 0 12px 30px rgba(60,64,67,0.08);
      }

      .composer textarea {
        width: 100%;
        min-height: 90px;
        resize: none;
        border: none;
        background: transparent;
        padding: 10px 12px 12px;
        font: inherit;
        color: var(--text);
      }

      .attachment-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 8px 10px;
      }

      .checkpoint-panel {
        margin: 0 8px 10px;
        padding: 14px 16px;
        border-radius: 22px;
        border: 1px solid rgba(197,34,31,0.18);
        background: rgba(253,232,232,0.95);
        display: none;
        gap: 10px;
      }

      .checkpoint-panel.is-visible {
        display: grid;
      }

      .checkpoint-panel textarea {
        width: 100%;
        min-height: 74px;
        resize: vertical;
        border: 1px solid rgba(197,34,31,0.16);
        border-radius: 16px;
        padding: 12px 14px;
        font: inherit;
        background: rgba(255,255,255,0.96);
        color: var(--text);
      }

      .checkpoint-panel textarea:focus {
        outline: none;
      }

      .checkpoint-issues {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .checkpoint-pill {
        display: inline-flex;
        align-items: center;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 0.78rem;
        background: rgba(255,255,255,0.92);
        border: 1px solid rgba(197,34,31,0.14);
        color: #a50e0e;
      }

      .button.danger {
        border-color: rgba(197,34,31,0.18);
        background: rgba(197,34,31,0.1);
        color: #a50e0e;
      }

      .attachment-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(241,244,251,0.95);
        border: 1px solid var(--border);
        font-size: 0.82rem;
      }

      .attachment-chip button {
        border: none;
        background: transparent;
        color: var(--muted);
        cursor: pointer;
        padding: 0;
        font: inherit;
      }

      .composer textarea:focus {
        outline: none;
      }

      .composer-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        padding: 0 6px 4px;
      }

      .footer-left {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .tiny {
        font-size: 0.82rem;
        color: var(--muted);
      }

      @media (max-width: 960px) {
        .workspace,
        .composer-wrap {
          width: calc(100vw - 300px);
        }

        .suggestions {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .app {
          grid-template-columns: 1fr;
        }

        .rail {
          display: none;
        }

        .topbar {
          padding: 16px 16px 6px;
          flex-direction: column;
          align-items: flex-start;
        }

        .workspace,
        .composer-wrap {
          width: 100%;
        }

        .hero,
        .conversation,
        .composer-wrap {
          padding-left: 0;
          padding-right: 0;
        }

        .hero {
          padding-top: 18px;
        }

        .hero h1 {
          font-size: 2.2rem;
        }

        .composer {
          margin: 0 10px;
        }
      }
    </style>
  </head>
  <body>
    <div class="app">
      <aside class="rail">
        <div class="rail-top">
          <button class="rail-button" id="new-chat" title="New chat" type="button">+</button>
          <a class="rail-link" href="/" target="_blank" rel="noreferrer" title="Open MMASION monitor">M</a>
        </div>
        <div class="chat-list" id="chat-list"></div>
      </aside>

      <div class="shell">
        <header class="topbar">
          <div class="brand">
            <div class="brand-mark">G</div>
            <div class="brand-copy">
              <strong>Gemma 12B</strong>
              <span>Visible worker chat with passive MMASION monitoring</span>
            </div>
          </div>
          <div class="topbar-actions">
            <span class="pill" id="worker-status">Gemma ready</span>
            <span class="pill" id="monitor-status">MMASION ready</span>
            <a class="link-pill" id="monitor-link" href="/" target="_blank" rel="noreferrer">Open monitor tab</a>
          </div>
        </header>

        <main class="workspace">
          <section class="hero" id="hero">
            <h1><span class="hero-gradient">How can Gemma help?</span></h1>
            <p>Use this as the normal working chat. MMASION listens in a different tab, detects what Gemma is trying to do, and intervenes only when the workflow starts going wrong.</p>

            <details class="objective">
              <summary>Optional monitor note</summary>
              <textarea id="objective" placeholder="Optional: add a note for MMASION later. Leave blank if you want it to infer everything from the live chat."></textarea>
              <div class="objective-actions">
                <span class="tiny">By default MMASION starts cold and infers context from the ongoing conversation only.</span>
                <button class="button" id="save-objective" type="button">Save note</button>
              </div>
            </details>

            <div class="suggestions" id="suggestions">
              <button class="suggestion" data-prompt="Help me draft an algorithmic tool disclosure for a vendor-supported scoring model, and tell me what information is still missing.">
                <strong>Draft a disclosure</strong>
                <span class="muted">Start from a realistic agency or vendor disclosure workflow.</span>
              </button>
              <button class="suggestion" data-prompt="Review this tool description and explain the compliance risks around training data, inputs, outputs, and identifying information.">
                <strong>Review compliance risk</strong>
                <span class="muted">Good for showing how Gemma reasons before MMASION steps in.</span>
              </button>
              <button class="suggestion" data-prompt="Summarize what we know about this ranking tool, then tell me which required disclosure fields are still incomplete.">
                <strong>Check field coverage</strong>
                <span class="muted">Makes the passive monitor story easier to explain live.</span>
              </button>
              <button class="suggestion" data-prompt="Walk through whether this tool is safe to approve yet, and be explicit about where a human should intervene before release.">
                <strong>Test approval safety</strong>
                <span class="muted">Useful for triggering MMASION in the other tab.</span>
              </button>
            </div>
          </section>

          <section class="conversation" id="conversation"></section>
        </main>

        <footer class="composer-wrap">
          <form class="composer" id="composer">
            <textarea id="prompt" placeholder="Message Gemma"></textarea>
            <input id="file-input" type="file" class="hidden" multiple accept=".txt,.md,.json,.csv,.xls,.xlsx,.pdf,.html,.xml,image/*" />
            <div class="attachment-row" id="attachment-row"></div>
            <section class="checkpoint-panel" id="checkpoint-panel">
              <div>
                <strong id="checkpoint-title">MMASION requested a human decision</strong>
                <div class="meta" id="checkpoint-body">Gemma is paused until a human decides what should happen next.</div>
              </div>
              <div class="checkpoint-issues" id="checkpoint-issues"></div>
              <textarea id="checkpoint-rationale" placeholder="Tell MMASION whether Gemma should continue, revise, or stop."></textarea>
              <div class="footer-left">
                <button class="button" id="checkpoint-continue" type="button">Allow Gemma to continue</button>
                <button class="button danger" id="checkpoint-stop" type="button">Stop this session</button>
              </div>
            </section>
            <div class="composer-footer">
              <div class="footer-left">
                <span class="tiny" id="session-chip">No linked MMASION session yet</span>
                <span class="tiny" id="sync-chip">Passive sync idle</span>
              </div>
              <div class="footer-left">
                <button class="button ghost" id="attach" type="button">Upload</button>
                <button class="button ghost" id="voice" type="button">Mic</button>
                <button class="button ghost" id="speak" type="button">Speak off</button>
                <button class="button ghost" id="stop-audio" type="button">Stop voice</button>
                <button class="button primary" id="send" type="submit">Send</button>
              </div>
            </div>
          </form>
        </footer>
      </div>
    </div>

    <script type="module">
      const THREADS_KEY = "mmasion-gemma-chat-threads";
      const CURRENT_CHAT_KEY = "mmasion-gemma-current-chat";
      const SESSION_KEY = "mmasion-gemma-session-id";
      const SYNC_KEY = "mmasion-gemma-last-sync";
      const MONITOR_ACTIVITY_KEY = "mmasion-monitor-activity";

      const conversationEl = document.getElementById("conversation");
      const composerEl = document.getElementById("composer");
      const promptEl = document.getElementById("prompt");
      const objectiveEl = document.getElementById("objective");
      const heroEl = document.getElementById("hero");
      const suggestionsEl = document.getElementById("suggestions");
      const newChatEl = document.getElementById("new-chat");
      const chatListEl = document.getElementById("chat-list");
      const saveObjectiveEl = document.getElementById("save-objective");
      const workerStatusEl = document.getElementById("worker-status");
      const monitorStatusEl = document.getElementById("monitor-status");
      const monitorLinkEl = document.getElementById("monitor-link");
      const sessionChipEl = document.getElementById("session-chip");
      const syncChipEl = document.getElementById("sync-chip");
      const fileInputEl = document.getElementById("file-input");
      const attachmentRowEl = document.getElementById("attachment-row");
      const checkpointPanelEl = document.getElementById("checkpoint-panel");
      const checkpointTitleEl = document.getElementById("checkpoint-title");
      const checkpointBodyEl = document.getElementById("checkpoint-body");
      const checkpointIssuesEl = document.getElementById("checkpoint-issues");
      const checkpointRationaleEl = document.getElementById("checkpoint-rationale");
      const checkpointContinueEl = document.getElementById("checkpoint-continue");
      const checkpointStopEl = document.getElementById("checkpoint-stop");
      const attachEl = document.getElementById("attach");
      const voiceEl = document.getElementById("voice");
      const speakEl = document.getElementById("speak");
      const stopAudioEl = document.getElementById("stop-audio");

      let threads = loadThreads();
      let currentChatId = localStorage.getItem(CURRENT_CHAT_KEY) || "";
      if (!threads.length) {
        threads = [createThread()];
      }
      if (!currentChatId || !threads.some((thread) => thread.id === currentChatId)) {
        currentChatId = threads[0].id;
      }
      let currentSessionId = getCurrentThread().sessionId || localStorage.getItem(SESSION_KEY) || "";
      let messages = getCurrentThread().messages || [];
      let pendingAttachments = [];
      let autoSpeak = false;
      let recognition = null;
      let listening = false;
      let audioMode = "browser-fallback";
      let mediaRecorder = null;
      let mediaStream = null;
      let recordedChunks = [];
      let monitorSessionState = null;
      let sessionPollTimer = null;
      let checkpointBusy = false;
      let lastMonitorAnnouncementKey = "";
      let activeAudio = null;
      let browserTranscript = "";

      function emitMonitorActivity(stage, detail) {
        try {
          localStorage.setItem(
            MONITOR_ACTIVITY_KEY,
            JSON.stringify({
              stage,
              detail,
              sessionId: currentSessionId,
              chatId: currentChatId,
              timestamp: new Date().toISOString(),
            }),
          );
        } catch {
          // ignore localStorage sync failures
        }
      }

      function createThread() {
        const id = "chat_" + Math.random().toString(36).slice(2, 10);
        return {
          id,
          title: "New chat",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sessionId: "",
          objective: "",
          attachments: [],
          messages: [],
        };
      }

      function normalizeThreads(input) {
        if (!Array.isArray(input)) {
          return [];
        }

        return input.map((thread) => ({
          ...createThread(),
          ...thread,
          objective: String(thread?.objective ?? ""),
          attachments: Array.isArray(thread?.attachments) ? thread.attachments : [],
          messages: Array.isArray(thread?.messages) ? thread.messages : [],
        }));
      }

      function loadThreads() {
        try {
          const value = localStorage.getItem(THREADS_KEY);
          if (value) {
            return normalizeThreads(JSON.parse(value));
          }
        } catch {
          // ignore
        }

        try {
          const legacy = localStorage.getItem("mmasion-gemma-chat");
          if (legacy) {
            return [
              {
                ...createThread(),
                title: "Imported chat",
                messages: JSON.parse(legacy),
              },
            ];
          }
        } catch {
          return [];
        }

        return [];
      }

      function getCurrentThread() {
        let thread = threads.find((item) => item.id === currentChatId);

        if (!thread) {
          thread = createThread();
          threads = [thread, ...threads];
          currentChatId = thread.id;
        }

        return thread;
      }

      function persistThreads() {
        localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
        localStorage.setItem(CURRENT_CHAT_KEY, currentChatId);
      }

      function saveMessages() {
        const thread = getCurrentThread();
        thread.messages = messages;
        thread.updatedAt = new Date().toISOString();
        thread.objective = objectiveEl.value.trim();

        const firstUserMessage = messages.find((message) => message.role === "user")?.content?.trim();
        if (firstUserMessage) {
          thread.title = firstUserMessage.split(/\s+/).slice(0, 6).join(" ");
        }

        thread.sessionId = currentSessionId;
        persistThreads();
      }

      function mergeAttachments(existing, incoming) {
        const merged = [...(Array.isArray(existing) ? existing : [])];

        for (const attachment of Array.isArray(incoming) ? incoming : []) {
          if (!attachment?.name) {
            continue;
          }

          const index = merged.findIndex((item) => item?.name === attachment.name);

          if (index >= 0) {
            merged[index] = attachment;
          } else {
            merged.push(attachment);
          }
        }

        return merged;
      }

      function renderChatList() {
        chatListEl.innerHTML = threads.map((thread) => \`
          <article class="chat-card \${thread.id === currentChatId ? "is-active" : ""}" data-chat-id="\${thread.id}">
            <div class="chat-card-head">
              <div class="chat-card-title">\${escapeHtml(thread.title || "New chat")}</div>
              <button class="chat-delete" type="button" data-delete-id="\${thread.id}">Delete</button>
            </div>
            <div class="chat-card-meta">
              \${thread.messages.length} messages<br/>
              \${escapeHtml(new Date(thread.updatedAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }))}
            </div>
          </article>
        \`).join("");

        chatListEl.querySelectorAll("[data-chat-id]").forEach((card) => {
          card.addEventListener("click", (event) => {
            if (event.target.closest("[data-delete-id]")) {
              return;
            }

            currentChatId = card.getAttribute("data-chat-id") || currentChatId;
            const thread = getCurrentThread();
            currentSessionId = thread.sessionId || "";
            monitorSessionState = null;
            lastMonitorAnnouncementKey = "";
            messages = thread.messages || [];
            objectiveEl.value = thread.objective || "";
            pendingAttachments = [];
            renderAttachments();
            renderConversation();
            renderChatList();
            void refreshMonitorSession();
          });
        });

        chatListEl.querySelectorAll("[data-delete-id]").forEach((button) => {
          button.addEventListener("click", (event) => {
            event.stopPropagation();
            const id = button.getAttribute("data-delete-id");
            threads = threads.filter((thread) => thread.id !== id);

            if (!threads.length) {
              threads = [createThread()];
            }

            if (currentChatId === id) {
              currentChatId = threads[0].id;
              currentSessionId = threads[0].sessionId || "";
              monitorSessionState = null;
              lastMonitorAnnouncementKey = "";
              messages = threads[0].messages || [];
              objectiveEl.value = threads[0].objective || "";
            }

            persistThreads();
            renderConversation();
            renderChatList();
          });
        });
      }

      function saveObjective() {
        const thread = getCurrentThread();
        thread.objective = objectiveEl.value.trim();
        persistThreads();
      }

      function latestUserIntent() {
        const lastUser = [...messages].reverse().find((message) => message.role === "user");
        return (lastUser?.content || "the current task").split("\\\\n")[0].trim();
      }

      function buildCheckpointQuestion(session) {
        if (!session?.intervention) {
          return "MMASION needs a human decision before Gemma continues.";
        }

        const blocking = (session.intervention.blockingIssues || []).slice(0, 3).join(", ");
        const intent = latestUserIntent();
        const areas = blocking ? " It is failing around: " + blocking + "." : "";
        return "Gemma is trying to " + intent + ", but MMASION paused the turn because " + session.intervention.reason + areas + " What should Gemma do next?";
      }

      function buildResumePrompt(session, rationale) {
        const blocking = (session?.intervention?.blockingIssues || []).slice(0, 5);
        const missing = (session?.complianceCoverage?.missingCriticalFields || []).slice(0, 5);
        const instructions = [];

        instructions.push("Revise your last answer using the human guidance below.");
        instructions.push("Human guidance: " + (rationale || "Proceed carefully and resolve MMASION's concerns first."));

        if (blocking.length) {
          instructions.push("Address these MMASION concerns explicitly: " + blocking.join(", ") + ".");
        }

        if (missing.length) {
          instructions.push("If information is missing, say that clearly and ask for the missing fields instead of inventing them: " + missing.join(", ") + ".");
        }

        instructions.push("Give a safer, clearer next-step answer in plain language.");
        return instructions.join(" ");
      }

      function latestSessionEvent(session, type) {
        return [...(session?.events || [])].reverse().find((item) => item.type === type) || null;
      }

      function buildSupportiveMonitorFollowup(session) {
        const latestModel = latestSessionEvent(session, "model-message");
        if (!latestModel) {
          return null;
        }

        const content = String(latestModel.content || "").toLowerCase();
        const looksGrounded = [
          "cannot provide",
          "can't provide",
          "cannot calculate",
          "can't calculate",
          "does not contain",
          "doesn't contain",
          "based on this file",
          "from this file alone",
          "not enough information",
          "insufficient information",
        ].some((phrase) => content.includes(phrase));

        if (!looksGrounded) {
          return null;
        }

        return {
          key: "grounded-refusal::" + latestModel.id,
          message:
            "MMASION update\\n\\nGemma handled that correctly. The uploaded material does not support the missing metric, so MMASION is keeping the answer grounded. Ask for the right dataset or reframe the question if you want Gemma to go further.",
        };
      }

      function announceMmasion(message, key) {
        if (!message) {
          return;
        }

        if (key && lastMonitorAnnouncementKey === key) {
          return;
        }

        messages.push({
          role: "assistant",
          source: "mmasion",
          content: message,
          createdAt: new Date().toISOString(),
        });
        saveMessages();
        if (key) {
          lastMonitorAnnouncementKey = key;
        }

        if (autoSpeak) {
          void speakText(message.replaceAll("\\\\n", " "));
        }
      }

      function removePendingAssistant() {
        messages = messages.filter((message) => !message.pending);
      }

      function escapeHtml(value) {
        return String(value)
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;");
      }

      function formatTime(value) {
        return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      }

      function updateSessionUi() {
        if (currentSessionId) {
          sessionChipEl.textContent = "MMASION session " + currentSessionId.slice(-6);
          monitorLinkEl.href = "/?session=" + encodeURIComponent(currentSessionId);
          if (!monitorSessionState) {
            monitorStatusEl.textContent = "MMASION linked";
          }
        } else {
          sessionChipEl.textContent = "No linked MMASION session yet";
          monitorLinkEl.href = "/";
          monitorStatusEl.textContent = "MMASION ready";
        }

        const lastSync = localStorage.getItem(SYNC_KEY);
        syncChipEl.textContent = lastSync ? "Passive sync " + formatTime(lastSync) : "Passive sync idle";
      }

      function checkpointRequired(session) {
        if (!session || !session.intervention) {
          return false;
        }

        return session.intervention.action === "pause" || session.intervention.action === "ask-human";
      }

      function updateInputAvailability() {
        const blocked = checkpointRequired(monitorSessionState) || monitorSessionState?.status === "blocked";
        promptEl.disabled = blocked || checkpointBusy;
        attachEl.disabled = blocked || checkpointBusy;
        voiceEl.disabled = blocked || checkpointBusy;
        fileInputEl.disabled = blocked || checkpointBusy;
        document.getElementById("send").disabled = blocked || checkpointBusy;
      }

      function renderCheckpoint() {
        if (!checkpointPanelEl) {
          return;
        }

        if (!monitorSessionState || !monitorSessionState.intervention) {
          checkpointPanelEl.classList.remove("is-visible");
          updateInputAvailability();
          return;
        }

        const intervention = monitorSessionState.intervention;
        const blocked = checkpointRequired(monitorSessionState);
        const stopped = monitorSessionState.status === "blocked" || intervention.action === "stop";

        if (!blocked && !stopped) {
          checkpointPanelEl.classList.remove("is-visible");
          checkpointIssuesEl.innerHTML = "";
          updateInputAvailability();
          return;
        }

        checkpointPanelEl.classList.add("is-visible");
        checkpointTitleEl.textContent = stopped
          ? "MMASION stopped this session"
          : "MMASION paused Gemma and needs a human decision";
        checkpointBodyEl.textContent = buildCheckpointQuestion(monitorSessionState);
        checkpointIssuesEl.innerHTML = (intervention.blockingIssues || []).length
          ? intervention.blockingIssues.map((issue) => '<span class="checkpoint-pill">' + escapeHtml(issue) + '</span>').join("")
          : '<span class="checkpoint-pill">No blocking issue details returned</span>';
        checkpointRationaleEl.placeholder = stopped
          ? "Start a new chat if you want to resume with a different plan."
          : (intervention.suggestedHumanPrompt || "Tell MMASION what Gemma should do next.");
        checkpointContinueEl.style.display = stopped ? "none" : "inline-flex";
        checkpointStopEl.textContent = stopped ? "Session stopped" : "Stop this session";
        checkpointStopEl.disabled = stopped || checkpointBusy;
        checkpointContinueEl.disabled = checkpointBusy;
        checkpointRationaleEl.disabled = stopped || checkpointBusy;

        if (stopped) {
          monitorStatusEl.textContent = "MMASION stopped Gemma";
        } else {
          monitorStatusEl.textContent = "MMASION is waiting for a human decision";
        }

        updateInputAvailability();
      }

      function renderAttachments() {
        const savedAttachments = getCurrentThread().attachments || [];
        const chips = [
          ...savedAttachments.map((file) => ({
            ...file,
            persisted: true,
          })),
          ...pendingAttachments.map((file) => ({
            ...file,
            persisted: false,
          })),
        ];

        if (!chips.length) {
          attachmentRowEl.innerHTML = "";
          return;
        }

        attachmentRowEl.innerHTML = chips.map((file, index) => \`
          <div class="attachment-chip">
            <span>\${file.persisted ? "File in chat memory" : "File ready to send"}\${!file.persisted && chips.filter((item) => !item.persisted).length > 1 ? " (" + (index - savedAttachments.length + 1) + ")" : ""}</span>
            \${file.persisted ? "" : \`<button data-index="\${index}" type="button">Remove</button>\`}
          </div>
        \`).join("");

        attachmentRowEl.querySelectorAll("[data-index]").forEach((button) => {
          button.addEventListener("click", () => {
            const index = Number(button.getAttribute("data-index"));
            pendingAttachments.splice(index - savedAttachments.length, 1);
            renderAttachments();
          });
        });
      }

      function renderConversation() {
          heroEl.style.display = messages.length ? "none" : "block";

        if (!messages.length) {
          conversationEl.innerHTML = '<div class="empty-state"></div>';
          renderCheckpoint();
          updateSessionUi();
          return;
        }

        conversationEl.innerHTML = messages.map((message) => {
          if (message.role === "user") {
            return \`
              <div class="message-row user">
                <div class="user-bubble">
                  <div>\${escapeHtml(message.content)}</div>
                  \${message.attachmentCount ? \`<div class="meta">\${escapeHtml(String(message.attachmentCount))} file\${message.attachmentCount > 1 ? "s" : ""} attached</div>\` : ""}
                  <div class="meta">You - \${escapeHtml(formatTime(message.createdAt))}</div>
                </div>
              </div>
            \`;
          }

            return \`
              <div class="message-row assistant">
                <div class="assistant-wrap">
                  <div class="\${message.source === "mmasion" ? "assistant-mark monitor" : "assistant-mark"}">\${message.source === "mmasion" ? "M" : "G"}</div>
                  <div class="assistant-body">
                    <div class="assistant-text\${message.pending ? " pending" : ""}">\${escapeHtml(message.content)}\${message.pending ? '<span class="thinking-dots"><span></span><span></span><span></span></span>' : ""}</div>
                    <div class="meta">\${message.source === "mmasion" ? "MMASION" : "Gemma"} • \${escapeHtml(message.pending ? "thinking now" : formatTime(message.createdAt))}</div>
                  </div>
                </div>
              </div>
            \`;
          }).join("");

        conversationEl.scrollTop = conversationEl.scrollHeight;
        renderCheckpoint();
        updateSessionUi();
      }

      async function api(path, options) {
        const response = await fetch(path, {
          headers: { "Content-Type": "application/json" },
          ...options,
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || "Request failed");
        }

        return payload;
      }

      async function loadSystem() {
        try {
          const data = await api("/api/system");
          audioMode = data.audioRuntime?.provider || "browser-fallback";
          if (!monitorSessionState) {
            monitorStatusEl.textContent = data.audioRuntime?.detail || "MMASION ready";
          }
        } catch {
          audioMode = "browser-fallback";
        }
      }

      async function ensureMonitorSession(firstMessage) {
        if (currentSessionId) {
          return currentSessionId;
        }

        const session = await api("/api/sessions", {
          method: "POST",
          body: JSON.stringify({
            title: "Observed Gemma session",
            objective: objectiveEl.value.trim(),
            transcript: "",
            sourceType: pendingAttachments.length ? "upload" : "chat",
            interfaceName: "Gemma workspace",
            uploadedArtifactName: pendingAttachments[0]?.name,
          }),
        });

        currentSessionId = session.id;
        monitorSessionState = session;
        localStorage.setItem(SESSION_KEY, currentSessionId);
        localStorage.setItem(SYNC_KEY, new Date().toISOString());
        getCurrentThread().sessionId = currentSessionId;
        persistThreads();
        emitMonitorActivity("session-created", "MMASION linked a fresh monitor session for this chat.");
        updateSessionUi();
        renderCheckpoint();
        return currentSessionId;
      }

      async function refreshMonitorSession() {
        if (!currentSessionId) {
          monitorSessionState = null;
          renderCheckpoint();
          return;
        }

        try {
          const previousSession = monitorSessionState;
          const session = await api("/api/sessions/" + currentSessionId);
          monitorSessionState = session;
          localStorage.setItem(SYNC_KEY, new Date().toISOString());
          emitMonitorActivity("session-updated", session.intervention?.reason || "MMASION observed new activity in this session.");

          const nextKey = [
            session.status,
            session.intervention?.action || "",
            session.intervention?.reason || "",
            (session.intervention?.blockingIssues || []).join("|"),
          ].join("::");
          const previousKey = previousSession
            ? [
                previousSession.status,
                previousSession.intervention?.action || "",
                previousSession.intervention?.reason || "",
                (previousSession.intervention?.blockingIssues || []).join("|"),
              ].join("::")
            : "";

          if (nextKey !== previousKey) {
            if (session.intervention?.action === "pause" || session.intervention?.action === "ask-human") {
              announceMmasion(
                "MMASION checkpoint\\\\n\\\\n" + buildCheckpointQuestion(session),
                nextKey,
              );
            } else if (previousSession && previousSession.status === "paused" && session.intervention?.action === "allow") {
              announceMmasion(
                "MMASION update\\\\n\\\\nThe session looks safe enough to continue now. You can keep working with Gemma, or use the suggested next step if you want a more cautious answer.",
                nextKey,
              );
            } else if (session.intervention?.action === "warn") {
              announceMmasion(
                "MMASION update\\\\n\\\\nI’m still watching this. The flow can continue, but some important compliance context is still missing.",
                nextKey,
              );
            }
          }

          const supportiveFollowup = buildSupportiveMonitorFollowup(session);
          if (supportiveFollowup) {
            announceMmasion(supportiveFollowup.message, supportiveFollowup.key);
          }

          renderCheckpoint();
          renderConversation();
          updateSessionUi();
        } catch {
          // ignore polling failures and keep last known state
        }
      }

      function startSessionPolling() {
        if (sessionPollTimer) {
          clearInterval(sessionPollTimer);
        }

        sessionPollTimer = setInterval(() => {
          void refreshMonitorSession();
        }, 2500);
      }

      function setBusy(isBusy, label) {
        promptEl.disabled = isBusy;
        document.getElementById("send").disabled = isBusy;
        workerStatusEl.textContent = label || (isBusy ? "Gemma thinking" : "Gemma ready");
      }

      async function speakText(text) {
        if (!text.trim()) {
          return;
        }

        stopSpeechPlayback();

        if (audioMode === "google-cloud-audio") {
          try {
            const payload = await api("/api/audio/speak", {
              method: "POST",
              body: JSON.stringify({ text }),
            });
            const audio = new Audio("data:" + (payload.mimeType || "audio/mpeg") + ";base64," + payload.audioBase64);
            activeAudio = audio;
            audio.onended = () => {
              if (activeAudio === audio) {
                activeAudio = null;
              }
            };
            audio.onpause = () => {
              if (audio.currentTime === 0 || audio.ended) {
                return;
              }
              if (activeAudio === audio) {
                activeAudio = null;
              }
            };
            await audio.play();
            return;
          } catch {
            // fall through to browser speech
          }
        }

        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        }
      }

      function stopSpeechPlayback() {
        if (activeAudio) {
          activeAudio.pause();
          activeAudio.currentTime = 0;
          activeAudio = null;
        }

        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      }

      async function submitTranscriptTurn(transcript, sourceLabel) {
        const cleaned = String(transcript || "").trim();

        if (!cleaned) {
          monitorStatusEl.textContent = "No speech was detected in that recording";
          return;
        }

        promptEl.value = cleaned;
        promptEl.focus();
        monitorStatusEl.textContent = sourceLabel + " ready, sending to Gemma";
        await sendMessage(cleaned);
      }

      async function fileToAttachment(file) {
        const isTextLike = file.type.startsWith("text/") || /\\.(txt|md|json|csv|html|xml)$/i.test(file.name);

        if (isTextLike) {
          const text = await file.text();
          return {
            name: file.name,
            type: file.type || "text/plain",
            text: text.slice(0, 16000),
          };
        }

        return {
          name: file.name,
          type: file.type || "application/octet-stream",
          text: "[Binary or image attachment uploaded. Use filename and user prompt as context.]",
        };
      }

      async function sendMessage(rawContent) {
        if (checkpointRequired(monitorSessionState) || monitorSessionState?.status === "blocked") {
          renderCheckpoint();
          return;
        }

        const content = rawContent.trim();

        if (!content && !pendingAttachments.length) {
          return;
        }

        const userContent = content || "Please analyze the attached files and explain them clearly.";
        const userDisplay = userContent;
        const attachmentCount = pendingAttachments.length;


        saveObjective();

        const thread = getCurrentThread();
        const activeAttachments = mergeAttachments(thread.attachments, pendingAttachments);
        thread.attachments = activeAttachments;
        persistThreads();

        messages.push({
          role: "user",
          content: userDisplay,
          attachmentCount,
          createdAt: new Date().toISOString(),
        });
        messages.push({
          role: "assistant",
          source: "gemma",
          content: "Gemma is thinking",
          createdAt: new Date().toISOString(),
          pending: true,
        });
        saveMessages();
        renderConversation();
        promptEl.value = "";
        setBusy(true, "Gemma thinking");
        monitorStatusEl.textContent = "MMASION is watching this turn";
        emitMonitorActivity("turn-started", "Gemma received a new user turn and MMASION is waiting for session updates.");

        try {
          const sessionId = await ensureMonitorSession(userContent);
          monitorStatusEl.textContent = "MMASION linked and observing";
          emitMonitorActivity("session-linked", "MMASION linked this chat and started observing live.");

          for (const attachment of pendingAttachments) {
            const uploadSession = await api("/api/sessions/" + sessionId + "/events", {
              method: "POST",
              body: JSON.stringify({
                type: "file-uploaded",
                actor: "system",
                content: "Observed upload in Gemma workspace: " + attachment.name + "\\\\n" + attachment.text.slice(0, 3000),
              }),
            });
            monitorSessionState = uploadSession;
          }

          const observedSession = await api("/api/sessions/" + sessionId + "/events", {
            method: "POST",
            body: JSON.stringify({
              type: "user-message",
              actor: "user",
              content: userContent,
            }),
          });
          monitorSessionState = observedSession;
          localStorage.setItem(SYNC_KEY, new Date().toISOString());
          emitMonitorActivity("user-turn-observed", "MMASION observed the latest user turn from Gemma.");

          if (checkpointRequired(monitorSessionState) || monitorSessionState?.status === "blocked") {
            const checkpointMessage = "MMASION checkpoint\\\\n\\\\n" + buildCheckpointQuestion(monitorSessionState);
            removePendingAssistant();
            messages.push({
              role: "assistant",
              source: "mmasion",
              content: checkpointMessage,
              createdAt: new Date().toISOString(),
            });
            saveMessages();
            monitorStatusEl.textContent = "MMASION intercepted this turn before Gemma responded";
            emitMonitorActivity("turn-blocked", "MMASION blocked Gemma before the model answered.");
            if (autoSpeak) {
              await speakText(buildCheckpointQuestion(monitorSessionState));
            }
            pendingAttachments = [];
            renderAttachments();
            renderConversation();
            return;
          }

          const response = await api("/api/gemma-chat", {
            method: "POST",
            body: JSON.stringify({
              sessionId,
              objective: objectiveEl.value.trim(),
              attachments: activeAttachments,
              messages: messages.map((message) => ({
                role: message.role,
                content: message.role === "user" && pendingAttachments.length && message === messages[messages.length - 1]
                  ? userContent
                  : message.content,
              })),
            }),
          });

          if (response.session) {
            monitorSessionState = response.session;
          }

          removePendingAssistant();
          messages.push({
            role: "assistant",
            source: "gemma",
            content: response.message || "Gemma returned an empty response.",
            createdAt: new Date().toISOString(),
          });
          saveMessages();
          localStorage.setItem(SYNC_KEY, new Date().toISOString());
          monitorStatusEl.textContent = "MMASION synced";
          emitMonitorActivity("turn-complete", "Gemma answered and MMASION synced the latest session state.");
          pendingAttachments = [];
          renderAttachments();

          const supportiveFollowup = buildSupportiveMonitorFollowup(monitorSessionState);
          if (supportiveFollowup) {
            announceMmasion(supportiveFollowup.message, supportiveFollowup.key);
          }

          if (autoSpeak) {
            await speakText(response.message || "");
          }
        } catch (error) {
          removePendingAssistant();
          messages.push({
            role: "assistant",
            source: "mmasion",
            content: error instanceof Error ? error.message : "Gemma is unavailable right now.",
            createdAt: new Date().toISOString(),
          });
          saveMessages();
          monitorStatusEl.textContent = "MMASION needs attention";
          emitMonitorActivity("turn-error", error instanceof Error ? error.message : "Gemma is unavailable right now.");
        } finally {
          renderConversation();
          setBusy(false, "Gemma ready");
        }
      }

      async function resolveCheckpoint(decision) {
        if (!currentSessionId || checkpointBusy) {
          return;
        }

        checkpointBusy = true;
        renderCheckpoint();

        try {
          const rationale = checkpointRationaleEl.value.trim() || (
            decision === "continue"
              ? "Human approved Gemma to continue from the workspace tab."
              : "Human stopped the session from the workspace tab."
          );

          const session = await api("/api/sessions/" + currentSessionId + "/intervention", {
            method: "POST",
            body: JSON.stringify({
              decision,
              rationale,
            }),
          });

          monitorSessionState = session;
          localStorage.setItem(SYNC_KEY, new Date().toISOString());
          checkpointRationaleEl.value = "";

          if (decision === "continue") {
            monitorStatusEl.textContent = "Human allowed Gemma to continue";
            const polishedPrompt = buildResumePrompt(session, rationale);
            const handoffMessage = "MMASION handoff\\\\n\\\\n" + buildCheckpointQuestion(session) + "\\\\n\\\\nSuggested next prompt for Gemma:\\\\n" + polishedPrompt;
            messages.push({
              role: "assistant",
              source: "mmasion",
              content: handoffMessage,
              createdAt: new Date().toISOString(),
            });
            saveMessages();
            promptEl.value = polishedPrompt;
            promptEl.focus();
            if (autoSpeak) {
              await speakText(buildCheckpointQuestion(session));
            }
          } else {
            monitorStatusEl.textContent = "Human stopped this session";
            const stopMessage = "MMASION stopped this run. Start a new chat or revise the plan before asking Gemma to continue.";
            messages.push({
              role: "assistant",
              source: "mmasion",
              content: stopMessage,
              createdAt: new Date().toISOString(),
            });
            saveMessages();
            if (autoSpeak) {
              await speakText(stopMessage);
            }
          }
        } catch (error) {
          monitorStatusEl.textContent = error instanceof Error ? error.message : "Unable to resolve checkpoint";
        } finally {
          checkpointBusy = false;
          renderCheckpoint();
          updateSessionUi();
        }
      }

      composerEl.addEventListener("submit", async (event) => {
        event.preventDefault();
        await sendMessage(promptEl.value);
      });

      promptEl.addEventListener("keydown", async (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          await sendMessage(promptEl.value);
        }
      });

      saveObjectiveEl.addEventListener("click", () => {
        saveObjective();
        monitorStatusEl.textContent = objectiveEl.value.trim()
          ? "Optional monitor note saved"
          : "MMASION will infer context from the live chat only";
      });

      checkpointContinueEl.addEventListener("click", async () => {
        await resolveCheckpoint("continue");
      });

      checkpointStopEl.addEventListener("click", async () => {
        if (monitorSessionState?.status === "blocked" || monitorSessionState?.intervention?.action === "stop") {
          return;
        }

        await resolveCheckpoint("stop");
      });

      newChatEl.addEventListener("click", () => {
        const thread = createThread();
        threads = [thread, ...threads];
        currentChatId = thread.id;
        messages = [];
        pendingAttachments = [];
        currentSessionId = "";
        monitorSessionState = null;
        lastMonitorAnnouncementKey = "";
        objectiveEl.value = "";
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SYNC_KEY);
        persistThreads();
        renderAttachments();
        renderConversation();
        renderChatList();
      });

      attachEl.addEventListener("click", () => {
        fileInputEl.click();
      });

      fileInputEl.addEventListener("change", async () => {
        const files = Array.from(fileInputEl.files || []);
        const attachments = [];

        for (const file of files) {
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = "";

          for (const byte of bytes) {
            binary += String.fromCharCode(byte);
          }

          try {
            const extracted = await api("/api/extract-file", {
              method: "POST",
              body: JSON.stringify({
                name: file.name,
                mimeType: file.type,
                dataBase64: btoa(binary),
              }),
            });
            attachments.push({
              name: extracted.name,
              type: extracted.type,
              text: extracted.text,
            });
          } catch {
            attachments.push(await fileToAttachment(file));
          }
        }

        pendingAttachments = attachments;
        renderAttachments();
        monitorStatusEl.textContent = attachments.length
          ? attachments.length === 1
            ? "1 file is ready for Gemma and MMASION"
            : attachments.length + " files are ready for Gemma and MMASION"
          : "MMASION ready";
        fileInputEl.value = "";
      });

      async function stopGoogleRecording() {
        if (!mediaRecorder) {
          return;
        }

        await new Promise((resolve) => {
          mediaRecorder.onstop = resolve;
          mediaRecorder.stop();
        });

        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(recordedChunks, { type: mimeType });
        const buffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";

        for (const byte of bytes) {
          binary += String.fromCharCode(byte);
        }

        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
        }

        mediaRecorder = null;
        mediaStream = null;
        recordedChunks = [];

        let transcript = "";
        let usedFallback = false;

        try {
          const payload = await api("/api/audio/transcribe", {
            method: "POST",
            body: JSON.stringify({
              audioBase64: btoa(binary),
              mimeType,
            }),
          });
          transcript = String(payload.transcript || "").trim();
        } catch (error) {
          if (browserTranscript.trim()) {
            transcript = browserTranscript.trim();
            usedFallback = true;
          } else {
            throw error;
          }
        } finally {
          stopBrowserRecognition();
        }

        if (transcript) {
          await submitTranscriptTurn(
            transcript,
            usedFallback ? "Browser transcript recovered after Gemini audio throttling" : "Google transcription",
          );
        } else if (browserTranscript.trim()) {
          await submitTranscriptTurn(browserTranscript.trim(), "Browser transcription");
        } else {
          monitorStatusEl.textContent = "No speech was detected in that recording";
        }

        browserTranscript = "";
      }

      async function startGoogleRecording() {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const candidates = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/ogg;codecs=opus",
        ];
        const mimeType = candidates.find((candidate) => window.MediaRecorder && MediaRecorder.isTypeSupported(candidate)) || "";
        mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
        recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        mediaRecorder.start();
        startBrowserRecognition();
      }

      function getBrowserRecognition() {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!Recognition) {
          return null;
        }

        if (!recognition) {
          recognition = new Recognition();
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event) => {
            const result = Array.from(event.results)
              .map((item) => item[0]?.transcript || "")
              .join(" ")
              .trim();

            if (result) {
              browserTranscript = result;
            }
          };

          recognition.onend = () => {
            if (!listening) {
              return;
            }
          };
        }

        return recognition;
      }

      function startBrowserRecognition() {
        const instance = getBrowserRecognition();

        if (!instance) {
          return;
        }

        browserTranscript = "";

        try {
          instance.start();
        } catch {
          // ignore duplicate-start and browser-specific failures
        }
      }

        function stopBrowserRecognition() {
          if (!recognition) {
            return;
          }

        try {
          recognition.stop();
        } catch {
          // ignore stop failures
          }
        }

        function formatAudioError(error) {
          const message = error instanceof Error ? error.message : String(error || "");
          if (/rate-limited|status 429/i.test(message)) {
            return "Gemini audio is busy right now. Try again in a moment or type your message.";
          }

          if (/speech transcription failed|google transcription failed/i.test(message)) {
            return "Audio transcription did not complete. Try again or type your message.";
          }

          return message || "Audio transcription did not complete.";
        }

      function toggleVoiceRecognition() {
        if (audioMode === "google-cloud-audio" && navigator.mediaDevices && window.MediaRecorder) {
            if (listening) {
              voiceEl.textContent = "Mic";
              listening = false;
              stopGoogleRecording().catch((error) => {
                monitorStatusEl.textContent = formatAudioError(error);
              });
              return;
            }

          startGoogleRecording()
            .then(() => {
              listening = true;
              voiceEl.textContent = "Stop mic";
              monitorStatusEl.textContent = "Recording with Google audio path";
              })
              .catch((error) => {
                monitorStatusEl.textContent = formatAudioError(error) || "Microphone is unavailable";
              });
            return;
          }

        const instance = getBrowserRecognition();

        if (!instance) {
          monitorStatusEl.textContent = "Browser speech input is unavailable here";
          return;
        }

        if (listening) {
          stopBrowserRecognition();
          listening = false;
          voiceEl.textContent = "Mic";
          if (browserTranscript.trim()) {
            void submitTranscriptTurn(browserTranscript.trim(), "Browser transcription");
            browserTranscript = "";
          }
          return;
        }

        browserTranscript = "";
        instance.start();
        listening = true;
        voiceEl.textContent = "Stop mic";
        monitorStatusEl.textContent = "Listening for live voice input";
      }

      voiceEl.addEventListener("click", () => {
        toggleVoiceRecognition();
      });

      speakEl.addEventListener("click", () => {
        autoSpeak = !autoSpeak;
        speakEl.textContent = autoSpeak ? "Speak on" : "Speak off";

        if (!autoSpeak) {
          stopSpeechPlayback();
        }
      });

      stopAudioEl.addEventListener("click", () => {
        stopSpeechPlayback();
        monitorStatusEl.textContent = "Voice playback stopped";
      });

      suggestionsEl.querySelectorAll("[data-prompt]").forEach((button) => {
        button.addEventListener("click", () => {
          promptEl.value = button.getAttribute("data-prompt") || "";
          promptEl.focus();
        });
      });

      renderConversation();
      renderAttachments();
      renderChatList();
      loadSystem();
      startSessionPolling();
      void refreshMonitorSession();
    </script>
  </body>
</html>`;
