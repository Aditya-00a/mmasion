# Audit the Algorithm

MMASION is being shaped into an NYC Government AI Transparency Tool.

## Product Story

Residents should be able to:

- ask what algorithmic tools a city agency uses
- understand what those tools do in plain language
- see what decisions those tools affect
- see where disclosure or compliance reporting is incomplete

Operators should be able to:

- run Gemma as the visible assistant
- let MMASION monitor the interaction passively
- pause risky or overconfident explanations
- generate a Gemini-based resident explainer with interleaved output blocks

## Current Architecture

- `/gemma`
  - visible worker chat
  - local Gemma 12B via Ollama
  - supports uploads and browser-level voice input/output
- `/`
  - MMASION passive supervision console
  - auto-selects internal monitoring agents
  - maps content to the NYC algorithmic-tools reporting schema
  - generates resident explainers through Gemini when a key is available

## Google-Native Path

- Gemini API / Vertex AI
  - passive monitoring
  - resident explainer generation
  - future interleaved multimodal outputs
- Gemini Live API
  - real-time voice agent
  - interruption-aware conversation
- Speech-to-Text / Text-to-Speech
  - production-grade audio I/O
- Document AI
  - PDF and form extraction
- BigQuery
  - audit analytics and reporting
- Agent Studio
  - future supervised multi-agent execution

## Demo Narrative

1. Start a conversation in the Gemma tab.
2. Upload a disclosure or tool description.
3. Ask Gemma to explain it for NYC residents.
4. Open MMASION in a separate tab and show passive monitoring.
5. Trigger a risky step such as premature approval or missing disclosure coverage.
6. Show MMASION pausing the workflow.
7. Generate the resident explainer with Gemini interleaved output blocks.

## Most Important Next Steps

- replace browser voice fallback with Google speech services
- add true file extraction for PDFs and images
- add deployment on Google Cloud Run
- add BigQuery-backed session analytics
- add a polished architecture diagram for the final submission
