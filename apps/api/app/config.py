from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Avelys API"
    app_env: str = "development"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173,http://localhost:8080"

    auth_enabled: bool = False
    oidc_issuer_url: str = ""
    oidc_jwks_url: str = ""
    oidc_audience: str = "avelys-api"

    @field_validator("oidc_issuer_url")
    @classmethod
    def normalize_issuer(cls, value: str) -> str:
        return value.rstrip("/")

    @property
    def resolved_jwks_url(self) -> str:
        if self.oidc_jwks_url:
            return self.oidc_jwks_url
        if self.oidc_issuer_url:
            return f"{self.oidc_issuer_url}/protocol/openid-connect/certs"
        return ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
