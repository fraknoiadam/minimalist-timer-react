#!/usr/bin/env python3
"""
Simple script to set up the PostgreSQL database for the Durer Timer application.
"""

import sys
import subprocess
import os

def main():
    print("Setting up PostgreSQL database for Durer Timer")
    
    try:
        # Check if PostgreSQL is installed
        subprocess.run(["psql", "--version"], check=True, capture_output=True)
    except Exception:
        print("\nError: PostgreSQL is not installed or not in your PATH.")
        print("Please install PostgreSQL or use Docker instead.")
        return 1
    
    # Try to create database
    try:
        subprocess.run(["createdb", "durer_timer"], check=True, capture_output=True)
        print("\nDatabase 'durer_timer' created successfully!")
    except subprocess.CalledProcessError:
        print("\nNote: Database 'durer_timer' may already exist. Continuing...")
    
    # Set up environment
    print("\nSetting up backend environment...")
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))
    
    try:
        # Create virtual environment if it doesn't exist
        if not os.path.exists(".venv"):
            subprocess.run([sys.executable, "-m", "venv", ".venv"], check=True)
        
        # Determine the activate script based on platform
        if os.name == "nt":  # Windows
            activate_script = os.path.join(".venv", "Scripts", "activate")
        else:  # Unix/Linux/Mac
            activate_script = os.path.join(".venv", "bin", "activate")
        
        # Install requirements
        if os.name == "nt":  # Windows
            subprocess.run(f".venv\\Scripts\\pip install -r requirements.txt", shell=True, check=True)
        else:
            subprocess.run(f". {activate_script} && pip install -r requirements.txt", shell=True, check=True)
        
        print("\nBackend setup complete!")
        print("\nTo run the backend:")
        print("1. Activate the virtual environment:")
        if os.name == "nt":  # Windows
            print(f"   .venv\\Scripts\\activate")
        else:
            print(f"   source {activate_script}")
        print("2. Run the FastAPI app:")
        print("   python -m uvicorn app:app --reload --port 5000")
        
    except Exception as e:
        print(f"\nError setting up backend environment: {str(e)}")
        return 1
        
    return 0

if __name__ == "__main__":
    sys.exit(main())
