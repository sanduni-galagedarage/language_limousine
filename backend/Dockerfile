# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:18-alpine AS dependencies

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --prefer-offline --no-audit

# ============================================
# Stage 2: Build (if needed for any build steps)
# ============================================
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy source code
COPY . .

# Remove dev dependencies and keep only production
RUN npm prune --production

# ============================================
# Stage 3: Production
# ============================================
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies from build stage
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./

# Copy application source code
COPY --chown=nodejs:nodejs . .

# Create necessary directories with proper permissions
RUN mkdir -p uploads logs && \
    chown -R nodejs:nodejs uploads logs

# Set environment variables
ENV NODE_ENV=production \
    PORT=5000 \
    NPM_CONFIG_LOGLEVEL=warn

# Switch to non-root user
USER nodejs

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "index.js"]
