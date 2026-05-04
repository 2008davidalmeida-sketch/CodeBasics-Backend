# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist

# Use the non-root node user for security
USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]