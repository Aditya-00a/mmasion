# MMASION

MMASION is a live AI supervision system built around a simple idea:

- let a visible assistant do the work
- let a second intelligence layer monitor that work in real time
- interrupt the workflow before unsupported or risky output becomes the final answer

In this repository, the visible assistant is a local Gemma workspace and the passive monitor is MMASION.

For the current demo:

- `Gemma 12B` is the worker the user talks to
- `Gemini` is the background monitor and explainer
- `MMASION` is the orchestration, intervention, and human-checkpoint layer

This project is designed to be public GitHub-ready, demoable, and extensible into a fuller Google Cloud-native deployment.

## What This Project Does

MMASION supervises an ongoing AI session while it is happening.

The product is intentionally split into two tabs:

- `/gemma`
  - the visible assistant workspace
  - file uploads
  - voice input
  - normal chat interaction
- `/`
  - the MMASION monitor
  - live reasoning feed
  - intervention state
  - operator controls
  - resident-friendly explanation generation

That separation is the point.

The user interacts normally with Gemma, while MMASION passively observes:

- user messages
- model replies
- uploaded files
- voice transcripts
- human overrides

MMASION then decides whether the workflow should:

- continue
- warn
- pause
- ask a human
- stop

## Product Story

The project is built to support the `Audit the Algorithm` narrative:

an interactive system that helps people understand government or enterprise AI workflows, detect when the available evidence is incomplete, and translate technical output into safer plain-language explanations.

In the hackathon framing, that becomes:

- Gemma is the visible assistant
- MMASION is the live oversight layer
- Gemini powers passive validation and explanation
- uploaded documents and spreadsheets become observable context
- humans stay in the loop when the model starts drifting beyond the evidence

The current repository also works beyond the NYC transparency use case.

For example, the same monitor can supervise:

- finance spreadsheet analysis
- due diligence review
- document summarization
- policy-sensitive Q&A
- resident-safe explainers from dense source material

## Why This Is Different

Most demos stop at “the model answered.”

MMASION is about what happens before trust is granted.

The system is built around:

- live supervision instead of after-the-fact review
- multi-model execution instead of one model doing everything
- multi-agent internal monitoring instead of one generic verifier
- human checkpoints as part of the runtime, not a manual add-on

The core pitch is:

`Gemma does the work. MMASION helps you trust the work.`

## Current Runtime

### Worker model

- Local Ollama runtime
- Default worker model: `gemma3:12b`

### Monitor / explanation model

- `Gemini API` when configured
- current default monitor model: `gemini-2.5-flash`

### Voice

- browser capture plus server-side audio transcription path
- graceful fallback when Gemini audio is rate-limited

### Storage

- local JSON persistence for sessions and audit runs

### Deployment scaffolding

- Cloud Run config
- BigQuery schema
- PowerShell deployment scripts

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

MMASION auto-selects specialized internal agents depending on the session:

- `Conversation Monitor`
- `Evidence Scope Agent`
- `Action Guard`
- `Document Intake Agent`
- `Vendor Risk Agent`
- `Data Governance Agent`
- `Voice Supervisor`
- `Human Checkpoint Agent`
- `Policy Counsel Agent`

These are not separate browser tabs. They are internal supervision roles inside MMASION.

## Key Features

### 1. Passive supervision

MMASION does not need a full prewritten brief before the conversation starts.

Each new Gemma chat begins blank, and MMASION infers the context from:

- uploaded file contents
- user turns
- Gemma replies
- session behavior over time

### 2. Separate worker and monitor

The assistant doing the work and the system validating the work are intentionally separate.

That lets the product demonstrate:

- a visible worker UI
- an independent trust layer
- live intervention before output is relied on

### 3. File extraction

The app extracts uploaded content server-side so both Gemma and MMASION can reason over it.

Supported now:

- `.xlsx`
- `.xls`
- `.csv`
- `.json`
- `.txt`
- `.md`
- text-like formats

### 4. Voice path

Voice is available through:

- browser-side capture
- server-side Gemini-based transcription path
- browser fallback when server audio is throttled or unavailable

The product also includes a `Stop voice` control for playback interruption.

### 5. Live intervention

MMASION can:

- warn
- pause
- stop
- request a human decision
- inject a follow-up message back into the Gemma chat

This is important because the monitor is not just a dashboard. It can affect the actual flow.

### 6. Resident-facing explanation path

The monitor can generate a simpler explainer after observing enough of the session.

That path is built around Gemini-powered explanation generation and interleaved output blocks.

## Example Scenarios

### NYC transparency workflow

Use a reporting schema or data dictionary and ask Gemma to:

- explain what the disclosure fields mean
- summarize what is missing
- translate technical government language into resident-safe plain English

MMASION can then:

- watch for missing reporting context
- detect when Gemma overstates what the source supports
- produce a plain-language explanation

### Finance workflow

Upload a spreadsheet like a dividends CSV and ask Gemma something intentionally unsupported, such as:

- “Using only this file, tell me Mastercard’s 2023 revenue.”
- “Calculate total return from this dividends-only file.”
- “Tell me the stock price from this dataset.”

MMASION should step in because the file does not contain that metric.

### Grounded refusal workflow

If Gemma correctly refuses to invent a number or unsupported claim, MMASION can reinforce that grounded behavior with a short follow-up message.

## Architecture

See [ARCHITECTURE.md](/C:/Ravendise/MMASION/docs/ARCHITECTURE.md) for the mermaid diagram and system map.

High-level architecture:

- `Gemma workspace`
  - visible assistant
- `MMASION monitor`
  - passive session observer
- `Session event stream`
  - user messages, model replies, uploads, voice
- `Session monitor`
  - routing, intervention, session status
- `Gemini reasoner`
  - passive supervision and explanation support
- `Google audio bridge`
  - transcription and TTS adapters
- `File extraction layer`
  - spreadsheet/text ingestion
- `Store`
  - local persisted sessions and runs

## Technology Stack

### App

- TypeScript
- Node.js
- lightweight custom server
- embedded HTML/CSS/JS frontends for both tabs

### Models

- `Gemma 12B` through Ollama
- `Gemini 2.5 Flash` for monitoring and explanation paths

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
  chat-ui.ts                  Gemma workspace UI
  ui.ts                       MMASION monitor UI
  server.ts                   HTTP server and API routes
  session-monitor.ts          Live monitoring, intervention, session state
  transparency-explainer.ts   Gemini-based plain-language explanation path
  google-audio.ts             Google/Gemini audio adapters
  file-extraction.ts          Spreadsheet and text extraction
  monitor-reasoner.ts         Monitor-provider wiring
  vertex-session-reasoner.ts  Gemini/Vertex passive reasoning path
  compliance-schema.ts        Schema/risk signals used in monitoring
  providers/
    ollama-provider.ts        Local worker model provider
    factory.ts                Provider selection

docs/
  ARCHITECTURE.md
  BIGQUERY_SCHEMA.sql
  NYC_TRANSPARENCY_ROADMAP.md

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

### Minimum local setup

For the main local demo, configure:

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

- [http://localhost:4173/gemma](http://localhost:4173/gemma)
- [http://localhost:4173/](http://localhost:4173/)

## Environment Variables

See [.env.example](/C:/Ravendise/MMASION/.env.example).

Important variables:

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

Current test coverage includes:

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

Upload a dividends CSV and ask:

> Using only this file, tell me Mastercard’s stock price and 2023 revenue.

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

- [Dockerfile](/C:/Ravendise/MMASION/Dockerfile)
- [cloudrun.yaml](/C:/Ravendise/MMASION/cloudrun.yaml)
- [BIGQUERY_SCHEMA.sql](/C:/Ravendise/MMASION/docs/BIGQUERY_SCHEMA.sql)
- [deploy-cloudrun.ps1](/C:/Ravendise/MMASION/scripts/deploy-cloudrun.ps1)
- [setup-bigquery.ps1](/C:/Ravendise/MMASION/scripts/setup-bigquery.ps1)

## Current Limitations

This is a working prototype, not a finished production platform.

Current limitations:

- local JSON persistence instead of a full database
- Gemini audio can still be rate-limited
- browser-based UI state is intentionally lightweight
- not all Google Cloud paths are fully productionized yet
- some monitoring heuristics are still rule-based rather than fully model-driven

## Roadmap

Short-term:

- stronger live voice path
- cleaner intervention phrasing
- Cloud Run deployment proof
- BigQuery event logging

Medium-term:

- Document AI ingestion
- Gemini Live API integration
- richer multimodal explanation output
- stronger model separation between worker and verifier

Long-term:

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

- Maintainer: Aditya Sakhale
- Email: `replace-with-your-public-email-before-publishing`

If you want the README to include your exact public email, replace the placeholder before pushing the repository.
