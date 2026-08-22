DTR_REGISTRY ?= dtr.admin.avade.fr
IMAGE_NAMESPACE ?= avelys
WEB_IMAGE ?= $(DTR_REGISTRY)/$(IMAGE_NAMESPACE)/web

GIT_SHA := $(shell git rev-parse --short=8 HEAD 2>/dev/null)
GIT_TAG := $(shell git describe --exact-match --tags HEAD 2>/dev/null)
DEFAULT_IMAGE_TAG := $(if $(GIT_TAG),$(GIT_TAG),$(if $(GIT_SHA),COMMIT_$(GIT_SHA),))
IMAGE_TAG ?= $(DEFAULT_IMAGE_TAG)

.PHONY: dev build test lint helm-check check-image-tag check-release-tag web-image web-push web-release image-ref

dev:
	docker compose up --build

build:
	docker compose build

check-image-tag:
	@test -n "$(IMAGE_TAG)" || (echo "No Git revision found. Commit the project or pass IMAGE_TAG=<tag>." >&2; exit 1)
	@printf '%s\n' "$(IMAGE_TAG)" | grep -Eq '^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$$' || (echo "Invalid Docker tag: $(IMAGE_TAG)" >&2; exit 1)

check-release-tag:
	@test -n "$(GIT_TAG)" || (echo "HEAD must have an exact Git tag for a production release." >&2; exit 1)

image-ref: check-image-tag
	@echo "$(WEB_IMAGE):$(IMAGE_TAG)"

web-image: check-image-tag
	docker build \
		--build-arg VCS_REF="$(GIT_SHA)" \
		--build-arg VERSION="$(IMAGE_TAG)" \
		--file apps/web/Dockerfile \
		--tag "$(WEB_IMAGE):$(IMAGE_TAG)" \
		.

web-push: web-image
	docker push "$(WEB_IMAGE):$(IMAGE_TAG)"

web-release: check-release-tag
	$(MAKE) web-push IMAGE_TAG="$(GIT_TAG)"

test:
	docker compose run --rm api-test
	docker compose run --rm web-test

lint:
	docker compose run --rm api-test ruff check app tests
	docker compose run --rm web-test pnpm --filter @avelys/web lint

helm-check:
	helm lint deploy/helm/avelys -f deploy/helm/environments/dev.yaml
	helm lint deploy/helm/avelys -f deploy/helm/environments/prod.yaml
	helm template avelys deploy/helm/avelys -f deploy/helm/environments/prod.yaml >/dev/null
