FROM node:22-slim

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for vite)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the frontend (vite build -> creates dist/)
RUN npm run build

# Expose the port
EXPOSE 3001

# Start the server
CMD ["node", "server/server.js"]
