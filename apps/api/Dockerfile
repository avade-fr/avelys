FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/opt/venv/bin:$PATH

RUN python -m venv /opt/venv
WORKDIR /app

COPY apps/api/pyproject.toml ./
COPY apps/api/app ./app
RUN pip install --no-cache-dir .

FROM base AS test
COPY apps/api/tests ./tests
RUN pip install --no-cache-dir '.[dev]'
CMD ["pytest"]

FROM base AS runtime
RUN addgroup --system --gid 10001 app && \
    adduser --system --uid 10001 --ingroup app app
USER 10001:10001

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips=*"]
