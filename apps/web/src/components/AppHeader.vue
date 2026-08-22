<script setup lang="ts">
import { auth } from '@/auth'

function openAccount() {
  if (auth.isAuthenticated.value) return
  void auth.login()
}
</script>

<template>
  <header class="site-header page-width">
    <RouterLink class="brand" to="/" aria-label="Avelys home">
      <span class="brand-mark">A</span>
      <span>Avelys</span>
    </RouterLink>
    <nav aria-label="Main navigation">
      <a href="/#platform">Platform</a>
      <a href="/#approach">Approach</a>
      <RouterLink v-if="auth.isAuthenticated.value" class="button button-small" to="/account">
        My account
      </RouterLink>
      <button v-else-if="auth.configured" class="button button-small" type="button" @click="openAccount">
        Client access
      </button>
    </nav>
  </header>
</template>
