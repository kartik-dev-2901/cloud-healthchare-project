#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Healthcare System - Local Start ==="
cd "$PROJECT_DIR"

# --- MongoDB ---
start_mongo_docker() {
  echo "Starting MongoDB via Docker..."
  docker run -d --name healthcare-mongo \
    -p 27017:27017 \
    -v healthcare-mongo-data:/data/db \
    mongo:7 2>/dev/null || docker start healthcare-mongo 2>/dev/null || true
  sleep 2
  echo "MongoDB running on port 27017"
}

if pgrep -x mongod &>/dev/null; then
  echo "MongoDB already running (native)"
elif command -v brew &>/dev/null && brew list mongodb-community &>/dev/null 2>&1; then
  brew services start mongodb-community
  sleep 2
elif command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  start_mongo_docker
else
  echo ""
  echo "ERROR: MongoDB is not installed or running."
  echo ""
  echo "Choose one of:"
  echo "  1. Install via Homebrew:"
  echo "       brew tap mongodb/brew"
  echo "       brew install mongodb-community"
  echo "       brew services start mongodb-community"
  echo ""
  echo "  2. Run via Docker (fastest):"
  echo "       docker run -d --name healthcare-mongo -p 27017:27017 mongo:7"
  echo ""
  echo "  3. Use docker-compose (runs everything):"
  echo "       docker-compose up -d"
  echo ""
  exit 1
fi

# --- .env ---
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "Created backend/.env from example."
fi

# --- Install deps ---
echo "Installing backend dependencies..."
(cd backend && npm install --silent)

echo "Installing frontend dependencies..."
(cd frontend && npm install --silent)

# --- Start services ---
echo ""
echo "Starting backend on http://localhost:5000 ..."
(cd "$PROJECT_DIR/backend" && npm run dev) &
BACKEND_PID=$!

sleep 2

echo "Starting frontend on http://localhost:3000 ..."
(cd "$PROJECT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:5000"
echo "  Health:    http://localhost:5000/api/health"
echo "========================================="
echo ""
echo "Seed test data: node scripts/seed-db.js"
echo "Press Ctrl+C to stop all services"
echo ""

cleanup() {
  echo ""
  echo "Stopping services..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  echo "Stopped."
}
trap cleanup EXIT INT TERM
wait
