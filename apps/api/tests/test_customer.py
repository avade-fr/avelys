from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import app

client = TestClient(app)


def test_local_profile_when_authentication_is_disabled() -> None:
    response = client.get("/api/v1/me")

    assert response.status_code == 200
    assert response.json() == {
        "id": "local-development-user",
        "email": "developer@localhost",
        "name": "Local developer",
    }


def test_profile_requires_token_when_authentication_is_enabled() -> None:
    app.dependency_overrides[get_settings] = lambda: Settings(
        auth_enabled=True,
        oidc_issuer_url="https://sso.example.com/realms/avelys",
    )

    try:
        response = client.get("/api/v1/me")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"
