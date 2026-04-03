"""
Dependency Injection for FastAPI
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.core.security import verify_token
from app.core.supabase import get_supabase_client
from app.config import settings

security = HTTPBearer(auto_error=False)

# Demo user returned when no token is present
DEMO_USER = {
    "sub": "demo-user-id",
    "email": "demo@chainsight.ai",
    "role": "analyst",
    "is_demo": True
}


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> dict:
    """
    Dependency to get the current authenticated user from JWT token.
    Falls back to demo user if no token is provided.
    """
    # No token — return demo user instead of rejecting
    if credentials is None:
        return DEMO_USER

    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        # Invalid token — also fall back to demo user
        return DEMO_USER

    return payload


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[dict]:
    """
    Optional authentication - returns None if no valid token
    """
    if credentials is None:
        return None

    token = credentials.credentials
    return verify_token(token)


def get_db():
    """
    Get Supabase client instance
    """
    return get_supabase_client()