from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"


@router.get("/health/live", response_model=HealthResponse)
def liveness() -> HealthResponse:
    return HealthResponse()


@router.get("/health/ready", response_model=HealthResponse)
def readiness() -> HealthResponse:
    # Add dependency checks here when database or object storage becomes mandatory.
    return HealthResponse()

