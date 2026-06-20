#!/bin/bash
set -e

echo "=== Building Docker Images ==="

# Create .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example. Fill in your values."
fi

docker build -t healthcare-backend:latest ./backend
echo "Backend image built"

docker build -t healthcare-frontend:latest ./frontend
echo "Frontend image built"

echo ""
echo "Build complete! Run with: docker-compose up -d"
