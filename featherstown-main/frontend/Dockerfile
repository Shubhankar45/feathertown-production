# =========================================================
# FeatherTown Frontend - Production Nginx Container
# Uses pre-compiled, code-split production bundle (4.4 MB)
# Requires ZERO Node.js / npm disk overhead on the server!
# =========================================================
FROM nginx:1.27-alpine

# Remove default Nginx website configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom Nginx configuration with SPA routing and API reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy pre-compiled static production assets directly into Nginx html directory
COPY dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Healthcheck to verify Nginx is serving index.html
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q -O - http://127.0.0.1/ > /dev/null || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
