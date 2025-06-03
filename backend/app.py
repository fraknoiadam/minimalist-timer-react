import uvicorn
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from pydantic import BaseModel
from config import settings

# Database setup
engine = create_engine(settings.database_uri)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Define SQLAlchemy model
class TimerStateDB(Base):
    __tablename__ = "timer_states"

    id = Column(String(36), primary_key=True)
    name = Column(String(255))
    timer_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


# Create tables
Base.metadata.create_all(bind=engine)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pydantic models for request/response
class TimerStateResponse(BaseModel):
    id: str
    name: str
    timer_data: Dict[str, Any]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}  # This replaces orm_mode in Pydantic v2


# FastAPI app
app = FastAPI(
    title="Durer Timer API",
    description="API for managing and sharing timer states",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=settings.allow_credentials,
    allow_methods=settings.allow_methods,
    allow_headers=settings.allow_headers,
)


# Define routes
@app.get("/api/states/{timer_id}", response_model=TimerStateResponse)
def get_timer_state(timer_id: str, db: Session = Depends(get_db)):
    """
    Get a timer state by its ID
    """
    timer_state = db.query(TimerStateDB).filter(TimerStateDB.id == timer_id).first()
    if timer_state is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Timer state not found"
        )

    return {
        "id": timer_state.id,
        "name": timer_state.name,
        "timer_data": timer_state.timer_data,
        "created_at": timer_state.created_at,
        "updated_at": timer_state.updated_at,
    }


@app.put("/api/states/{timer_id}", response_model=TimerStateResponse)
async def update_timer_state(
    timer_id: str, timer_data: Dict[str, Any], db: Session = Depends(get_db)
):
    """
    Update a timer state by its ID or create a new one if it doesn't exist
    """
    timer_state = db.query(TimerStateDB).filter(TimerStateDB.id == timer_id).first()

    if timer_state is None:
        # Create new timer state
        timer_state = TimerStateDB(
            id=timer_id,
            name=timer_data.get("name", "Unnamed Timer"),
            timer_data=timer_data,
        )
        db.add(timer_state)
    else:
        # Update existing timer state
        timer_state.timer_data = timer_data
        if "name" in timer_data:
            timer_state.name = timer_data["name"]
        timer_state.updated_at = datetime.now(timezone.utc)

    try:
        db.commit()
        db.refresh(timer_state)

        return {
            "id": timer_state.id,
            "name": timer_state.name,
            "timer_data": timer_state.timer_data,
            "created_at": timer_state.created_at,
            "updated_at": timer_state.updated_at,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating timer state: {str(e)}",
        )


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
