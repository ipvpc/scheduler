sudo docker run --rm -it --name scheduler-api \
-p 8001:8001 \
-e DATABASE_URL=postgresql://markets:changeme@db.example.com:5432/markets_prod \
-e REDIS_HOST=redis.example.com \
-e REDIS_PORT=6379 \
-e REDIS_PASSWORD= \
-e TZ=America/New_York \
"${SCHEDULER_API_IMAGE:-scheduler-api:latest}" bash