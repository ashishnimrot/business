FROM node:20-alpine AS builder

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
# Configure npm for better network handling
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000
# Install dependencies with retry logic for network issues
RUN for i in 1 2 3 4 5; do \
    echo "npm install attempt $i..." && \
    npm ci --legacy-peer-deps && break || \
    (echo "Attempt $i failed, waiting 30 seconds before retry..." && sleep 30); \
    done

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files and install production dependencies with retry logic
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000
RUN for i in 1 2 3 4 5; do \
    echo "npm install attempt $i..." && \
    npm ci --only=production --legacy-peer-deps && break || \
    (echo "Attempt $i failed, waiting 30 seconds before retry..." && sleep 30); \
    done

# Copy built application and necessary config files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

CMD ["npm", "start"]

