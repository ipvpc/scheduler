#!/bin/bash

# =============================================================================
# ALPHA5 SCHEDULER - NETWORK TEST SCRIPT
# =============================================================================

echo "🔍 Testing network connectivity..."

# Test database connection
echo "Testing PostgreSQL connection..."
python -c "
import psycopg2
import os
try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    print('✅ PostgreSQL connection successful')
    conn.close()
except Exception as e:
    print(f'❌ PostgreSQL connection failed: {e}')
    exit(1)
"

# Test Redis connection
echo "Testing Redis connection..."
python -c "
import redis
import os
try:
    r = redis.Redis(host=os.getenv('REDIS_HOST'), port=int(os.getenv('REDIS_PORT')), db=int(os.getenv('REDIS_DB')))
    r.ping()
    print('✅ Redis connection successful')
except Exception as e:
    print(f'❌ Redis connection failed: {e}')
    exit(1)
"

echo "🎉 All network tests passed!"
