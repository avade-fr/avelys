import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts'
import { computed, ref } from 'vue'

const runtimeConfig = window.__APP_CONFIG__ ?? {}
const authority = runtimeConfig.oidcAuthority || import.meta.env.VITE_OIDC_AUTHORITY || ''
const configured = Boolean(authority)
const currentUser = ref<User | null>(null)

const manager = configured
  ? new UserManager({
      authority,
      client_id: runtimeConfig.oidcClientId || import.meta.env.VITE_OIDC_CLIENT_ID || 'avelys-web',
      redirect_uri:
        runtimeConfig.oidcRedirectUri ||
        import.meta.env.VITE_OIDC_REDIRECT_URI ||
        `${window.location.origin}/auth/callback`,
      post_logout_redirect_uri:
        runtimeConfig.oidcPostLogoutRedirectUri ||
        import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI ||
        `${window.location.origin}/`,
      response_type: 'code',
      scope: 'openid profile email',
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
      automaticSilentRenew: true,
    })
  : null

const ready = manager
  ? manager.getUser().then((user) => {
      currentUser.value = user && !user.expired ? user : null
    })
  : Promise.resolve()

if (manager) {
  manager.events.addUserLoaded((user) => {
    currentUser.value = user
  })
  manager.events.addUserUnloaded(() => {
    currentUser.value = null
  })
}

export const auth = {
  configured,
  ready,
  user: computed(() => currentUser.value),
  isAuthenticated: computed(() => Boolean(currentUser.value && !currentUser.value.expired)),
  async login(returnTo = '/account') {
    if (!manager) throw new Error('OIDC is not configured')
    await manager.signinRedirect({ state: { returnTo } })
  },
  async completeLogin() {
    if (!manager) throw new Error('OIDC is not configured')
    const user = await manager.signinRedirectCallback()
    currentUser.value = user
    const state = user.state as { returnTo?: string } | undefined
    return state?.returnTo ?? '/account'
  },
  async logout() {
    if (!manager) return
    await manager.signoutRedirect()
  },
  accessToken() {
    return currentUser.value?.access_token ?? null
  },
}
