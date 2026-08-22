<script setup lang="ts">
import { useRoute } from 'vue-router'

import { auth } from '@/auth'

const route = useRoute()
</script>

<template>
  <section class="hero page-width">
    <div class="hero-copy">
      <p class="eyebrow">A clear path forward</p>
      <h1>Technology that works quietly in the background.</h1>
      <p class="lede">
        Avelys brings your services, information, and customer experience together in one
        dependable platform.
      </p>
      <div class="hero-actions">
        <a class="button" href="#platform">Discover the platform</a>
        <button
          v-if="auth.configured"
          class="text-link"
          type="button"
          @click="auth.login()"
        >
          Sign in to your space →
        </button>
      </div>
      <p v-if="route.query.auth === 'not-configured'" class="notice">
        Client access will be available when the identity provider is configured.
      </p>
    </div>
    <div class="hero-visual" aria-hidden="true">
      <div class="orb orb-main"></div>
      <div class="orb orb-small"></div>
      <div class="grid-card">
        <span>Connected</span>
        <strong>One platform</strong>
      </div>
    </div>
  </section>

  <section id="platform" class="feature-section page-width">
    <p class="eyebrow">Built as a foundation</p>
    <h2>Simple for customers. Ready to grow.</h2>
    <div class="feature-grid">
      <article>
        <span class="feature-number">01</span>
        <h3>A focused experience</h3>
        <p>A fast public site and a secure customer area, designed as one coherent product.</p>
      </article>
      <article>
        <span class="feature-number">02</span>
        <h3>Secure by design</h3>
        <p>Standards-based identity through your Keycloak realm, with authorization enforced by the API.</p>
      </article>
      <article>
        <span class="feature-number">03</span>
        <h3>Operationally ready</h3>
        <p>Container-first services and Kubernetes manifests that fit your existing delivery platform.</p>
      </article>
    </div>
  </section>

  <section id="approach" class="statement">
    <div class="page-width">
      <p class="eyebrow">Our approach</p>
      <p class="statement-copy">Start lean. Keep boundaries clear. Add capability when the product needs it.</p>
    </div>
  </section>
</template>

