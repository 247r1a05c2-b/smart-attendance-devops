# Smart Attendance Management System — DevOps LAB

A simple college LAB project that demonstrates the DevOps lifecycle using a Smart Attendance application.

## Features

### Student
- Login and dashboard
- Attendance percentage and status
- Subject-wise attendance analysis
- Attendance trend graph
- Low-attendance warning below 75%
- Attendance history
- CSV export

### Teacher
- Login
- Assigned class dashboard
- Mark PRESENT / ABSENT attendance
- Student search/filter while marking attendance
- Class-wise analytics
- Low-attendance alerts
- CSV export

### Admin
- Dashboard with attendance analytics
- Add/remove students
- Add/remove teachers
- Create/remove classes
- Search/filter lists
- Low-attendance alerts
- Audit log
- Full attendance CSV export
- DevOps monitoring dashboard

## DevOps concepts demonstrated

**Plan → Develop → Git → Test → Docker → CI → CD → Deploy → Monitor**

| Concept | Implementation |
|---|---|
| Source control | GitHub |
| CI | GitHub Actions |
| Testing | Node.js built-in test runner |
| Containerization | Docker |
| CD / deployment | Render |
| Health check | `/health` |
| Runtime monitoring | `/api/devops/status` |
| Application | Node.js + Express + HTML/CSS/JS |

## Local run

```bash
npm install
npm start
```

Open `http://localhost:10000`.

Docker:

```bash
docker build -t smart-attendance .
docker run -p 10000:10000 smart-attendance
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@demo.local | Admin@123 |
| Teacher | teacher@demo.local | Teacher@123 |
| Student | student@demo.local | Student@123 |

These are LAB demo credentials stored in the sample application.

## CI/CD

The GitHub Actions workflow runs on pushes and pull requests to `main`. It installs dependencies, runs tests, and builds the Docker image.

Render is connected to the `main` branch. When a new commit is pushed, Render can automatically build and deploy the Docker service. Render also supports waiting for CI checks before deployment. citeturn0search3turn0search2

## Monitoring

- `GET /health` — lightweight service health endpoint.
- `GET /api/devops/status` — uptime, request count, memory, Node version, deployment commit and pipeline stages.
- Render uses the configured `/health` path for HTTP health checks. A 2xx/3xx response is considered healthy. citeturn0search1

## Important LAB note

This simplified version intentionally uses **in-memory data** instead of PostgreSQL so the project stays easy to understand and deploy for a college LAB. Data resets when the service restarts or redeploys. Render services use an ephemeral filesystem by default, so persistent application data requires a datastore or persistent storage. citeturn0search3

## Deployment

The included `Dockerfile` and `render.yaml` are configured for a Render Docker web service. Render web services must listen on `0.0.0.0` and normally use the `PORT` environment variable; this app does both. citeturn0search0

## LAB demonstration flow

1. Login as Student and show subject analysis, trend graph, low-attendance warning and CSV export.
2. Login as Teacher and mark attendance.
3. Open Teacher Analytics.
4. Login as Admin and show counts, subject analytics, search/filter, audit log and CSV export.
5. Open DevOps Monitor and show uptime, memory, request count and pipeline stages.
6. Show GitHub Actions passing.
7. Show Dockerfile and Docker image build.
8. Show Render deployment and `/health`.

## Git example

```bash
git checkout -b feature/attendance-analytics
git add .
git commit -m "Add attendance analytics and DevOps monitoring"
git push -u origin feature/attendance-analytics
```

Open a Pull Request and merge to `main` after CI passes.
