🧠 MMASION
Real-Time AI Supervision & Assurance Layer

Team
- Aditya Sakhale - axs10415@nyu.edu
- Yash Sharma - ys6587@nyu.edu

MMASION is a live AI supervision system built around a simple idea:

Let one model do the work.
Let another system watch it in real time.
Intervene before unsafe or unsupported output becomes truth.

⚡ Core Concept

MMASION introduces a separation of responsibilities:

Role	System
Worker (visible)	Gemma 12B
Monitor (passive)	Gemini 2.5 Flash
Orchestration	MMASION

MMASION is not another model.
It is a control layer that supervises AI behavior as it happens.

🎯 What This Project Does

MMASION observes a live AI session and decides:

Continue
Warn
Pause
Escalate to human
Stop execution

It monitors:

User prompts
Model responses
Uploaded files
Voice input
Session behavior

All in real time.

🧩 Product Experience

The system is intentionally split into two interfaces:

🗂 /gemma — Worker Interface
Chat with AI
Upload files
Use voice input
Standard assistant experience
🧠 / — MMASION Monitor
Live reasoning feed
Intervention state
Risk signals
Operator controls
Plain-language explanations

The separation is the product.

🧵 Product Story

MMASION supports the “Audit the Algorithm” paradigm:

Make AI systems observable
Detect when evidence is incomplete
Prevent hallucinated conclusions
Translate outputs into safe, human-readable explanations
💡 Why This Is Different

Most AI demos stop at:

“The model answered.”

MMASION focuses on:

Before trust is granted
Key Differentiators
Real-time supervision (not post-hoc)
Multi-model architecture (not single LLM)
Multi-agent monitoring (not generic validation)
Built-in human checkpoints (not optional)

Gemma does the work. MMASION helps you trust the work.

⚙️ Current Runtime
🤖 Worker Model
Local Ollama runtime
gemma3:12b
🧠 Monitor Model
gemini-2.5-flash (default)
Used for validation + explanation
🎙 Voice
Browser capture
Server-side transcription
Fallback support
💾 Storage
Local JSON persistence
☁️ Deployment Ready
Cloud Run configs
BigQuery schema
Deployment scripts
🔄 Core Workflow
Open /gemma
Upload file or speak naturally
Ask for analysis or explanation
MMASION starts monitoring silently
Internal agents activate dynamically
Gemini validates in the background
If output exceeds evidence → intervention
Human decision if required
MMASION generates safe explanation
🤖 Internal Monitoring Agents

MMASION dynamically activates specialized agents:

Conversation Monitor
Evidence Scope Agent
Action Guard
Document Intake Agent
Vendor Risk Agent
Data Governance Agent
Voice Supervisor
Human Checkpoint Agent
Policy Counsel Agent

These are internal roles, not separate services.

✨ Key Features
1. Passive Supervision

No pre-configuration required.
MMASION learns context from the session itself.

2. Worker + Monitor Separation

Decoupled architecture enables:

independent validation
trust layer abstraction
real-time control
3. File Intelligence

Supports:

.xlsx, .csv, .json, .txt, .md

Extracted server-side for shared reasoning.

4. Voice Interface
Capture → Transcribe → Reason
Built-in fallback system
Playback control included
5. Live Intervention

MMASION can:

Inject messages
Pause execution
Request human input
Block unsafe conclusions
6. Plain-Language Explanation Engine
Converts technical output → human-friendly explanation
Powered by Gemini
Triggered after sufficient grounding
🧪 Example Scenarios
🏛 NYC Transparency Use Case
Interpret compliance schemas
Detect missing reporting fields
Translate government language
💰 Finance Use Case

Upload a dividends dataset and ask:

“Tell me Mastercard’s 2023 revenue.”

MMASION blocks the response because:

the dataset does not contain that metric
🚫 Grounded Refusal Reinforcement

If the model correctly refuses:

MMASION reinforces that behavior
instead of letting the user override it blindly

🏗 Architecture

See full diagram:
📄 docs/ARCHITECTURE.md

High-Level Components
Gemma Workspace
MMASION Monitor
Event Stream
Session Monitor
Gemini Reasoner
Audio Bridge
File Extraction Layer
Persistence Store
🛠 Tech Stack
Application
TypeScript
Node.js
Custom lightweight server
Models
Gemma (Ollama)
Gemini API
Google Cloud Path
Cloud Run
BigQuery
Speech APIs
Vertex-compatible abstraction
📁 Repository Structure
src/
docs/
scripts/

(Full structure in repo)

⚡ Local Setup
Prerequisites
Node.js
Ollama
gemma3:12b
Install
npm install
Configure
copy .env.example .env
MMASION_PROVIDER=ollama
MMASION_OLLAMA_MODEL=gemma3:12b
MMASION_MONITOR_PROVIDER=auto
GEMINI_API_KEY=your_key_here
Run
npm run dev

Open:

http://localhost:4173/gemma
http://localhost:4173/
🧪 Demo Flow
Upload dataset
Ask grounded question
Ask unsupported question
Show intervention
Show human checkpoint
☁️ Google Cloud Alignment
Active
Gemini API
Ready
Speech / TTS
Vertex abstraction
Scaffolded
Cloud Run
BigQuery
Deployment scripts
⚠️ Current Limitations
Local storage only
Partial cloud integration
Some rule-based monitoring
UI intentionally lightweight
🗺 Roadmap
Short-Term
Voice improvements
Better intervention UX
Cloud deployment proof
Mid-Term
Document AI
Gemini Live API
Multimodal outputs
Long-Term
Multi-tenant platform
Policy packs
Enterprise audit tooling
🔐 Safety Before Publishing
Do not commit .env
Rotate API keys
Remove sensitive data
👤 Maintainer

Aditya Sakhale
Replace email before publishing
