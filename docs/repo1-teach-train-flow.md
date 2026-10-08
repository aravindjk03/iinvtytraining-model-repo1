# AI Safety Builder — Teach & Train Pipeline Architecture (Phase 4)

**Document Version**: 1.0.0-phase4  
**Date**: October 2026  
**Auditor / Engineer**: Antigravity Assistant (Gemini 3.6)  
**Target Repository**: `Repo 1 — ai-safety-builder`  
**External Engine**: `Repo 2 — ai-safety-model-engine`  

---

## 1. Executive Summary

This document specifies the complete participant-facing data collection, validation, and training journey connecting **Repo 1** (`ai-safety-builder`) to **Repo 2** (`ai-safety-model-engine`).

The platform enables participants who are beginners in AI to construct an industrial safety system from visual components, teach it with local examples, validate dataset sufficiency with the external engine, dispatch real training jobs, and bind the resulting model into the visual safety workflow.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PARTICIPANT WORKSHOP JOURNEY                      │
└─────────────────────────────────────────────────────────────────────────┘
   │
   ├─► 01 BUILD: Wire input, AI node (with modelId), condition, and action
   │
   ├─► 02 TEACH: Create classes, upload images / capture camera, verify quality
   │
   ├─► DATASET VALIDATION: Repo2Connector.validateDataset() (Repo 2 Authority)
   │
   ├─► 03 TRAIN: Select profile (workshop_cpu), confirm parameters, dispatch job
   │
   ├─► EVALUATE: Receive real metrics (Precision, Recall, mAP50, mAP50-95)
   │
   └─► MODEL READY: Set activeModelId in project; unlock Stage 04 TEST
```

---

## 2. Architectural Boundary: Repo 1 vs. Repo 2

A fundamental tenet of the platform is strict separation between frontend participant experience and model compute infrastructure:

| Responsibility | Repo 1 (Participant UI) | Repo 2 (Model Engine) |
| :--- | :--- | :--- |
| **User Interface** | React 18, Vite, Tailwind CSS, React Flow | None (Headless REST API) |
| **Visual Workflow** | Graph editor, topological validation, rule evaluation | Consumes serialized workflow JSON |
| **Model Storage** | References `modelId` string only (NO `.pt` weights) | Stores model checkpoints, weights, registry |
| **Dataset Storage** | Browser-local staging, metadata, image manifest | Server-side directory, YOLO dataset YAML |
| **Dataset Validation** | Quality heuristics (counts, balance, format) | **Authoritative validation** (labels, YOLO format) |
| **Training Execution** | Dispatches job via HTTP, monitors progress | PyTorch / YOLO training loop, CUDA/CPU |
| **Metrics Calculation** | Displays returned metrics (NO fake data) | Precision, Recall, mAP50, mAP50-95 calculation |
| **Inference Engine** | Dispatches image binaries, renders bounding boxes | Tensor forward pass, NMS, detection boxes |

---

## 3. The Central Connector: `Repo2Connector`

All communication between Repo 1 and Repo 2 routes through `src/services/api/repo2Connector.ts`.

### 3.1 Interface Definition
```typescript
export interface IRepo2Connector {
  getEngineStatus(): Promise<EngineStatusResult>;
  listModels(taskType?: string): Promise<Repo2ModelMetadata[]>;
  getModel(modelId: string): Promise<Repo2ModelMetadata | null>;
  getCapabilities(): Promise<Repo2Capabilities>;
  validateDataset(params: DatasetValidationParams): Promise<DatasetValidationResponse>;
  startTraining(params: DispatchTrainingParams): Promise<TrainingJobResponse>;
  getTrainingStatus(jobId: string): Promise<TrainingJobStatusResponse>;
  cancelTraining(jobId: string): Promise<void>;
  runInference(params: RunPredictionParams): Promise<PredictionResponse>;
}
```

### 3.2 Connectivity States
The engine status conforms to a 5-state accessible model:
- `CONNECTED`: Health check returns `200 OK` (`status === 'ok'`).
- `CONNECTING`: Probe actively executing.
- `OFFLINE`: Repo 2 unreachable or network timed out.
- `ERROR`: Backend reported internal error or degraded state.
- `UNKNOWN`: Initial uninitialized state.

When Repo 2 is offline:
- The participant can still visually wire workflows in Stage 01.
- Model catalog displays `MODEL ENGINE OFFLINE` (or optional clearly marked Demo Mode fixture).
- Dataset validation and training are gracefully blocked with actionable messages:
  > *"MODEL ENGINE OFFLINE: Connect the AI Model Engine before validating or training."*

---

## 4. Stage 02: Teach & Dataset Pipeline

### 4.1 Class Management
Participants define safety classes corresponding to their mission:
- Example: `Helmet` vs `No Helmet` for PPE Compliance.
- Validates: non-empty class names, no duplicate names, whitespace trimming.
- Minimum threshold: ≥ 10 examples per class for workshop training readiness.

### 4.2 Image Ingestion
- **Laptop Upload**: Multiple image files (`.jpg`, `.jpeg`, `.png`, `.webp`). Rejects unsupported formats with immediate feedback.
- **Camera Capture**: WebRTC `navigator.mediaDevices.getUserMedia` capture modal with live viewfinder, snap, and review actions. Safe resource cleanup on unmount.

### 4.3 Object Detection Notice
For object detection tasks, the UI explicitly clarifies:
> *"For object detection, training data must contain valid bounding-box annotations."*

### 4.4 Authoritative Dataset Validation
Clicking **`CHECK MY DATA`** invokes `Repo2Connector.validateDataset()`:
- Validation states: `NOT_CHECKED` ➔ `CHECKING` ➔ `VALID` / `VALID_WITH_WARNINGS` / `INVALID` / `ERROR`.
- Verifies sample sufficiency, class balance (flags imbalance if ratio > 2.5×), and image integrity.

---

## 5. Stage 03: Train Pipeline

### 5.1 Training Readiness Gate
Training cannot be initiated unless:
1. Safety problem is defined in project metadata.
2. Visual workflow graph is topologically valid with an AI model selected.
3. At least 2 dataset classes exist with ≥ 10 examples each.
4. Dataset is verified by Repo 2 (or local balance check).
5. Model Engine is connected.

### 5.2 Pre-Training Confirmation
Before job dispatch, a confirmation card verifies:
- Target Model: e.g. `PPE Detection (ppe-workshop-v1)`
- Dataset: Sample count and class count
- Epochs: e.g. `20 epochs`
- Profile: `workshop_cpu (CPU)`

### 5.3 Training Job Lifecycle
```
POST /api/v1/training/jobs  ──►  jobId
                                  │
                                  ▼
                    GET /api/v1/training/jobs/:jobId
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
  [QUEUED]                  [PREPARING]                  [TRAINING]
      │                           │                           │
      └───────────────────────────┼───────────────────────────┘
                                  │
                                  ▼
                            [EVALUATING]
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
             [COMPLETED]                       [FAILED]
                  │                               │
        Register modelId                  Display friendly
        Update activeModel                 retry guidance
```

### 5.4 Honest Metrics Reporting
Upon job completion, actual metrics returned from Repo 2 are displayed:
- **Precision**: e.g. `92%`
- **Recall**: e.g. `89%`
- **mAP50**: e.g. `91%`
- **mAP50-95**: e.g. `68%`

If any metric is omitted by the engine, the UI renders **`Not available`**. Fabricating artificial numbers is strictly forbidden.

### 5.5 State Transitions
Upon completion:
- `project.activeModelId = returnedModelId`
- `activeModel = { modelId, jobId, metrics, trainedAt }`
- Journey State updates:
  - `01 BUILD` = `COMPLETED`
  - `02 TEACH` = `COMPLETED`
  - `03 TRAIN` = `COMPLETED`
  - `04 TEST` = `AVAILABLE` (unlocked)

Participants maintain full backward navigation, allowing iterative returns to Teach or Build to refine the dataset and retrain.
