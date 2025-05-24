import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

load_dotenv()

class Settings(BaseSettings):
    # Database
    database_uri: str = os.getenv('DATABASE_URI', 'postgresql://postgres:postgres@localhost/durer_timer')
    
    # Application
    secret_key: str = os.getenv('SECRET_KEY', 'dev-secret-key')
    debug: bool = os.getenv('API_DEBUG', 'True') == 'True'
    
    # CORS
    allow_origins: List[str] = ["*"]
    allow_credentials: bool = True
    allow_methods: List[str] = ["*"] 
    allow_headers: List[str] = ["*"]
    
    def model_post_init(self, __context) -> None:
        # Parse comma-separated ALLOW_ORIGINS if present in env
        origins_env = os.getenv('ALLOW_ORIGINS')
        if origins_env:
            self.allow_origins = origins_env.split(',')
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
