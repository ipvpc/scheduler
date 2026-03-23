FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy environment file for Docker
COPY docker.env .env

# Make startup script executable
RUN chmod +x start.sh

# Make network test script executable
RUN chmod +x network_test.sh

# Create non-root user
RUN useradd -m -u 1000 scheduler && chown -R scheduler:scheduler /app
USER scheduler

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Start the application
CMD ["./start.sh"]
