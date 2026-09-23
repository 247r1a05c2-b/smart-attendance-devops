# Deployment guide

## Local
Copy .env.example to .env and run:
docker compose up --build

## Production
Use a Linux host with Docker:
docker compose -f docker-compose.prod.yml up -d --build

The application exposes the frontend on port 80 and proxies /api to the backend. PostgreSQL is internal and should never be exposed publicly.

## CI/CD
The repository workflow builds and pushes backend/frontend images to GHCR on pushes to main. A cloud-specific deployment step can be added after connecting a deployment provider.
