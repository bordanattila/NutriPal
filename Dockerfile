# Use Node.js 20 (as specified in package.json engines)
FROM node:20-alpine

# Install pnpm (the package manager used by this project)
RUN npm install -g pnpm@10.11.0

# Set the working directory in the container
WORKDIR /app

# Copy root package files for workspace setup
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for all workspaces (needed for pnpm workspace resolution)
COPY server/package.json ./server/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies using pnpm (respects workspace structure)
# Use --frozen-lockfile for reproducible builds
RUN pnpm install --frozen-lockfile --prod=false

# Copy the rest of the application code
COPY . .

# Build the shared package if it has a build script
WORKDIR /app/packages/shared
RUN if [ -f package.json ] && grep -q '"build"' package.json; then pnpm run build; fi

# Build the web app for production (server serves static files in production)
WORKDIR /app/apps/web
RUN pnpm run build

# Set working directory back to root
WORKDIR /app

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
