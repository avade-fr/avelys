# Keycloak setup

Use separate Keycloak clients for the browser and API audience.

## Browser client: `avelys-web`

- Client authentication: off (public client).
- Standard flow: enabled.
- Implicit and direct access grant flows: disabled.
- PKCE method: `S256`.
- Valid redirect URIs: exact environment URLs such as
  `https://avelys.io/oauth2-redirect` and
  `https://dev.avelys.io/oauth2-redirect` in their respective realms.
- Valid post-logout redirect URIs: environment site roots.
- Web origins: exact environment origins; avoid `*` in production.

Swagger UI may use the same public client while it has the same API permissions, but its
exact API-origin callback must be registered separately. Give Swagger a dedicated client
if its scopes or access policy diverge from the portal.

No client secret belongs in Vue or Helm runtime configuration.

## API audience: `avelys-api`

The access token consumed by FastAPI must contain `avelys-api` in its `aud` claim. Add a
Keycloak audience mapper or client scope to the browser client so that audience is present.
The API validates:

- RS256 signature using the realm JWKS endpoint;
- exact realm issuer;
- expiry and issued-at claims;
- `avelys-api` audience.

Roles can later be mapped from `realm_access.roles` or
`resource_access.<client>.roles` in a dedicated authorization dependency. Authentication
alone should not be used as authorization for privileged customer operations.
