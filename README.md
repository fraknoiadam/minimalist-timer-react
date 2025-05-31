# Durer Timer

A minimalistic timer application built with React and TypeScript, with a FastAPI backend for sharing timer states.

## Features

- Dark and light mode
- Customizable font size
- Display custom web content beneath the timer with iframe embedding
- Cycle through multiple websites at customizable intervals
- States are automatically saved in local storage
- Share timer states with others via unique IDs
- Load shared timer states using the timer code
- Screen wake lock to prevent device from sleeping
- Backend support for sharing timer states with PostgreSQL

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- Docker

### Setting Up PostgreSQL

```bash
# Start PostgreSQL
docker compose up -d
```

### Setting Up the Backend

```bash
# Create a virtual environment
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI app
python -m uvicorn app:app --reload --port 8000
```

### Setting Up the Frontend

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Running Both Frontend and Backend

```bash
# Install dependencies for root project
npm install

# Run both services
npm run dev
```
