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
  web/implementation.md Landing-page design and implementation decisions
compose.yaml           Local production-like stack
```

## Run locally with hot reload

Docker is the only required tool for the complete stack. Start the Vite development
server and API with:

```bash
cp .env.example .env
make dev
```

- Website: <http://localhost:5173>
- API documentation: <http://localhost:8000/api/docs>
- Liveness: <http://localhost:8000/health/live>

Changes under `apps/web/src` and `apps/web/public` are reflected immediately in the
browser. To run the production-like Nginx build locally instead, use `make local`; it is
served at <http://localhost:8080>.

Local Compose development uses the Keycloak realm at
`http://localhost:7000/realms/avelys` and enables API token validation by default. Its
container must be attached to the external Docker network named `keycloak`, where it is
reachable as `keycloak:7000`. Register `http://localhost:5173/oauth2-redirect` and
`http://localhost:8080/oauth2-redirect`, their corresponding post-logout URLs, and both
localhost web origins in the local Keycloak client. Set `AUTH_ENABLED=false` only when
deliberately exercising the API without authentication.

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
