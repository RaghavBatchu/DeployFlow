# 🚀 DeployFlow — DevOps Team Role Simulator

A gamified DevOps pipeline simulator where users pick a role (Developer, QA, DevOps, Manager) and collaboratively move a project through a real-world CI/CD pipeline.

## 🧱 Tech Stack
- **Frontend**: React (Vite) + CSS
- **Backend**: Node.js + Express + Socket.io
- **Database**: PostgreSQL
- **Deployment**: Docker Compose

## 📁 Project Structure
```
DeployFlow/
├── frontend/       # React Vite app
├── backend/        # Express API + Socket.io
├── database/       # PostgreSQL init script
├── docker-compose.yml
└── .env
```

## ⚙️ Getting Started

### 1. Clone & configure
```bash
git clone <repo-url>
cd DeployFlow
cp .env .env.local   # edit as needed
```

### 2. Run with Docker
```bash
docker-compose up --build
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| Backend  | http://localhost:5000  |
| Database | localhost:5432         |

### 3. Run locally (without Docker)
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

## 📜 License
MIT
