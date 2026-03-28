import { createServer } from "node:http";
import type { RuntimeStatus } from "./contracts.js";
import { algorithmicComplianceFields, googleCapabilityMap } from "./compliance-schema.js";
import { loadEnvFile } from "./env.js";
import { extractAttachment } from "./file-extraction.js";
import { GoogleAudioBridge } from "./google-audio.js";
import { createProvider } from "./providers/factory.js";
import type { SessionReasoner } from "./monitor-reasoner.js";
import { OllamaProvider } from "./providers/ollama-provider.js";
import { SessionMonitor } from "./session-monitor.js";
import { FileRunStore, FileSessionStore } from "./store.js";
import { SupervisorGateway } from "./supervisor.js";
import { TransparencyExplainer } from "./transparency-explainer.js";
import { VertexSessionReasoner } from "./vertex-session-reasoner.js";
import { chatHtml } from "./chat-ui.js";
import { html } from "./ui.js";

loadEnvFile();

const port = Number(process.env.PORT ?? 4173);
const store = new FileRunStore(process.env.MMASION_STORE_PATH ?? "data/runs.json");
const sessionStore = new FileSessionStore(process.env.MMASION_SESSION_STORE_PATH ?? "data/sessions.json");
const preferredLocalModel = process.env.MMASION_OLLAMA_MODEL ?? "gemma3:12b";

let gateway!: SupervisorGateway;
const sessionMonitor = new SessionMonitor();
let runtimeStatus: RuntimeStatus = {
  provider: "booting",
  mode: "simulation",
  detail: "Server is starting.",
};
const audioBridge = new GoogleAudioBridge();
let selectedModel: string | null = null;
let sessionReasoner: SessionReasoner | null = null;
const transparencyExplainer = new TransparencyExplainer();
let sessionReasonerStatus = {
  provider: "deterministic-monitor",
  mode: "deterministic",
  detail: "Using deterministic passive supervision.",
};

async function initializeGateway(modelOverride?: string): Promise<void> {
  const { provider, runtime, selectedModel: activeModel } = await createProvider(
    modelOverride
      ? {
          preferred: "ollama",
          model: modelOverride,
        }
      : undefined,
  );

  gateway = new SupervisorGateway(provider, store);
  runtimeStatus = runtime;
  selectedModel = activeModel;
}

async function initializeSessionReasoner(): Promise<void> {
  const preferred = (process.env.MMASION_MONITOR_PROVIDER ?? "auto").toLowerCase();
  const vertexReasoner = new VertexSessionReasoner();

  if (preferred === "deterministic") {
    sessionReasoner = null;
    sessionReasonerStatus = {
      provider: "deterministic-monitor",
      mode: "deterministic",
      detail: "Using deterministic passive supervision.",
    };
    return;
  }

  if (await vertexReasoner.isAvailable()) {
    sessionReasoner = vertexReasoner;
    sessionReasonerStatus = {
      provider: vertexReasoner.name,
      mode: vertexReasoner.name === "gemini-api-monitor" ? "gemini-api" : "vertex-ai",
      detail: vertexReasoner.detail,
    };
    return;
  }

  if (preferred === "vertex" || preferred === "gemini") {
    throw new Error(`MMASION_MONITOR_PROVIDER=${preferred} but matching Gemini/Vertex credentials were not configured.`);
  }

  sessionReasoner = null;
  sessionReasonerStatus = {
    provider: "deterministic-monitor",
    mode: "deterministic",
    detail: "Vertex monitor unavailable. Falling back to deterministic passive supervision.",
  };
}

async function maybeEnhanceSession(sessionId: string): Promise<void> {
  if (!sessionReasoner) {
    return;
  }

  const session = sessionMonitor.getSession(sessionId);

  if (!session) {
    return;
  }

  try {
    const patch = await sessionReasoner.analyze(session);
    const updated = sessionMonitor.applyReasoning(session.id, patch, sessionReasoner.name);

    if (updated) {
      sessionStore.save(sessionMonitor.listSessions());
    }
  } catch (error) {
    sessionMonitor.applyReasoning(
      session.id,
      {
        notes: [
          ...(session.monitorNotes ?? []),
          error instanceof Error ? error.message : "Vertex passive monitor failed.",
        ],
      },
      sessionReasoner.name,
    );
    sessionStore.save(sessionMonitor.listSessions());
  }
}

function jsonHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
}

function parseBody(request: import("node:http").IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    request.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

async function chatWithGemma(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string> {
  const model = selectedModel ?? preferredLocalModel;
  const response = await fetch("http://127.0.0.1:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemma chat failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    message?: {
      content?: string;
    };
  };

  return payload.message?.content?.trim() || "Gemma returned an empty response.";
}

function normalizeChatMessages(
  messages: Array<{ role?: "user" | "assistant" | "system"; content?: string }>,
  attachments: Array<{ name?: string; text?: string; type?: string }> = [],
  objective?: string,
): Array<{ role: "user" | "assistant" | "system"; content: string }> {
  const normalized = messages
    .filter((message) => message?.content)
    .map((message) => ({
      role: message.role ?? "user",
      content: String(message.content ?? ""),
    })) as Array<{ role: "user" | "assistant" | "system"; content: string }>;

  const systemMessages: Array<{ role: "system"; content: string }> = [];

  if (objective?.trim()) {
    systemMessages.push({
      role: "system",
      content: `Session objective: ${objective.trim()}`,
    });
  }

  if (attachments.length) {
    const attachmentContext = attachments
      .map((attachment, index) => {
        const name = String(attachment.name ?? `attachment-${index + 1}`);
        const type = String(attachment.type ?? "text/plain");
        const text = String(attachment.text ?? "").slice(0, 12000);
        return `Attachment ${index + 1}: ${name}\nType: ${type}\nExtracted content:\n${text}`;
      })
      .join("\n\n");

    systemMessages.push({
      role: "system",
      content:
        "The user attached supporting files. Use them as context, cite them in plain language, and do not pretend a file contains details that are missing.\n\n" +
        attachmentContext,
    });
  }

  return [...systemMessages, ...normalized];
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      ...jsonHeaders(),
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (request.method === "GET" && url.pathname === "/gemma") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(chatHtml);
    return;
  }

  if (request.method === "GET" && url.pathname === "/") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(html);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/runs") {
    const runs = gateway.listRuns();
    response.writeHead(200, jsonHeaders());
    response.end(JSON.stringify(runs));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/sessions") {
    response.writeHead(200, jsonHeaders());
    response.end(JSON.stringify(sessionMonitor.listSessions()));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/system") {
    const models = await OllamaProvider.listModels();
    response.writeHead(200, jsonHeaders());
    response.end(
      JSON.stringify({
        runtime: runtimeStatus,
        provider: gateway.getProviderName(),
        selectedModel,
        models,
        preferredLocalModel,
        monitorRuntime: sessionReasonerStatus,
        audioRuntime: {
          provider: audioBridge.isAvailable() ? "google-cloud-audio" : "browser-fallback",
          mode: audioBridge.isAvailable() ? "server-audio" : "browser-audio",
          detail: audioBridge.detail(),
        },
        complianceFields: algorithmicComplianceFields,
        googleCapabilities: googleCapabilityMap,
      }),
    );
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/healthz") {
    response.writeHead(200, jsonHeaders());
    response.end(JSON.stringify({ ok: true, service: "mmasion", timestamp: new Date().toISOString() }));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/compliance-schema") {
    response.writeHead(200, jsonHeaders());
    response.end(JSON.stringify({ fields: algorithmicComplianceFields }));
    return;
  }

  if (request.method === "GET" && /^\/api\/sessions\/[^/]+\/resident-brief$/.test(url.pathname)) {
    const sessionId = url.pathname.split("/")[3] ?? "";
    const session = sessionMonitor.getSession(sessionId);

    if (!session) {
      response.writeHead(404, jsonHeaders());
      response.end(JSON.stringify({ error: "Session not found" }));
      return;
    }

    const brief = await transparencyExplainer.explain(session);
    response.writeHead(200, jsonHeaders());
    response.end(JSON.stringify(brief));
    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/runs/")) {
    const runId = url.pathname.split("/").at(-1) ?? "";
    const run = gateway.getRun(runId);
    response.writeHead(run ? 200 : 404, jsonHeaders());
    response.end(JSON.stringify(run ?? { error: "Run not found" }));
    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/sessions/")) {
    const sessionId = url.pathname.split("/").at(-1) ?? "";
    const session = sessionMonitor.getSession(sessionId);
    response.writeHead(session ? 200 : 404, jsonHeaders());
    response.end(JSON.stringify(session ?? { error: "Session not found" }));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/extract-file") {
    const body = (await parseBody(request)) as {
      name?: string;
      mimeType?: string;
      dataBase64?: string;
    };

    if (!body.name || !body.dataBase64) {
      response.writeHead(400, jsonHeaders());
      response.end(JSON.stringify({ error: "File name and base64 data are required." }));
      return;
    }

    try {
      const extracted = extractAttachment({
        name: body.name,
        base64: body.dataBase64,
        ...(body.mimeType ? { mimeType: body.mimeType } : {}),
      });
      response.writeHead(200, jsonHeaders());
      response.end(JSON.stringify(extracted));
    } catch (error) {
      response.writeHead(422, jsonHeaders());
      response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unable to extract file." }));
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/audio/transcribe") {
    const body = (await parseBody(request)) as {
      audioBase64?: string;
      mimeType?: string;
      languageCode?: string;
    };

    if (!body.audioBase64 || !body.mimeType) {
      response.writeHead(400, jsonHeaders());
      response.end(JSON.stringify({ error: "audioBase64 and mimeType are required." }));
      return;
    }

    try {
      const transcript = await audioBridge.transcribe({
        audioBase64: body.audioBase64,
        mimeType: body.mimeType,
        ...(body.languageCode ? { languageCode: body.languageCode } : {}),
      });
      response.writeHead(200, jsonHeaders());
      response.end(JSON.stringify({ transcript }));
    } catch (error) {
      response.writeHead(503, jsonHeaders());
      response.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Speech transcription failed.",
          transcript: "",
        }),
      );
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/audio/speak") {
    const body = (await parseBody(request)) as {
      text?: string;
      languageCode?: string;
      voiceName?: string;
    };

    if (!body.text?.trim()) {
      response.writeHead(400, jsonHeaders());
      response.end(JSON.stringify({ error: "text is required." }));
      return;
    }

    try {
      const audioBase64 = await audioBridge.speak({
        text: body.text,
        ...(body.languageCode ? { languageCode: body.languageCode } : {}),
        ...(body.voiceName ? { voiceName: body.voiceName } : {}),
      });
      response.writeHead(200, jsonHeaders());
      response.end(JSON.stringify({ audioBase64, mimeType: "audio/mpeg" }));
    } catch (error) {
      response.writeHead(503, jsonHeaders());
      response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Text-to-Speech failed." }));
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/runs") {
    const body = (await parseBody(request)) as Record<string, string>;
    const task = {
      title: body.title ?? "Untitled task",
      input: body.input ?? "",
    } as {
      title: string;
      input: string;
      requestedDomain?:
        | "finance"
        | "operations"
        | "legal"
        | "it"
        | "hr"
        | "healthcare";
    };

    if (body.requestedDomain) {
      task.requestedDomain = body.requestedDomain as
        | "finance"
        | "operations"
        | "legal"
        | "it"
        | "hr"
        | "healthcare";
    }

    const run = await gateway.submit(task);
    response.writeHead(201, jsonHeaders());
    response.end(JSON.stringify(run));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/sessions") {
    const body = (await parseBody(request)) as Record<string, string>;
    const sessionInput = {
      title: body.title ?? "Observed LLM session",
      objective: body.objective ?? body.input ?? "",
      transcript: body.transcript ?? "",
      sourceType: (body.sourceType as "chat" | "upload" | "voice") ?? "chat",
      interfaceName: body.interfaceName ?? "Observed external workspace",
    } as {
      title: string;
      objective: string;
      transcript: string;
      sourceType: "chat" | "upload" | "voice";
      interfaceName: string;
      uploadedArtifactName?: string;
    };

    if (body.uploadedArtifactName) {
      sessionInput.uploadedArtifactName = body.uploadedArtifactName;
    }

    const session = sessionMonitor.createSession(sessionInput);
    await maybeEnhanceSession(session.id);
    sessionStore.save(sessionMonitor.listSessions());
    response.writeHead(201, jsonHeaders());
    response.end(JSON.stringify(sessionMonitor.getSession(session.id)));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/gemma-chat") {
    const body = (await parseBody(request)) as {
      messages?: Array<{ role?: "user" | "assistant" | "system"; content?: string }>;
      sessionId?: string;
      objective?: string;
      attachments?: Array<{ name?: string; text?: string; type?: string }>;
    };
    const attachments = Array.isArray(body.attachments) ? body.attachments : [];
    const messages = normalizeChatMessages(body.messages ?? [], attachments, body.objective);

    if (!messages.length) {
      response.writeHead(400, jsonHeaders());
      response.end(JSON.stringify({ error: "At least one chat message is required." }));
      return;
    }

    try {
      const assistantMessage = await chatWithGemma(messages);

      if (body.sessionId) {
        sessionMonitor.appendEvent(body.sessionId, {
          type: "model-message",
          actor: "model",
          content: assistantMessage,
        });
        await maybeEnhanceSession(body.sessionId);
        sessionStore.save(sessionMonitor.listSessions());
      }

      response.writeHead(200, jsonHeaders());
      response.end(
        JSON.stringify({
          message: assistantMessage,
          session: body.sessionId ? sessionMonitor.getSession(body.sessionId) : null,
        }),
      );
    } catch (error) {
      response.writeHead(503, jsonHeaders());
      response.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Gemma chat is unavailable.",
        }),
      );
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/system/model") {
    const body = (await parseBody(request)) as Record<string, unknown>;
    const model = String(body.model ?? "").trim();
    const models = await OllamaProvider.listModels();

    if (!model) {
      response.writeHead(400, jsonHeaders());
      response.end(JSON.stringify({ error: "Model is required." }));
      return;
    }

    if (!models.includes(model)) {
      response.writeHead(404, jsonHeaders());
      response.end(JSON.stringify({ error: `Model "${model}" is not available in Ollama.` }));
      return;
    }

    try {
      await initializeGateway(model);
      response.writeHead(200, jsonHeaders());
      response.end(
        JSON.stringify({
          runtime: runtimeStatus,
          provider: gateway.getProviderName(),
          selectedModel,
          models,
          preferredLocalModel,
        }),
      );
    } catch (error) {
      response.writeHead(503, jsonHeaders());
      response.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unable to switch model.",
        }),
      );
    }
    return;
  }

  if (request.method === "POST" && /^\/api\/sessions\/[^/]+\/events$/.test(url.pathname)) {
    const sessionId = url.pathname.split("/")[3] ?? "";
    const body = (await parseBody(request)) as Record<string, string>;
    const session = sessionMonitor.appendEvent(sessionId, {
      type: (body.type as "user-message" | "model-message" | "tool-action" | "file-uploaded") ?? "user-message",
      actor: (body.actor as "user" | "model" | "tool" | "human" | "monitor" | "system") ?? "user",
      content: body.content ?? "",
    });

    if (session) {
      await maybeEnhanceSession(session.id);
      sessionStore.save(sessionMonitor.listSessions());
    }
    response.writeHead(session ? 200 : 404, jsonHeaders());
    response.end(JSON.stringify((session && sessionMonitor.getSession(session.id)) ?? { error: "Session not found" }));
    return;
  }

  if (request.method === "POST" && /^\/api\/sessions\/[^/]+\/intervention$/.test(url.pathname)) {
    const sessionId = url.pathname.split("/")[3] ?? "";
    const body = (await parseBody(request)) as Record<string, string>;
    const session = sessionMonitor.resolveIntervention(sessionId, {
      decision: (body.decision as "continue" | "stop") ?? "continue",
      rationale: body.rationale ?? "Human reviewed the checkpoint.",
    });

    if (session) {
      sessionStore.save(sessionMonitor.listSessions());
    }
    response.writeHead(session ? 200 : 404, jsonHeaders());
    response.end(JSON.stringify((session && sessionMonitor.getSession(session.id)) ?? { error: "Session not found" }));
    return;
  }

  if (request.method === "POST" && /^\/api\/escalations\/[^/]+\/resolve$/.test(url.pathname)) {
    const escalationId = url.pathname.split("/")[3] ?? "";
    const body = (await parseBody(request)) as Record<string, unknown>;
    const run = gateway.resolveEscalation(escalationId, {
      reviewer: String(body.reviewer ?? "Reviewer"),
      decision: (body.decision as "approve" | "reject" | "override") ?? "override",
      rationale: String(body.rationale ?? "Resolved during review."),
      rememberPreference: Boolean(body.rememberPreference),
    });
    response.writeHead(run ? 200 : 404, jsonHeaders());
    response.end(JSON.stringify(run ?? { error: "Escalation not found" }));
    return;
  }

  response.writeHead(404, jsonHeaders());
  response.end(JSON.stringify({ error: "Not found" }));
});

void initializeGateway()
  .then(async () => {
    await initializeSessionReasoner();
    sessionMonitor.hydrate(sessionStore.load());
    server.listen(port, () => {
      console.log(`MMASION local server running at http://localhost:${port}`);
      console.log(`MMASION provider: ${runtimeStatus.provider} (${runtimeStatus.detail})`);
      console.log(`MMASION monitor: ${sessionReasonerStatus.provider} (${sessionReasonerStatus.detail})`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize MMASION provider.", error);
    process.exitCode = 1;
  });
