<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const capabilities = [
  { key: 'aggregation', path: 'M8 14h12M8 8h7M8 20h16M4 8h.01M4 14h.01M4 20h.01' },
  { key: 'standardization', path: 'm5 12 4 4L19 6M5 6h5M14 18h5' },
  { key: 'rules', path: 'M7 4v16M17 4v16M4 8h6M14 16h6' },
  { key: 'selection', path: 'm5 12 4 4L19 6M4 21h16' },
  { key: 'audit', path: 'M9 11h6M9 15h4M7 3h8l4 4v14H7zM15 3v5h5' },
  { key: 'exposure', path: 'M4 19V9M10 19V5M16 19v-7M22 19H2' },
] as const

const processSteps = ['ingest', 'control', 'decide'] as const
const audiences = ['banks', 'servicers', 'funds', 'fintechs'] as const
</script>

<template>
  <section class="hero">
    <div class="hero-background" aria-hidden="true"></div>
    <div class="hero-inner page-width">
      <div class="hero-copy">
        <p class="eyebrow">{{ t('hero.eyebrow') }}</p>
        <h1>{{ t('hero.title') }}</h1>
        <p class="lede">{{ t('hero.body') }}</p>
        <div class="hero-actions">
          <a class="button" href="#platform">
            {{ t('hero.primary') }}
            <span class="button-arrow" aria-hidden="true">↘</span>
          </a>
          <a class="text-link" href="mailto:contact@avelys.io">{{ t('hero.secondary') }} <span aria-hidden="true">→</span></a>
        </div>
        <p class="hero-note"><span aria-hidden="true">✓</span>{{ t('hero.note') }}</p>
        <p v-if="route.query.auth === 'not-configured'" class="notice">{{ t('auth.unavailable') }}</p>
      </div>

      <div class="portfolio-card" aria-hidden="true">
        <div class="portfolio-card-head">
          <span>{{ t('hero.cardLabel') }}</span>
          <span class="live-dot"></span>
        </div>
        <strong>{{ t('hero.cardValue') }}</strong>
        <span class="portfolio-unit">{{ t('hero.cardUnit') }}</span>
        <div class="data-bars">
          <i style="--bar: 42%"></i><i style="--bar: 68%"></i><i style="--bar: 54%"></i><i style="--bar: 85%"></i><i style="--bar: 74%"></i><i style="--bar: 96%"></i>
        </div>
        <div class="portfolio-status">
          <span><b>✓</b>{{ t('hero.cardStatus') }}</span>
          <span>{{ t('hero.cardAudit') }}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="proof-strip" aria-label="Avelys key benefits">
    <div class="proof-grid page-width">
      <article>
        <span class="proof-index">01</span>
        <div><strong>{{ t('proof.scale') }}</strong><small>{{ t('proof.scaleDetail') }}</small></div>
      </article>
      <article>
        <span class="proof-index">02</span>
        <div><strong>{{ t('proof.audit') }}</strong><small>{{ t('proof.auditDetail') }}</small></div>
      </article>
      <article>
        <span class="proof-index">03</span>
        <div><strong>{{ t('proof.neutral') }}</strong><small>{{ t('proof.neutralDetail') }}</small></div>
      </article>
    </div>
  </section>

  <section id="platform" class="intro-section section-space">
    <div class="intro-grid page-width">
      <div v-reveal>
        <p class="eyebrow eyebrow-accent">{{ t('intro.eyebrow') }}</p>
        <h2>{{ t('intro.title') }}</h2>
      </div>
      <div v-reveal class="intro-copy">
        <p>{{ t('intro.body') }}</p>
        <div class="intro-stats">
          <div><strong>{{ t('intro.expertise') }}</strong><span>{{ t('intro.expertiseLabel') }}</span></div>
          <div><strong>{{ t('intro.decision') }}</strong><span>{{ t('intro.decisionLabel') }}</span></div>
        </div>
      </div>
    </div>
  </section>

  <section id="capabilities" class="capabilities-section section-space">
    <div class="page-width">
      <div v-reveal class="section-heading">
        <div>
          <p class="eyebrow eyebrow-accent">{{ t('capabilities.eyebrow') }}</p>
          <h2>{{ t('capabilities.title') }}</h2>
        </div>
        <p>{{ t('capabilities.subtitle') }}</p>
      </div>

      <div class="capability-grid">
        <article v-for="(capability, index) in capabilities" :key="capability.key" v-reveal class="capability-card">
          <div class="capability-topline">
            <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path :d="capability.path" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>0{{ index + 1 }}</span>
          </div>
          <h3>{{ t(`capabilities.${capability.key}.title`) }}</h3>
          <p>{{ t(`capabilities.${capability.key}.body`) }}</p>
        </article>
      </div>
    </div>
  </section>

  <section class="process-section section-space">
    <div class="page-width">
      <div v-reveal class="process-heading">
        <p class="eyebrow">{{ t('process.eyebrow') }}</p>
        <h2>{{ t('process.title') }}</h2>
      </div>
      <div class="process-grid">
        <article v-for="step in processSteps" :key="step" v-reveal>
          <span>{{ t(`process.${step}.number`) }}</span>
          <div class="process-marker"><i></i></div>
          <h3>{{ t(`process.${step}.title`) }}</h3>
          <p>{{ t(`process.${step}.body`) }}</p>
        </article>
      </div>
    </div>
  </section>

  <section id="audiences" class="audience-section section-space">
    <div class="audience-grid page-width">
      <div v-reveal class="audience-intro">
        <p class="eyebrow eyebrow-accent">{{ t('audiences.eyebrow') }}</p>
        <h2>{{ t('audiences.title') }}</h2>
      </div>
      <div class="audience-list">
        <article v-for="(audience, index) in audiences" :key="audience" v-reveal>
          <span>0{{ index + 1 }}</span>
          <div>
            <h3>{{ t(`audiences.${audience}.title`) }}</h3>
            <p>{{ t(`audiences.${audience}.body`) }}</p>
          </div>
          <i aria-hidden="true">↗</i>
        </article>
      </div>
    </div>
  </section>

  <section class="security-section">
    <div class="security-inner page-width">
      <div v-reveal class="security-copy">
        <p class="eyebrow">{{ t('security.label') }}</p>
        <h2>{{ t('security.title') }}</h2>
        <p>{{ t('security.body') }}</p>
      </div>
      <div v-reveal class="security-orbit" aria-hidden="true">
        <span class="orbit orbit-one"></span>
        <span class="orbit orbit-two"></span>
        <div class="security-core">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M24 5 39 11v11c0 10-6.4 17.4-15 21-8.6-3.6-15-11-15-21V11l15-6Z" stroke="currentColor" stroke-width="1.5" />
            <path d="m17 24 5 5 10-11" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
      </div>
      <div class="security-points">
        <span>✓ {{ t('security.traceability') }}</span>
        <span>✓ {{ t('security.governance') }}</span>
        <span>✓ {{ t('security.access') }}</span>
      </div>
    </div>
  </section>

  <section id="contact" class="contact-section section-space">
    <div v-reveal class="contact-inner page-width">
      <p class="eyebrow">{{ t('contact.eyebrow') }}</p>
      <h2>{{ t('contact.title') }}</h2>
      <p>{{ t('contact.body') }}</p>
      <a class="button button-light" href="mailto:contact@avelys.io">
        {{ t('contact.cta') }} <span aria-hidden="true">↗</span>
      </a>
    </div>
  </section>

  <footer class="site-footer">
    <div class="footer-inner page-width">
      <img src="/avelys.io-logo.png" alt="Avelys.io" />
      <p>{{ t('footer.tagline') }}</p>
      <small>© {{ new Date().getFullYear() }} Avelys.io — {{ t('footer.rights') }}</small>
    </div>
  </footer>
</template>
