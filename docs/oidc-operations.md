# OIDC configuration and release procedure

This runbook is the operational reference for the Avelys web portal OIDC integration.
The design and security decisions are recorded in
[oidc-client-portal.md](oidc-client-portal.md).

## Configuration ownership

Helm values are the source of truth for deployed environments:

| Setting | Location | Purpose |
| --- | --- | --- |
| Environment issuer | `deploy/helm/environments/dev.yaml` or `prod.yaml`, under `oidc.issuerUrl` | Browser discovery and API issuer validation |
| API base URL | The same environment file, under `web.runtimeConfig.apiBaseUrl` | Browser API requests |
| Browser client ID | `deploy/helm/avelys/values.yaml`, under `oidc.webClientId` | Public OIDC client; currently `avelys-web` |
| API audience | `deploy/helm/avelys/values.yaml`, under `oidc.apiAudience` | Required access-token audience; currently `avelys-api` |
| Optional API JWKS override | `oidc.jwksUrl` | Used only when the API must reach Keycloak through a different internal URL |

The chart writes the public browser settings to `/runtime-config.js` and, when the API
workload is enabled, derives its OIDC environment variables from the same `oidc` values.
The web library resolves authorization, token, logout, and other provider endpoints from
the issuer's `.well-known/openid-configuration` document. Do not copy those resolved
endpoints into Helm values.

`runtime-config.js` is served with `Cache-Control: no-store`; `index.html` is served with
`no-cache`. Hashed application assets remain immutable. Never rename the runtime file back
to the previously cached `/config.js`.

All browser OIDC settings are public. Do not put a client secret, token, or credential in
Helm values, Compose variables, the Vue build, or `runtime-config.js`.

## Environment values

| Environment | Issuer | API base URL |
| --- | --- | --- |
| Production | `https://auth.avade.fr/realms/avelys` | `https://api.avelys.io/v1` |
| Development | `https://auth.avade.fr/realms/avelys-dev` | `https://dev-api.avelys.io/v1` |
| Local browser | `http://localhost:7000/realms/avelys` | `http://localhost:8000/v1` |

Local values live in `compose.yaml` and `compose.dev.yaml`. The browser uses the host URL
`localhost:7000`. The API container uses the same issuer but overrides the JWKS URL with
`http://keycloak:7000/realms/avelys/protocol/openid-connect/certs`; therefore the Keycloak
container must be attached to the external Docker network named `keycloak`.

Start the hot-reload stack with:

```bash
make dev
```

Use `make local` to test the production-like Nginx image on port 8080.

## Keycloak configuration

Configure `avelys-web` as a public client in each realm:

- Client authentication: off.
- Standard Flow: on.
- PKCE: required, method `S256`.
- Implicit Flow, Direct Access Grants, and service accounts: off.
- Add `avelys-api` to access-token `aud` through an audience mapper/client scope.
- Use exact redirect URIs and web origins; do not use a production wildcard.

Register these portal URLs in the corresponding realm:

| Environment | Valid redirect URI | Post-logout redirect URI | Web origin |
| --- | --- | --- | --- |
| Production | `https://avelys.io/oauth2-redirect` | `https://avelys.io/` | `https://avelys.io` |
| Development | `https://dev.avelys.io/oauth2-redirect` | `https://dev.avelys.io/` | `https://dev.avelys.io` |
| Local Vite | `http://localhost:5173/oauth2-redirect` | `http://localhost:5173/` | `http://localhost:5173` |
| Local Nginx | `http://localhost:8080/oauth2-redirect` | `http://localhost:8080/` | `http://localhost:8080` |

Swagger UI is a separate browser application on the API origin. It may share this client
while its scopes and permissions are identical, but its exact callbacks must also be
registered:

- `https://api.avelys.io/v1/docs/oauth2-redirect`
- `https://dev-api.avelys.io/v1/docs/oauth2-redirect`
- `http://localhost:8000/v1/docs/oauth2-redirect`

Add each corresponding API origin to the client's exact web origins as well. For local
Swagger UI, that is `http://localhost:8000`; Keycloak needs it to allow the browser's token
exchange request.

Create a separate Swagger client only if its permissions or access policy diverge from
the portal. Its callback cannot replace the web portal callback because browser session
storage is origin-scoped.

## Changing an environment

1. Update `oidc.issuerUrl` and, if necessary, `web.runtimeConfig.apiBaseUrl` in the target
   environment file.
2. Update the Keycloak redirect, logout, and web-origin allowlists for that environment.
3. Render and inspect both environments before committing:

   ```bash
   make helm-check
   helm template avelys-dev deploy/helm/avelys \
     -f deploy/helm/environments/dev.yaml
   helm template avelys-prod deploy/helm/avelys \
     -f deploy/helm/environments/prod.yaml
   ```

4. Confirm the rendered `runtime-config.js` contains the intended issuer, client ID, and
   API URL. Confirm no secret is present.
5. Commit and push the values change. Argo CD reconciles the environment from `master`.

Changing only runtime values does not require rebuilding the web image. A code release
does require a new immutable image tag.

## Publishing a code release

1. Choose `vX.Y.Z` and update all of the following together:

   - `apps/web/package.json` version;
   - `apps/api/pyproject.toml` version;
   - `deploy/helm/avelys/Chart.yaml` `version` and `appVersion`;
   - `web.image.tag` and `api.image.tag` in the environment files being promoted.

2. Rebuild and validate the exact sources:

   ```bash
   docker compose build web-test api-test
   make test
   make lint
   make helm-check
   git diff --check
   ```

3. Commit the release, create the annotated tag locally, and publish the image before
   pushing Git:

   ```bash
   git add apps/web/package.json apps/api/pyproject.toml \
     deploy/helm/avelys/Chart.yaml \
     deploy/helm/environments/dev.yaml \
     deploy/helm/environments/prod.yaml
   git commit -m "Release Avelys vX.Y.Z"
   git tag -a vX.Y.Z -m "Avelys vX.Y.Z"
   make release
   git push origin master vX.Y.Z
   ```

Publishing both images first prevents Argo CD from observing a Helm image tag that does not
yet exist. `make release` refuses to run unless `HEAD` has an exact Git tag.

For development-only commit images, `make web-push` and `make api-push` create a
`COMMIT_<8-character-sha>` tag. Put that exact tag only in the development values and push
the values commit. Formal production releases use the annotated `vX.Y.Z` tag.

## Operational checks and troubleshooting

Check the effective public configuration, not only the Git values:

```bash
curl --fail --show-error https://avelys.io/runtime-config.js
curl --fail --show-error https://auth.avade.fr/realms/avelys/.well-known/openid-configuration
```

For development, substitute `dev.avelys.io` and the `avelys-dev` realm. The runtime file
must contain the expected `oidcAuthority`, `oidcClientId`, and `apiBaseUrl`, and its response
must have `Cache-Control: no-store`.

If the UI says that the identity provider is unavailable:

1. Inspect `/runtime-config.js` in the browser network panel and confirm it is the current,
   non-cached response.
2. Open the issuer discovery URL from the browser and check its CORS response.
3. Confirm the issuer is exact, including the realm, with no `.well-known` suffix in Helm.
4. Confirm the current web origin is allowed by the Keycloak client.
5. Inspect the rendered ConfigMap before changing application code.

After login, verify the access token has issuer `iss` for the correct realm and contains
`avelys-api` in `aud`. Login success by itself does not prove the API will accept the token.
