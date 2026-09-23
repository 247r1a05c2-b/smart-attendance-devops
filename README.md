# Smart Attendance Management System — DevOps LAB Project

## Objective

Build a simple attendance web application and demonstrate the complete DevOps lifecycle:

**Plan → Develop → Git → Test → Docker → CI → CD → Deploy → Monitor**

## Application

### Student
- Login
- Attendance percentage
- Subject-wise attendance
- Attendance history
- Attendance trend

### Teacher
- Login
- Assigned subjects
- Select date
- Mark PRESENT / ABSENT / LATE / EXCUSED
- Save attendance

### Admin
- Login
- Student/teacher/class/subject counts
- Student list

## Technology

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT + bcrypt |
| Containers | Docker + Docker Compose |
| Source control | GitHub |
| CI | GitHub Actions |
| CD | GitHub Actions + deployment platform |
| Deployment | Railway or another Docker host |
| Monitoring | /health and /metrics |

## Local setup

### Docker — recommended for the LAB

```bash
docker compose up --build
```

Open `http://localhost`.

Health check:

```
http://localhost:4000/health
```

The first startup creates the database tables and demo data.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@demo.local | Admin@123 |
| Teacher | teacher@demo.local | Teacher@123 |
| Student | student@demo.local | Student@123 |

These are demo credentials only. Change them before any real deployment.

## Run without Docker

Start PostgreSQL and create a database named `attendance`.

Backend:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

## DevOps workflow

```
Developer
   |
   | git push
   v
GitHub
   |
   v
GitHub Actions
   |
   +--> Install
   +--> Test
   +--> Build
   +--> Docker build
   |
   v
Container Registry
   |
   v
Deployment Platform
   |
   v
Live Smart Attendance Website
   |
   v
Health Check / Monitoring
```

## CI

The workflow in `.github/workflows/ci.yml` runs automatically on pushes and pull requests.

It:
1. Starts PostgreSQL.
2. Installs backend dependencies.
3. Generates Prisma client.
4. Builds backend.
5. Runs backend tests.
6. Installs frontend dependencies.
7. Builds frontend.
8. Runs frontend tests.
9. Validates Docker Compose.

## CD

The workflow in `.github/workflows/cd.yml` builds Docker images and publishes them to GitHub Container Registry (GHCR).

For a simple LAB deployment, connect the GitHub repository to Railway and configure the frontend/backend/database services. See `docs/DEPLOYMENT.md`.

## Monitoring

Backend endpoints:

```
GET /health
GET /metrics
```

`/health` confirms that the API can reach PostgreSQL.

`/metrics` exposes a minimal Prometheus-compatible metric.

## Git demonstration

```bash
git clone https://github.com/247r1a05c2-b/smart-attendance-devops.git
cd smart-attendance-devops
git checkout -b feature/dashboard
# make a change
git add .
git commit -m "Add dashboard improvement"
git push -u origin feature/dashboard
```

Create a Pull Request on GitHub. After review, merge to `main`.

## LAB demonstration

1. Show student login and attendance dashboard.
2. Show teacher marking attendance.
3. Show PostgreSQL-backed data.
4. Run Docker Compose.
5. Show GitHub repository.
6. Show passing GitHub Actions CI.
7. Show Docker images built by CD.
8. Show deployed application.
9. Open `/health`.

## DevOps concepts demonstrated

- Version control
- Branching
- Pull requests
- Automated testing
- Continuous Integration
- Containerization
- Container registry
- Continuous Delivery/Deployment
- Environment variables
- Database service
- Health checks
- Basic monitoring
- Documentation

## Security

Never commit `.env`, passwords, API tokens, or private keys.

Use repository/deployment secrets for production credentials.
