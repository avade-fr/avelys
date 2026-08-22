<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { auth } from '@/auth'

type Profile = {
  id: string
  email: string | null
  name: string | null
}

const profile = ref<Profile | null>(null)
const error = ref('')
const { t } = useI18n()

onMounted(async () => {
  const token = auth.accessToken()
  if (!token) return

  try {
    const apiBaseUrl = window.__APP_CONFIG__?.apiBaseUrl || import.meta.env.VITE_API_BASE_URL || '/api'
    const response = await fetch(`${apiBaseUrl}/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`API returned ${response.status}`)
    profile.value = await response.json() as Profile
  } catch {
    error.value = t('auth.profileError')
  }
})
</script>

<template>
  <section class="account page-width">
    <div>
      <p class="eyebrow">{{ t('auth.privateArea') }}</p>
      <h1>{{ t('auth.welcome') }}{{ profile?.name ? `, ${profile.name}` : '' }}.</h1>
      <p v-if="error" class="notice">{{ error }}</p>
      <p v-else-if="!profile">{{ t('auth.loading') }}</p>
      <p v-else>{{ profile.email }}</p>
    </div>
    <button class="text-link" type="button" @click="auth.logout()">{{ t('auth.signOut') }} →</button>
  </section>
</template>
