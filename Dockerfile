FROM node:20-alpine

WORKDIR /app

# Copy root package.json and server package.json
COPY package.json package-lock.json* ./
COPY server/package.json server/

# Install root dependencies (for build tools if any)
RUN npm ci

WORKDIR /app

# Copy all source code
COPY . .

# Install server dependencies
RUN npm --prefix server ci

# Build frontend
RUN npm ci && npm run build

# Expose port
EXPOSE 3000

# Start server (serves frontend from /dist)
CMD ["node", "server/src/server.js"]
