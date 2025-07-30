# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Overwrite main.ts with simplified version
RUN cp src/main-simple.ts src/main.ts

# Expose port
EXPOSE 3004

# Start development server
CMD ["node", "-r", "ts-node/register", "src/main.ts"]

# Production stage
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy source code and dependencies
COPY --from=development /app/src ./src
COPY --from=development /app/package*.json ./
COPY --from=development /app/node_modules ./node_modules

# Create logs directory
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start production server
CMD ["node", "-r", "ts-node/register", "src/main.ts"] 