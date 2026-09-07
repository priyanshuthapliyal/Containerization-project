# Docker & Orchestration Architecture Guide

This guide provides an in-depth breakdown of the containerization and orchestration setup for the **Campus Placement Portal**. It explains how the Dockerfiles, Nginx configurations, and Docker Compose files are structured, why specific instructions were chosen, and how to troubleshoot common issues (such as empty databases and login errors).

---

## 📁 Architecture Overview

The application is split into three containerized services running on a secure, private bridge network:

```mermaid
graph TD
    Client[Client Browser] -->|Port 80/8080| FE[Frontend Nginx Container]
    FE -->|Serves Static Files| Client
    FE -->|Proxies /api/v1| BE[Backend Node.js Container]
    FE -->|Proxies /uploads| BE
    BE -->|Connects internally| DB[(MongoDB Container)]
    
    subgraph Private Docker Network (placement-net)
        FE
        BE
        DB
    end
```

---

## 1. Backend Dockerfile Breakdown

The backend uses a production-ready, single-stage Dockerfile located at `backend/Dockerfile`. Since this is a raw JavaScript project (no TypeScript or compilation required), a single stage is highly efficient.

### Line-by-Line Breakdown

```dockerfile
FROM node:20-alpine
```
* **`FROM node:20-alpine`**: Uses a lightweight Alpine Linux image pre-configured with Node.js 20. Alpine keeps the final image size minimal.

```dockerfile
ENV NODE_ENV=production
ENV PORT=5000
```
* **`ENV ...`**: Defines environment variables inside the container. Setting `NODE_ENV=production` optimizes third-party node libraries (like Express) to disable debugging and run at maximum speed.

```dockerfile
WORKDIR /app
```
* **`WORKDIR /app`**: Creates and navigates to the active runtime folder.

```dockerfile
RUN mkdir -p /app/uploads && chown -R node:node /app
```
* **`RUN mkdir... && chown...`**: Pre-creates the `uploads/` directory where student resume PDFs are stored. Crucially, it changes the ownership of `/app` recursively to the built-in non-root user `node`. If we skip this, the folder would belong to `root`, causing write-permission errors when a non-root user runs the application.

```dockerfile
COPY --chown=node:node package*.json ./
RUN npm ci --only=production && npm cache clean --force
```
* **`COPY --chown=node:node package*.json ./`**: Copies the manifests into the clean runner stage, applying the correct user permissions.
* **`RUN npm ci --only=production...`**: Installs *only* the production dependencies listed under `"dependencies"` in `package.json`, completely omitting `"devDependencies"` (like nodemon). It cleans the NPM cache to save disk space.

```dockerfile
COPY --chown=node:node . .
```
* **`COPY --chown=node:node . .`**: Copies the rest of the backend source code (routes, controllers, models, utils) into the image, excluding folders defined in `.dockerignore`.

```dockerfile
USER node
```
* **`USER node`**: Switches container execution from `root` to the standard unprivileged `node` user. This is a critical security step: if an attacker compromises the Node.js application, they are trapped inside the container without root system authority, preventing host takeover.

```dockerfile
EXPOSE 5000
```
* **`EXPOSE 5000`**: Documents that the container will listen on port 5000.

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1
```
* **`HEALTHCHECK ...`**: Instructs Docker to query the backend health check endpoint (`/health`) every 30 seconds. If the container freezes or database connection fails, the container status will switch to `unhealthy`, prompting orchestration tools (like Docker Compose or Kubernetes) to restart the container.

```dockerfile
CMD ["node", "server.js"]
```
* **`CMD ["node", "server.js"]`**: Executes the Node server directly. We avoid using `npm start` because NPM does not forward system signals (such as `SIGTERM` or `SIGINT`) down to the child Node process. By calling `node` directly, the application receives termination signals, enabling the graceful shutdowns configured in `server.js`.

---

## 2. Frontend Dockerfile Breakdown

The frontend uses a multi-stage Dockerfile at `frontend/Dockerfile` that builds the React project and serves it using Nginx.

### Line-by-Line Breakdown

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
```
* **`RUN npm ci --legacy-peer-deps`**: Installs the React project dependencies. The `--legacy-peer-deps` flag is required because React 19 has strict peer version mismatches with older libraries (like `lucide-react@0.395.0`), which would otherwise halt the build.

```dockerfile
COPY . .
ARG VITE_API_URL=/api/v1
ARG VITE_BACKEND_URL=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm run build
```
* **`ARG VITE_API_URL=/api/v1`**: Declares a build-time argument. Setting it to a relative path `/api/v1` ensures that the client's browser makes requests to the current host rather than a hardcoded domain.
* **`ENV VITE_API_URL=$VITE_API_URL`**: Bakes the build argument into the system environment so the Vite compilation process can read it.
* **`RUN npm run build`**: Compiles the React SPA, compressing assets and generating HTML/JS/CSS files in the `dist/` directory.

---

```dockerfile
FROM nginx:1.25-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
```
* **`FROM nginx:1.25-alpine`**: Starts a clean Nginx container (alpine version).
* **`RUN rm... && COPY nginx.conf...`**: Deletes the default generic Nginx index page configuration and replaces it with our custom `nginx.conf`.

```dockerfile
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
* **`COPY --from=build ...`**: Copies the static compiled React code out of the `build` container into the Nginx public folder.
* **`CMD ["nginx", "-g", "daemon off;"]`**: Runs Nginx in the foreground so the Docker container remains active.

---

## 3. Custom Nginx Configuration (`nginx.conf`)

The file `frontend/nginx.conf` handles routing and performance inside the frontend container.

```nginx
server {
    listen 80;
    server_name localhost;
```
* **`listen 80;`**: Tells Nginx to listen for HTTP requests on port 80.

```nginx
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
```
* **`try_files $uri $uri/ /index.html;`**: This is critical for Single Page Applications (SPAs). If a user refreshes the page on a route like `/login` or `/dashboard`, Nginx will first search for a matching physical folder or file. When it fails to find one, it silently falls back to serving `index.html`. The React Router script inside `index.html` then loads and routes the user to the correct page. Without this rule, refreshes on subpages return a **404 Not Found**.

```nginx
    location /api/v1 {
        proxy_pass http://placement-backend:5000/api/v1;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        ...
    }
```
* **`proxy_pass http://placement-backend:5000/api/v1;`**: Intercepts requests sent to `/api/v1` and proxies them to the backend container.
  * **CORS Prevention:** Because the frontend Nginx serves both the React page and handles API calls under the same origin (same port and host), **CORS security blocks are completely avoided**.
  * **Routing:** `placement-backend` matches the exact name of the container service in our Docker Compose network.

---

## 4. Docker Compose Orchestration

The `docker-compose.yml` configures and connects the database, backend, and frontend together.

### Core Orchestration Rules:
1. **Network Isolation (`placement-net`):** All containers belong to a private bridge network. The MongoDB database container does **not** expose ports to your local host machine. This protects the database from external network scans; only the backend container can reach it.
2. **Persistence Volumes:**
   - `mongodb_data` is mounted to MongoDB's internal data directory `/data/db`.
   - `backend_uploads` is mounted to `/app/uploads` in the backend container.
   - These ensure that student PDF resumes and database accounts are not deleted when you update, stop, or recreate the containers.
3. **Health-Check Dependencies:**
   - The backend service waits for the MongoDB database container to pass its `ping` health check before it starts up.
   - The frontend service waits for the backend API container to pass its `/health` health check before Nginx starts listening. This prevents broken request loops on startup.

---

## 5. Troubleshooting: Login / Credential Failures

### Why does the first login fail with "Invalid email or password"?
When you start the containers for the first time via `docker compose up -d`, Docker provisions a brand-new MongoDB database. This database is completely **blank** and contains no tables or users. 

Because there are no records, any login attempt (even with the correct default credentials) will fail with a `401 Unauthorized` (Invalid email or password) error.

### How to Resolve It (Seeding the Database)
To insert the default test accounts, you must run the database seed script inside the running backend container.

#### Command:
```bash
docker compose exec placement-backend npm run seed
```

#### What this does under the hood:
1. `docker compose exec placement-backend` hooks your terminal input/output directly into the running backend container.
2. It executes `npm run seed` which calls `node seed.js`.
3. The script reads the `MONGODB_URI` environment variable, connects to MongoDB over the private network, clears database records to prevent duplicate key conflicts, and seeds the default collections:
   - **CSE & ECE Departments**
   - **Admin Account:** `admin@college.edu` / `admin123`
   - **Placement Officer Account:** `po@college.edu` / `po123456`
   - **Student Account:** `student@college.edu` / `student123`
