/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_OIDC_AUTHORITY?: string
  readonly VITE_OIDC_CLIENT_ID?: string
  readonly VITE_OIDC_REDIRECT_URI?: string
  readonly VITE_OIDC_POST_LOGOUT_REDIRECT_URI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  readonly __APP_CONFIG__?: {
    apiBaseUrl?: string
    oidcAuthority?: string
    oidcClientId?: string
    oidcRedirectUri?: string
    oidcPostLogoutRedirectUri?: string
  }
}
