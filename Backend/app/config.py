"""
Application Configuration
Loads environment variables and provides configuration settings
"""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "ChainSight API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS - added local dev ports and production Vercel domain
    CORS_ORIGINS: str = "https://chain-sight-mauve.vercel.app,http://localhost:8000,http://localhost:5173,http://localhost:5174,http://localhost:3000,http://localhost:8080,http://localhost:8081,http://localhost:8082,http://localhost:8083,http://localhost:8084,http://127.0.0.1:5173,http://127.0.0.1:8080,http://127.0.0.1:8082,http://127.0.0.1:8084"
    
    # Frontend URL for OAuth redirects (Vercel Production)
    FRONTEND_URL: str = "https://chain-sight-mauve.vercel.app"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
    
    # JWT
    JWT_SECRET_KEY: str = "your-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Supabase
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None

    @property
    def supabase_key(self) -> str:
        return self.SUPABASE_KEY or self.SUPABASE_ANON_KEY or "your-supabase-anon-key"
    
    # OAuth (Google only) - kept for compatibility but no longer used with Clerk
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # Clerk Authentication
    CLERK_SECRET_KEY: Optional[str] = None
    CLERK_PUBLISHABLE_KEY: Optional[str] = None

    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_EXTENSIONS: str = ".csv,.xlsx,.xls,.json"
    
    @property
    def allowed_extensions_list(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_EXTENSIONS.split(",") if ext.strip()]
    
    # ML Model
    MODEL_PATH: str = "../AI/ML/smurf_hunter_model.pt"
    
    # Redis (for caching and rate limiting)
    REDIS_URL: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_AUTH: int = 10
    RATE_LIMIT_UPLOAD: int = 20
    RATE_LIMIT_ANALYSIS: int = 100
    RATE_LIMIT_REPORT: int = 10
    RATE_LIMIT_DEFAULT: int = 1000
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60
    
    # Extra fields from .env (compatibility)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    OAUTH_REDIRECT_URL: str = "http://localhost:8082/cryptoflow/auth/callback"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()