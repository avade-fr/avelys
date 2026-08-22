<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { auth } from '@/auth'

const router = useRouter()
const error = ref('')

onMounted(async () => {
  try {
    const returnTo = await auth.completeLogin()
    await router.replace(returnTo)
  } catch {
    error.value = 'We could not complete sign-in. Please return home and try again.'
  }
})
</script>

<template>
  <section class="centered-page page-width">
    <p v-if="!error">Completing sign-in…</p>
    <div v-else>
      <h1>Sign-in interrupted</h1>
      <p>{{ error }}</p>
      <RouterLink class="button" to="/">Return home</RouterLink>
    </div>
  </section>
</template>

