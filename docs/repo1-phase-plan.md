# AI Safety Builder — Implementation Roadmap (Phases 0–23)

**Document Version**: 1.0.0-phase0  
**Date**: October 2026  
**Auditor**: Antigravity Assistant (Gemini 3.6)  

---

## 1. Roadmap Architecture

The engineering roadmap for **Repo 1 (`ai-safety-builder`)** is organized into 24 disciplined phases. Each phase targets a single cohesive responsibility, ensuring that existing working features remain stable while incrementally fulfilling the master product definition.

```
PHASE 0  ──►  PHASE 1  ──►  PHASE 2  ──►  PHASE 3
(Audit)       (Shell)       (Project)     (Mission)
                                              │
┌─────────────────────────────────────────────┘
▼
PHASE 4  ──►  PHASE 5  ──►  PHASE 6  ──►  PHASE 7  ──►  PHASE 8
(Build)       (Connector)   (Catalog)     (Teach)       (Readiness)
                                                          │
┌─────────────────────────────────────────────────────────┘
▼
PHASE 9  ──►  PHASE 10 ──►  PHASE 11 ──►  PHASE 12 ──►  PHASE 13
(Train Req)   (Live State)  (Model Reg)   (Test Lab)    (Perception)
                                                          │
┌─────────────────────────────────────────────────────────┘
▼
PHASE 14 ──►  PHASE 15 ──►  PHASE 16 ──►  PHASE 17 ──►  PHASE 18
(Challenge)   (Analytics)   (Improve)     (Retrain)     (My AI)
                                                          │
┌─────────────────────────────────────────────────────────┘
▼
PHASE 19 ──►  PHASE 20 ──►  PHASE 21 ──►  PHASE 22 ──►  PHASE 23
(Persistence) (Recovery)    (Workshop)    (UX Polish)   (Golden Path)
```

---

## 2. Detailed Phase Specifications

### PHASE 0 — Codebase Audit & Specification Alignment
- **Objective**: Inspect the existing repository, verify dependencies, test and build status, compare against Master Specification, and create gap matrix, file inventory, and roadmap.
- **Deliverables**: `docs/repo1-ui-gap-analysis.md`, `docs/repo1-audit-inventory.md`, `docs/repo1-phase-plan.md`.
- **Status**: Completed.

### PHASE 1 — Application Shell & Journey Navigation
- **Objective**: Implement the unified `ApplicationShell`, dynamic `Header`, 6-stage `JourneySidebar` (`01 BUILD` to `06 IMPROVE`), 4-tier step states (`LOCKED`, `AVAILABLE`, `CURRENT`, `COMPLETED`), `ProjectStatusPanel` (displaying honest state), 5-state `EngineStatusIndicator`, and persistent `WorkshopDisclaimer`.
- **Deliverables**: Shell components, route alignment, journey state model, responsive layout, tests.

### PHASE 2 — Project Creation Flow
- **Objective**: Implement `/start` landing page and `/project/new` creation wizard capturing: Project Name, Safety Problem, AI Goal, and Safety Mission.
- **Deliverables**: Dedicated onboarding views, project creation validation, integration with `ProjectContext`.

### PHASE 3 — Mission Catalogs & Journey State Engine
- **Objective**: Formally define the 6 industrial safety mission types (PPE, FIRE, SPILL, RESTRICTED AREA, POSTURE, CUSTOM) with domain-specific starter templates and configure the central journey state machine enforcing prerequisites.
- **Deliverables**: Mission catalog definitions, prerequisite evaluators, dynamic mission configuration.

### PHASE 4 — Visual Workflow Builder Alignment
- **Objective**: Polish the visual React Flow workflow editor on `/build`. Ensure Component Palette, Canvas, and Properties Panel map directly to the 5 categories (Input, Model, Condition, Decision, Action).
- **Deliverables**: Serialized workflow JSON, real-time topological validation, canvas persistence.

### PHASE 5 — Repo 2 Engine Connector Hardening
- **Objective**: Formalize the typed `EngineConnector` boundary with strict offline graceful degradation.
- **Deliverables**: `EngineConnector` interface (`getEngineStatus`, `listModels`, `validateDataset`, `startTraining`, `getTrainingStatus`, `runInference`), network timeout handling, retry logic.

### PHASE 6 — Model Catalog & Node Wiring
- **Objective**: Connect the Workflow Model Node directly to dynamic model selection (`model_id` from catalog or active trained model), eliminating manual file paths or Python command inputs.
- **Deliverables**: Model catalog selector in Model Node Properties, model ID resolution.

### PHASE 7 — Teach & Safety Dataset Builder
- **Objective**: Refine `/teach` for industrial safety class creation, high-performance batch image uploading, and real-time webcam capture with device selection.
- **Deliverables**: Multi-class image gallery, camera permission handling, dataset deletion/editing.

### PHASE 8 — Dataset Quality & Readiness Verification
- **Objective**: Enforce the industrial training readiness gate: minimum sample thresholds (≥ 10/class), class balance ratios, and actionable recommendations.
- **Deliverables**: `DatasetQualityReport` visualization, automated readiness checks blocking `/train`.

### PHASE 9 — Training Request Packaging
- **Objective**: Formulate the multipart/form-data contract packaging project metadata, workflow JSON, dataset manifest, and image binaries.
- **Deliverables**: Multipart serialization service, payload size safety checks, progress initiation.

### PHASE 10 — Live Training State & Real-Time Monitoring
- **Objective**: Consume actual Repo 2 training job progress via polling. Display current epoch, loss, progress percentage, and engine status without mock timers or fake metrics.
- **Deliverables**: Live training progress card, epoch countdown, cancel job action, connection watchdog.

### PHASE 11 — Training Results & Model Registration
- **Objective**: Process terminal `completed` training status. Extract evaluation metrics (Precision, Recall, mAP50) and register the resulting `modelId` as the active project model.
- **Deliverables**: Training success celebration card, metrics summary, model history table.

### PHASE 12 — Industrial Test Lab
- **Objective**: Polish `/test` for single-image upload, live camera test stream, and model inference dispatch to Repo 2.
- **Deliverables**: Test viewport, bounding box rendering, inference latency metrics.

### PHASE 13 — Perception vs. Workflow Decision Visualization
- **Objective**: Visually decouple raw computer vision perception (detected classes and bounding boxes) from the deterministic workflow safety outcome (SAFE, WARNING, UNSAFE).
- **Deliverables**: Dual-tier result panel, step-by-step workflow execution trace highlighting active path.

### PHASE 14 — "Break Your AI" Adversarial Challenge Suite
- **Objective**: Complete `/challenge` with 6 industrial stress-test conditions (Low Light, Extreme Angle, Distance, Glare/Reflection, Motion Blur, Scale Variation) and custom image upload.
- **Deliverables**: Scenario selector, automated expected-vs-predicted comparison, pass/fail grading.

### PHASE 15 — Challenge Analytics & Failure Diagnostics
- **Objective**: Aggregate challenge run results into weakness diagnostics (e.g., "AI is failing in low light conditions").
- **Deliverables**: Challenge session stats, critical false-negative tracking, failure taxonomy.

### PHASE 16 — Improvement Feedback Loop
- **Objective**: Build `/improve` linking challenge failures back to the Teach module. Provide 1-click action to add failure images to dataset classes with appropriate labels.
- **Deliverables**: `/improve` screen, failed sample transfer to dataset, guided prompt to retrain.

### PHASE 17 — Model Lineage & Retraining Comparison
- **Objective**: Support multi-run model lineage. Enable participants to compare Model Run 01 (baseline) vs Model Run 02 (improved) side-by-side.
- **Deliverables**: Run comparison view, delta metrics (e.g., +12% mAP50 on low-light test set).

### PHASE 18 — "My AI" Executive Presentation
- **Objective**: Implement `/my-ai` comprehensive summary aggregating: Project Mission, Workflow Architecture, Dataset Statistics, Trained Models, Challenge Results, and Improvement Evidence.
- **Deliverables**: Presentation mode, exportable summary card, executive safety declaration.

### PHASE 19 — Robust Project Persistence & Export
- **Objective**: Unify project state storage in browser LocalStorage / IndexedDB. Add Project Export (JSON bundle with workflow, dataset manifest, runs) and Import capabilities.
- **Deliverables**: Project serialization format, import/export dialog, schema version migrations.

### PHASE 20 — Comprehensive Error & Recovery Handling
- **Objective**: Implement friendly, actionable participant error screens for: Engine Offline, Training Failed, Incompatible Dataset, and Camera Permission Denied.
- **Deliverables**: Reusable error banners, contextual retry buttons, connection diagnostics modal.

### PHASE 21 — Workshop Safety & Ethics Layer
- **Objective**: Solidify the educational boundary. Ensure persistent workshop disclaimer, confidence threshold warnings, and explicit education that this tool is for learning, not production safety interlocking.
- **Deliverables**: Disclaimer banner, ethics reminder before training, safety sign-off modal.

### PHASE 22 — UX Polish, Responsive Refinements & Accessibility
- **Objective**: Refine spacing, typography, transitions, focus rings, keyboard navigation, and screen reader labels across all viewports (desktop, laptop, tablet).
- **Deliverables**: WCAG 2.1 AA accessibility audit, responsive drawer polish, micro-animations.

### PHASE 23 — Golden-Path End-to-End Integration Test
- **Objective**: Execute automated end-to-end integration tests verifying the full participant journey: Onboarding -> Build -> Teach -> Train -> Test -> Challenge -> Improve -> My AI.
- **Deliverables**: Comprehensive test suite verifying unbroken state transitions and zero regressions.
