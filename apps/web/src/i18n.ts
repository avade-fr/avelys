import { createI18n } from 'vue-i18n'

const messages = {
  fr: {
    meta: {
      description: 'Avelys modernise l’infrastructure de la titrisation grâce à une plateforme de données fiable, automatisée et totalement auditable.',
    },
    nav: {
      platform: 'Plateforme',
      capabilities: 'Fonctionnalités',
      audiences: 'Pour qui ?',
      contact: 'Nous contacter',
      connect: 'Connexion',
      account: 'Espace client',
      menu: 'Ouvrir le menu',
      language: 'Langue',
    },
    hero: {
      eyebrow: 'L’infrastructure data de la titrisation',
      title: 'La donnée au service de la performance.',
      body: 'Unifiez, standardisez, analysez et sélectionnez vos créances avec une précision institutionnelle — de l’ingestion à la décision.',
      primary: 'Découvrir la plateforme',
      secondary: 'Parler à un expert',
      note: 'Conçue par des professionnels de la titrisation.',
      cardLabel: 'Portefeuille analysé',
      cardValue: '2,4 M',
      cardUnit: 'lignes traitées',
      cardStatus: 'Contrôles terminés',
      cardAudit: '100 % traçable',
    },
    proof: {
      scale: 'Des millions de lignes',
      scaleDetail: 'traitées avec stabilité',
      audit: 'Auditabilité ligne à ligne',
      auditDetail: 'chaque décision expliquée',
      neutral: 'Multi-originators',
      neutralDetail: 'une donnée enfin unifiée',
    },
    intro: {
      eyebrow: 'Une nouvelle ère',
      title: 'La complexité métier, enfin maîtrisée.',
      body: 'Les programmes de titrisation ne devraient plus dépendre de fichiers fragmentés, de scripts difficiles à maintenir ou de contrôles manuels. Avelys réunit toute la chaîne de traitement dans un environnement unique, robuste et lisible.',
      expertise: '10+ ans',
      expertiseLabel: 'd’expertise métier',
      decision: 'Chaque ligne',
      decisionLabel: 'justifiée et historisée',
    },
    capabilities: {
      eyebrow: 'La plateforme',
      title: 'Un socle unique pour chaque étape de vos opérations.',
      subtitle: 'Une technologie conçue pour absorber la complexité, sans la transmettre à vos équipes.',
      aggregation: {
        title: 'Agrégation multi-originators',
        body: 'Importez automatiquement vos portefeuilles, quels que soient leur format, leur volume ou leur système d’origine.',
      },
      standardization: {
        title: 'Standardisation intelligente',
        body: 'Harmonisez les données, détectez les incohérences et enrichissez les champs pour une qualité irréprochable.',
      },
      rules: {
        title: 'Moteur de règles configurable',
        body: 'Modélisez critères d’éligibilité, limites de concentration, contraintes contractuelles et règles d’assurance.',
      },
      selection: {
        title: 'Sélection automatique',
        body: 'Identifiez instantanément les créances qui respectent l’ensemble de vos règles, limites et couvertures.',
      },
      audit: {
        title: 'Auditabilité totale',
        body: 'Documentez chaque acceptation ou rejet avec un historique complet, clair et consultable.',
      },
      exposure: {
        title: 'Vue consolidée des expositions',
        body: 'Suivez achats, expositions, limites, assurances et triggers depuis une source de vérité unique.',
      },
    },
    process: {
      eyebrow: 'De la donnée à la décision',
      title: 'Plus rapide. Plus fiable. Entièrement traçable.',
      ingest: {
        number: '01',
        title: 'Connectez',
        body: 'Centralisez les données de tous vos originators dans un flux sécurisé.',
      },
      control: {
        number: '02',
        title: 'Contrôlez',
        body: 'Standardisez, enrichissez et appliquez vos règles à chaque créance.',
      },
      decide: {
        number: '03',
        title: 'Décidez',
        body: 'Sélectionnez les actifs éligibles et restituez une piste d’audit complète.',
      },
    },
    audiences: {
      eyebrow: 'Pensée pour tout l’écosystème',
      title: 'Une donnée commune. Des décisions mieux alignées.',
      banks: {
        title: 'Banques',
        body: 'Industrialisez vos programmes et sécurisez vos processus internes.',
      },
      servicers: {
        title: 'Servicers',
        body: 'Automatisez les contrôles et renforcez la transparence investisseurs.',
      },
      funds: {
        title: 'Fonds & SPV',
        body: 'Pilotez une vision multi-originators fiable et audit-proof.',
      },
      fintechs: {
        title: 'Fintechs & entreprises',
        body: 'Accélérez la cession et la valorisation de vos créances.',
      },
    },
    security: {
      label: 'Sécurité & conformité',
      title: 'La confiance n’est pas une option.',
      body: 'Chaque flux, transformation et décision est tracé et documenté. Avelys applique des standards exigeants de sécurité, de gouvernance des données et de conformité.',
      traceability: 'Traçabilité complète',
      governance: 'Gouvernance des données',
      access: 'Accès sécurisés',
    },
    contact: {
      eyebrow: 'Construisons la suite',
      title: 'Prêt à moderniser vos opérations de titrisation ?',
      body: 'Échangeons sur vos données, vos règles et les besoins de vos équipes.',
      cta: 'Nous contacter',
    },
    footer: {
      tagline: 'La donnée au service de la performance.',
      rights: 'Tous droits réservés.',
    },
    auth: {
      unavailable: 'L’espace client sera disponible dès que le fournisseur d’identité sera configuré.',
      privateArea: 'Espace client sécurisé',
      welcome: 'Bienvenue',
      loading: 'Chargement de votre profil sécurisé…',
      profileError: 'Votre profil n’a pas pu être chargé.',
      signOut: 'Se déconnecter',
      completing: 'Connexion en cours…',
      interrupted: 'Connexion interrompue',
      callbackError: 'La connexion n’a pas pu aboutir. Revenez à l’accueil et réessayez.',
      home: 'Retour à l’accueil',
    },
  },
  en: {
    meta: {
      description: 'Avelys modernizes securitization infrastructure with a reliable, automated and fully auditable data platform.',
    },
    nav: {
      platform: 'Platform',
      capabilities: 'Capabilities',
      audiences: 'Who it’s for',
      contact: 'Contact us',
      connect: 'Connect',
      account: 'Client portal',
      menu: 'Open menu',
      language: 'Language',
    },
    hero: {
      eyebrow: 'The data infrastructure for securitization',
      title: 'Data driving performance.',
      body: 'Unify, standardize, analyze and select receivables with institutional-grade precision — from ingestion to decision.',
      primary: 'Explore the platform',
      secondary: 'Talk to an expert',
      note: 'Built by securitization professionals.',
      cardLabel: 'Portfolio analyzed',
      cardValue: '2.4 M',
      cardUnit: 'rows processed',
      cardStatus: 'Checks completed',
      cardAudit: '100% traceable',
    },
    proof: {
      scale: 'Millions of rows',
      scaleDetail: 'processed with stability',
      audit: 'Line-by-line auditability',
      auditDetail: 'every decision explained',
      neutral: 'Multi-originator',
      neutralDetail: 'one unified data layer',
    },
    intro: {
      eyebrow: 'A new era',
      title: 'Business complexity, finally under control.',
      body: 'Securitization programs should no longer rely on fragmented files, hard-to-maintain scripts or manual controls. Avelys brings the entire processing chain into one robust, readable environment.',
      expertise: '10+ years',
      expertiseLabel: 'of industry expertise',
      decision: 'Every row',
      decisionLabel: 'explained and recorded',
    },
    capabilities: {
      eyebrow: 'The platform',
      title: 'One foundation for every step of your operations.',
      subtitle: 'Technology built to absorb complexity, without passing it on to your teams.',
      aggregation: {
        title: 'Multi-originator aggregation',
        body: 'Automatically import portfolios regardless of their format, volume or source system.',
      },
      standardization: {
        title: 'Intelligent standardization',
        body: 'Harmonize data, detect inconsistencies and enrich fields for outstanding data quality.',
      },
      rules: {
        title: 'Configurable rules engine',
        body: 'Model eligibility criteria, concentration limits, contractual constraints and insurance rules.',
      },
      selection: {
        title: 'Automated selection',
        body: 'Instantly identify receivables that satisfy all your rules, limits and coverage requirements.',
      },
      audit: {
        title: 'Complete auditability',
        body: 'Document every acceptance or rejection with a full, clear and accessible history.',
      },
      exposure: {
        title: 'Consolidated exposure view',
        body: 'Track purchases, exposures, limits, insurance and triggers from one source of truth.',
      },
    },
    process: {
      eyebrow: 'From data to decision',
      title: 'Faster. More reliable. Fully traceable.',
      ingest: {
        number: '01',
        title: 'Connect',
        body: 'Centralize data from every originator in one secure flow.',
      },
      control: {
        number: '02',
        title: 'Control',
        body: 'Standardize, enrich and apply your rules to every receivable.',
      },
      decide: {
        number: '03',
        title: 'Decide',
        body: 'Select eligible assets and deliver a complete audit trail.',
      },
    },
    audiences: {
      eyebrow: 'Built for the entire ecosystem',
      title: 'Shared data. Better aligned decisions.',
      banks: {
        title: 'Banks',
        body: 'Industrialize programs and secure internal processes.',
      },
      servicers: {
        title: 'Servicers',
        body: 'Automate controls and improve investor transparency.',
      },
      funds: {
        title: 'Funds & SPVs',
        body: 'Manage a reliable, audit-proof multi-originator view.',
      },
      fintechs: {
        title: 'Fintechs & corporates',
        body: 'Accelerate the sale and valuation of your receivables.',
      },
    },
    security: {
      label: 'Security & compliance',
      title: 'Trust is non-negotiable.',
      body: 'Every flow, transformation and decision is traced and documented. Avelys applies demanding standards for security, data governance and compliance.',
      traceability: 'Complete traceability',
      governance: 'Data governance',
      access: 'Secure access',
    },
    contact: {
      eyebrow: 'Build what’s next',
      title: 'Ready to modernize your securitization operations?',
      body: 'Let’s talk about your data, your rules and what your teams need.',
      cta: 'Contact us',
    },
    footer: {
      tagline: 'Data driving performance.',
      rights: 'All rights reserved.',
    },
    auth: {
      unavailable: 'The client portal will be available once the identity provider is configured.',
      privateArea: 'Secure client portal',
      welcome: 'Welcome',
      loading: 'Loading your secure profile…',
      profileError: 'Your profile could not be loaded.',
      signOut: 'Sign out',
      completing: 'Completing sign-in…',
      interrupted: 'Sign-in interrupted',
      callbackError: 'We could not complete sign-in. Please return home and try again.',
      home: 'Return home',
    },
  },
} as const

type Locale = keyof typeof messages

const storedLocale = window.localStorage.getItem('avelys-locale')
const initialLocale: Locale = storedLocale === 'fr' || storedLocale === 'en' ? storedLocale : 'fr'

document.documentElement.lang = initialLocale

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'fr',
  messages,
})

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
  window.localStorage.setItem('avelys-locale', locale)
  document.documentElement.lang = locale
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (description) description.content = messages[locale].meta.description
}
