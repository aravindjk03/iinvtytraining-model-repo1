# AI Safety Builder — Application Shell & UI Architecture (Phase 1)

**Document Version**: 1.0.0-phase1  
**Architecture Date**: October 2026  
**Target Repository**: `Repo 1 — ai-safety-builder`  
**Status**: Implemented & Verified  

---

## 1. High-Level Architecture Overview

The **AI Safety Builder** frontend architecture provides a resilient, participant-focused environment for designing, testing, and stress-testing industrial vision safety systems.

Phase 1 establishes the permanent application skeleton:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PARTICIPANT BROWSER UI                          │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     ▼                           ▼
            [ Standalone Routes ]       [ ApplicationShell ]
            ├── /start (Onboarding)     ├── Header (Dynamic Context, Engine Probe)
                                        ├── JourneySidebar (Stages 01–06, State-Aware)
                                        ├── ProjectStatusPanel (Non-Fabricated Metrics)
                                        ├── MainContentArea (<Outlet />)
                                        └── WorkshopDisclaimer (Persistent Footer)
                                                 │
                                                 ▼
                                        [ State Hierarchy ]
                                        ├── ProjectContext (Project, Mission, Goal)
                                        ├── JourneyState (LOCKED, AVAILABLE, CURRENT, COMPLETED)
                                        └── EngineHealthHook (5-State Connectivity Model)
                                                 │
                                                 ▼
                                        [ Feature Modules ]
                                        ├── 01 BUILD (React Flow Visual Editor)
                                        ├── 02 TEACH (Dataset Class & Capture)
                                        ├── 03 TRAIN (Training Dispatch & Polling)
                                        ├── 04 TEST (Perception vs Safety Decision)
                                        ├── 05 CHALLENGE (Adversarial Stress Suite)
                                        ├── 06 IMPROVE (Failure Analysis Loop)
                                        └── MY AI (Executive Safety Summary)
```

---

## 2. Shell Components & Boundaries

### 2.1 `ApplicationShell` (`src/components/layout/AppLayout.tsx`)
The root structural layout wrapping all in-project screens.
- **Header**: Persistent top bar providing application branding, current route title, state-bound project name (`Project: [name]`), and interactive `EngineStatusIndicator`.
- **Sidebar**: Collapsible left navigation bar hosting the 6-stage participant journey and the `ProjectStatusPanel`.
- **MainContentArea**: Scrollable view area constrained to `max-w-7xl` with focus management and ARIA landmark roles (`role="main"`).
- **WorkshopDisclaimer**: Persistent footer present across every view inside the shell:
  > *"Workshop model only — not for production safety control"*

### 2.2 Header (`src/components/navigation/Header.tsx`)
- **Branding**: Displays `APP_CONFIG.name` (`AI SAFETY BUILDER`).
- **Dynamic Context**: Reads active project name from `ProjectContext` (`project.name`). Never hardcodes a project name when state is active.
- **Engine Status**: Renders `EngineStatusIndicator` providing visual and accessible cues. Clicking the indicator opens the connection diagnostics modal.

### 2.3 Journey Sidebar (`src/components/navigation/Sidebar.tsx`)
Hosts the 6 required pipeline stages:
1. `01 BUILD` (`/build`)
2. `02 TEACH` (`/teach`)
3. `03 TRAIN` (`/train`)
4. `04 TEST` (`/test`)
5. `05 CHALLENGE` (`/challenge`)
6. `06 IMPROVE` (`/improve`)

Each stage evaluates against the participant journey state machine. Completed stages display a distinct checkmark (`✓`) and remain clickable so participants can freely return to earlier work. Locked stages display a lock icon and prevent entry.

### 2.4 Project Status Panel (`src/components/navigation/ProjectStatusPanel.tsx`)
Positioned at the lower section of the sidebar. It displays:
- **Project**: Active project name.
- **WORKFLOW**: `✓ Valid` / `In progress` / `Not started` / `✗ Invalid`.
- **DATASET**: `Ready` / `In progress` / `Needs attention` / `Not started`.
- **MODEL**: `✓ Trained` / `Training...` / `Failed` / `No model`.
- **ENGINE**: `● Connected` / `◌ Connecting...` / `○ Offline` / `▲ Error`.
- **LAST TRAINING**: `Run 0X` or `None`.
- **CURRENT MODEL**: Active `modelId` or `None`.

**Zero Fabrication Rule**: No artificial precision, recall, or fake model identifiers are displayed when compute has not run.

### 2.5 Engine Status Model (`src/components/navigation/EngineStatusIndicator.tsx`)
Supports the 5-state model:
- `CONNECTED`: Operational link to Repo 2 (`● CONNECTED`, emerald indicator).
- `CONNECTING`: Probe in progress (`◌ CONNECTING...`, amber ping indicator).
- `OFFLINE`: Repo 2 is unreachable (`○ OFFLINE`, slate neutral indicator).
- `ERROR`: HTTP failure or server exception (`▲ ERROR`, rose indicator).
- `UNKNOWN`: Probe has not run (`? NOT CONNECTED`, slate indicator).

Accessibility is guaranteed through distinct symbols (`●`, `◌`, `○`, `▲`, `?`) and descriptive `aria-label` text, avoiding color-only communication.

---

## 3. Journey State Machine & Prerequisites

### Step State Semantics
- `LOCKED`: Prerequisite condition is unsatisfied. Entry is disabled.
- `AVAILABLE`: Prerequisite condition is met. Participant may enter.
- `CURRENT`: Participant is actively viewing this stage.
- `COMPLETED`: Stage criteria have been successfully executed. Remains accessible.

### Prerequisite Matrix
| Stage | Prerequisite | Completion Criteria | Accessible When |
| :--- | :--- | :--- | :--- |
| **01 BUILD** | Project exists | Graph is valid with connected Input, Model, Decision, Action | Always accessible |
| **02 TEACH** | Project exists | ≥ 20 images and dataset readiness threshold met | Always accessible |
| **03 TRAIN** | Dataset threshold met (≥ 10 images/class, 2 classes) | Training job completed and model registered | Accessible when dataset is ready or model trained |
| **04 TEST** | Active trained model exists | Test inference evaluated against workflow decision | Accessible when active model exists |
| **05 CHALLENGE** | Active trained model exists | At least 1 adversarial stress test executed | Accessible when active model exists |
| **06 IMPROVE** | Challenge tests executed or active model exists | Weakness identified or failure addressed | Accessible after challenge execution |

---

## 4. Route Architecture

```
/start           ──► Standalone Start / Onboarding Screen (No Shell)
/                ──► Platform Dashboard (Inside ApplicationShell)
/project/new     ──► Project Creation Wizard Placeholder (Inside ApplicationShell)
/project/:id     ──► Dynamic Project Dashboard (Inside ApplicationShell)
/build           ──► 01 Build (React Flow Canvas)
/teach           ──► 02 Teach (Dataset Management & Capture)
/train           ──► 03 Train (Compute Dispatch & Monitoring)
/test            ──► 04 Test (Inference Perception vs Decision)
/challenge       ──► 05 Challenge (Adversarial Stress Test Suite)
/improve         ──► 06 Improve (Failure Weakness Analysis & Retrain Loop)
/my-ai           ──► My AI (Presentation View)
/*               ──► 404 Not Found Page
```

---

## 5. Responsive Behavior & Accessibility

- **Desktop & Laptop**: Full 64-column navigation sidebar with persistent project status panel.
- **Compact / Tablet**: Sidebar collapses to icon-only rail (`w-16`) with tooltips on hover.
- **Mobile (< 1024px)**: Drawer sidebar toggled via hamburger menu in header, closed on link click or `Escape` key.
- **Accessibility**:
  - Valid ARIA landmark structure (`header`, `aside`, `nav`, `main`, `footer`).
  - `aria-current="page"` and `aria-disabled="true"` for step navigation.
  - Visible `focus-visible:ring-2` keyboard focus rings throughout.
  - High-contrast text matching WCAG 2.1 AA standards.
