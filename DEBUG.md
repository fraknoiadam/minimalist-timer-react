# VS Code Debugging Setup

This document explains how to use the VS Code debugging configurations for Durer Timer.

## Available Debug Configurations

### 1. FastAPI Backend

Runs and debugs only the FastAPI backend server.

- **How to use:** From the Run and Debug panel in VS Code, select "FastAPI Backend" and press F5 or click the green play button.
- **What it does:** Starts the FastAPI server with hot-reloading enabled at http://localhost:5000.

### 2. Vite Frontend

Runs and debugs only the Vite frontend application.

- **How to use:** From the Run and Debug panel in VS Code, select "Vite Frontend" and press F5 or click the green play button.
- **What it does:** Launches Chrome with the debugger attached pointing to http://localhost:5173.

### 3. Full Stack (Frontend + Backend)

Runs and debugs both the backend and frontend simultaneously.

- **How to use:** From the Run and Debug panel in VS Code, select "Full Stack (Frontend + Backend)" and press F5 or click the green play button.
- **What it does:** 
  1. Starts the frontend development server using Vite
  2. Starts the FastAPI backend server with the debugger attached
  3. Automatically stops the frontend when you stop debugging

## Debugging Tips

1. **Breakpoints:** You can set breakpoints in both Python and TypeScript/JavaScript files.

2. **Backend Breakpoints:** Set breakpoints in any Python file in the backend folder:
   - app.py
   - config.py
   - Any other Python files you create

3. **Frontend Breakpoints:** Set breakpoints in:
   - .tsx files (React components)
   - .ts files (TypeScript code)
   - You can also use the browser's DevTools for frontend debugging

4. **Variables:** During debugging, use the VARIABLES panel to inspect the values of variables.

5. **Console:** Use the DEBUG CONSOLE to execute code in the context of the breakpoint.

## Accessing the Running Application

When the debugger is running:

- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000/docs
- **Frontend:** http://localhost:5173

## Stopping the Debug Session

Click the red square stop button in the debug toolbar or press Shift+F5.
