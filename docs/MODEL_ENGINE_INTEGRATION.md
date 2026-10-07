# Model Engine Integration Guide (Repo 1 ↔ Repo 2)

This document describes how the separate **Model Engine** backend (Repo 2) integrates with the **AI Safety Builder** frontend (Repo 1).

---

## 1. Overview
Repo 1 is a client-side React + TypeScript application designed for industrial safety AI training workshops. It maintains zero machine-learning dependencies and does not embed model weights or Python runtimes.

All model execution (dataset processing, YOLO training, inference, and metrics calculation) is delegated to Repo 2 via HTTP REST calls governed by the contract in `docs/API_CONTRACT.md`.

---

## 2. Configuration & Base URL

Repo 1 locates the backend via the Vite environment variable:

```bash
VITE_MODEL_API_URL=http://localhost:8000
```

- When running locally, set this variable in `.env` (or `.env.local`).
- In remote environments, set this variable to the HTTPS base URL of the deployed Model Engine (e.g., `https://model-engine.internal-plant.net`).
- **No code rebuild or source edits** are required in Repo 1 to switch between local and remote Model Engine endpoints.

---

## 3. Required CORS Configuration

Because Repo 1 is hosted on a separate port or domain (e.g., `http://localhost:5173` in development), Repo 2 **must configure Cross-Origin Resource Sharing (CORS)** properly:

### Allowed Origins
- Development: `http://localhost:5173`, `http://127.0.0.1:5173`
- Production: Whitelist the deployed frontend domain(s).

### Allowed Methods
- `GET`, `POST`, `OPTIONS`

### Allowed Headers
- `Content-Type`, `Accept`, `Authorization`, `X-Requested-With`

### Pre-flight Handling
- Repo 2 must respond to HTTP `OPTIONS` requests with `200 OK` or `204 No Content` and appropriate CORS headers. Repo 1 will not use `no-cors` mode as that disables header and response body access.

---

## 4. Required Endpoint Paths

Repo 2 must implement the following 4 routes:

| Method | Path | Function |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status check |
| `POST` | `/api/v1/training/jobs` | Accept and queue multipart training job |
| `GET` | `/api/v1/training/jobs/{jobId}` | Poll training progress and receive trained `modelId` |
| `POST` | `/api/v1/inference/predict` | Run computer vision inference on an uploaded image |

*(Note: Repo 1 also accepts legacy `/health` as an automatic fallback if `/api/v1/health` is not routed).*

---

## 5. Training Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Participant
    participant Frontend as Repo 1 (Frontend)
    participant Engine as Repo 2 (Model Engine)

    Participant->>Frontend: Clicks "TRAIN MY AI"
    Frontend->>Engine: POST /api/v1/training/jobs (Multipart with project, workflow, dataset manifest, images)
    Engine-->>Frontend: 201 Created (jobId: "job-xyz", status: "queued")
    
    loop Polling (every 2.5s)
        Frontend->>Engine: GET /api/v1/training/jobs/job-xyz
        Engine-->>Frontend: 200 OK (status: "training", progress: 65, epoch: 13/20)
    end

    Frontend->>Engine: GET /api/v1/training/jobs/job-xyz
    Engine-->>Frontend: 200 OK (status: "completed", modelId: "model-001", metrics: {precision, recall, map50})
    Frontend->>Participant: Displays "TRAINING COMPLETE", sets active model, enables Test & Challenge modules
```

1. **Submission**: Frontend validates that classes have ≥ 10 examples, packages images as binary parts, serializes manifests, and submits `POST /api/v1/training/jobs`.
2. **Asynchronous Processing**: The backend immediately returns `jobId` with status `queued`.
3. **Status Polling**: The frontend initiates polling at controlled intervals. When progress updates occur, the progress bar and epoch indicators update without full-page re-renders.
4. **Terminal Completion**: When `status` transitions to `completed`, Repo 2 returns `modelId` and final metrics. Repo 1 stores this `modelId` in project state and enables `/test` and `/challenge`.
5. **Failure Handling**: If `status` transitions to `failed`, Repo 2 provides an error reason in `error.message`. Frontend displays a user-friendly error card with guidance.

---

## 6. Prediction Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Participant
    participant Frontend as Repo 1 (Frontend)
    participant Evaluator as Frontend Workflow Evaluator
    participant Engine as Repo 2 (Model Engine)

    Participant->>Frontend: Captures or uploads test image
    Frontend->>Engine: POST /api/v1/inference/predict (modelId, image file)
    Engine-->>Frontend: 200 OK (detections: [{className, confidence, bbox}])
    Frontend->>Evaluator: evaluateWorkflow(workflow, detections)
    Evaluator-->>Frontend: { decision: "SAFE", action: "No Alert" }
    Frontend->>Participant: Overlays bounding boxes & displays Safety Decision
```

1. **Submission**: Frontend validates image size (< 15 MB) and format (JPG, PNG, WEBP), then sends image binary + `modelId` to `POST /api/v1/inference/predict`.
2. **Inference**: Repo 2 runs object detection and returns identified classes, confidence scores (0.00 – 1.00), and bounding box coordinates (`x, y, width, height`).
3. **Deterministic Workflow Evaluation**: Repo 1's client-side `evaluateWorkflow()` consumes the prediction and steps through the participant's configured workflow (Camera → Object Detection → Helmet Detected? → Decision → Action) to render the final safety outcome (`SAFE` / `UNSAFE`, `Alert` / `No Alert`).
4. **No Synthetic Fallbacks**: If Repo 2 fails or is offline, Repo 1 presents a clean error banner and does not synthesize fake predictions.

---

## 7. Model ID & State Handling

- Model IDs are opaque strings assigned by Repo 2 upon job completion (e.g. `model-yolo26n-safety-001`).
- Repo 1 stores the active `modelId` in `ProjectContext` and persists it to browser session storage.
- If the participant trains a new model, the new `modelId` replaces the previous active model, while previous runs are preserved in the training run history table.

---

## 8. Deployment Examples

### Local Development Deployment
```bash
# Repo 2 runs locally on port 8000
# Repo 1 configured in .env:
VITE_MODEL_API_URL=http://localhost:8000
```

### Remote / Cloud Training Server Deployment
```bash
# Repo 2 hosted on cloud GPU instance with SSL reverse proxy
# Repo 1 configured in .env:
VITE_MODEL_API_URL=https://vision-engine-gpu1.training.acme-corp.com
```

---

## 9. Integration Checklist for Repo 2 Engineers

- [ ] Implement `GET /api/v1/health` returning JSON `{ "status": "ok", "service": "...", "version": "..." }`.
- [ ] Configure CORS headers allowing `GET`, `POST`, `OPTIONS` from frontend origin.
- [ ] Implement multipart ingestion at `POST /api/v1/training/jobs` accepting fields `project`, `workflow`, `dataset`, `training`, and image files `files`.
- [ ] Implement progress polling at `GET /api/v1/training/jobs/{jobId}` returning `status`, `progress`, `epoch`, `totalEpochs`, and upon completion `modelId` and `metrics`.
- [ ] Implement `POST /api/v1/inference/predict` returning `detections` array with `className`, `confidence`, and optional `bbox`.
- [ ] Return appropriate HTTP status codes (`400`, `404`, `413`, `429`, `500`) with structured error details `{ "error": { "code": "...", "message": "..." } }`.
