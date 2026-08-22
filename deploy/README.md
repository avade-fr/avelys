# Deploying the landing page

The production Helm values deploy only the Vue/Nginx landing page at `avelys.io`.
The API remains disabled until the customer area is ready.

## Prerequisites

- `avelys.io` DNS points to the Kubernetes ingress entry point.
- The namespace contains a TLS Secret named `avelys-io-tls`, or the ingress annotations
  are configured for your certificate manager.
- Kubernetes can pull from DTR. Add the relevant Secret under `imagePullSecrets` when
  DTR does not provide cluster-wide credentials.

## Build and push

Commit builds use `COMMIT_<8-character-sha>`. When `HEAD` has an exact Git tag, that tag
is used instead. Build and push the current revision with:

```bash
make image-ref
make web-push
```

For a production release, tag the release commit and use the guarded release target:

```bash
git tag 0.1.0
git push origin 0.1.0
make web-release
```

`make web-release` fails unless `HEAD` has an exact Git tag. `make web-push` can also be
used outside a Git checkout by explicitly passing `IMAGE_TAG`, but this should not be used
for normal CI releases:

```bash
make web-push IMAGE_TAG=temporary-test
```

## Direct Helm deployment

This is useful for the first smoke test before handing reconciliation to Argo CD:

```bash
helm upgrade --install avelys deploy/helm/avelys \
  --namespace avelys-prod \
  --create-namespace \
  --values deploy/helm/environments/prod.yaml \
  --set-string web.image.repository="dtr.admin.avade.fr/avelys/web" \
  --set-string web.image.tag="$(git describe --exact-match --tags HEAD)"
```

Check the release:

```bash
kubectl -n avelys-prod rollout status deployment/avelys-web
kubectl -n avelys-prod get ingress,pods,services
curl --fail --show-error https://avelys.io/healthz
```

## Argo CD handoff

Before applying `deploy/argocd/application-prod.yaml`:

1. Replace its `repoURL` with this repository's real Git URL.
2. Put the immutable release tag in `deploy/helm/environments/prod.yaml`.
3. Configure `imagePullSecrets` if required.
4. Commit and push those changes, then create the Argo CD Application.

Argo CD will render the same chart and continuously reconcile the `avelys-prod`
namespace. Do not run direct Helm upgrades after Argo CD takes ownership.
