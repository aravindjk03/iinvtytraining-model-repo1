# AI Safety Builder — Model Engine REST API Contract (v1)

This document specifies the exact REST API contract between **Repo 1** (`ai-safety-builder` frontend) and **Repo 2** (`SafetyVisionAI` / Model Engine backend).

---

## Base Path
All endpoints are relative to `VITE_MODEL_API_URL` (default: `http://localhost:8000`).

---

## 1. Health Probe

### `GET /api/v1/health`
Checks whether the Model Engine service is running, ready to accept workloads, and returns service metadata.

- **Purpose**: System connectivity verification and health status bar indicator in Repo 1.
- **Method**: `GET`
- **Path**: `/api/v1/health`
- **Request Format**: None (no headers or body required)
- **Required Fields**: None
- **Response Format**: `application/json`
- **Response Schema**:
  ```json
  {
    "status": "ok",
    "service": "ai-safety-model-engine",
    "version": "1.0"
  }
  ```
- **Error Behavior**:
  - `503 Service Unavailable`: If the engine is warming up or resources are unavailable.
  - Connection refused/timeout: Front-end catches network errors and marks status as `OFFLINE`.
- **Example Request**:
  ```http
  GET /api/v1/health HTTP/1.1
  Host: localhost:8000
  Accept: application/json
  ```
- **Example Response**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "status": "ok",
    "service": "ai-safety-model-engine",
    "version": "1.0"
  }
  ```

---

## 2. Dispatch Training Job

### `POST /api/v1/training/jobs`
Accepts a training request including project metadata, workflow JSON, dataset manifest, training hyperparameters, and training image binaries via multipart/form-data.

- **Purpose**: Queues and starts a vision model training job (e.g., YOLO26n) on the backend.
- **Method**: `POST`
- **Path**: `/api/v1/training/jobs`
- **Request Format**: `multipart/form-data`
- **Form Fields**:
  - `project`: (string, JSON-serialized) `{ id: string, name: string, safetyProblem: string }`
  - `workflow`: (string, JSON-serialized) `{ version: "1.0", nodes: Array, connections: Array }`
  - `dataset`: (string, JSON-serialized) `{ version: "1.0", datasetId: string, classes: Array }`
  - `training`: (string, JSON-serialized) `{ model: "yolo26n", task: "object_detection", imageSize: number, epochs: number }`
  - `files`: (binary, multiple files) Image files corresponding to image IDs in the dataset manifest.
- **Response Format**: `application/json`
- **Response Schema**:
  ```json
  {
    "jobId": "job-20261008-001",
    "status": "queued",
    "message": "Training job accepted"
  }
  ```
- **Error Behavior**:
  - `400 Bad Request`: Invalid or missing JSON parts, missing required classes.
  - `413 Payload Too Large`: Total dataset size exceeds engine capacity.
  - `422 Unprocessable Entity`: Schema validation errors in workflow or training configurations.
  - `429 Too Many Requests`: Engine compute busy with other training tasks.
- **Example Request**:
  ```http
  POST /api/v1/training/jobs HTTP/1.1
  Host: localhost:8000
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXYZ

  ------WebKitFormBoundaryXYZ
  Content-Disposition: form-data; name="project"

  {"id":"proj-001","name":"PPE Detection","safetyProblem":"Detect worker helmet compliance"}
  ------WebKitFormBoundaryXYZ
  Content-Disposition: form-data; name="workflow"

  {"version":"1.0","nodes":[],"connections":[]}
  ------WebKitFormBoundaryXYZ
  Content-Disposition: form-data; name="dataset"

  {"version":"1.0","datasetId":"ds-001","classes":[{"id":"c1","name":"Helmet","imageIds":["img-1"]}]}
  ------WebKitFormBoundaryXYZ
  Content-Disposition: form-data; name="training"

  {"model":"yolo26n","task":"object_detection","imageSize":640,"epochs":20}
  ------WebKitFormBoundaryXYZ
  Content-Disposition: form-data; name="files"; filename="img-1.jpg"
  Content-Type: image/jpeg

  <binary image data>
  ------WebKitFormBoundaryXYZ--
  ```
- **Example Response**:
  ```http
  HTTP/1.1 201 Created
  Content-Type: application/json

  {
    "jobId": "job-872f91-20261008",
    "status": "queued",
    "message": "Training job accepted"
  }
  ```

---

## 3. Query Training Job Status

### `GET /api/v1/training/jobs/{jobId}`
Queries the live status, progress, current epoch, and terminal evaluation metrics for a dispatched training job.

- **Purpose**: Polled periodically by Repo 1 during active training until a terminal status is returned.
- **Method**: `GET`
- **Path**: `/api/v1/training/jobs/{jobId}`
- **Request Format**: None (path parameter `jobId`)
- **Required Fields**: `jobId` in path
- **Response Format**: `application/json`
- **Response Schema**:
  ```json
  {
    "jobId": "job-872f91-20261008",
    "status": "training",
    "progress": 70,
    "epoch": 14,
    "totalEpochs": 20,
    "modelId": null,
    "metrics": null
  }
  ```
  *Terminal Success Schema*:
  ```json
  {
    "jobId": "job-872f91-20261008",
    "status": "completed",
    "progress": 100,
    "epoch": 20,
    "totalEpochs": 20,
    "modelId": "model-yolo26n-safety-001",
    "metrics": {
      "precision": 0.93,
      "recall": 0.89,
      "map50": 0.91
    }
  }
  ```
- **Allowed `status` Values**:
  - `queued`
  - `preparing`
  - `training`
  - `validating`
  - `completed` (Terminal)
  - `failed` (Terminal)
  - `cancelled` (Terminal)
- **Error Behavior**:
  - `404 Not Found`: Unknown `jobId`.
- **Example Request**:
  ```http
  GET /api/v1/training/jobs/job-872f91-20261008 HTTP/1.1
  Host: localhost:8000
  Accept: application/json
  ```
- **Example Response (Terminal)**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "jobId": "job-872f91-20261008",
    "status": "completed",
    "progress": 100,
    "epoch": 20,
    "totalEpochs": 20,
    "modelId": "model-yolo26n-safety-001",
    "metrics": {
      "precision": 0.93,
      "recall": 0.89,
      "map50": 0.91
    }
  }
  ```

---

## 4. Run Model Inference (Prediction)

### `POST /api/v1/inference/predict`
Runs object detection inference on a provided image using a trained model.

- **Purpose**: Evaluates test and challenge images against trained safety models.
- **Method**: `POST`
- **Path**: `/api/v1/inference/predict`
- **Request Format**: `multipart/form-data`
- **Form Fields**:
  - `modelId`: (string, required) Identifier of the trained model returned by completed training job.
  - `image`: (binary, required) JPG, PNG, or WEBP image payload.
  - `workflow`: (string, optional JSON) The active workflow JSON definition for condition routing.
- **Response Format**: `application/json`
- **Response Schema**:
  ```json
  {
    "modelId": "model-yolo26n-safety-001",
    "detections": [
      {
        "className": "helmet",
        "confidence": 0.94,
        "bbox": {
          "x": 120,
          "y": 80,
          "width": 180,
          "height": 240
        }
      }
    ],
    "processingTimeMs": 42
  }
  ```
- **Bounding Box Format**:
  - Coordinates may be absolute pixel values (`x`, `y`, `width`, `height`) or normalized values (`0.0 - 1.0`). Repo 1 normalizes automatically based on input image dimensions.
  - If no objects are detected, `detections` is an empty array `[]`.
- **Error Behavior**:
  - `400 Bad Request`: Missing image or model ID.
  - `404 Not Found`: `modelId` not found or model unloaded.
  - `413 Payload Too Large`: Image file exceeds 15 MB limit.
  - `500 Internal Server Error`: GPU out of memory or inference runtime failure.
- **Example Request**:
  ```http
  POST /api/v1/inference/predict HTTP/1.1
  Host: localhost:8000
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXYZ

  ------WebKitFormBoundaryXYZ
  Content-Disposition: form-data; name="modelId"

  model-yolo26n-safety-001
  ------WebKitFormBoundaryXYZ
  Content-Disposition: form-data; name="image"; filename="inspection.jpg"
  Content-Type: image/jpeg

  <binary image data>
  ------WebKitFormBoundaryXYZ--
  ```
- **Example Response**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "modelId": "model-yolo26n-safety-001",
    "detections": [
      {
        "className": "helmet",
        "confidence": 0.94,
        "bbox": {
          "x": 120,
          "y": 80,
          "width": 180,
          "height": 240
        }
      }
    ],
    "processingTimeMs": 42
  }
  ```
