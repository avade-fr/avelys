from functools import lru_cache
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from jwt import PyJWKClient
from jwt.exceptions import PyJWKClientConnectionError

from app.config import Settings, get_settings

_openapi_settings = get_settings()
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=_openapi_settings.oidc_authorization_url,
    tokenUrl=_openapi_settings.oidc_token_url,
    scopes={
        "openid": "Authenticate with OpenID Connect",
        "profile": "Read the user's profile",
        "email": "Read the user's email address",
    },
    auto_error=False,
)


@lru_cache
def _get_jwk_client(jwks_url: str) -> PyJWKClient:
    return PyJWKClient(jwks_url)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def _provider_unavailable() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="The identity provider is unavailable",
        headers={"Retry-After": "30"},
    )


def get_current_claims(
    access_token: Annotated[str | None, Depends(oauth2_scheme)],
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

    if access_token is None:
        raise _unauthorized("A bearer token is required")
    if (
        not settings.oidc_issuer_url
        or not settings.resolved_jwks_url
        or not settings.oidc_audience
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The identity provider is not configured",
        )

    try:
        signing_key = _get_jwk_client(settings.resolved_jwks_url).get_signing_key_from_jwt(
            access_token
        )
        claims = jwt.decode(
            access_token,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.oidc_audience,
            issuer=settings.oidc_issuer_url,
            options={"require": ["exp", "iat", "sub", "iss", "aud"]},
        )
    except PyJWKClientConnectionError as exc:
        raise _provider_unavailable() from exc
    except jwt.PyJWTError as exc:
        raise _unauthorized("The access token is invalid or expired") from exc

    if not claims.get("sub"):
        raise _unauthorized("The access token is invalid or expired")

    return claims


CurrentClaims = Annotated[dict[str, Any], Depends(get_current_claims)]
