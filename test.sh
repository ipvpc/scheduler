sudo docker run --rm -it --name scheduler-api \
-p 8001:8001 \
-e DATABASE_URL=postgresql://markets:p0w3rb4r@postgres.alpha5.finance:5432/markets_prod \
-e REDIS_HOST=redis.alpha5.finance \
-e REDIS_PORT=6379 \
-e REDIS_PASSWORD= \
-e TZ=America/New_York \
registry.alpha5.finance/backend/scheduler-api:latest bash