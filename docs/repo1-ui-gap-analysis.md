# AI Safety Builder — Repo 1 UI Gap Analysis & Master Specification Alignment

**Document Version**: 1.0.0-phase0  
**Audit Date**: October 2026  
**Auditor**: Antigravity Assistant (Gemini 3.6)  
**Target Repository**: `Repo 1 — ai-safety-builder`  
**Reference Specification**: AI Safety Builder Master Product & Participant Journey Specification  

---

## 1. Executive Summary

Repo 1 is the participant-facing, client-side web application for the **Industrial AI Safety Builder** workshop. It enables non-coding participants to visually wire safety workflows, teach computer vision models with real data, dispatch training jobs to an external compute engine (Repo 2), test model accuracy against safety decisions, stress-test workflows with adversarial conditions, and iterate to improve industrial safety models.

This audit evaluates the codebase as it exists prior to Phase 1 alignment. The codebase possesses a solid foundation built with **Vite, React 18, TypeScript, Tailwind CSS, React Flow, and Vitest**. All 37 existing unit and component tests pass, and the TypeScript build succeeds with zero errors.

However, significant gaps exist between the current prototype and the Master Specification:
- The persistent application shell lacks the dedicated **Project Status Panel**, **Persistent Workshop Disclaimer**, and a centralized **Journey State Machine** (LOCKED / AVAILABLE / CURRENT / COMPLETED).
- Navigation has only 5 numbered steps in the sidebar (`01 BUILD` through `05 CHALLENGE`), completely omitting `06 IMPROVE` and `MY AI`.
- The Header hardcodes the project title (`Industrial PPE Vision`), failing to bind to active project state.
- Route structures lack `/start`, `/project/new`, `/project/:id`, `/improve`, and `/my-ai`.
- The Project object lacks core master fields: `mission`, `aiGoal`, and `currentStep`.
- Repo 1 contains zero unauthorized YOLO/PyTorch training or weight logic (properly separating frontend from Repo 2), but the engine connection abstraction needs complete decoupling and strict offline state reporting without fake progress.

---

## 2. Master Gap Matrix

| Area | Existing | Required | Status | Action |
| :--- | :--- | :--- | :--- | :--- |
| **Start** | Root (`/`) renders Dashboard with cards directly | Simple dedicated landing page (`/start`) with CTA "START", project resume option, no advanced UI | **Missing** | Keep `/` accessible, add `/start` route, decouple onboarding |
| **Project** | Hardcoded initial project in `ProjectContext` (`proj-helmet-01`) | Dedicated flow (`/project/new`) capturing Name, Safety Problem, AI Goal, Mission | **Partial** | Extend `Project` model with `mission`, `aiGoal`, `currentStep`; add creation route |
| **Mission** | Implicit in PPE default | 6 formal mission templates: PPE, FIRE, SPILL, RESTRICTED AREA, POSTURE, CUSTOM | **Missing** | Add mission type definitions and template catalogs in Phase 3 |
| **Shell** | `AppLayout` with `Sidebar` and `Header` | Unified shell with Header, ProjectIndicator, EngineStatus, JourneySidebar, ProjectStatusPanel, WorkshopDisclaimer | **Needs Modification** | Upgrade `AppLayout` to `ApplicationShell` with disclaimer, project status, responsive mobile drawer |
| **Build** | React Flow canvas with NodePalette, PropertiesPanel, 5 categories (Input, Model, Condition, Decision, Action) | Visual drag-and-drop workflow builder: Components -> Canvas -> Properties; validate & evaluate | **Present (Keep & Align)** | Keep working React Flow implementation; wrap in new shell; bind model node to active model |
| **Teach** | Classes management, image upload, camera capture modal, threshold checks (10/class) | Class creation, camera capture, file upload, thumbnail grid, dataset summary, readiness check | **Present (Keep & Align)** | Keep working dataset tools; ensure clean state sync with project |
| **Train** | Training dispatch card, hyperparameters (epochs, imageSize), status polling | Simple training UI consuming real Repo 2 jobs; no low-level PyTorch/CUDA options exposed; no fake progress | **Present (Keep & Align)** | Preserve simple interface; verify clean polling and strict real-status reporting |
| **Test** | Test page with image upload, camera, inference dispatch, prediction vs decision breakdown | Dual-tier evaluation: Model Perception (bounding boxes, confidence) != Workflow Decision (SAFE/UNSAFE) | **Present (Keep & Align)** | Preserve distinct perception vs decision architecture; wrap in new shell |
| **Challenge** | Adversarial stress test scenarios (low light, angle, glare, blur), failure logging | Break Your AI test suite with expected vs actual, pass/fail, and weakness logging | **Present (Keep & Align)** | Keep challenge runner; ensure failed cases can flow into Improve loop |
| **Improve** | Absent (Workflow cards redirect to `/teach`) | Dedicated `/improve` route: Challenge Failure -> Observed Weakness -> Add Data -> Teach loop | **Missing** | Create `/improve` route and screen placeholder linking failures to dataset refinement |
| **My AI** | Absent | Dedicated `/my-ai` route: Comprehensive project presentation summarizing Workflow, Dataset, Model, Challenges, Improvements | **Missing** | Create `/my-ai` route placeholder and export architecture |
| **Persistence** | `localStorage` for project, workflow, dataset classes, training config, active model | Local browser persistence resilient to page refresh and restart | **Present (Keep & Align)** | Keep localStorage keys; plan unified storage schema in Phase 19 |
| **Engine** | REST client (`ApiClient`) targeting `VITE_MODEL_API_URL` (`/api/v1/health`, `/jobs`, `/predict`) | Clean typed `EngineConnector` boundary; zero duplicate ML code; robust offline handling | **Present (Keep & Align)** | Clean abstraction already in place; formalize contract and error recovery in Phase 5 |
| **Errors** | Basic `ErrorBoundary`, alert banners, `NetworkErrorState` | Participant-friendly guidance for Engine Offline, Dataset Incomplete, Invalid Workflow | **Partial** | Standardize reusable feedback patterns across all routes |
| **Journey Navigation** | Static links (`Dashboard`, `01 Build` .. `05 Challenge`) in `Sidebar` | Guided 6-stage journey: `01 BUILD`, `02 TEACH`, `03 TRAIN`, `04 TEST`, `05 CHALLENGE`, `06 IMPROVE` with state machine | **Needs Modification** | Add `06 IMPROVE`, implement step states (`LOCKED`, `AVAILABLE`, `CURRENT`, `COMPLETED`), retain accessibility for completed steps |
| **Journey State** | `ProjectModuleStatus` ('not_started' \| 'in_progress' \| 'completed' \| 'blocked') | Centralized journey state tracking `currentStep`, per-step prerequisite validation, step locks | **Missing** | Implement `JourneyContext` / Journey state in `ProjectContext` with deterministic transitions |
| **Project Status Panel** | Rendered inside Dashboard page content only | Persistent sidebar panel showing: Project Name, Workflow (Valid), Dataset (Count), Model (Trained), Engine (Connected), Last Training Run, Current Model | **Needs Relocation & Alignment** | Move to lower section of `Sidebar` in the application shell; bind directly to project state; show empty states (no fake data) |
| **Workshop Disclaimer** | Absent | Persistent footer: *"Workshop model only — not for production safety control"* across all application views | **Missing** | Add `WorkshopDisclaimer` component permanently anchored to the shell |
| **Header Context** | Hardcoded title `"Industrial PPE Vision"` and static subtitle | Dynamic project context: `Project: [projectName]` driven by active state, with fallback for unset | **Needs Modification** | Bind Header directly to `useProject().project.name` |
| **Engine Status Model** | Boolean `isOnline`, `isChecking` in `useModelEngineHealth` | 5-state model: `UNKNOWN`, `CONNECTED`, `OFFLINE`, `CONNECTING`, `ERROR` with visual and accessible cues | **Needs Modification** | Upgrade engine status types, add accessible indicators (not color-only), show explicit OFFLINE |

---

## 3. Architecture Map

### 3.1 Current Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│                              CURRENT REPO 1                            │
└────────────────────────────────────────────────────────────────────────┘
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                 [ AppProviders ]            [ ErrorBoundary ]
                         │
                         ▼
                 [ ProjectProvider ] (Monolithic State: Project, Workflow, Dataset,
                         │            Training, Model, Testing, Challenge in localStorage)
                         ▼
                 [ BrowserRouter ]
                         │
                         ▼
                   [ AppLayout ]
                   ├── Header (Hardcoded Project Title, Binary Engine Check)
                   ├── Sidebar (Static 5 NavLinks, Missing 06 Improve & Status Panel)
                   └── Main Content (<Outlet />)
                         ├── / (DashboardPage)
                         ├── /build (BuildPage with React Flow)
                         ├── /teach (TeachPage with Dataset Management)
                         ├── /train (TrainPage with Training Dispatch)
                         ├── /test (TestPage with Dual-tier Inference)
                         ├── /challenge (ChallengePage with Stress Tests)
                         └── * (NotFoundPage)
                                      │
                                      ▼
                        [ Services & API Client ]
                        ├── ApiClient (fetch + abort timeout)
                        ├── WorkflowValidator & WorkflowEvaluator
                        └── ModelEngineService (Stubbed / REST calls)
                                      │
                                      ▼
                      [ Repo 2: External Model Engine ]
```

### 3.2 Target Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│                               TARGET REPO 1                            │
└────────────────────────────────────────────────────────────────────────┘
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                 [ AppProviders ]            [ ErrorBoundary ]
                         │
                         ├─────────────────────────────────────────┐
                         ▼                                         ▼
                 [ ProjectProvider ]                       [ JourneyProvider ]
                 (Project Entity, Mission,                 (6-Stage State Machine:
                  Workflow, Dataset, Model,                 LOCKED, AVAILABLE,
                  Runs, Tests, Challenges)                  CURRENT, COMPLETED)
                         │                                         │
                         └────────────────────┬────────────────────┘
                                              ▼
                                    [ BrowserRouter ]
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
                 [ Standalone Routes ]                     [ ApplicationShell ]
                 ├── /start (Landing / QR)                 ├── Persistent Header
                 └── /project/new (Creation)               │   ├── App Title
                                                           │   ├── State-Driven Project Context
                                                           │   └── 5-State Engine Indicator
                                                           ├── JourneySidebar
                                                           │   ├── 01 BUILD (State-Aware)
                                                           │   ├── 02 TEACH (State-Aware)
                                                           │   ├── 03 TRAIN (State-Aware)
                                                           │   ├── 04 TEST (State-Aware)
                                                           │   ├── 05 CHALLENGE (State-Aware)
                                                           │   └── 06 IMPROVE (State-Aware)
                                                           ├── ProjectStatusPanel
                                                           │   └── Real State (No Faked Metrics)
                                                           ├── MainContentArea (<Outlet />)
                                                           │   ├── /project/:id (Dashboard)
                                                           │   ├── /build (Visual Workflow)
                                                           │   ├── /teach (Dataset Teaching)
                                                           │   ├── /train (Compute Dispatch)
                                                           │   ├── /test (Perception vs Decision)
                                                           │   ├── /challenge (Adversarial Tests)
                                                           │   ├── /improve (Improvement Loop)
                                                           │   └── /my-ai (Final Presentation)
                                                           └── WorkshopDisclaimer (Persistent Footer)
                                                                       │
                                                                       ▼
                                                           [ EngineConnector Abstraction ]
                                                           (Health, Model Catalog, Dispatch,
                                                            Status Polling, Inference)
                                                                       │
                                                                       ▼
                                                       [ Repo 2: External Model Engine ]
```

---

## 4. End-to-End Data Flow Map

```
[ Participant Action ]
       │
       ▼
 1. QR / Start ─────────► [ Project Creation Flow ]
                               │
                               ▼
 2. Initialize ─────────► [ Project Entity ]
                               │   id, name, safetyProblem, aiGoal, mission, currentStep
                               ▼
 3. 01 BUILD ───────────► [ Visual Workflow Model ]
                               │   Nodes (Camera, Model, Condition, Decision, Action),
                               │   Connections, Validation Result
                               ▼
 4. 02 TEACH ───────────► [ Safety Dataset Classes ]
                               │   Class definitions, Images (data URLs / files),
                               │   Readiness Verification (≥ 10 examples/class)
                               ▼
 5. 03 TRAIN ───────────► [ Training Request Payload ]
                               │   Multipart package (Manifest + Images + Hyperparameters)
                               ▼
                           [ Engine Connector ]
                               │   HTTP POST /api/v1/training/jobs
                               ▼
                      ┌─────────────────────────────────┐
                      │ REPO 2: External Model Engine   │
                      │ (Training YOLO26n on PyTorch)   │
                      └─────────────────────────────────┘
                               │
                               ▼
                           [ Status Polling Loop ]
                               │   HTTP GET /api/v1/training/jobs/{jobId}
                               │   queued ──► preparing ──► training ──► completed
                               ▼
 6. Trained Model ──────► [ Model Registration ]
                               │   modelId, epochs, metrics (Precision, Recall, mAP50)
                               ▼
 7. 04 TEST ────────────► [ Inspection & Prediction ]
                               │   Image Binary ──► POST /api/v1/inference/predict
                               │   Engine Return: Detections (className, confidence, bbox)
                               ▼
                           [ Workflow Decision Engine ]
                               │   Perception ≠ Safety Decision
                               │   Safe / Warning / Unsafe Action Outcome
                               ▼
 8. 05 CHALLENGE ───────► [ Adversarial Stress Suite ]
                               │   Low light, Glare, Extreme Angle, Blur
                               │   Compare Expected vs Decision ──► Log Failures
                               ▼
 9. 06 IMPROVE ─────────► [ Learning & Retraining Loop ]
                               │   Weakness Analysis ──► Add Failed Samples to Dataset
                               │   Return to 02 TEACH ──► Retrain ──► Retest
                               ▼
10. MY AI ──────────────► [ Project Presentation ]
                                   Executive summary of architecture, data, runs,
                                   stress results, and verified safety reliability
```

---

## 5. Security & Isolation Observations

1. **Model Logic Isolation**:
   - Verification confirmed: Repo 1 contains **zero** PyTorch dependencies, **zero** Ultralytics imports, **zero** `.pt` binary weights, and **zero** local training scripts.
   - All references to YOLO are purely metadata strings or contract identifiers.
2. **Secret Exposure**:
   - Zero hardcoded API keys or cloud credentials in source code.
   - Environment variables are safely accessed via centralized `src/config/env.ts`.
3. **Execution Safety**:
   - No `eval()`, `Function()`, or unsafe dynamic code execution.
   - React Flow safely sanitizes SVG node layouts without `dangerouslySetInnerHTML`.
4. **Data Hygiene**:
   - Dataset image previews are managed via standard Object URLs and Base64 strings.
   - Payload limits are enforced on the client side (15 MB maximum for test images).

---

## 6. Recommendations for Phase 1

1. **Preserve All Existing Functional Modules**: Do not replace the rich, working `/build`, `/teach`, `/train`, `/test`, and `/challenge` pages with mock stubs.
2. **Build the Permanent ApplicationShell**:
   - Upgrade `AppLayout` into `ApplicationShell`.
   - Update `Header` to consume dynamic project state (`Project: [name]`) and display standard engine status.
   - Update `Sidebar` to include all 6 journey steps (`01 BUILD` to `06 IMPROVE`).
   - Add state-machine indicators for step status: `LOCKED`, `AVAILABLE`, `CURRENT`, `COMPLETED`. Ensure completed stages remain clickable and accessible.
   - Embed the **Project Status Panel** in the lower section of the sidebar showing real state.
   - Add the permanent **Workshop Disclaimer** in the persistent footer.
3. **Establish Required Routes & Placeholders**:
   - Add placeholders for `/start`, `/project/new`, `/improve`, and `/my-ai`.
   - Ensure small-screen / mobile responsive drawer navigation functions cleanly.
   - Add comprehensive tests covering all 12 Phase 1 acceptance criteria.
