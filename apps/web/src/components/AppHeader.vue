<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { auth } from '@/auth'
import { setLocale } from '@/i18n'

const { locale, t } = useI18n()
const menuOpen = ref(false)

function openAccount() {
  menuOpen.value = false
  if (auth.isAuthenticated.value) return
  void auth.login()
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
        <img src="/avelys.io-logo.png" alt="Avelys.io" />
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

        <RouterLink v-if="auth.isAuthenticated.value" class="button button-small" to="/account" @click="closeMenu">
          {{ t('nav.account') }}
        </RouterLink>
        <button v-else-if="auth.configured" class="button button-small" type="button" @click="openAccount">
          {{ t('nav.account') }}
        </button>

        <div class="language-switcher" :aria-label="t('nav.language')">
          <button type="button" :class="{ active: locale === 'fr' }" @click="selectLocale('fr')">FR</button>
          <span aria-hidden="true">/</span>
          <button type="button" :class="{ active: locale === 'en' }" @click="selectLocale('en')">EN</button>
        </div>
      </nav>
    </div>
  </header>
</template>
