#!/bin/bash
REGISTRY="${REGISTRY:-registry.example.com/your-org}"
sudo docker build -t "${REGISTRY}/scheduler-api:latest" . --push