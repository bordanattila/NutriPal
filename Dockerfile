# Frontend build stage
FROM node:20-alpine AS frontend-build

# Install pnpm (the package manager used by this project)
RUN npm install -g pnpm@10.11.0

# Set the working directory in the container
WORKDIR /app

# Copy root package files for workspace setup
COPY package.json pnpm-workspace.yaml ./

# Copy package.json files for all workspaces (needed for pnpm workspace resolution)
COPY server/package.json ./server/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Copy lockfile if it exists (will be updated if needed)
COPY pnpm-lock.yaml* ./

# Copy the rest of the application code (including shared package source)
COPY . .

# Install dependencies using pnpm (respects workspace structure)
# Update lockfile if needed (handles case where package.json changed but lockfile wasn't updated)
RUN pnpm install --no-frozen-lockfile --prod=false

# Build the shared package if it has a build script
WORKDIR /app/packages/shared
RUN if [ -f package.json ] && grep -q '"build"' package.json; then pnpm run build; fi

# Accept optional build argument to override REACT_APP_API_URL.
# When omitted, CRA reads from apps/web/.env.production automatically.
ARG REACT_APP_API_URL

# Build the web app for production
WORKDIR /app/apps/web
RUN if [ -n "$REACT_APP_API_URL" ]; then \
      REACT_APP_API_URL="$REACT_APP_API_URL" pnpm run build; \
    else \
      pnpm run build; \
    fi

# Production stage
FROM node:20-alpine

# Install pnpm (the package manager used by this project)
RUN npm install -g pnpm@10.11.0

# Set the working directory in the container
WORKDIR /app

# Copy root package files for workspace setup
COPY package.json pnpm-workspace.yaml ./

# Copy package.json files for all workspaces (needed for pnpm workspace resolution)
COPY server/package.json ./server/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Copy lockfile if it exists (will be updated if needed)
COPY pnpm-lock.yaml* ./

# Copy the rest of the application code (excluding frontend build artifacts)
COPY . .

# Install only production dependencies for the server
RUN pnpm install --no-frozen-lockfile --prod=false

# Copy the built frontend from the build stage
COPY --from=frontend-build /app/apps/web/build ./apps/web/build

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Expose the port the server runs on (4000, not 3000)
EXPOSE 4000

# Health check to ensure the server is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/graphql', (r) => {process.exit(r.statusCode === 200 || r.statusCode === 400 ? 0 : 1)})"

# Run the server when the container launches
CMD ["pnpm", "start"]
