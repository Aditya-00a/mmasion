export const styles = `
:root {
  color-scheme: light;
  --bg: #f7f9fc;
  --panel: rgba(255, 255, 255, 0.82);
  --panel-soft: rgba(255, 255, 255, 0.92);
  --panel-strong: #ffffff;
  --border: #dde3ee;
  --text: #1f1f1f;
  --muted: #5f6368;
  --accent: #1a73e8;
  --green: #188038;
  --amber: #b06000;
  --red: #c5221f;
  --shadow: 0 10px 28px rgba(60,64,67,0.08);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: "Google Sans", "Segoe UI", Roboto, Arial, sans-serif;
  background:
    radial-gradient(circle at top left, rgba(26,115,232,0.12), transparent 24%),
    radial-gradient(circle at top right, rgba(66,133,244,0.08), transparent 20%),
    linear-gradient(180deg, #ffffff, var(--bg));
  color: var(--text);
}

.page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
}

.rail {
  padding: 18px 14px;
  border-right: 1px solid rgba(221,227,238,0.8);
  background: rgba(255,255,255,0.52);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
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

.shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 22px 6px;
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

.brand h1,
.hero h2 {
  margin: 0;
  line-height: 1.05;
  font-weight: 600;
}

.brand h1 {
  font-size: clamp(1.45rem, 3vw, 2.35rem);
}

.brand-copy {
  display: grid;
  gap: 4px;
}

.brand p,
.topbar-note,
.muted {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.topbar-controls {
  display: grid;
  gap: 6px;
  justify-items: end;
}

.runtime-bar,
.action-row,
.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.workspace {
  width: min(1440px, calc(100vw - 120px));
  margin: 0 auto;
  padding: 4px 0 16px;
  display: grid;
  gap: 10px;
}

.hero {
  padding: 2px 8px 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 10px;
}

.compact-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
  padding: 0 8px;
}

.compact-hero-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
  padding: 10px 12px;
}

.compact-hero h2 {
  margin-bottom: 4px;
  font-size: 0.98rem;
}

.compact-copy {
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.35;
}

.mini-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(84px, 1fr));
  gap: 6px;
}

.mini-metric {
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255,255,255,0.78);
}

.mini-metric strong {
  display: block;
  font-size: 0.92rem;
}

.mini-metric span {
  color: var(--muted);
  font-size: 0.72rem;
}

.hero-card,
.hero-side {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}

.hero-card {
  padding: 14px 16px;
}

.hero-side {
  padding: 12px;
  display: grid;
  gap: 8px;
  align-content: start;
}

.hero h2 {
  font-size: clamp(1.15rem, 2.4vw, 1.7rem);
  letter-spacing: -0.03em;
  margin-bottom: 6px;
}

.hero-gradient {
  background: linear-gradient(90deg, #1a73e8, #5f8cff, #7b61ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-copy {
  width: min(760px, 100%);
  color: var(--muted);
  line-height: 1.38;
  font-size: 0.87rem;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.surface,
.queue-item,
.template-button,
.timeline-item,
.agent-card,
.detail-card,
.schema-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}

.surface,
.timeline-item,
.agent-card,
.detail-card,
.schema-card {
  padding: 11px 12px;
}

.queue-item,
.template-button {
  padding: 11px 12px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 10px;
}

.column {
  display: grid;
  gap: 10px;
  align-content: start;
}

.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 9px;
  color: var(--muted);
  font-weight: 600;
}

h2, h3, h4, p {
  margin-top: 0;
}

h2 {
  margin-bottom: 8px;
  font-size: 1rem;
}

h3 {
  margin-bottom: 6px;
  font-size: 0.92rem;
}

h4 {
  margin-bottom: 5px;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.form-grid,
.queue-list,
.template-list,
.detail-stack,
.agent-grid,
.timeline-list,
.brief-list,
.schema-list {
  display: grid;
  gap: 6px;
}

input,
textarea,
select,
button {
  font: inherit;
}

input,
textarea,
select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.95);
  color: var(--text);
}

textarea {
  resize: vertical;
}

button {
  cursor: pointer;
  border: none;
}

.primary-button,
.secondary-button,
.template-button {
  padding: 9px 12px;
  border-radius: 999px;
}

.primary-button {
  background: var(--accent);
  color: white;
  font-weight: 600;
}

.secondary-button {
  background: rgba(255,255,255,0.95);
  border: 1px solid var(--border);
  color: var(--text);
}

.secondary-button[disabled] {
  opacity: 0.6;
  cursor: wait;
}

.template-button,
.queue-item {
  text-align: left;
}

.template-button strong,
.queue-item strong {
  display: block;
  margin-bottom: 4px;
}

.template-button span,
.queue-item p,
.list-copy {
  color: var(--muted);
  font-size: 0.82rem;
}

.queue-item.is-active {
  outline: 2px solid rgba(26,115,232,0.3);
  background: rgba(232,240,254,0.9);
}

.metric strong,
.signal strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 2px;
}

.metric span,
.signal span {
  color: var(--muted);
  font-size: 0.78rem;
}

.pill,
.status,
.check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 999px;
  font-size: 11px;
}

.pill { background: #eef3fd; color: #174ea6; }
.pill.live { background: rgba(24,128,56,0.12); color: #137333; }
.status.allowed { background: rgba(24,128,56,0.12); color: #137333; }
.status.monitoring { background: rgba(26,115,232,0.12); color: #185abc; }
.status.paused { background: rgba(176,96,0,0.14); color: #8d4b00; }
.status.blocked { background: rgba(197,34,31,0.12); color: #a50e0e; }
.status.completed { background: rgba(24,128,56,0.12); color: #137333; }
.check.allow { background: rgba(24,128,56,0.12); color: #137333; }
.check.warn { background: rgba(176,96,0,0.14); color: #8d4b00; }
.check.pause,
.check.ask-human { background: rgba(197,34,31,0.12); color: #a50e0e; }
.check.stop { background: rgba(197,34,31,0.16); color: #a50e0e; }

.summary-grid,
.signal-grid,
.agent-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.signal {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: rgba(255,255,255,0.76);
}

.detail-card {
  background: rgba(255,255,255,0.76);
}

.timeline-item {
  border-left: 4px solid var(--accent);
}

.timeline-item.monitor { border-left-color: var(--amber); }
.timeline-item.human { border-left-color: var(--green); }
.timeline-item.tool { border-left-color: var(--red); }

.timeline-item ul,
.schema-card ul,
.detail-card ul,
.agent-card ul {
  margin: 0;
  padding-left: 18px;
}

.compact {
  font-size: 0.86rem;
}

.surface.low-priority,
.surface.low-priority .detail-card,
.surface.low-priority .schema-card {
  opacity: 0.86;
}

.fold {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: rgba(255,255,255,0.72);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.fold summary {
  list-style: none;
  cursor: pointer;
  padding: 10px 12px;
  font-weight: 600;
  font-size: 0.84rem;
}

.fold summary::-webkit-details-marker {
  display: none;
}

.fold-body {
  padding: 0 12px 12px;
  display: grid;
  gap: 6px;
}

.terminal {
  background: #0f172a;
  color: #dbe7ff;
  border: 1px solid rgba(95,140,255,0.22);
  border-radius: 20px;
  padding: 0;
  overflow: hidden;
}

.terminal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(148,163,184,0.18);
  background: rgba(15,23,42,0.92);
}

.terminal-title {
  display: grid;
  gap: 2px;
}

.terminal-title h2,
.terminal-title p,
.terminal-title .eyebrow {
  margin: 0;
  color: inherit;
}

.terminal-body {
  padding: 10px 12px 12px;
  display: grid;
  gap: 6px;
  max-height: 320px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.76rem;
  line-height: 1.45;
  background:
    linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.98));
}

.terminal-line {
  display: grid;
  grid-template-columns: 68px minmax(0, 82px) minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.terminal-time {
  color: #7dd3fc;
}

.terminal-type {
  color: #fbbf24;
  text-transform: uppercase;
}

.terminal-text {
  color: #e5eefc;
  white-space: pre-wrap;
}

.compact-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.operator-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 6px;
}

.mini-stack {
  display: grid;
  gap: 6px;
}

@media (max-width: 1180px) {
  .compact-hero {
    grid-template-columns: 1fr;
  }

  .hero {
    grid-template-columns: 1fr;
  }

  .layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .page {
    grid-template-columns: 1fr;
  }

  .rail {
    display: none;
  }

  .workspace {
    width: 100%;
    padding: 6px 12px 20px;
  }

  .metrics,
  .summary-grid,
  .signal-grid,
  .agent-grid {
    grid-template-columns: 1fr;
  }

  .topbar,
  .runtime-bar {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .topbar-controls {
    justify-items: start;
  }
}
`;

export const appScript = `
const runtimeEl = document.getElementById("runtime-status");
const monitorRuntimeEl = document.getElementById("monitor-runtime");
const liveStatusEl = document.getElementById("live-status");
const modelSelectEl = document.getElementById("model-select");
const switchModelEl = document.getElementById("switch-model");
const modelNoteEl = document.getElementById("model-note");
const metricSessionsEl = document.getElementById("metric-sessions");
const metricPausedEl = document.getElementById("metric-paused");
const metricAllowedEl = document.getElementById("metric-allowed");
const metricRunsEl = document.getElementById("metric-runs");
const sessionsEl = document.getElementById("sessions");
const sessionTitleEl = document.getElementById("session-title");
const sessionSummaryEl = document.getElementById("session-summary");
const sessionDetailsEl = document.getElementById("session-details");
const transcriptEl = document.getElementById("session-transcript");
const googleCapabilitiesEl = document.getElementById("google-capabilities");
const schemaHighlightsEl = document.getElementById("schema-highlights");
const runSnapshotEl = document.getElementById("run-snapshot");
const residentBriefEl = document.getElementById("resident-brief");
const residentBriefMetaEl = document.getElementById("resident-brief-meta");
const generateResidentBriefEl = document.getElementById("generate-resident-brief");
const MONITOR_ACTIVITY_KEY = "mmasion-monitor-activity";
const params = new URLSearchParams(window.location.search);

let selectedSessionId = params.get("session");
const pinnedSessionId = selectedSessionId;
let followLatestSession = !pinnedSessionId;
let cachedResidentBrief = null;
let refreshTimer = null;
let refreshInFlight = false;

async function api(path, options) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";

    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch {
      // ignore parse error
    }

    throw new Error(message);
  }

  return response.json();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function humanize(value) {
  return String(value).replaceAll("-", " ");
}

function titleCase(value) {
  return String(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function percent(value) {
  return Math.round(Number(value || 0) * 100);
}

function listMarkup(items, fallback) {
  const safeItems = Array.isArray(items) && items.length ? items : [fallback];
  return \`<ul>\${safeItems.map((item) => \`<li>\${escapeHtml(item)}</li>\`).join("")}</ul>\`;
}

function formatEventLabel(item) {
  if (!item) {
    return "Monitor update";
  }

  if (item.type === "monitor-decision") {
    const prefix = String(item.content || "").split(":")[0].trim().toLowerCase();
    if (prefix === "pause") return "MMASION paused";
    if (prefix === "warn") return "MMASION warning";
    if (prefix === "stop") return "MMASION stopped";
    if (prefix === "allow") return "MMASION allowed";
    if (prefix === "ask-human") return "Human check needed";
    return "MMASION decision";
  }

  if (item.type === "monitor-note") return "MMASION note";
  if (item.type === "file-uploaded") return "File observed";
  if (item.type === "tool-action") return "Tool action";
  if (item.type === "user-message") return "User said";
  if (item.type === "model-message") return "Gemma replied";
  if (item.type === "human-checkpoint") return "Human checkpoint";
  if (item.type === "human-resolution") return "Human decision";
  return titleCase(humanize(item.type));
}

function formatEventContent(item) {
  const text = String(item?.content || "").trim();
  if (!text) {
    return "No details recorded.";
  }

  if (item.type === "file-uploaded") {
    if (text.startsWith("Uploaded artifact ingested:")) {
      const name = text.replace("Uploaded artifact ingested:", "").trim().replace(/[.]+$/, "");
      return name ? \`Detected uploaded file and started extracting it for monitoring.\` : "Detected uploaded file and started extracting it for monitoring.";
    }

    if (text.startsWith("Observed upload in Gemma workspace:")) {
      const firstLine = text.split("\\\\n")[0];
      const name = firstLine.replace("Observed upload in Gemma workspace:", "").trim();
      return name
        ? \`Parsed the uploaded file and pulled its contents into MMASION's live context.\`
        : "Parsed the uploaded file and pulled its contents into MMASION's live context.";
    }
  }

  if (item.type === "monitor-note" && /status 429/i.test(text)) {
    return "Gemini monitoring hit a rate limit on this step, so MMASION continued with fallback supervision.";
  }

  if (item.type === "monitor-decision") {
    return text.replace(/^(WARN|PAUSE|STOP|ALLOW|ASK-HUMAN):\s*/i, "");
  }

  return text;
}

function buildReadableEntries(items, limit) {
  const filtered = (Array.isArray(items) ? items : [])
    .map((item) => ({
      item,
      label: formatEventLabel(item),
      text: formatEventContent(item),
      time: new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    }));

  const deduped = [];

  for (const entry of filtered) {
    const previous = deduped[deduped.length - 1];
    if (previous && previous.label === entry.label && previous.text === entry.text) {
      continue;
    }
    deduped.push(entry);
  }

  return deduped.slice(-limit).reverse();
}

function renderModelOptions(models, selectedModel) {
  modelSelectEl.innerHTML = "";

  if (!models.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "gemma3:12b not detected";
    modelSelectEl.appendChild(option);
    modelSelectEl.disabled = true;
    switchModelEl.disabled = true;
    modelNoteEl.textContent = "Install or start Ollama with gemma3:12b to enable Gemma-based live supervision.";
    return;
  }

  for (const model of models) {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    option.selected = model === selectedModel;
    modelSelectEl.appendChild(option);
  }

  modelSelectEl.disabled = false;
  switchModelEl.disabled = false;
  modelNoteEl.textContent = selectedModel
    ? \`Active supervision model: \${selectedModel}\`
    : "Simulation fallback is active until gemma3:12b is available.";
}

function renderGoogleCapabilities(capabilities) {
  googleCapabilitiesEl.innerHTML = capabilities.map((item) => \`
    <article class="schema-card">
      <h4>\${escapeHtml(item.capability)}</h4>
      <p><strong>\${escapeHtml(item.service)}</strong></p>
      <p class="compact">\${escapeHtml(item.purpose)}</p>
      <div class="pill-row"><span class="pill">\${escapeHtml(item.status)}</span></div>
    </article>
  \`).join("");
}

function renderSchemaHighlights(fields) {
  const important = (fields || []).filter((field) => field.critical).slice(0, 8);
  schemaHighlightsEl.innerHTML = important.map((field) => \`
    <article class="schema-card">
      <h4>\${escapeHtml(field.fieldName)}</h4>
      <p class="compact">\${escapeHtml(field.description)}</p>
      <p class="muted compact">Triggers: \${escapeHtml((field.triggerKeywords || []).slice(0, 4).join(", "))}</p>
    </article>
  \`).join("");
}

async function loadSystem() {
  try {
    const data = await api("/api/system");
    runtimeEl.textContent = \`\${data.runtime.provider} - \${data.runtime.detail}\`;
    monitorRuntimeEl.textContent = \`\${data.monitorRuntime.provider} - \${data.monitorRuntime.detail}\`;
    renderModelOptions(data.models || [], data.selectedModel || "");
    if (!data.selectedModel && data.preferredLocalModel) {
      modelNoteEl.textContent = \`Preferred local supervision model: \${data.preferredLocalModel}. Currently using simulation fallback.\`;
    }
    renderGoogleCapabilities(data.googleCapabilities || []);
    renderSchemaHighlights(data.complianceFields || []);
  } catch {
    runtimeEl.textContent = "runtime unavailable";
    monitorRuntimeEl.textContent = "monitor runtime unavailable";
    modelSelectEl.disabled = true;
    switchModelEl.disabled = true;
    modelNoteEl.textContent = "Runtime controls are unavailable right now.";
  }
}

function renderMetrics(sessions, runs) {
  const paused = sessions.filter((session) => session.status === "paused").length;
  const allowed = sessions.filter((session) => session.intervention?.action === "allow").length;
  metricSessionsEl.textContent = String(sessions.length);
  metricPausedEl.textContent = String(paused);
  metricAllowedEl.textContent = String(allowed);
  metricRunsEl.textContent = String(runs.length);
}

function renderSessions(sessions) {
  if (!sessionsEl) {
    return;
  }

  sessionsEl.innerHTML = "";

  if (!sessions.length) {
    sessionsEl.innerHTML = '<p class="list-copy">No passive Gemma sessions yet. Open the Gemma tab, upload a file there, and start asking questions.</p>';
    return;
  }

  for (const session of sessions) {
    const card = document.createElement("button");
    card.className = "queue-item" + (session.id === selectedSessionId ? " is-active" : "");
    card.innerHTML = \`
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">
        <strong>\${escapeHtml(session.title)}</strong>
        <span class="status \${escapeHtml(session.status)}">\${escapeHtml(humanize(session.status))}</span>
      </div>
      <div class="pill-row" style="margin:8px 0;">
        <span class="pill">\${escapeHtml(session.sourceType)}</span>
        <span class="pill">\${escapeHtml(session.interfaceName)}</span>
      </div>
      <p>Monitor action: \${escapeHtml(humanize(session.intervention.action))}</p>
    \`;
    card.addEventListener("click", () => {
      selectedSessionId = session.id;
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("session", session.id);
      window.history.replaceState({}, "", nextUrl);
      cachedResidentBrief = null;
      renderSessions(sessions);
      renderSessionDetails(session);
      renderResidentBrief(null);
    });
    sessionsEl.appendChild(card);
  }
}

function renderRunSnapshot(runs) {
  const recent = runs.slice(0, 3);
  runSnapshotEl.innerHTML = recent.length
    ? recent.map((run) => \`
      <article class="schema-card">
        <h4>\${escapeHtml(run.task.title)}</h4>
        <p class="compact">\${escapeHtml(run.finalSummary || "No final summary yet.")}</p>
        <div class="pill-row"><span class="pill">\${escapeHtml(run.status)}</span></div>
      </article>
    \`).join("")
    : '<p class="list-copy">No post-action audit runs yet.</p>';
}

function renderResidentBrief(brief) {
  if (!brief) {
    residentBriefMetaEl.textContent = "Select a monitored session, then generate a plain-language resident explainer.";
    residentBriefEl.innerHTML = '<p class="list-copy">Gemini-powered interleaved explanation blocks will appear here.</p>';
    return;
  }

  residentBriefMetaEl.textContent = "Generated via " + escapeHtml(brief.provider || "resident explainer");
  residentBriefEl.innerHTML = \`
    <article class="detail-card">
      <h3>\${escapeHtml(brief.title)}</h3>
      <p>\${escapeHtml(brief.plainLanguageSummary)}</p>
      <div class="pill-row" style="margin-top:10px;">
        \${(brief.agenciesMentioned || []).map((agency) => \`<span class="pill">\${escapeHtml(agency)}</span>\`).join("")}
        \${(brief.decisionAreas || []).slice(0, 3).map((area) => \`<span class="pill">\${escapeHtml(area)}</span>\`).join("")}
      </div>
    </article>
    <div class="detail-stack">
      \${(brief.interleavedOutput || []).map((block) => \`
        <article class="timeline-item \${escapeHtml(block.type === "warning" ? "tool" : block.type === "question" ? "human" : "monitor")}">
          <h4>\${escapeHtml(block.type)}</h4>
          <strong>\${escapeHtml(block.title)}</strong>
          <p style="margin-top:8px;">\${escapeHtml(block.content)}</p>
        </article>
      \`).join("")}
    </div>
    <article class="detail-card">
      <h4>Questions residents should ask</h4>
      \${listMarkup(brief.suggestedQuestions, "No resident questions generated yet.")}
    </article>
  \`;
}

function renderSessionDetails(session) {
  if (!session) {
    sessionTitleEl.textContent = "No session selected";
    sessionSummaryEl.textContent = "Start a monitored session to watch an LLM while it acts.";
    sessionDetailsEl.innerHTML = "";
    renderResidentBrief(null);
    return;
  }

  selectedSessionId = session.id;
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("session", session.id);
  window.history.replaceState({}, "", nextUrl);
  sessionTitleEl.textContent = session.title;
  sessionSummaryEl.textContent = session.intervention.reason;

  const agentMarkup = (session.agents || []).map((agent) => \`
    <article class="agent-card">
      <h4>\${escapeHtml(agent.name)}</h4>
      <p>\${escapeHtml(agent.summary)}</p>
      <div class="pill-row" style="margin-top:10px;">
        <span class="pill">confidence \${percent(agent.confidence)}%</span>
        <span class="pill">\${escapeHtml(agent.role)}</span>
      </div>
      \${agent.flags?.length ? \`<h4 style="margin-top:12px;">Flags</h4>\${listMarkup(agent.flags, "No flags.")}\` : ""}
      <h4 style="margin-top:12px;">Why selected</h4>
      <p>\${escapeHtml(agent.selectedBecause || "Selected as part of the active supervision plan.")}</p>
    </article>
  \`).join("");

  const eventMarkup = (session.events || []).map((item) => \`
    <article class="timeline-item \${escapeHtml(item.actor)}">
      <h4>\${escapeHtml(humanize(item.type))}</h4>
      <p>\${escapeHtml(item.content)}</p>
      <p class="muted compact">\${escapeHtml(item.actor)} • \${escapeHtml(item.createdAt)}</p>
    </article>
    \`).join("");

  const monitorEvents = buildReadableEntries(
    (session.events || []).filter((item) => item.actor === "monitor"),
    8,
  )
    .map((entry) => \`
      <article class="timeline-item monitor">
        <h4>\${escapeHtml(entry.label)}</h4>
        <p>\${escapeHtml(entry.text)}</p>
        <p class="muted compact">\${escapeHtml(entry.time)}</p>
      </article>
    \`).join("");

  const liveThinking = buildReadableEntries(
    (session.events || []).filter((item) => item.actor === "monitor" || item.actor === "tool" || item.type === "human-checkpoint" || item.type === "file-uploaded"),
    12,
  )
    .map((entry) => \`
      <div class="terminal-line">
        <span class="terminal-time">\${escapeHtml(entry.time)}</span>
        <span class="terminal-type">\${escapeHtml(entry.label)}</span>
        <span class="terminal-text">\${escapeHtml(entry.text)}</span>
      </div>
    \`).join("");

  sessionDetailsEl.innerHTML = \`
    <section class="terminal">
      <div class="terminal-head">
        <div class="terminal-title">
          <p class="eyebrow">Live reasoning</p>
          <h2>MMASION thinking screen</h2>
          <p class="compact">This feed updates from the passive monitor while Gemma runs.</p>
        </div>
        <div class="pill-row">
          <span class="status \${escapeHtml(session.status)}">\${escapeHtml(humanize(session.status))}</span>
          <span class="pill live">\${escapeHtml(session.monitorProvider || "deterministic-monitor")}</span>
        </div>
      </div>
      <div class="terminal-body">
        \${liveThinking || '<div class="terminal-line"><span class="terminal-time">--:--:--</span><span class="terminal-type">idle</span><span class="terminal-text">Waiting for new monitored activity.</span></div>'}
      </div>
    </section>

    <section class="surface detail-stack">
      <div>
        <p class="eyebrow">Control state</p>
        <h2>Current monitor decision</h2>
      </div>
      <div class="compact-grid">
        <div class="signal">
          <h4>Status</h4>
          <strong>\${escapeHtml(humanize(session.status))}</strong>
          <span class="muted">session state</span>
        </div>
        <div class="signal">
          <h4>Action</h4>
          <strong>\${escapeHtml(humanize(session.intervention.action))}</strong>
          <span class="muted">supervision verdict</span>
        </div>
        <div class="signal">
          <h4>Source</h4>
          <strong>\${escapeHtml(humanize(session.sourceType))}</strong>
          <span class="muted">\${escapeHtml(session.interfaceName)}</span>
        </div>
        <div class="signal">
          <h4>Updated</h4>
          <strong>\${escapeHtml(new Date(session.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }))}</strong>
          <span class="muted">last observed tick</span>
        </div>
      </div>
      <div class="operator-grid">
        <div class="detail-card">
          <h4>Why MMASION intervened</h4>
          <p>\${escapeHtml(session.intervention.reason)}</p>
          <h4 style="margin-top:12px;">Suggested human prompt</h4>
          <p>\${escapeHtml(session.intervention.suggestedHumanPrompt)}</p>
        </div>
        <div class="detail-card">
          <h4>Blocking issues</h4>
          \${listMarkup(session.intervention.blockingIssues, "No blocking issues detected.")}
          <h4 style="margin-top:12px;">Domain lanes</h4>
          <div class="pill-row">
            \${(session.routedDomains || []).map((domain) => \`<span class="pill">\${escapeHtml(domain)} lane</span>\`).join("")}
          </div>
        </div>
      </div>
    </section>

    <section class="surface detail-stack">
      <div>
        <p class="eyebrow">Operator controls</p>
        <h2>Checkpoint and actions</h2>
      </div>
      <div class="operator-grid">
        <div class="detail-card">
          <h4>Reasoning notes</h4>
          \${listMarkup(session.monitorNotes, "No additional monitor notes were recorded for this session yet.")}
          <h4 style="margin-top:12px;">Recent decisions</h4>
          <div class="timeline-list">
            \${monitorEvents || '<p class="list-copy">No monitor reasoning events recorded yet.</p>'}
          </div>
        </div>
        <div class="detail-card">
          <h4>Human-in-the-loop</h4>
          <textarea id="checkpoint-rationale" rows="3" placeholder="Explain whether the LLM should continue or stop."></textarea>
          <div class="action-row" style="margin-top:10px;">
            <button class="secondary-button" type="button" id="allow-session">Allow to continue</button>
            <button class="secondary-button" type="button" id="stop-session">Stop session</button>
          </div>
          <h4 style="margin-top:12px;">Append monitored event</h4>
          <div class="mini-stack">
            <select id="event-type">
              <option value="user-message">User message</option>
              <option value="model-message">Model message</option>
              <option value="tool-action">Tool action</option>
            </select>
            <select id="event-actor">
              <option value="user">User</option>
              <option value="model">Model</option>
              <option value="tool">Tool</option>
            </select>
            <textarea id="event-content" rows="4" placeholder="Add the next message, action, or tool event for MMASION to monitor."></textarea>
            <button class="primary-button" type="button" id="append-event">Append event</button>
          </div>
        </div>
      </div>
    </section>

    <section class="surface detail-stack">
      <div>
        <p class="eyebrow">Live agents</p>
        <h2>Active monitoring and translation agents</h2>
      </div>
      <div class="agent-grid">
        \${agentMarkup}
      </div>
    </section>
    <section class="surface low-priority detail-stack">
      <div>
        <p class="eyebrow">Timeline</p>
        <h2>Observed conversation and actions</h2>
      </div>
      <div class="timeline-list">
        \${eventMarkup || '<p class="list-copy">No events captured yet.</p>'}
      </div>
    </section>
  \`;

  document.getElementById("allow-session")?.addEventListener("click", async () => {
    const rationale = document.getElementById("checkpoint-rationale").value || "Human approved continued execution.";
    await api(\`/api/sessions/\${session.id}/intervention\`, {
      method: "POST",
      body: JSON.stringify({ decision: "continue", rationale }),
    });
    await refresh();
  });

  document.getElementById("stop-session")?.addEventListener("click", async () => {
    const rationale = document.getElementById("checkpoint-rationale").value || "Human stopped the session.";
    await api(\`/api/sessions/\${session.id}/intervention\`, {
      method: "POST",
      body: JSON.stringify({ decision: "stop", rationale }),
    });
    await refresh();
  });

  document.getElementById("append-event")?.addEventListener("click", async () => {
    const type = document.getElementById("event-type").value;
    const actor = document.getElementById("event-actor").value;
    const content = document.getElementById("event-content").value;

    if (!content.trim()) {
      return;
    }

    await api(\`/api/sessions/\${session.id}/events\`, {
      method: "POST",
      body: JSON.stringify({ type, actor, content }),
    });
    await refresh();
  });
}

async function refresh() {
  if (refreshInFlight) {
    return;
  }

  refreshInFlight = true;

  try {
  const [sessions, runs] = await Promise.all([
    api("/api/sessions"),
    api("/api/runs"),
  ]);
  const passiveGemmaSessions = sessions
    .filter((session) => session.interfaceName === "Gemma workspace")
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

  renderMetrics(passiveGemmaSessions, runs);
  renderSessions(passiveGemmaSessions);
  renderRunSnapshot(runs);

  if (selectedSessionId && !passiveGemmaSessions.some((item) => item.id === selectedSessionId)) {
    selectedSessionId = null;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("session");
    window.history.replaceState({}, "", nextUrl);
  }

  if (followLatestSession && passiveGemmaSessions[0] && selectedSessionId !== passiveGemmaSessions[0].id) {
    selectedSessionId = passiveGemmaSessions[0].id;
  }

  if (!selectedSessionId && passiveGemmaSessions[0]) {
    selectedSessionId = passiveGemmaSessions[0].id;
  }

  const session = passiveGemmaSessions.find((item) => item.id === selectedSessionId) || passiveGemmaSessions[0];
  renderSessionDetails(session);
  renderResidentBrief(cachedResidentBrief);
    liveStatusEl.textContent = "Live monitor on";
  } catch (error) {
    liveStatusEl.textContent = error instanceof Error ? error.message : "Live monitor unavailable";
  } finally {
    refreshInFlight = false;
  }
}

window.addEventListener("storage", (event) => {
  if (event.key !== MONITOR_ACTIVITY_KEY || !event.newValue) {
    return;
  }

  try {
    const payload = JSON.parse(event.newValue);
    if (payload?.detail) {
      liveStatusEl.textContent = payload.detail;
    }
    if (followLatestSession && payload?.sessionId) {
      selectedSessionId = payload.sessionId;
      cachedResidentBrief = null;
      void refresh();
    }
  } catch {
    // ignore malformed sync payloads
  }
});

switchModelEl.addEventListener("click", async () => {
  const model = modelSelectEl.value;

  if (!model) {
    return;
  }

  switchModelEl.disabled = true;
  modelSelectEl.disabled = true;
  modelNoteEl.textContent = \`Switching runtime to \${model}...\`;

  try {
    await api("/api/system/model", {
      method: "POST",
      body: JSON.stringify({ model }),
    });
    await loadSystem();
  } catch (error) {
    modelNoteEl.textContent = error instanceof Error ? error.message : "Unable to switch runtime.";
    await loadSystem();
  }
});

generateResidentBriefEl.addEventListener("click", async () => {
  if (!selectedSessionId) {
    renderResidentBrief(null);
    return;
  }

  generateResidentBriefEl.disabled = true;
  residentBriefMetaEl.textContent = "Generating resident explainer...";

  try {
    const brief = await api(\`/api/sessions/\${selectedSessionId}/resident-brief\`);
    cachedResidentBrief = brief;
    renderResidentBrief(brief);
  } catch (error) {
    residentBriefMetaEl.textContent = error instanceof Error ? error.message : "Unable to generate resident explainer.";
  } finally {
    generateResidentBriefEl.disabled = false;
  }
});

loadSystem();
refresh();
refreshTimer = window.setInterval(refresh, 2500);
`;

export const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Audit the Algorithm | MMASION</title>
    <style>${styles}</style>
  </head>
  <body>
    <div class="page">
      <aside class="rail">
        <a class="rail-link" href="/gemma" target="_blank" rel="noreferrer" title="Open Gemma workspace">G</a>
        <button class="rail-button" type="button" id="generate-resident-brief" title="Generate resident explainer">AI</button>
      </aside>

      <div class="shell">
        <header class="topbar">
          <div class="brand">
            <div class="brand-mark">M</div>
            <div class="brand-copy">
              <h1>Audit the Algorithm</h1>
              <p>MMASION listens from a separate tab, infers context from Gemma’s live conversation, and intervenes only when the workflow starts drifting.</p>
            </div>
          </div>
          <div class="topbar-controls">
            <p class="topbar-note" id="runtime-status">Loading runtime status...</p>
            <p class="topbar-note" id="monitor-runtime">Loading monitor runtime...</p>
            <div class="runtime-bar">
              <span class="pill live" id="live-status">Connecting live monitor...</span>
              <select id="model-select" aria-label="Select local model">
                <option value="">Loading models...</option>
              </select>
              <button class="secondary-button" id="switch-model" type="button">Switch model</button>
              <a class="secondary-button" href="/gemma" target="_blank" rel="noreferrer" style="text-decoration:none;">Open Gemma</a>
            </div>
            <p class="topbar-note" id="model-note">Preparing runtime controls...</p>
          </div>
        </header>

        <div class="workspace">
          <section class="compact-hero">
            <div class="compact-hero-card">
              <p class="eyebrow">Passive supervision</p>
              <h2><span class="hero-gradient">Live monitor for Gemma</span></h2>
              <p class="compact-copy">Gemma stays in its own tab. MMASION follows the active chat, shows its reasoning, and interrupts only when the workflow drifts.</p>
            </div>

            <div class="mini-metrics">
              <div class="mini-metric"><strong id="metric-sessions">0</strong><span>sessions</span></div>
              <div class="mini-metric"><strong id="metric-paused">0</strong><span>paused</span></div>
              <div class="mini-metric"><strong id="metric-allowed">0</strong><span>allowed</span></div>
              <div class="mini-metric"><strong id="metric-runs">0</strong><span>runs</span></div>
            </div>
          </section>

          <main class="layout">
            <section class="column">
              <section class="surface">
                <p class="eyebrow">Active session</p>
                <h2 id="session-title">No session selected</h2>
                <p id="session-summary" class="muted">Open Gemma, start talking, and MMASION will begin to infer the session from the actual conversation.</p>
              </section>
              <section class="surface low-priority">
                <p class="eyebrow">Resident explainer</p>
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;">
                  <div>
                    <h2>Gemini interleaved output</h2>
                    <p id="resident-brief-meta" class="muted">Generate a plain-language explainer after MMASION has observed enough of the live chat.</p>
                  </div>
                </div>
                <div id="resident-brief" class="detail-stack" style="margin-top:12px;"></div>
              </section>
              <div id="session-details" class="detail-stack"></div>
            </section>

            <aside class="column">
              <details class="fold" open>
                <summary>Cloud path</summary>
                <div class="fold-body">
                  <div id="google-capabilities" class="brief-list"></div>
                </div>
              </details>

              <details class="fold">
                <summary>Data dictionary fields</summary>
                <div class="fold-body">
                  <div id="schema-highlights" class="schema-list"></div>
                </div>
              </details>

              <details class="fold">
                <summary>Background runs</summary>
                <div class="fold-body">
                  <div id="run-snapshot" class="brief-list"></div>
                </div>
              </details>
            </aside>
          </main>
        </div>
      </div>
    </div>
    <script type="module">${appScript}</script>
  </body>
</html>`;
