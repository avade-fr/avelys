FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --filter @avelys/web... --frozen-lockfile=false

COPY apps/web apps/web

ARG VITE_API_BASE_URL=/v1
ARG VITE_OIDC_AUTHORITY
ARG VITE_OIDC_CLIENT_ID=avelys-web
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_OIDC_AUTHORITY=$VITE_OIDC_AUTHORITY \
    VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID
RUN pnpm --filter @avelys/web build

FROM build AS test
CMD ["pnpm", "--filter", "@avelys/web", "typecheck"]

FROM nginx:1.29-alpine
ARG VERSION=development
ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="Avelys web" \
      org.opencontainers.image.description="Avelys landing page" \
      org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$VCS_REF
COPY apps/web/nginx-main.conf /etc/nginx/nginx.conf
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html
RUN nginx -t
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
