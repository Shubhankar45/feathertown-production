# =========================================================
# FeatherTown Frontend - React / Vite Multi-Stage Dockerfile
# =========================================================

# Stage 1: Build the React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies required for vite build)
RUN npm ci || npm install

# Build arguments (optional Google OAuth ID injected at build time)
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copy frontend source code
COPY . .

# Build production bundle into /app/dist
RUN npm run build

# Stage 2: Serve with lightweight, secure Nginx
FROM nginx:1.27-alpine AS runner

# Remove default Nginx website configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom Nginx configuration with SPA routing and API reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Healthcheck to verify Nginx is serving index.html
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q -O - http://127.0.0.1/ > /dev/null || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
