# Web implementation notes

This document records the product and implementation decisions behind the Avelys public
landing page as of release `v1.0.2`.

## Product position

Avelys is presented as the data infrastructure for securitization. The landing page
focuses on multi-originator aggregation, data standardization, configurable rules,
automatic receivables selection, line-by-line auditability, consolidated exposures, and
institutional-grade security and governance.

The source product brief remains in [platform-presentation.md](platform-presentation.md).

## Brand system

The site uses the following approved palette:

- Dark petrol blue: `#02466B`
- Blue-green: `#01738B`
- Deep turquoise: `#017E82`
- Very light mint: `#DFF4EF`
- Strong blue: `#025299`
- Midnight blue: `#002053`

Source brand images live under `docs/web/images`. Runtime copies consumed by Vite live
under `apps/web/public`:

- `avelys.io-logo.png`: complete header/footer wordmark
- `header-background.webp`: compressed landing-page hero image
- `favicon.png`: 64 px transparent browser icon derived from the Avelys “A” mark
- `apple-touch-icon.png`: 180 px high-resolution touch icon

The runtime wordmark is a 543 px transparent PNG, which provides more than 3x density at
its largest rendered size. If official vector marks become available, replace the
wordmark and favicon assets with SVG sources while preserving the raster Apple touch icon.

## Layout decisions

- Main editorial content uses a maximum width of 1240 px.
- On wide desktop screens, the toolbar spans the viewport with 32 px edge padding.
- The logo is anchored to the left edge area.
- The first navigation item aligns with the 1240 px content grid when space permits; a
  minimum 32 px gap after the logo prevents overlap on narrower desktop widths.
- The FR/EN selector remains pinned to the toolbar's right edge.
- The mobile breakpoint is 760 px and uses a compact menu; desktop-only decorative
  experiments must not be carried into mobile without an explicit design decision.
- Motion is limited to subtle content reveals and the security illustration, and honors
  `prefers-reduced-motion`.

## Localization

Public and authenticated UI strings use `vue-i18n`. French is the default locale, with
English available through the toolbar selector. The selected locale is persisted in
`localStorage` under `avelys-locale`, and the document language and translated meta
description are updated with the selection.

Translations are centralized in `apps/web/src/i18n.ts`. New public-facing text must be
added in both `fr` and `en`; avoid hard-coded strings in Vue templates.

## Page structure and contact

The landing page is organized around stable anchors used by the toolbar:

- `#platform`
- `#capabilities`
- `#audiences`
- `#contact`

Contact calls to action currently use `mailto:contact@avelys.io`. Authentication remains
conditional on the runtime OIDC configuration.

## Local development

The supported hot-reload workflow is:

```bash
make dev
```

- Vite website: <http://localhost:5173>
- API: <http://localhost:8000>
- API documentation: <http://localhost:8000/api/docs>

Use `make local` for the production-like Nginx build at <http://localhost:8080>.

## Validation and release

Before a release, validate the exact rebuilt sources:

```bash
docker compose run --rm --build web-test
docker compose run --rm web-test pnpm --filter @avelys/web lint
make test
make helm-check
```

Releases use immutable Git and container tags. Bump the web package, Helm chart,
`appVersion`, and both environment image tags together. Create the release commit and
annotated tag, push the image to DTR first, then atomically push `master` and the Git tag.
This prevents Argo CD from reconciling an image tag that does not exist yet.

Release `v1.0.2` is represented by:

- Git commit: `5a9a0c2`
- Image: `dtr.admin.avade.fr/avelys/web:v1.0.2`
- Image digest: `sha256:4388bedb64d7b4be2b388d78fe5620c8a42c4be88989e97b31f423df0d0a9602`
- Dev and production Helm values pinned to `v1.0.2`
