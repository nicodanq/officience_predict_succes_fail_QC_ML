# 🚀 QC Marlink Project — Frontend + Backend (Dockerized)

This project includes:
- **Frontend** → Next.js web application (user interface)
- **Backend** → FastAPI service (prediction model)
- Fully orchestrated using **Docker Compose**

---

## 🧱 Project Structure

ai_qc_project/
│
├── qc_marlink_frontend/ # Frontend (Next.js + shadcn/ui)
│ ├── Dockerfile
│ ├── package.json
│ ├── .env.sample
│ └── ...
│
├── api/ # Backend (FastAPI + ML)
│ ├── Dockerfile
│ ├── main.py
│ ├── requirements.txt
│ └── core/
│
├── compose.yaml # Docker Compose configuration
└── README.md

yaml
Copier le code

---

## ⚙️ Prerequisites

Before running this project, make sure you have installed:

- 🐳 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- 🧩 (Optional) [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/) if you want to run the frontend locally without Docker

---

## 🔐 Environment Variables

### 🧩 `.env` file

Create a `.env` file at the project root (or copy from the provided sample):

```bash
cp .env.sample .env
Inside it, set at least:

env
Copier le code
NEXT_PUBLIC_API_URL=http://backend:8000
⚠️ Important Notes:

http://backend:8000 → used inside Docker (via the internal network)

If you run the frontend locally (without Docker), change it to:

ini
Copier le code
NEXT_PUBLIC_API_URL=http://localhost:8000
🚀 Run with Docker
Step 1 — Build the images
bash
Copier le code
docker compose build
This command builds both:

The Next.js frontend image

The FastAPI backend image

Step 2 — Start the containers
bash
Copier le code
docker compose up
Both containers (frontend and backend) will start together and communicate internally.

🌍 Access the Services
Service	URL	Description
Frontend	http://localhost:3000	Next.js web application
Backend API	http://localhost:8000	FastAPI backend
API Docs (Swagger)	http://localhost:8000/docs	Interactive API documentation
API Docs (ReDoc)	http://localhost:8000/redoc	Static API documentation

🧰 Useful Commands
Stop all containers
bash
Copier le code
docker compose down
Rebuild everything from scratch
bash
Copier le code
docker compose build --no-cache
View logs
bash
Copier le code
docker compose logs backend
docker compose logs frontend
Enter a container shell
bash
Copier le code
docker exec -it qc_backend /bin/sh
🧠 Run Locally (without Docker)
You can also run both services independently for development.

▶️ Backend (FastAPI)
bash
Copier le code
cd api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
▶️ Frontend (Next.js)
bash
Copier le code
cd qc_marlink_frontend
pnpm install
pnpm dev
Then open http://localhost:3000 in your browser.

✅ Troubleshooting
Issue	Likely Cause	Solution
❌ Backend container stops	Missing Python package (shap, pandas, etc.)	Check and update requirements.txt
❌ Frontend can't reach API	Incorrect .env value	Use NEXT_PUBLIC_API_URL=http://backend:8000
⚙️ permission denied error	Docker Desktop not running	Start Docker before running docker compose up
🐍 ImportError in backend	Wrong import path or module name	Check CMD ["uvicorn", "main:app", ...] in backend Dockerfile

🧾 License
Internal project — Officience
© 2025 QC Marlink Project

👨‍💻 Author
Nicolas Danquigny — Fullstack Developer Intern @ Officience

yaml
Copier le code

---

Would you like me to include a **section with GitHub badges and quick-start command highlights** (for a more polished public-facing README)?