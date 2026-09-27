<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { auth } from '@/auth'
import { setLocale } from '@/i18n'

const { locale, t } = useI18n()
const menuOpen = ref(false)
const loginError = ref(false)

async function openAccount() {
  menuOpen.value = false
  if (auth.isAuthenticated.value) return
  loginError.value = false
  try {
    await auth.login()
  } catch {
    loginError.value = true
  }
}

function selectLocale(nextLocale: 'fr' | 'en') {
  setLocale(nextLocale)
  menuOpen.value = false
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="header-inner page-width">
      <RouterLink class="brand" to="/" aria-label="Avelys — accueil" @click="closeMenu">
        <img src="/avelys.io-logo.png" alt="Avelys.io" width="543" height="181" />
      </RouterLink>

      <button
        class="menu-toggle"
        type="button"
        :aria-label="t('nav.menu')"
        :aria-expanded="menuOpen"
        aria-controls="main-navigation"
        @click="menuOpen = !menuOpen"
      >
        <span></span>
        <span></span>
      </button>

      <nav id="main-navigation" :class="{ 'is-open': menuOpen }" :aria-label="t('nav.menu')">
        <a href="/#platform" @click="closeMenu">{{ t('nav.platform') }}</a>
        <a href="/#capabilities" @click="closeMenu">{{ t('nav.capabilities') }}</a>
        <a href="/#audiences" @click="closeMenu">{{ t('nav.audiences') }}</a>
        <a href="/#contact" @click="closeMenu">{{ t('nav.contact') }}</a>

        <div class="language-switcher" :aria-label="t('nav.language')">
          <button type="button" :class="{ active: locale === 'fr' }" @click="selectLocale('fr')">FR</button>
          <span aria-hidden="true">/</span>
          <button type="button" :class="{ active: locale === 'en' }" @click="selectLocale('en')">EN</button>
        </div>

        <RouterLink v-if="auth.isAuthenticated.value" class="header-auth-button" to="/account" @click="closeMenu">
          <span>{{ t('nav.account') }}</span>
          <span class="header-auth-button-icon" aria-hidden="true">→</span>
        </RouterLink>
        <button
          v-else
          class="header-auth-button"
          type="button"
          :disabled="!auth.configured"
          :title="auth.configured ? undefined : t('auth.unavailable')"
          @click="openAccount"
        >
          <span>{{ t('nav.connect') }}</span>
          <span class="header-auth-button-icon" aria-hidden="true">→</span>
        </button>
      </nav>
    </div>
    <p v-if="loginError" class="header-auth-error" role="alert">{{ t('auth.loginFailed') }}</p>
  </header>
</template>

<style scoped>
.header-auth-error {
  position: absolute;
  top: 100%;
  right: 24px;
  max-width: min(420px, calc(100vw - 32px));
  margin: 8px 0 0;
  padding: 10px 14px;
  border: 1px solid #b91c1c;
  border-radius: 8px;
  color: #7f1d1d;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 32, 83, 0.12);
  font-size: 0.82rem;
}
</style>
