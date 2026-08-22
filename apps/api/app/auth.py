from functools import lru_cache
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.config import Settings, get_settings

bearer_scheme = HTTPBearer(auto_error=False)


@lru_cache
def _get_jwk_client(jwks_url: str) -> PyJWKClient:
    return PyJWKClient(jwks_url)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_claims(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[str, Any]:
    """Validate Keycloak access tokens at the API boundary.

    Local development deliberately returns a synthetic identity when authentication
    is disabled. Production values always enable authentication.
    """
    if not settings.auth_enabled:
        return {
            "sub": "local-development-user",
            "email": "developer@localhost",
            "name": "Local developer",
        }

    if credentials is None:
        raise _unauthorized("A bearer token is required")
    if not settings.oidc_issuer_url or not settings.resolved_jwks_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The identity provider is not configured",
        )

    try:
        signing_key = _get_jwk_client(settings.resolved_jwks_url).get_signing_key_from_jwt(
            credentials.credentials
        )
        return jwt.decode(
            credentials.credentials,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.oidc_audience,
            issuer=settings.oidc_issuer_url,
            options={"require": ["exp", "iat", "sub", "iss", "aud"]},
        )
    except jwt.PyJWTError as exc:
        raise _unauthorized("The access token is invalid or expired") from exc


CurrentClaims = Annotated[dict[str, Any], Depends(get_current_claims)]
