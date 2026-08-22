import { createApp } from 'vue'

import App from './App.vue'
import { i18n } from './i18n'
import { router } from './router'
import './style.css'

const app = createApp(App)

app.directive('reveal', {
  mounted(element: HTMLElement) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.classList.add('is-visible')
      return
    }

    element.classList.add('reveal')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        element.classList.add('is-visible')
        observer.disconnect()
      },
      { threshold: 0.14 },
    )
    observer.observe(element)
  },
})

app.use(i18n).use(router).mount('#app')
