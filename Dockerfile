FROM node:20-alpine

WORKDIR /app

# Copy root package.json and server package.json
COPY package.json package-lock.json* ./
COPY server/package.json server/

# Install root dependencies (for build tools if any)
RUN npm ci

# Install server dependencies
WORKDIR /app/server
RUN npm ci

WORKDIR /app

# Copy all source code
COPY . .

# Build TypeScript
WORKDIR /app/server
RUN npm run build

# Build frontend
WORKDIR /app
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server/dist/index.js"]
