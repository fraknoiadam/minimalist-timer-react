# Durer Timer FastAPI Backend

This is the FastAPI backend for the Durer Timer application. It provides API endpoints for storing and retrieving timer states.

## Features

- RESTful API
- PostgreSQL database integration
- Automatic API documentation via Swagger UI and ReDoc
- CORS support for frontend integration

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up the database:
   - Ensure PostgreSQL is running
   - Create a database named `durer_timer`
   - Or use Docker: `docker compose up -d` from the root directory

4. Run the server:
   ```bash
   python -m uvicorn app:app --reload --port 8000
   ```

## API Endpoints

### GET /api/states/{timer_id}

Fetches a timer state by its ID.

**Response:**
```json
{
  "id": "uuid-string",
  "name": "Timer Name",
  "timer_data": {
    "id": "uuid-string",
    "name": "Timer Name",
    "savedAt": 1621531932000,
    "timerState": {
      "totalMs": 300000,
      "paused": false,
      "startTime": 1621531932000,
      "pauseStart": 0,
      "totalPauseMs": 0
    },
    "appSettings": {
      "darkMode": true,
      "fontSize": 10,
      "embedOverflow": true,
      "wakeLockEnabled": true,
      "embedSettings": {
        "links": ["https://example.com"],
        "linkSwitchDurationSec": 15,
        "embedFadeOutSec": 600
      }
    }
  },
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:00:00"
}
```

### PUT /api/states/{timer_id}

Updates a timer state (or creates a new one if it doesn't exist).

**Request Body:**
The timer state object to save.

**Response:**
Same as GET endpoint.

## API Documentation

After running the server, you can access:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
