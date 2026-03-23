#!/bin/bash

# =============================================================================
# ALPHA5 SCHEDULER - STARTUP SCRIPT
# =============================================================================

echo "🚀 Starting Alpha5 Scheduler API..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
python -c "
import psycopg2
import os
import time
import sys

max_retries = 30
retry_count = 0

while retry_count < max_retries:
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        print('✅ Database connection successful')
        conn.close()
        break
    except Exception as e:
        retry_count += 1
        print(f'⏳ Database not ready, retrying... ({retry_count}/{max_retries})')
        time.sleep(2)
else:
    print('❌ Database connection failed after maximum retries')
    sys.exit(1)
"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis connection..."
python -c "
import redis
import os
import time
import sys

max_retries = 30
retry_count = 0

while retry_count < max_retries:
    try:
        r = redis.Redis(host=os.getenv('REDIS_HOST'), port=int(os.getenv('REDIS_PORT')), db=int(os.getenv('REDIS_DB')))
        r.ping()
        print('✅ Redis connection successful')
        break
    except Exception as e:
        retry_count += 1
        print(f'⏳ Redis not ready, retrying... ({retry_count}/{max_retries})')
        time.sleep(2)
else:
    print('❌ Redis connection failed after maximum retries')
    sys.exit(1)
"

echo "🎉 All services ready, starting API server..."

# Start the API server
exec python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
