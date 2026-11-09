# Secrets (created out of band, never committed)

All live in namespace `secretsanta`.

| Secret | Keys | Purpose |
|---|---|---|
| `secretsanta-db` | `username`, `password` (type `kubernetes.io/basic-auth`) | CNPG bootstrap + managed role password |
| `secretsanta-secrets` | `DATABASE_URL`, `MAGIC_LINK_SECRET`, `SESSION_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | App runtime secrets |
| `secretsanta-cloudflared-credentials` | `credentials.json` | Tunnel `secretsanta-shell-primary` (7aeae5e3-716b-4f3e-b245-c44e4bdfe3e4) |
| `ghcr-pull` | `.dockerconfigjson` | Pull `ghcr.io/csteenkamp/secretsanta-web` |

```bash
export KUBECONFIG=~/talos-install/cluster/kubeconfig-tailscale
kubectl apply -f deploy/k8s/base/namespace.yaml
PW=$(openssl rand -hex 24)
kubectl -n secretsanta create secret generic secretsanta-db --type=kubernetes.io/basic-auth \
  --from-literal=username=secretsanta --from-literal=password="$PW"
kubectl -n secretsanta create secret generic secretsanta-secrets \
  --from-literal=DATABASE_URL="postgresql://secretsanta:$PW@secretsanta-pg-rw:5432/secretsanta?schema=public&sslmode=require" \
  --from-literal=MAGIC_LINK_SECRET="$(openssl rand -hex 32)" \
  --from-literal=SESSION_SECRET="$(openssl rand -hex 32)" \
  --from-literal=EMAIL_USER= --from-literal=EMAIL_PASS= \
  --from-literal=STRIPE_SECRET_KEY= --from-literal=STRIPE_WEBHOOK_SECRET=
kubectl -n secretsanta create secret generic secretsanta-cloudflared-credentials \
  --from-file=credentials.json=$HOME/.cloudflared/7aeae5e3-716b-4f3e-b245-c44e4bdfe3e4.json
kubectl get secret ghcr-pull -n kostas -o json \
  | jq 'del(.metadata.namespace,.metadata.uid,.metadata.resourceVersion,.metadata.creationTimestamp,.metadata.annotations,.metadata.labels,.metadata.ownerReferences)' \
  | kubectl apply -n secretsanta -f -
```

## Stripe

The Unlimited upgrade is sold through the **Realtap** Stripe account (`acct_1UXE6DBkC5aYbBTB`):
product `prod_Vb39FSX0YSVCNB`, price `price_1UZr3KBkC5aYbBTBKa5lNMkK` ($10 one-time).
Webhook destination `secret-santa` → `https://secretsanta.wagnerway.co.za/api/stripe/webhook`,
events `checkout.session.completed`, `checkout.session.async_payment_succeeded`.

```bash
kubectl -n secretsanta patch secret secretsanta-secrets --type merge -p \
  '{"stringData":{"STRIPE_SECRET_KEY":"rk_live_…","STRIPE_WEBHOOK_SECRET":"whsec_…"}}'
kubectl -n secretsanta rollout restart deploy/secretsanta-web
```

The app also confirms payments itself when Stripe redirects back to the dashboard, so the
webhook is a safety net rather than a requirement.
