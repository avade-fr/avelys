<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { auth } from '@/auth'

type Profile = {
  id: string
  email: string | null
  name: string | null
}

const profile = ref<Profile | null>(null)
const error = ref('')

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
    error.value = 'Your profile could not be loaded.'
  }
})
</script>

<template>
  <section class="account page-width">
    <div>
      <p class="eyebrow">Private customer area</p>
      <h1>Welcome{{ profile?.name ? `, ${profile.name}` : '' }}.</h1>
      <p v-if="error" class="notice">{{ error }}</p>
      <p v-else-if="!profile">Loading your secure profile…</p>
      <p v-else>{{ profile.email }}</p>
    </div>
    <button class="text-link" type="button" @click="auth.logout()">Sign out →</button>
  </section>
</template>
