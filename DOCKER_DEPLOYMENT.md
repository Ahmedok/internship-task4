# Docker Compose Setup - Simple Deployment

## Architecture

```
External NPM Proxy
    ↓
Client Container (port 8080)
    ├── Frontend (Nginx) → serves React SPA
    └── API Proxy → forwards /api/* to server:3000
         ↓
Server Container (internal)
    ↓
Database Container (internal)
```

**Key Design:** Client nginx handles both frontend AND API proxying. Your external NPM only needs to proxy to **one port: 8080**

## Quick Start

### 1. Environment Setup

```bash
# Optional: Create .env for custom database password
cp .env.example .env
nano .env  # Set your credentials
```

### 2. Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Configure External NPM

Point your reverse proxy to: `http://your-lxc-ip:8080`

That's it! The client nginx handles everything.

## Services

**Client (port 8080)**

- Serves React frontend
- Proxies `/api/*` to backend
- Single entry point for NPM

**Server (internal)**

- Node.js API on port 3000
- Only accessible from client

**Database (internal)**

- PostgreSQL 18-alpine
- Data persist in `postgres_data` volume

## Maintenance

```bash
# Restart
docker-compose restart

# Logs
docker-compose logs -f

# Rebuild
docker-compose build --no-cache
docker-compose up -d

# Backup database
docker-compose exec db pg_dump -U tasker4 task4db > backup.sql

# Stop and remove
docker-compose down
```
