# MMASION

Live AI supervision for Gemma-powered workspaces, with Gemini-based monitoring, interruption, and plain-language explanation.

## Team

- Aditya Sakhale - `axs10415@nyu.edu`
- Yash Sharma - `ys6587@nyu.edu`

##Presentation 
https://www.canva.com/design/DAHFP4B7aWw/er896kQv4UOwc87ueOs6RA/edit?utm_content=DAHFP4B7aWw&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
## Overview

MMASION is a live AI supervision system built around a simple idea:

- let a visible assistant do the work
- let a second intelligence layer monitor that work in real time
- intervene before unsupported or risky output becomes the final answer

In this repository:

- `Gemma 12B` is the visible worker
- `Gemini` is the background monitor and explainer
- `MMASION` is the orchestration, intervention, and human-checkpoint layer

MMASION is not another chatbot. It is a control layer that supervises AI behavior as it happens.

## Why It Matters

Most demos stop at "the model answered."

MMASION focuses on what happens before trust is granted.

The system is built around:

- live supervision instead of after-the-fact review
- multi-model execution instead of one model doing everything
- multi-agent monitoring instead of one generic verifier
- human checkpoints as part of the runtime, not a manual add-on

The core pitch is simple:

`Gemma does the work. MMASION helps you trust the work.`

## Product Experience

The system is intentionally split into two interfaces:

### `/gemma` - Worker Interface

This is the visible assistant workspace.

What you can do there:

- chat with Gemma naturally
- upload files
- use voice input
- hear audio playback
- receive MMASION interruptions directly inside the chat when a checkpoint is needed

### `/` - MMASION Monitor

This is the passive monitoring and control console.

What you can see there:

- live reasoning feed
- intervention state
- active monitoring agents
- operator actions
- plain-language explanation output

That separation is the product.

The user works inside Gemma, while MMASION quietly watches:

- user prompts
- model responses
- uploaded files
- voice transcripts
- human overrides

## Core Workflow

1. Open the Gemma workspace.
2. Upload a file or speak to Gemma naturally.
3. Ask Gemma to interpret, summarize, explain, or reason about the material.
4. MMASION creates a blank linked monitor session and begins learning only from live events.
5. MMASION auto-selects internal agents based on what it sees.
6. Gemini validates the session in the background.
7. If the question or answer goes beyond the evidence, MMASION interrupts.
8. A human can decide in the Gemma tab what should happen next.
9. MMASION can generate a plain-language explanation after enough grounded context exists.

## Internal Monitoring Agents

MMASION dynamically activates specialized agents depending on the session:

- `Conversation Monitor`
- `Evidence Scope Agent`
- `Action Guard`
- `Document Intake Agent`
- `Vendor Risk Agent`
- `Data Governance Agent`
- `Voice Supervisor`
- `Human Checkpoint Agent`
- `Policy Counsel Agent`

These are internal supervision roles, not separate user-facing services.

## Key Features

### Passive supervision

MMASION does not require a complete prewritten brief before the conversation starts.

Each new Gemma chat begins blank, and MMASION infers context from:

- uploaded file contents
- user turns
- Gemma replies
- session behavior over time

### Worker and monitor separation

The assistant doing the work and the system validating the work are intentionally separate.

That makes the architecture easier to explain and more trustworthy:

- visible worker UI
- independent trust layer
- live intervention before output is relied on

### File extraction

The app extracts uploaded content server-side so both Gemma and MMASION can reason over it.

Supported now:

- `.xlsx`
- `.xls`
- `.csv`
- `.json`
- `.txt`
- `.md`

### Voice path

Voice is available through:

- browser-side capture
- server-side Gemini-based transcription
- browser fallback when server audio is throttled or unavailable

The product also includes a `Stop voice` control for playback interruption.

### Live intervention

MMASION can:

- warn
- pause
- stop
- request a human decision
- inject a follow-up message back into the Gemma chat

### Plain-language explanation

The monitor can generate a simpler explainer after observing enough of the session.

That path is built around Gemini-powered explanation generation and interleaved output blocks.

## Example Scenarios

### NYC transparency workflow

Use a reporting schema or data dictionary and ask Gemma to:

- explain what disclosure fields mean
- summarize what is missing
- translate technical government language into resident-safe plain English

MMASION can then:

- watch for missing reporting context
- detect when Gemma overstates what the source supports
- produce a plain-language explanation

### Finance workflow

Upload a spreadsheet like a dividends CSV and ask Gemma something intentionally unsupported, such as:

- "Using only this file, tell me Mastercard's 2023 revenue."
- "Calculate total return from this dividends-only file."
- "Tell me the stock price from this dataset."

MMASION should step in because the file does not contain that metric.

### Grounded refusal workflow

If Gemma correctly refuses to invent a number or unsupported claim, MMASION can reinforce that grounded behavior with a short follow-up message.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system diagram and high-level architecture notes.

Key components:

- Gemma workspace
- MMASION monitor
- session event stream
- session monitor
- Gemini reasoner
- Google audio bridge
- file extraction layer
- persistence store

## Technology Stack

### Application

- TypeScript
- Node.js
- lightweight custom server
- embedded HTML/CSS/JS frontends for both tabs

### Models

- Gemma 12B through Ollama
- Gemini 2.5 Flash for monitoring and explanation paths

### Google path

- Gemini API
- Vertex-style provider abstraction
- Speech-to-Text / Text-to-Speech adapters
- Cloud Run deployment scaffolding
- BigQuery schema scaffolding
- Document AI planned path
- Gemini Live API planned path

## Repository Structure

```text
src/
  chat-ui.ts
  ui.ts
  server.ts
  session-monitor.ts
  transparency-explainer.ts
  google-audio.ts
  file-extraction.ts
  monitor-reasoner.ts
  vertex-session-reasoner.ts
  compliance-schema.ts
  providers/

docs/
  ARCHITECTURE.md
  BIGQUERY_SCHEMA.sql
  FUTURE_SECURITY_SCOPE.md
  NYC_TRANSPARENCY_ROADMAP.md
  security/

scripts/
  deploy-cloudrun.ps1
  setup-bigquery.ps1
```

## Local Setup

### Prerequisites

- Node.js
- Ollama
- `gemma3:12b` pulled locally
- optional Gemini API key
- optional Google access token for server-side speech and TTS

### Install dependencies

```bash
npm install
```

### Create your local environment file

```bash
copy .env.example .env
```

### Minimum local configuration

```env
MMASION_PROVIDER=ollama
MMASION_OLLAMA_MODEL=gemma3:12b
MMASION_MONITOR_PROVIDER=auto
GEMINI_API_KEY=your_key_here
```

### Start the app

```bash
npm run dev
```

Then open:

- `http://localhost:4173/gemma`
- `http://localhost:4173/`

## Environment Variables

See [.env.example](.env.example).

Key variables:

- `MMASION_PROVIDER`
- `MMASION_OLLAMA_MODEL`
- `MMASION_MONITOR_PROVIDER`
- `GEMINI_API_KEY`
- `MMASION_GEMINI_API_KEY`
- `MMASION_VERTEX_MODEL`
- `MMASION_VERTEX_LOCATION`
- `MMASION_VERTEX_PROJECT_ID`
- `MMASION_VERTEX_ACCESS_TOKEN`
- `MMASION_GOOGLE_ACCESS_TOKEN`
- `MMASION_TTS_VOICE_NAME`

## Available Scripts

```bash
npm run dev
npm run build
npm test
npm start
```

## Main Routes

### Frontend routes

- `GET /gemma`
- `GET /`

### Core APIs

- `GET /api/system`
- `GET /api/sessions`
- `POST /api/sessions`
- `GET /api/sessions/:id`
- `POST /api/sessions/:id/events`
- `POST /api/sessions/:id/intervention`
- `POST /api/gemma-chat`
- `POST /api/extract-file`
- `POST /api/audio/transcribe`
- `POST /api/audio/speak`

## Testing

Run:

```bash
npm test
npm run build
```

Current coverage includes:

- spreadsheet extraction
- session monitoring
- retry and escalation behavior
- human override flow
- supervisor orchestration logic

## Demo Flow

### Recommended demo

1. Open the Gemma tab.
2. Upload a spreadsheet or document.
3. Ask Gemma a normal grounded question.
4. Ask Gemma an intentionally unsupported question.
5. Show MMASION reacting in the monitor tab.
6. Show MMASION jumping into the Gemma chat.
7. Resolve the checkpoint or let MMASION validate a grounded refusal.

### Example finance prompt

> Using only this file, tell me Mastercard's stock price and 2023 revenue.

That should be blocked or constrained because the dataset does not support those metrics.

## Google Cloud Alignment

This repo is built to align with a Google-native path without requiring a full cloud deployment on day one.

### Actively used now

- `Gemini API` for passive monitoring and explanation

### Adapter-ready now

- server-side speech transcription
- server-side text-to-speech path
- Vertex-style monitor provider selection

### Scaffolded for deployment

- [Dockerfile](Dockerfile)
- [cloudrun.yaml](cloudrun.yaml)
- [docs/BIGQUERY_SCHEMA.sql](docs/BIGQUERY_SCHEMA.sql)
- [scripts/deploy-cloudrun.ps1](scripts/deploy-cloudrun.ps1)
- [scripts/setup-bigquery.ps1](scripts/setup-bigquery.ps1)

## Future Enterprise Security Scope

The repository now includes a documented future-scope security hardening track for enterprise readiness.

Planned deliverables:

- VAPT test case library
- Word / PDF export path for test cases
- Garak configuration plan
- prompt injection payload library targeting MMASION agents
- VAPT slide outline for enterprise buyers
- OPA shadow policy starter

See:

- [docs/FUTURE_SECURITY_SCOPE.md](docs/FUTURE_SECURITY_SCOPE.md)
- [docs/security/VAPT_TEST_CASE_LIBRARY.md](docs/security/VAPT_TEST_CASE_LIBRARY.md)
- [docs/security/GARAK_CONFIG_PLAN.md](docs/security/GARAK_CONFIG_PLAN.md)
- [docs/security/PROMPT_INJECTION_LIBRARY.md](docs/security/PROMPT_INJECTION_LIBRARY.md)
- [docs/security/OPA_SHADOW_POLICY_STARTER.md](docs/security/OPA_SHADOW_POLICY_STARTER.md)
- [docs/security/VAPT_SLIDE_OUTLINE.md](docs/security/VAPT_SLIDE_OUTLINE.md)

## Current Limitations

This is a working prototype, not a finished production platform.

Current limitations:

- local JSON persistence instead of a full database
- Gemini audio can still be rate-limited
- browser-based UI state is intentionally lightweight
- not all Google Cloud paths are fully productionized yet
- some monitoring heuristics are still rule-based rather than fully model-driven

## Roadmap

### Short-term

- stronger live voice path
- cleaner intervention phrasing
- Cloud Run deployment proof
- BigQuery event logging

### Medium-term

- Document AI ingestion
- Gemini Live API integration
- richer multimodal explanation output
- stronger model separation between worker and verifier

### Long-term

- multi-tenant platformization
- richer policy packs
- deeper audit analytics
- more enterprise deployment controls

## Public Repo Safety

Before publishing:

- keep `.env` untracked
- only commit `.env.example`
- rotate local API keys and tokens if they were ever used in development
- avoid committing private uploads or personal data

## Contact

- Aditya Sakhale - `axs10415@nyu.edu`
- Yash Sharma - `ys6587@nyu.edu`
