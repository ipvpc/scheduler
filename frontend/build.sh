REGISTRY="${REGISTRY:-registry.example.com/your-org}"
sudo docker build -t "${REGISTRY}/scheduler:latest" . --push
