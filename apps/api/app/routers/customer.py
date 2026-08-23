from fastapi import APIRouter
from pydantic import BaseModel

from app.auth import CurrentClaims

router = APIRouter(prefix="/v1", tags=["customer"])


class CustomerProfile(BaseModel):
    id: str
    email: str | None = None
    name: str | None = None


@router.get("/me", response_model=CustomerProfile)
def get_profile(claims: CurrentClaims) -> CustomerProfile:
    return CustomerProfile(
        id=str(claims["sub"]),
        email=claims.get("email"),
        name=claims.get("name") or claims.get("preferred_username"),
    )
