# Smart Attendance DevOps LAB — Complete Guide

## Step 1 — Install tools

Install Git, Docker Desktop and VS Code. Node.js 20+ is optional when Docker is used.

## Step 2 — Clone

```bash
git clone https://github.com/247r1a05c2-b/smart-attendance-devops.git
cd smart-attendance-devops
```

## Step 3 — Run the complete application

```bash
docker compose up --build
```

Open `http://localhost`.

## Step 4 — Test roles

Student: `student@demo.local / Student@123`

Teacher: `teacher@demo.local / Teacher@123`

Admin: `admin@demo.local / Admin@123`

## Step 5 — Explain Docker

Compose runs PostgreSQL, Express and Nginx/React as separate containers.

## Step 6 — Explain Git

```bash
git checkout -b feature/test-change
git add .
git commit -m "Test DevOps workflow"
git push -u origin feature/test-change
```

Create a Pull Request and merge it after CI passes.

## Step 7 — Explain CI

GitHub Actions installs dependencies, tests, builds frontend/backend and validates Docker Compose.

## Step 8 — Explain CD

The CD workflow builds backend and frontend Docker images and publishes them to GHCR.

## Step 9 — Deploy

Connect the repository to Railway, create PostgreSQL, backend and frontend services, and configure variables from DEPLOYMENT.md.

## Step 10 — Monitor

Open `/health` and `/metrics`.

## Viva answer

"This project demonstrates the DevOps lifecycle for a Smart Attendance application. GitHub manages source code. Docker packages the application and database environment. GitHub Actions automatically tests and builds every change. The CD workflow builds container images. The application is deployed to a cloud platform and the health endpoint provides basic monitoring."

## Final checklist

- [ ] Application works locally
- [ ] PostgreSQL works
- [ ] Docker Compose works
- [ ] GitHub repository is updated
- [ ] CI passes
- [ ] CD builds images
- [ ] Deployment is live
- [ ] /health works
- [ ] README is ready
- [ ] LAB demo is rehearsed
