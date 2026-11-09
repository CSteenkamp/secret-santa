# Next.js standalone build. The runtime image carries the traced server, static
# assets, the Prisma schema + migrations and the Prisma CLI, so the Kubernetes
# init container can run `prisma migrate deploy` with the same image.
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS build
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# prisma.config.ts requires DATABASE_URL to load; the value is not used at build time
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# A self-contained Prisma CLI (with its transitive deps) for `migrate deploy`,
# pinned to the versions in package-lock.json.
FROM node:22-alpine AS prisma-cli
WORKDIR /prisma
COPY package.json package-lock.json ./
RUN node -e "const l=require('./package-lock.json').packages;const v=n=>l['node_modules/'+n].version;require('fs').writeFileSync('cli.json',JSON.stringify({name:'prisma-cli',private:true,dependencies:{prisma:v('prisma'),'@prisma/client':v('@prisma/client'),dotenv:v('dotenv')}}))" \
 && mv cli.json package.json && rm package-lock.json \
 && npm install --omit=dev --no-audit --no-fund

FROM node:22-alpine AS runtime
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Prisma: schema, migrations, config, generated client, and the CLI (merged into
# the traced node_modules) so the init container can run `migrate deploy`.
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/prisma.config.ts ./prisma.config.ts
COPY --from=build --chown=node:node /app/app/generated ./app/generated
COPY --from=prisma-cli --chown=node:node /prisma/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "server.js"]
