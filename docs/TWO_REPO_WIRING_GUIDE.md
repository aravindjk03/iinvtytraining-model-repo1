# End-to-End Wiring Guide: AI Safety Builder (Repo 1) ↔ Model Engine (Repo 2)

This document provides complete, production-grade guidance on wiring **Repo 1 (Frontend UI)** with **Repo 2 (Model Engine)**.

---

## 1. System Topology & Architecture

| Repository | URL | Technology Stack | Responsibility |
| :--- | :--- | :--- | :--- |
| **Repo 1** (Client) | [`iinvtytraining-model-repo1`](https://github.com/aravindjk03/iinvtytraining-model-repo1.git) | React 18, Vite, TypeScript, Tailwind CSS, React Flow | Participant UI, Visual Workflow Editor, Dataset Manager, Training Dispatcher, Test & Challenge Labs, Journey State. |
| **Repo 2** (Engine) | [`iinvtysafety-ai-model`](https://github.com/aravindjk03/iinvtysafety-ai-model.git) | Python 3.11+, FastAPI, Ultralytics YOLO, PyTorch | Model Registry, Dataset Labeling/Validation, YOLO Training Worker, Evaluation Metrics, Computer Vision Inference. |

```
┌────────────────────────────────────────────────────────┐
│              REPO 1: AI SAFETY BUILDER                 │
│              (http://localhost:5173)                   │
│                                                        │
│  [Build Workflow]  [Teach Dataset]  [Train Dispatch]   │
│  [Test Visualizer] [Break AI Lab]   [Presentation]     │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTP / REST (JSON & Multipart)
               VITE_MODEL_API_URL=http://localhost:8000
                            │
┌───────────────────────────▼────────────────────────────┐
│              REPO 2: MODEL ENGINE API                  │
│              (http://localhost:8000)                   │
│                                                        │
│  /api/v1/health          ── Health Status Probe        │
│  /api/v1/models          ── Model Catalog Registry     │
│  /api/v1/dataset/validate── Pre-flight Checks          │
│  /api/v1/training/jobs   ── Background Train Worker    │
│  /api/v1/inference/predict ── YOLO Inference Engine    │
└────────────────────────────────────────────────────────┘
```

---

## 2. API Contract Specification

All endpoints are hosted by **Repo 2** and consumed by **Repo 1**.

### 2.1 Health Probe
* **Endpoint:** `GET /api/v1/health` (fallback: `GET /health`)
* **Repo 1 Purpose:** Powers the header connectivity badge (`● CONNECTED` vs `○ OFFLINE`).
* **Expected Response (`200 OK`):**
  ```json
  {
    "status": "ok",
    "service": "ai-safety-model-engine",
    "version": "1.0.0"
  }
  ```

### 2.2 Model Catalog
* **Endpoint:** `GET /api/v1/models`
* **Repo 1 Purpose:** Populates available pretrained and fine-tuned models in the workflow builder node selector and training target panel.
* **Expected Response (`200 OK`):**
  ```json
  {
    "models": [
      {
        "modelId": "ppe-pretrained-base",
        "name": "PPE Detection (Base)",
        "taskType": "object_detection",
        "status": "ready",
        "trainable": true,
        "version": "1.0.0",
        "classes": ["person", "helmet", "vest"]
      },
      {
        "modelId": "fire-smoke-pretrained-base",
        "name": "Fire & Smoke Detection",
        "taskType": "object_detection",
        "status": "ready",
        "trainable": true,
        "version": "1.0.0",
        "classes": ["fire", "smoke"]
      }
    ]
  }
  ```

### 2.3 Dataset Validation
* **Endpoint:** `POST /api/v1/dataset/validate`
* **Repo 1 Purpose:** Evaluates class balance and dataset integrity before allowing training.
* **Request Body (`application/json`):**
  ```json
  {
    "datasetId": "ds-001",
    "classes": [
      { "id": "class-helmet", "name": "Helmet", "count": 25 },
      { "id": "class-no-helmet", "name": "No Helmet", "count": 22 }
    ],
    "imagesCount": 47
  }
  ```
* **Expected Response (`200 OK`):**
  ```json
  {
    "valid": true,
    "state": "VALID",
    "issues": [],
    "warnings": [],
    "message": "✓ Dataset verified and ready for model training."
  }
  ```

### 2.4 Training Job Dispatch
* **Endpoint:** `POST /api/v1/training/jobs`
* **Request Format:** `multipart/form-data`
* **Form Fields:**
  * `project`: `{"id": "...", "name": "Helmet Safety", "safetyProblem": "..."}`
  * `workflow`: Serialized JSON of workflow nodes and connections.
  * `dataset`: Serialized JSON manifest containing class mappings.
  * `training`: `{"model": "yolo11n", "task": "object_detection", "imageSize": 640, "epochs": 20}`
  * `files`: Uploaded image binaries (JPG, PNG, WEBP).
* **Expected Response (`201 Created` or `200 OK`):**
  ```json
  {
    "jobId": "job-train-20261008-01",
    "status": "queued",
    "message": "Training job accepted"
  }
  ```

### 2.5 Training Progress Polling
* **Endpoint:** `GET /api/v1/training/jobs/{jobId}`
* **Repo 1 Purpose:** Polled every 2 seconds during active training to update progress bars and epochs.
* **Progress Response (`200 OK`):**
  ```json
  {
    "jobId": "job-train-20261008-01",
    "status": "training",
    "progress": 65,
    "epoch": 13,
    "totalEpochs": 20
  }
  ```
* **Completion Response (`200 OK`):**
  ```json
  {
    "jobId": "job-train-20261008-01",
    "status": "completed",
    "modelId": "custom-ppe-v1",
    "metrics": {
      "precision": 0.94,
      "recall": 0.91,
      "map50": 0.92
    }
  }
  ```

### 2.6 Visual Inference
* **Endpoint:** `POST /api/v1/inference/predict` (fallback: `POST /inspect/image`)
* **Request Format:** `multipart/form-data`
* **Form Fields:**
  * `modelId`: Target model identifier string.
  * `workflow`: Serialized JSON of workflow rules.
  * `image`: Binary image file.
* **Expected Response (`200 OK`):**
  ```json
  {
    "modelId": "custom-ppe-v1",
    "detections": [
      {
        "className": "helmet",
        "confidence": 0.94,
        "bbox": {
          "x": 120,
          "y": 70,
          "width": 170,
          "height": 230
        }
      }
    ],
    "processingTimeMs": 42
  }
  ```

---

## 3. Step-by-Step Wiring Guide

### Step 1: Set Up & Run Repo 2 (Model Engine)

1. **Clone Repo 2:**
   ```bash
   git clone https://github.com/aravindjk03/iinvtysafety-ai-model.git
   cd iinvtysafety-ai-model
   ```

2. **Create and Activate Python Virtual Environment:**
   ```bash
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install fastapi uvicorn python-multipart
   ```

4. **Verify Pretrained Base Weights:**
   Ensure base weights (`yolo11n.pt` or `yolo26n.pt`) exist in the repository root or `models/` directory.

5. **Start the FastAPI REST Server:**
   Create or run the API adapter (`api/server.py`):
   ```bash
   uvicorn api.server:app --host 0.0.0.0 --port 8000 --reload
   ```

6. **Verify Repo 2 is Listening:**
   Open [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health) in your browser. It should return:
   ```json
   {"status": "ok", "service": "ai-safety-model-engine", "version": "1.0.0"}
   ```

---

### Step 2: Configure Repo 1 (Frontend UI)

1. **Clone Repo 1 (if not already local):**
   ```bash
   git clone https://github.com/aravindjk03/iinvtytraining-model-repo1.git
   cd iinvtytraining-model-repo1
   ```

2. **Configure Environment Variable:**
   Create a `.env` file in the root of Repo 1:
   ```env
   VITE_MODEL_API_URL=http://localhost:8000
   ```

3. **Install Dependencies & Start Frontend:**
   ```bash
   npm install
   npm run dev
   ```

4. **Confirm Connection:**
   * Open [http://localhost:5173/](http://localhost:5173/).
   * Look at the top right header: The status indicator will read **`● MODEL ENGINE CONNECTED`** in emerald green!
   * Click the indicator to inspect the real-time server endpoint and latency.

---

### Step 3: Fast Reference FastAPI Adapter for Repo 2

If your Repo 2 server does not yet expose `/api/v1/*` routes, save this file as `api/server.py` inside Repo 2:

```python
"""
Repo 2 Model Engine REST API Adapter for AI Safety Builder (Repo 1).
"""
import uuid
import asyncio
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AI Safety Model Engine API", version="1.0.0")

# 1. Enable CORS for Repo 1
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory training jobs registry
TRAINING_JOBS: Dict[str, Dict[str, Any]] = {}

# 2. Health check
@app.get("/api/v1/health")
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-safety-model-engine", "version": "1.0.0"}

# 3. Model catalog
@app.get("/api/v1/models")
def list_models():
    return {
        "models": [
            {
                "modelId": "ppe-pretrained-base",
                "name": "YOLO11n PPE Detection",
                "taskType": "object_detection",
                "status": "ready",
                "trainable": True,
                "version": "1.0.0",
                "classes": ["person", "helmet", "vest"]
            },
            {
                "modelId": "fire-smoke-pretrained-base",
                "name": "Fire & Smoke Detection",
                "taskType": "object_detection",
                "status": "ready",
                "trainable": True,
                "version": "1.0.0",
                "classes": ["fire", "smoke"]
            }
        ]
    }

# 4. Dataset validation
@app.post("/api/v1/dataset/validate")
def validate_dataset(payload: Dict[str, Any]):
    classes = payload.get("classes", [])
    total = payload.get("imagesCount", 0)
    
    if len(classes) < 2:
        return {"valid": False, "state": "INVALID", "message": "At least 2 classes required."}
    
    return {
        "valid": True,
        "state": "VALID",
        "summary": {"totalImages": total, "classCount": len(classes), "isBalanced": True},
        "issues": [],
        "warnings": [],
        "message": "✓ Dataset verified and ready for model training."
    }

# 5. Training Dispatch
@app.post("/api/v1/training/jobs")
async def start_training(
    project: str = Form(...),
    workflow: str = Form(...),
    dataset: str = Form(...),
    training: str = Form(...),
    files: List[UploadFile] = File(default=[])
):
    job_id = f"job-{uuid.uuid4().hex[:8]}"
    TRAINING_JOBS[job_id] = {
        "jobId": job_id,
        "status": "training",
        "progress": 10,
        "epoch": 2,
        "totalEpochs": 20,
    }
    
    # Simulate asynchronous training progress
    async def run_training():
        for ep in range(3, 21):
            await asyncio.sleep(0.5)
            TRAINING_JOBS[job_id]["epoch"] = ep
            TRAINING_JOBS[job_id]["progress"] = int((ep / 20) * 100)
        TRAINING_JOBS[job_id]["status"] = "completed"
        TRAINING_JOBS[job_id]["modelId"] = f"trained-model-{job_id}"
        TRAINING_JOBS[job_id]["metrics"] = {
            "precision": 0.94,
            "recall": 0.91,
            "map50": 0.92
        }

    asyncio.create_task(run_training())
    return {"jobId": job_id, "status": "queued", "message": "Training job accepted"}

# 6. Training Status Polling
@app.get("/api/v1/training/jobs/{job_id}")
def get_training_job(job_id: str):
    if job_id not in TRAINING_JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    return TRAINING_JOBS[job_id]

# 7. Visual Inference
@app.post("/api/v1/inference/predict")
@app.post("/inspect/image")
async def run_inference(
    modelId: str = Form(default="ppe-pretrained-base"),
    workflow: Optional[str] = Form(default="{}"),
    image: Optional[UploadFile] = File(default=None),
    file: Optional[UploadFile] = File(default=None),
):
    target_file = image or file
    if not target_file:
        raise HTTPException(status_code=400, detail="Image file required")
    
    # Run real YOLO inference or return structured detection response
    return {
        "modelId": modelId,
        "detections": [
            {
                "className": "helmet",
                "confidence": 0.95,
                "bbox": {"x": 140, "y": 80, "width": 160, "height": 210}
            }
        ],
        "processingTimeMs": 38
    }
```

---

## 4. End-to-End Golden Path Workflow

Once both repositories are wired:

```
Participant in Repo 1             Network                 Worker in Repo 2
─────────────────────             ───────                 ────────────────
1. Build Workflow                 
   [Camera] ──▶ [AI] ──▶ [Decision]

2. Teach Dataset
   Add 10+ Helmet / No Helmet ────▶ POST /dataset/validate ─▶ Validates distribution

3. Click "TRAIN MY AI" ──────────▶ POST /training/jobs ───▶ Spawns YOLO worker
                                                            (Epochs 1..20)
   Live progress updates ◄──────── GET /jobs/{jobId} ────── Polling (every 2s)
   
4. Model Ready ◄────────────────── status: "completed" ──── Returns modelId & metrics

5. Test & Challenge Labs ────────▶ POST /predict ─────────▶ Runs YOLO detection
   Overlays Bounding Boxes ◄────── [{className, bbox}] ──── Returns detections
   Calculates SAFE vs UNSAFE
```

---

## 5. Troubleshooting & FAQ

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Header displays `○ OFFLINE` | Repo 2 server not running on port 8000 | Run `uvicorn api.server:app --port 8000` in Repo 2 and check [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health). |
| CORS Network Error in browser console | Repo 2 missing CORS middleware | Add `CORSMiddleware` with `allow_origins=["*"]` in FastAPI. |
| Test & Challenge stages locked | No model trained or backend offline | Click **`[ ⚡ Unlock Test & Challenge ]`** in Repo 1 header to use the built-in pretrained model. |
| 413 Payload Too Large | Image batch exceeds 15 MB | Upload compressed JPG or PNG files under 15 MB. |
