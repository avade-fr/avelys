# Client portal OIDC and PKCE

Status: accepted

## Outcome

Add an environment-aware **Connect** action to the web header and authenticate the
Vue client with OpenID Connect Authorization Code flow and PKCE (`S256`). The browser
receives tokens; the API remains the authorization boundary and validates each access
token.

The client portal callback belongs to the web application:

| Environment | Web callback | API base URL | Issuer |
| --- | --- | --- | --- |
| Production | `https://avelys.io/oauth2-redirect` | `https://api.avelys.io/v1` | `https://auth.avade.fr/realms/avelys` |
| Development | `https://dev.avelys.io/oauth2-redirect` | `https://dev-api.avelys.io/v1` | `https://auth.avade.fr/realms/avelys-dev` |
| Local | `http://localhost:5173/oauth2-redirect` | `http://localhost:8000/v1` | `http://localhost:7000/realms/avelys` |

`/oauth2-redirect` is an SPA route served by the web container's history fallback. It
must not redirect to Swagger UI. Swagger's OAuth callback is a separate integration,
on the API origin, and cannot complete the web application's login because browser
storage is origin-scoped.

## Verified provider capabilities

Both realm discovery documents advertise:

- Authorization Code flow;
- PKCE challenge methods `S256` and `plain` (the client will require `S256`);
- RS256 token signing and a realm JWKS endpoint;
- an end-session endpoint;
- browser access to discovery from the corresponding Avelys web origin.

Discovery URLs:

- `https://auth.avade.fr/realms/avelys/.well-known/openid-configuration`
- `https://auth.avade.fr/realms/avelys-dev/.well-known/openid-configuration`

## Web behavior

- Place the language selector first and **Connect** immediately to its right on desktop.
  Preserve an accessible order in the mobile menu.
- Use `Connexion` in French and `Connect` in English.
- When signed in, replace the action with **Espace client** / **Client portal**, linking
  to `/account`. Sign-out remains available from the authenticated area.
- Clicking Connect starts a redirect login and records a relative return path, defaulting
  to `/account`.
- Configure the OIDC client with:
  - `client_id`: `avelys-web`;
  - `response_type`: `code`;
  - scopes: `openid profile email`;
  - PKCE: `S256`;
  - callback path: `/oauth2-redirect`;
  - post-logout path: `/`.
- Validate the authorization response through the OIDC library, including `state`,
  `nonce`, issuer, and code exchange. Only restore same-origin relative return paths.
- Keep tokens in session storage, never local storage, URLs, logs, or application error
  messages.
- Attach the access token only to the configured Avelys API origin. On an unrecoverable
  `401`, clear the local session and offer a fresh login.
- Show an explicit unavailable/error state if runtime OIDC configuration is absent or
  discovery fails; do not silently hide a broken Connect action.

`oidc-client-ts` is the existing implementation library and performs the PKCE code
verifier/challenge handling. Token renewal should use a refresh token when the realm
permits it. Do not depend on hidden-iframe renewal, which is fragile when third-party
cookies are restricted.

## Runtime configuration and Helm

Use Helm as the single source of environment configuration. Keep the web's runtime
`/runtime-config.js`, because it already allows one immutable web image to be promoted between
environments without making rendering depend on API availability or CORS.

Prefer shared chart values rather than separate web and API copies:

```yaml
oidc:
  issuerUrl: https://auth.avade.fr/realms/avelys
  webClientId: avelys-web
  apiAudience: avelys-api

web:
  runtimeConfig:
    apiBaseUrl: https://api.avelys.io/v1
```

The chart derives:

- web `oidcAuthority` and `oidcClientId` in `/runtime-config.js`;
- API `OIDC_ISSUER_URL` and `OIDC_AUDIENCE` environment variables;
- callback and post-logout URIs from `window.location.origin` plus fixed paths.

These values are public metadata and must not contain a client secret. `avelys-web` is
a public client.

An unauthenticated `GET /v1/config` endpoint is not part of the first increment. It can
be added later if native applications or independently deployed clients need centralized
Avelys-specific discovery. If added, it returns only public values, has explicit CORS and
cache behavior, and is not the API's source of truth for token validation.

## API contract

- Canonical public API origins are `api.avelys.io` and `dev-api.avelys.io`.
- Canonical versioned routes begin at `/v1`; for example `GET /v1/me`.
- CORS allows only the corresponding web origin and the `Authorization` and
  `Content-Type` headers.
- The API validates signature, exact issuer, expiry, required claims, and audience using
  the realm JWKS. A production token is never accepted by development, or conversely.
- Keycloak must add `avelys-api` to the access token `aud` claim issued to
  `avelys-web`. The `azp` claim alone is not a substitute for API audience validation.
- Authentication identifies a subject; endpoint roles and tenant/customer access remain
  separate authorization checks.

## Keycloak client settings

For `avelys-web` in each realm:

- client authentication off (public client);
- Standard Flow on;
- PKCE method required: `S256`;
- Implicit Flow, Direct Access Grants, and service accounts off;
- exact valid redirect and post-logout URIs for that realm's web origin;
- exact web origin, without production wildcards;
- audience mapper/client scope adding `avelys-api` to access tokens.

## Swagger UI callback

Swagger UI is a separate browser application and therefore uses callback URLs on the API
origin. It may initially share the `avelys-web` Keycloak client when it uses the same
scopes, audience, and access policy. Register exact callback URLs:

- `https://api.avelys.io/v1/docs/oauth2-redirect`;
- `https://dev-api.avelys.io/v1/docs/oauth2-redirect`;
- `http://localhost:8000/v1/docs/oauth2-redirect` for local development.

The portal still uses its callback on the web origin; Swagger's callback cannot complete
a portal login. If Swagger later receives broader developer or administrator access,
split it into a separate `avelys-swagger` client so its redirects, permissions, and audit
identity remain isolated. Production documentation should be enabled only by an explicit
deployment decision; the API currently disables documentation in production.

## Challenges and proposed resolutions

1. **Swagger callback versus portal callback:** they are callbacks for different browser
   applications. Use the web callback for Connect and the API callback only for Swagger.
2. **API-host migration:** FastAPI and the web client now use `/v1` without an ingress
   rewrite, keeping generated OpenAPI URLs consistent. Deployed environments use their
   dedicated API origins; enable the API workload only after its image and external routing
   are available.
3. **Audience is not yet demonstrated:** before rollout, inspect a real access token and
   prove that `aud` contains `avelys-api`. Login success alone does not prove the token is
   valid for this API.
4. **Browser token exposure:** PKCE prevents authorization-code interception but does not
   protect session-storage tokens from XSS. This SPA design is acceptable only with a
   strict CSP, dependency hygiene, no untrusted scripts, and short token lifetimes. A BFF
   with secure HTTP-only cookies is the stronger option if the portal's risk assessment
   forbids browser-held bearer tokens.
5. **Renewal and logout:** confirm refresh-token issuance/rotation and post-logout URI
   behavior in both realms. Do not consider initial login alone a complete session design.

## Acceptance checks

- Helm rendering produces the correct issuer and API base URL for both environments.
- Connect appears immediately right of FR/EN and remains keyboard and mobile accessible.
- The authorization request contains `response_type=code`, the exact redirect URI,
  `state`, `nonce`, and `code_challenge_method=S256`.
- Successful login returns to the original protected relative route; cancellation and
  malformed/replayed callbacks show a safe recovery path.
- `/v1/me` succeeds with a correctly issued access token and rejects wrong issuer,
  audience, signature, and expired tokens.
- Refresh/expiry and front-channel sign-out are tested in both realms.
- No secret is present in Helm values or web assets, and no token is written to logs or
  persistent browser storage.
