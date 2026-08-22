import { createRouter, createWebHistory } from 'vue-router'

import { auth } from '@/auth'
import AccountPage from '@/pages/AccountPage.vue'
import AuthCallbackPage from '@/pages/AuthCallbackPage.vue'
import HomePage from '@/pages/HomePage.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/auth/callback', name: 'auth-callback', component: AuthCallbackPage },
    { path: '/account', name: 'account', component: AccountPage, meta: { requiresAuth: true } },
  ],
})

router.beforeEach(async (to) => {
  await auth.ready
  if (!to.meta.requiresAuth || auth.isAuthenticated.value) return true
  if (!auth.configured) return { name: 'home', query: { auth: 'not-configured' } }
  await auth.login(to.fullPath)
  return false
})
