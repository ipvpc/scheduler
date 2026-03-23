FROM node:20.19-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl xsel
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

# Copy package files
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force

# Install all dependencies with legacy peer deps to resolve conflicts
RUN npm install --legacy-peer-deps

# Ensure ajv and related packages are properly installed
RUN npm install ajv@^8.12.0 ajv-keywords@^5.1.0 ajv-formats@^2.1.1 --legacy-peer-deps

# Copy source code
COPY public/ /app/public/
COPY src/ /app/src/
COPY package.json /app/package.json
COPY tsconfig.json /app/tsconfig.json
COPY local.env /app/local.env

# Build the application
RUN npm run build

# Clean up dev dependencies after build to reduce image size
RUN npm prune --production

# Install serve for serving static files
RUN npm install -g serve

# Copy built application to serve directory
RUN mkdir -p /app/serve && cp -r build/* /app/serve/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start serve
CMD ["serve", "-s", "/app/serve", "-l", "3000"]
