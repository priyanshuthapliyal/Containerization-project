FROM node:20-alpine

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Set working directory
WORKDIR /app

# Ensure correct permissions for the non-root 'node' user
# and prepare the uploads directory for persistent volume mounts
RUN mkdir -p /app/uploads && chown -R node:node /app

# Copy dependency manifests with proper ownership
COPY --chown=node:node package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source code with proper ownership
COPY --chown=node:node . .

# Switch to the non-root user for security
USER node

# Expose backend port
EXPOSE 5000

# Define a health check for Kubernetes liveness/readiness fallback
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the application directly with Node to propagate OS signals (e.g. SIGTERM)
CMD ["node", "server.js"]
