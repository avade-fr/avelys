# Avelys

Avelys is a monorepo for the public website, future authenticated customer space, Python
API, and its Kubernetes delivery configuration. The current production release deploys
only the landing page at `avelys.io`.

## Repository layout

```text
apps/
  web/                 Vue 3 + TypeScript public site and customer UI
  api/                 FastAPI service and Keycloak token validation
deploy/
  README.md            Landing-page deployment runbook
  helm/avelys/         Reusable Kubernetes Helm chart
  helm/environments/   Environment-specific Helm values
  argocd/              Argo CD Application examples
docs/
  architecture.md      Boundaries and technical decisions
  keycloak.md          Realm/client configuration checklist
compose.yaml           Local production-like stack
```

## Run locally

Docker is the only required tool for the complete stack:

```bash
cp .env.example .env
docker compose up --build
```

- Website: <http://localhost:8080>
- API documentation: <http://localhost:8000/api/docs>
- Liveness: <http://localhost:8000/health/live>

Authentication is disabled by default for local API development. To exercise the real
login flow, set the `OIDC_*` and `VITE_OIDC_*` values in `.env`, enable authentication,
and configure the local redirect URIs in Keycloak.

For native development, use Node 22 with pnpm 10 for `apps/web` and Python 3.11+ for
`apps/api`.

```bash
corepack enable
pnpm install
pnpm dev
```

In a separate shell:

```bash
cd apps/api
python -m venv .venv
. .venv/bin/activate
pip install -e '.[dev]'
uvicorn app.main:app --reload
```

## Validate and package

```bash
docker compose build
make test
helm lint deploy/helm/avelys -f deploy/helm/environments/dev.yaml
helm template avelys deploy/helm/avelys -f deploy/helm/environments/prod.yaml
```

For the first landing-page release, follow [the deployment runbook](deploy/README.md).
The image repository is `dtr.admin.avade.fr/avelys/web`; replace the example Argo CD Git
URL before deploying.

## Delivery model

For now, build and push only the immutable `web` image to DTR. Update its tag in the
production values file and let Argo CD reconcile the Helm release. The `api` chart module
is disabled in production until the customer area is introduced. The web image reads
`config.js` from a Helm-managed ConfigMap at runtime, so later OIDC and API URLs will not
require rebuilding the image.

Database and object storage are intentionally not selected yet. Their clients belong in
the API, their credentials should be supplied through an existing Kubernetes Secret, and
their manifests should remain outside this application chart if they are managed services
or platform-level operators.
