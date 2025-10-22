# 🚀 QC Marlink Project — Frontend + Backend (Dockerized)

This project includes:
- **Frontend** → Next.js web application (user interface)
- **Backend** → FastAPI service (prediction model)
- Fully orchestrated using **Docker Compose**

---

## 🧱 Project Structure

```bash
ai_qc_project/
│
├── qc_marlink_frontend/     # Frontend (Next.js + shadcn/ui)
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.sample
│   └── ...
│
├── api/                     # Backend (FastAPI + ML)
│   ├── Dockerfile
│   ├── main.py
│   ├── requirements.txt
│   └── core/
│
├── compose.yaml             # Docker Compose configuration
└── README.md
```

---

## ⚙️ Prerequisites

```bash
# Make sure you have installed:
# - Docker Desktop
# - (Optional) pnpm or npm if you want to run the frontend locally without Docker
```

---

## 🔐 Environment Variables

```bash
# Create a .env file at the project root (or copy the provided sample)
cp .env.sample .env
```

```bash
# Minimum required content:
NEXT_PUBLIC_API_URL=http://backend:8000
```

> 💡 **Notes**
> - Use `http://backend:8000` when running inside Docker (internal network)
> - Use `http://localhost:8000` when running the frontend locally (without Docker)

---

## 🚀 Run with Docker

```bash
# Step 1 — Build images
docker compose build
```

```bash
# Step 2 — Start services
docker compose up
```

---

## 🌍 Access the Services

```bash
Frontend (Next.js):        http://localhost:3000
Backend API (FastAPI):     http://localhost:8000
API Docs (Swagger):        http://localhost:8000/docs
API Docs (ReDoc):          http://localhost:8000/redoc
```

---

## 🧰 Useful Commands

```bash
# Stop all containers
docker compose down

# Rebuild everything from scratch
docker compose build --no-cache

# View logs
docker compose logs backend
docker compose logs frontend

# Enter a container shell
docker exec -it qc_backend /bin/sh
```

---

## 🧠 Run Locally (without Docker)

```bash
# Run Backend (FastAPI)
cd api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

```bash
# Run Frontend (Next.js)
cd qc_marlink_frontend
pnpm install
pnpm dev
```

```bash
# Open the app
http://localhost:3000
```

---

## ✅ Troubleshooting

```bash
# Backend container stops immediately
# → Missing Python dependencies (e.g., shap, pandas)
# → Fix: update api/requirements.txt and rebuild

# Frontend can't reach API
# → Incorrect .env value
# → Fix: NEXT_PUBLIC_API_URL=http://backend:8000 (Docker)
#        NEXT_PUBLIC_API_URL=http://localhost:8000 (Local)

# "permission denied" / cannot connect
# → Docker Desktop not running
# → Fix: start Docker before docker compose up

# ImportError in backend
# → Wrong module path or startup command
# → Fix: ensure Dockerfile uses:
#   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🧾 License

```bash
Internal project — Officience
© 2025 QC Marlink Project
```

---

## 👨‍💻 Author

```bash
Nicolas Danquigny
Fullstack Developer Intern @ Officience
```
