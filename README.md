# 🚀 DeployFlow — DevOps Team Role Simulator

A gamified DevOps pipeline simulator where users pick a role (Developer, QA, DevOps, Manager) and collaboratively move a project through a real-world CI/CD pipeline.

## 🧱 Tech Stack
- **Frontend**: React (Vite) + TailwindCSS
- **Backend**: Node.js + Express + Socket.io
- **Database**: PostgreSQL
- **Monitoring**: Prometheus + Grafana
- **Deployment**: Docker Compose

## 📁 Project Structure
```
DeployFlow/
├── frontend/                      # React Vite app (Tailwind, Framer Motion)
├── backend/                       # Express API + Socket.io+Node.JS+Prometheus client
├── database/                      # PostgreSQL init script
├── docker-compose.yml             # Main application stack
├── docker-compose.monitoring.yml  # Monitoring stack (Prometheus & Grafana)
├── prometheus.yml                 # Prometheus configuration
├── Jenkinsfile                    # CI/CD Pipeline definition
└── .env                           # Environment variables
```

## ⚙️ Getting Started

### 1. Clone & configure
```bash
git clone <repo-url>
cd DeployFlow
cp .env .env.local   # edit as needed
```

### 2. Run with Docker (Application)
```bash
docker-compose up --build
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost       |
| Backend  | http://localhost:5000  |
| Database | localhost:5433         |

### 3. Run Monitoring Stack (Prometheus & Grafana)
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

| Service    | URL                           | Credentials       |
|------------|-------------------------------|-------------------|
| Grafana    | http://localhost:3000         | admin / admin     |
| Prometheus | http://localhost:9090         |                   |
| Metrics    | http://localhost:5000/metrics |                   |

### 4. Run locally (without Docker)
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## 🎮 Roles & Actions

| Role      | Action           | API Endpoint               |
|-----------|------------------|----------------------------|
| Developer | Push Code        | POST /api/pipeline/build   |
| QA        | Run Tests        | POST /api/pipeline/test    |
| DevOps    | Deploy           | POST /api/pipeline/deploy  |
| Manager   | Approve Release  | POST /api/pipeline/release |
