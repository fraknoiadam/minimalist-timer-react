#!/bin/bash

# Durer Timer Startup Script
# This script starts both the FastAPI backend and React frontend

# Set colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Durer Timer...${NC}"

# Check if PostgreSQL is running
which pg_isready > /dev/null
if [ $? -eq 0 ]; then
  pg_isready > /dev/null
  if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Warning: PostgreSQL does not appear to be running.${NC}"
    echo -e "You may need to start it with: ${GREEN}docker compose up -d${NC}"
  else
    echo -e "${GREEN}PostgreSQL is running.${NC}"
  fi
else
  echo -e "${YELLOW}Warning: pg_isready not found, can't check PostgreSQL status.${NC}"
fi

# Start the backend
echo -e "${BLUE}Starting FastAPI backend...${NC}"
cd backend
if [ ! -d ".venv" ]; then
  echo -e "${YELLOW}Virtual environment not found. Creating one...${NC}"
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
else
  source .venv/bin/activate
fi

# Start backend in the background
python -m uvicorn app:app --reload --port 5000 &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID $BACKEND_PID${NC}"

# Wait a moment for the backend to start
sleep 2

# Start the frontend
echo -e "${BLUE}Starting React frontend...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend started with PID $FRONTEND_PID${NC}"

# Setup trap to catch SIGINT and kill both processes
cleanup() {
  echo -e "${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit 0
}

trap cleanup SIGINT

echo -e "${GREEN}Durer Timer is running!${NC}"
echo -e "${BLUE}Backend:${NC} http://localhost:5000"
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}API Docs:${NC} http://localhost:5000/docs"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Keep the script running to maintain the background processes
wait
