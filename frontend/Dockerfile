# ==========================================
# Stage 1: Build static assets
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (bypassing peer conflicts between React 19 and older package specs)
RUN npm ci --legacy-peer-deps

# Copy application source code
COPY . .

# Build-time environment variables for Vite
# By default, we use relative paths so Nginx proxy handles routing
ARG VITE_API_URL=/api/v1
ARG VITE_BACKEND_URL=

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Build the React application
RUN npm run build

# ==========================================
# Stage 2: Serve static files with Nginx
# ==========================================
FROM nginx:1.25-alpine

# Remove default nginx configurations
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React files from the builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
