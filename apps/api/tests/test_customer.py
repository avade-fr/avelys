from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from typing import Any

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi.testclient import TestClient
from jwt.exceptions import PyJWKClientConnectionError

from app import auth
from app.config import Settings, get_settings
from app.main import app

ISSUER = "https://sso.example.com/realms/avelys"
AUDIENCE = "avelys-api"

client = TestClient(app)


@pytest.fixture
def signing_keys() -> tuple[Any, Any]:
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    return private_key, private_key.public_key()


@pytest.fixture(autouse=True)
def clear_dependency_overrides() -> None:
    yield
    app.dependency_overrides.clear()


def enable_authentication() -> None:
    app.dependency_overrides[get_settings] = lambda: Settings(
        auth_enabled=True,
        oidc_issuer_url=ISSUER,
        oidc_audience=AUDIENCE,
    )


def token_for(private_key: Any, *, omit_claim: str | None = None, **claim_overrides: Any) -> str:
    now = datetime.now(UTC)
    claims: dict[str, Any] = {
        "sub": "customer-123",
        "iss": ISSUER,
        "aud": AUDIENCE,
        "iat": now,
        "exp": now + timedelta(minutes=5),
        "email": "customer@example.com",
        "name": "Avelys Customer",
    }
    claims.update(claim_overrides)
    if omit_claim:
        claims.pop(omit_claim)
    return jwt.encode(claims, private_key, algorithm="RS256", headers={"kid": "test-key"})


def use_signing_key(monkeypatch: pytest.MonkeyPatch, public_key: Any) -> None:
    jwk_client = SimpleNamespace(
        get_signing_key_from_jwt=lambda _token: SimpleNamespace(key=public_key)
    )
    monkeypatch.setattr(auth, "_get_jwk_client", lambda _url: jwk_client)


def test_local_profile_when_authentication_is_disabled() -> None:
    response = client.get("/v1/me")

    assert response.status_code == 200
    assert response.json() == {
        "id": "local-development-user",
        "email": "developer@localhost",
        "name": "Local developer",
    }


def test_profile_requires_bearer_token_when_authentication_is_enabled() -> None:
    enable_authentication()

    response = client.get("/v1/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "A bearer token is required"}
    assert response.headers["www-authenticate"] == "Bearer"


def test_profile_reports_missing_provider_configuration() -> None:
    app.dependency_overrides[get_settings] = lambda: Settings(
        auth_enabled=True,
        oidc_audience=AUDIENCE,
    )

    response = client.get("/v1/me", headers={"Authorization": "Bearer token"})

    assert response.status_code == 503
    assert response.json() == {"detail": "The identity provider is not configured"}


def test_profile_accepts_a_valid_access_token(
    monkeypatch: pytest.MonkeyPatch, signing_keys: tuple[Any, Any]
) -> None:
    private_key, public_key = signing_keys
    enable_authentication()
    use_signing_key(monkeypatch, public_key)

    response = client.get(
        "/v1/me", headers={"Authorization": f"Bearer {token_for(private_key)}"}
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": "customer-123",
        "email": "customer@example.com",
        "name": "Avelys Customer",
    }


@pytest.mark.parametrize(
    "claim_overrides",
    [
        {"iss": "https://sso.example.com/realms/another-realm"},
        {"aud": "another-api"},
        {"exp": datetime.now(UTC) - timedelta(minutes=1)},
        {"sub": ""},
    ],
    ids=["wrong issuer", "wrong audience", "expired", "empty subject"],
)
def test_profile_rejects_invalid_access_token_claims(
    monkeypatch: pytest.MonkeyPatch,
    signing_keys: tuple[Any, Any],
    claim_overrides: dict[str, Any],
) -> None:
    private_key, public_key = signing_keys
    enable_authentication()
    use_signing_key(monkeypatch, public_key)

    response = client.get(
        "/v1/me",
        headers={"Authorization": f"Bearer {token_for(private_key, **claim_overrides)}"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "The access token is invalid or expired"}
    assert response.headers["www-authenticate"] == "Bearer"


def test_profile_rejects_a_token_with_an_invalid_signature(
    monkeypatch: pytest.MonkeyPatch, signing_keys: tuple[Any, Any]
) -> None:
    _trusted_private_key, trusted_public_key = signing_keys
    untrusted_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    enable_authentication()
    use_signing_key(monkeypatch, trusted_public_key)

    response = client.get(
        "/v1/me",
        headers={"Authorization": f"Bearer {token_for(untrusted_private_key)}"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "The access token is invalid or expired"}


def test_profile_rejects_a_token_missing_a_required_claim(
    monkeypatch: pytest.MonkeyPatch, signing_keys: tuple[Any, Any]
) -> None:
    private_key, public_key = signing_keys
    enable_authentication()
    use_signing_key(monkeypatch, public_key)

    response = client.get(
        "/v1/me",
        headers={
            "Authorization": f"Bearer {token_for(private_key, omit_claim='iat')}"
        },
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "The access token is invalid or expired"}


def test_profile_reports_an_unavailable_jwks_endpoint(
    monkeypatch: pytest.MonkeyPatch, signing_keys: tuple[Any, Any]
) -> None:
    private_key, _public_key = signing_keys
    enable_authentication()

    class UnavailableJWKClient:
        def get_signing_key_from_jwt(self, _token: str) -> Any:
            raise PyJWKClientConnectionError("JWKS endpoint unavailable")

    monkeypatch.setattr(auth, "_get_jwk_client", lambda _url: UnavailableJWKClient())

    response = client.get(
        "/v1/me", headers={"Authorization": f"Bearer {token_for(private_key)}"}
    )

    assert response.status_code == 503
    assert response.json() == {"detail": "The identity provider is unavailable"}
    assert response.headers["retry-after"] == "30"


def test_openapi_documents_authorization_code_flow() -> None:
    response = client.get("/v1/openapi.json")

    assert response.status_code == 200
    oauth_flow = response.json()["components"]["securitySchemes"]["OAuth2AuthorizationCodeBearer"][
        "flows"
    ]["authorizationCode"]
    assert oauth_flow["authorizationUrl"]
    assert oauth_flow["tokenUrl"]
    assert oauth_flow["scopes"] == {
        "openid": "Authenticate with OpenID Connect",
        "profile": "Read the user's profile",
        "email": "Read the user's email address",
    }


def test_swagger_oauth_callback_uses_the_api_origin_path() -> None:
    response = client.get("/v1/docs")

    assert response.status_code == 200
    assert "/v1/docs/oauth2-redirect" in response.text


def test_cors_allows_the_configured_web_origin_and_authorization_header() -> None:
    response = client.options(
        "/v1/me",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "Authorization" in response.headers["access-control-allow-headers"]


def test_cors_rejects_an_unconfigured_origin() -> None:
    response = client.options(
        "/v1/me",
        headers={
            "Origin": "https://attacker.example.com",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization",
        },
    )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
