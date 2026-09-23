# Simple Deployment Guide

## Architecture

Use:
- PostgreSQL database
- Backend Docker service
- Frontend Docker service

The frontend proxies `/api` requests to the backend.

## Railway setup

1. Create a Railway project.
2. Add a PostgreSQL service.
3. Add the GitHub repository as the backend service.
4. Set backend root directory to `backend`.
5. Set:
   - DATABASE_URL = Railway PostgreSQL connection string
   - JWT_SECRET = long random secret
   - PORT = 4000
   - CORS_ORIGIN = frontend public URL
6. Set backend health check path to `/health`.
7. Add another service from the same GitHub repository for the frontend.
8. Set frontend root directory to `frontend`.
9. Expose the frontend service publicly.
10. Open the frontend URL.

The repository is a monorepo, so frontend and backend are separate services. PostgreSQL should not be public.

## Environment variables

Example backend:

```
DATABASE_URL=<Railway PostgreSQL URL>
JWT_SECRET=<random secret>
PORT=4000
CORS_ORIGIN=<frontend URL>
```

Never put production secrets into source code.

## Deployment test

Open:

```
https://YOUR-FRONTEND-URL/
https://YOUR-BACKEND-URL/health
```

## CI/CD demonstration

Make a small UI change:

```bash
git add .
git commit -m "Update dashboard"
git push origin main
```

GitHub Actions runs CI/CD and the deployment platform redeploys the changed service.
