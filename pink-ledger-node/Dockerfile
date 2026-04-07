FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY . .

RUN mkdir -p /app/data \
  && chmod +x /app/scripts/docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=8860
ENV DB_PATH=/app/data/database.sqlite

EXPOSE 8860

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
