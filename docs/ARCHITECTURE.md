# Architecture

```mermaid
flowchart LR
    U["Resident / operator"] --> G["Gemma workspace<br/>Visible chat, uploads, voice"]
    U --> M["MMASION monitor<br/>Independent tab"]

    G -->|chat turns, uploads, audio transcripts| S["Session event stream"]
    S --> R["Smart router"]
    S --> A["Auto-selected live agents"]
    A --> C["Compliance coverage engine<br/>NYC algorithm reporting schema"]
    A --> V["Passive Gemini monitor<br/>Validation and intervention"]

    C --> I["Intervention engine"]
    V --> I

    I -->|allow / warn / pause / stop| M
    M -->|human checkpoint| G

    S --> E["Gemini resident explainer<br/>Interleaved output blocks"]
    E --> M

    G --> X["Excel / CSV / document extraction"]
    X --> S

    M --> BQ["BigQuery audit tables"]
    M --> CR["Cloud Run service"]
    M --> GS["Google speech adapters<br/>STT / TTS"]
```

## Main Surfaces

- `/gemma`
  - visible worker UI
  - Gemma 12B via Ollama
  - file uploads
  - voice input/output hooks
- `/`
  - MMASION supervision console
  - resident explainer generation
  - intervention review
  - session analytics

## Google-Native Runtime Path

- Gemini API / Vertex AI
  - passive monitor
  - resident explainer
  - future multimodal interleaving
- Speech-to-Text / Text-to-Speech
  - audio transcription and playback
- BigQuery
  - event telemetry and audit analytics
- Cloud Run
  - public demo deployment target

## Current Local-First Runtime

- Gemma worker: local Ollama
- Monitor: Gemini API when configured, deterministic fallback otherwise
- Storage: local JSON stores for runs and sessions
- Upload extraction: server-side spreadsheet and text parsing
