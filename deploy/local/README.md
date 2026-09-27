# Local Avelys HTTPS proxy

The Avelys VM runs Debian's nginx package. The configuration in
`avelys.nginx.conf` serves only `10.50.30.148:443` for `avelys.internal`.
It terminates TLS, proxies the website to `127.0.0.1:5173`, and proxies
`/v1/` to `127.0.0.1:8000`. The default nginx port-80 site is disabled.
This proxy does not start the development web or API processes; use the
existing VS Code **Full Stack - avelys.internal** launch configuration.

The VM holds only the Avelys leaf certificate and key at
`/etc/nginx/tls/avelys.crt` (0644) and `avelys.key` (0600), both root-owned.
The CA signing key stays on the host under `~/.local/share/local-ca/root/`.
Neither key belongs in Git. The leaf was issued for `avelys.internal` by
the Devman Local Root CA, which is distinct from OKD's router CA. Import
the public `~/.local/share/local-ca/root/root.crt` into the intended Firefox
profile's **Authorities** and trust it for websites.

The local Keycloak client must allow the browser origin
`https://avelys.internal` and redirect URI
`https://avelys.internal/oauth2-redirect`. The VS Code web launch sets
`VITE_API_BASE_URL=/v1` and HMR client port 443 so requests stay on HTTPS.

After renewing the leaf on the host, copy only its new `tls.crt` and
`tls.key` securely to the VM, install them root-owned at the paths above,
run `sudo nginx -t`, reload nginx, and verify the live certificate against
the public root CA. The Debian package receives security updates through
the normal Debian stable/security repositories; no vendor repository or
downloaded host-side code is used.

To stop the proxy without disturbing the application processes:
`sudo systemctl disable --now nginx`. The pre-change VS Code launch file
is retained on the VM at
`~/.local/share/avelys-proxy-backup/launch.json` for rollback.
