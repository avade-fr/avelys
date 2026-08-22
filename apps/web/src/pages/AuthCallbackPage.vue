<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { auth } from '@/auth'

const router = useRouter()
const error = ref('')
const { t } = useI18n()

onMounted(async () => {
  try {
    const returnTo = await auth.completeLogin()
    await router.replace(returnTo)
  } catch {
    error.value = t('auth.callbackError')
  }
})
</script>

<template>
  <section class="centered-page page-width">
    <p v-if="!error">{{ t('auth.completing') }}</p>
    <div v-else>
      <h1>{{ t('auth.interrupted') }}</h1>
      <p>{{ error }}</p>
      <RouterLink class="button" to="/">{{ t('auth.home') }}</RouterLink>
    </div>
  </section>
</template>
