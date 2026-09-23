# Smart Attendance Management System — DevOps Edition

A full-stack attendance system with Student, Teacher, and Admin roles, attendance analytics, Docker, PostgreSQL, CI, and production-oriented deployment files.

## Stack
- Frontend: React + Vite + TypeScript + Recharts
- Backend: Node.js + Express + TypeScript + Prisma
- Database: PostgreSQL
- Auth: JWT + bcrypt
- DevOps: Docker Compose + GitHub Actions + Nginx
- Optional monitoring: Prometheus

## Prerequisites
- Docker Desktop (recommended)
- Git
- Node.js 20+ only if you want to run frontend/backend without Docker

## Run with Docker
1. Copy `.env.example` to `.env`.
2. Run:
   `docker compose up --build`
3. Open:
   `http://localhost`

The API is available at `http://localhost:4000`.
Health check: `http://localhost:4000/health`

Demo accounts:
- Admin: `admin@demo.local` / `Admin@123`
- Teacher: `teacher@demo.local` / `Teacher@123`
- Student: `student@demo.local` / `Student@123`

The seed creates sample classes, subjects, students, a teacher, enrollments, and attendance history.

## Production deployment
A practical first deployment is a Linux VM with Docker Compose and Nginx:
`docker compose -f docker-compose.prod.yml up -d --build`

## CI/CD
`.github/workflows/ci.yml` runs backend/frontend tests and builds.
`.github/workflows/cd.yml` builds Docker images and pushes them to GHCR.
