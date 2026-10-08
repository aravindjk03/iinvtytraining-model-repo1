# AI Safety Builder — Repo 1 Codebase File Inventory

**Document Version**: 1.0.0-phase0  
**Audit Date**: October 2026  
**Auditor**: Antigravity Assistant (Gemini 3.6)  

This inventory categorizes key application files within **Repo 1 (`ai-safety-builder`)**, detailing their current responsibilities, dependencies, and recommended action (`KEEP AS-IS`, `MINOR MODIFICATION`, `MAJOR MODIFICATION`, `REPLACE`, `NEW`).

---

## 1. Core Application & Routing

| File Path | Purpose | Dependencies / Used By | Classification | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/main.tsx` | Entrypoint bootstrap rendering `<App />` into DOM | `index.html`, `src/app/App.tsx` | **KEEP AS-IS** | Clean React 18 createRoot bootstrap |
| `src/app/App.tsx` | Top-level application component wrapping Providers and Routes | `AppProviders`, `AppRoutes` | **KEEP AS-IS** | Follows modular composition pattern |
| `src/app/routes.tsx` | Route definitions for React Router (`/`, `/build`, etc.) | Used by `App.tsx` and test suites | **MINOR MODIFICATION** | Add routes for `/start`, `/project/new`, `/project/:id`, `/improve`, `/my-ai` |
| `src/app/providers/AppProviders.tsx` | Global providers composition (ErrorBoundary, ProjectProvider, BrowserRouter) | Used by `App.tsx` | **MINOR MODIFICATION** | Provide JourneyProvider or expose journey state from ProjectProvider |

---

## 2. Shell & Layout Components

| File Path | Purpose | Dependencies / Used By | Classification | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/components/layout/AppLayout.tsx` | Current application layout wrapper | `routes.tsx`, `Sidebar`, `Header` | **MAJOR MODIFICATION** | Evolve into `ApplicationShell`; embed persistent `WorkshopDisclaimer`, wire responsive drawer |
| `src/components/navigation/Header.tsx` | Top navigation bar with page title and engine health modal | Used in `AppLayout` | **MINOR MODIFICATION** | Replace hardcoded project title with `project.name` from state; align 5-state engine indicator |
| `src/components/navigation/Sidebar.tsx` | Left navigation sidebar with step links | Used in `AppLayout` | **MAJOR MODIFICATION** | Add `06 IMPROVE`; integrate `ProjectStatusPanel`; implement step states (`LOCKED`, `AVAILABLE`, `CURRENT`, `COMPLETED`) |
| `src/components/navigation/NavigationItem.tsx` | Reusable sidebar navigation link | Used in `Sidebar` | **MINOR MODIFICATION** | Support lock icon, completed checkmark, disabled click on locked steps |
| `src/components/navigation/ProjectStatusPanel.tsx` | Dedicated sidebar project status panel | `Sidebar` | **NEW** | Shows real workflow, dataset, model, engine, run status without faking |
| `src/components/navigation/EngineStatusIndicator.tsx` | Visual indicator for engine connectivity | `Header`, `Sidebar` | **NEW / EXTRACT** | Encapsulates accessible 5-state connectivity visualization |
| `src/components/common/WorkshopDisclaimer.tsx` | Persistent workshop educational disclaimer | `AppLayout` / `ApplicationShell` | **NEW** | Mandated persistent warning: *"Workshop model only — not for production safety control"* |
| `src/components/common/ErrorBoundary.tsx` | Class component error boundary | `AppProviders` | **KEEP AS-IS** | Clean industrial-themed error recovery screen |

---

## 3. State Management & Context

| File Path | Purpose | Dependencies / Used By | Classification | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/context/ProjectContext.tsx` | Central state for project, workflow, dataset, training, model, testing, and challenge | Consumed by all pages & modules | **MINOR MODIFICATION** | Add journey state tracking, `currentStep`, `mission`, `aiGoal`, and prerequisite evaluation |
| `src/types/project.ts` | Type definitions for project and module status | Consumed by `ProjectContext` and UI | **MINOR MODIFICATION** | Add `mission`, `aiGoal`, `currentStep`, `JourneyStep`, `JourneyStepStatus` |
| `src/types/workflow.ts` | Complete visual workflow and node schema | React Flow canvas, validator, evaluator | **KEEP AS-IS** | Clean serializable JSON schema for input, model, condition, decision, action |
| `src/types/dataset.ts` | Dataset classes, images, manifests, hyperparameters | Teach module, API services | **KEEP AS-IS** | Supports multi-class dataset manifest generation |
| `src/types/training.ts` | Training job lifecycle types (`queued` to `completed`) | Train module, API services | **KEEP AS-IS** | Aligned with Model Engine REST specification |
| `src/types/prediction.ts` | Inference bounding boxes, classes, confidence | Test module, inference service | **KEEP AS-IS** | Supports dual perception/decision data model |
| `src/types/challenge.ts` | Adversarial stress test suites and failure logging | Challenge module | **KEEP AS-IS** | Supports stress categories (low light, glare, angle, blur) |
| `src/types/api.ts` | API client responses and errors | API services | **KEEP AS-IS** | Typed response and error envelope |

---

## 4. Pages & Feature Views

| File Path | Purpose | Dependencies / Used By | Classification | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/pages/Dashboard/DashboardPage.tsx` | Overview dashboard with philosophy banner & cards | Route `/` | **KEEP AS-IS** | Retain for project dashboard view; map to `/project/:id` or dashboard |
| `src/pages/Build/BuildPage.tsx` | Visual node workflow editor using React Flow | Route `/build` | **KEEP AS-IS** | Full drag-and-drop workflow canvas with custom nodes |
| `src/pages/Teach/TeachPage.tsx` | Dataset teaching, webcam capture, image gallery | Route `/teach` | **KEEP AS-IS** | Interactive class management and camera capture |
| `src/pages/Train/TrainPage.tsx` | Training dispatch card and real-time job status | Route `/train` | **KEEP AS-IS** | Polling loop and prerequisite checks |
| `src/pages/Test/TestPage.tsx` | Testing lab comparing perception vs safety decision | Route `/test` | **KEEP AS-IS** | Dual-tier inference visualization |
| `src/pages/Challenge/ChallengePage.tsx` | Adversarial stress testing suite | Route `/challenge` | **KEEP AS-IS** | Break Your AI test scenarios |
| `src/pages/NotFound/NotFoundPage.tsx` | 404 Route Not Found page | Fallback route `*` | **KEEP AS-IS** | Industrial-styled 404 handler |
| `src/pages/Start/StartPage.tsx` | Simple participant onboarding landing page | Route `/start` | **NEW** | Clean start screen with project resume option |
| `src/pages/Project/NewProjectPage.tsx` | Project creation form (Name, Problem, Goal, Mission) | Route `/project/new` | **NEW** | Initial project setup flow |
| `src/pages/Improve/ImprovePage.tsx` | Improvement loop linking failures to dataset updates | Route `/improve` | **NEW** | Phase 1 placeholder; will connect challenge weaknesses to dataset in Phase 16 |
| `src/pages/MyAI/MyAIPage.tsx` | Final participant project presentation view | Route `/my-ai` | **NEW** | Phase 1 placeholder; full summary in Phase 18 |

---

## 5. Services & API Connector

| File Path | Purpose | Dependencies / Used By | Classification | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/services/api/client.ts` | Typed HTTP client using `fetch` with timeout and abort | All API services | **KEEP AS-IS** | Central client targeting `VITE_MODEL_API_URL` |
| `src/services/api/health.ts` | Health check probe against Model Engine | Header indicator | **KEEP AS-IS** | Checks `/api/v1/health` and `/health` fallback |
| `src/services/api/training.ts` | Multipart dispatch for training and progress polling | `TrainPage`, `ProjectContext` | **KEEP AS-IS** | Adheres to REST contract; zero local training code |
| `src/services/api/inference.ts` | Visual inference request dispatch | `TestPage`, `ChallengePage` | **KEEP AS-IS** | Sends image binaries and receives bounding boxes |
| `src/services/api/modelEngineService.ts` | Model Engine client service abstraction | Optional service facade | **KEEP AS-IS** | Typed connector boundary; ready for Phase 5 |
| `src/services/workflow/workflowValidator.ts` | Graph topology validation (Input -> Model -> Decision -> Action) | `BuildPage`, `ProjectContext` | **KEEP AS-IS** | Deterministic topological graph checks |
| `src/services/workflow/workflowEvaluator.ts` | Evaluates workflow rules against detections | `TestPage`, `ProjectContext` | **KEEP AS-IS** | Deterministic decision logic |
| `src/services/dataset/datasetQuality.ts` | Evaluates class distribution and readiness threshold | `TeachPage`, `TrainPage` | **KEEP AS-IS** | Ensures ≥ 10 samples per class before training |

---

## 6. Shared UI Components

| File Path | Purpose | Dependencies / Used By | Classification | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/components/ui/Button.tsx` | Accessible styled button component | Ubiquitous | **KEEP AS-IS** | Supports primary, secondary, outline, ghost, danger |
| `src/components/ui/Card.tsx` | Industrial styled container cards | Ubiquitous | **KEEP AS-IS** | CardHeader, CardTitle, CardContent |
| `src/components/ui/Badge.tsx` | Color-coded status badges | Ubiquitous | **KEEP AS-IS** | Supports primary, success, warning, neutral, danger |
| `src/components/ui/ProgressBar.tsx` | Visual progress indicator bar | Training & Dataset | **KEEP AS-IS** | Clean animated progress bar |
| `src/components/ui/StatusBadge.tsx` | Dot-indicator badge | Dashboard & Navigation | **KEEP AS-IS** | Multi-state indicator |
| `src/components/feedback/EmptyState.tsx` | Empty state placeholder | Ubiquitous | **KEEP AS-IS** | Clean icon + title + action button |
| `src/components/feedback/ErrorState.tsx` | Error state alert box | Ubiquitous | **KEEP AS-IS** | Standardized error UI |
| `src/components/feedback/LoadingState.tsx` | Loading spinner and message | Ubiquitous | **KEEP AS-IS** | Standardized loader |

---

## 7. Configuration & Testing

| File Path | Purpose | Classification | Notes |
| :--- | :--- | :--- | :--- |
| `src/config/constants.ts` | Navigation items, workflow cards, app metadata | **MINOR MODIFICATION** | Add 06 IMPROVE route metadata; align journey steps |
| `src/config/env.ts` | Environment variables wrapper (`modelApiUrl`) | **KEEP AS-IS** | Safe environment variable resolution |
| `src/test/navigation.test.tsx` | Route and page rendering tests | **MINOR MODIFICATION** | Update to verify new journey steps and shell components |
| `src/test/apiClient.test.ts` | API client test suite | **KEEP AS-IS** | 9 passing tests |
| `src/test/workflow.test.ts` | Workflow validation and evaluation tests | **KEEP AS-IS** | 7 passing tests |
| `src/test/dataset.test.ts` | Dataset manifest and quality tests | **KEEP AS-IS** | 4 passing tests |
| `src/test/components.test.tsx` | Reusable UI component tests | **KEEP AS-IS** | 8 passing tests |
