"""
Security utilities - Clerk JWT verification + API key helpers
"""
import secrets
import hashlib
import httpx
from datetime import datetime
from typing import Optional, Dict, Any

import jwt  # type: ignore
from jwt import PyJWKClient  # type: ignore

from app.config import settings


# ---------------------------------------------------------------------------
# Clerk JWT verification
# ---------------------------------------------------------------------------

_jwks_client: Optional[PyJWKClient] = None


def _get_jwks_client() -> PyJWKClient:
    """Lazily create and cache the JWKS client for Clerk."""
    global _jwks_client
    if _jwks_client is None:
        # Derive JWKS URI from the publishable key domain
        # pk_test_<base64(domain)>$ → decode to get domain
        import base64
        try:
            pk = settings.CLERK_PUBLISHABLE_KEY or ""
            # Format: pk_test_<b64payload>  or pk_live_<b64payload>
            b64 = pk.split("_", 2)[-1]
            # Add padding if needed
            b64 += "=" * (-len(b64) % 4)
            domain = base64.b64decode(b64).decode("utf-8").rstrip("$")
        except Exception:
            domain = "clerk.accounts.dev"

        jwks_url = f"https://{domain}/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url)

    return _jwks_client


def verify_clerk_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Clerk-issued JWT using their public JWKS endpoint.
    Returns the decoded payload dict on success, None on failure.
    """
    try:
        client = _get_jwks_client()
        signing_key = client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload
    except Exception:
        return None


# Alias so existing code that calls verify_token still works
def verify_token(token: str) -> Optional[Dict[str, Any]]:
    return verify_clerk_token(token)


# Alias used by ws.py
def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    return verify_clerk_token(token)


# ---------------------------------------------------------------------------
# Legacy stubs — kept so auth_service.py imports don't break.
# These are NOT called by the frontend anymore; Clerk issues all tokens.
# ---------------------------------------------------------------------------

def create_access_token(data: Dict[str, Any], expires_delta=None) -> str:
    """Stub — Clerk now issues all access tokens."""
    import secrets
    return f"clerk-managed-{secrets.token_urlsafe(16)}"


def create_refresh_token(data: Dict[str, Any], expires_delta=None) -> str:
    """Stub — Clerk now manages refresh tokens."""
    import secrets
    return f"clerk-managed-{secrets.token_urlsafe(16)}"


# ---------------------------------------------------------------------------
# API key helpers (unchanged)
# ---------------------------------------------------------------------------

def generate_api_key() -> str:
    return f"sk-{secrets.token_urlsafe(32)}"


def mask_api_key(key: str) -> str:
    if len(key) <= 8:
        return "****"
    return f"{key[:3]}****{key[-4:]}"


def hash_api_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


def generate_webhook_secret() -> str:
    return secrets.token_hex(32)


def sign_webhook_payload(payload: str, secret: str) -> str:
    import hmac
    signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"sha256={signature}"
