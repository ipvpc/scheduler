sudo docker run --rm -it --name scheduler \
-p 3001:3000 \
-e REACT_APP_API_URL=${REACT_APP_API_URL} \
-e TZ=America/New_York \
registry.alpha5.finance/trade-system/scheduler-frontend:latest bash