sudo docker run --rm -it --name scheduler \
-p 3001:3000 \
-e REACT_APP_API_URL=${REACT_APP_API_URL} \
-e TZ=America/New_York \
"${SCHEDULER_FRONTEND_IMAGE:-scheduler-frontend:latest}" bash