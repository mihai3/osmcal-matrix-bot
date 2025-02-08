# modified: mihai3 2025-02-08

FROM node:22 AS builder

WORKDIR /src
COPY . /src

RUN npm ci
RUN npm run build

FROM node:22

ENV NODE_ENV=production
WORKDIR /bot

COPY --from=builder /src/lib /bot/lib
COPY --from=builder /src/package*.json /bot
COPY --from=builder /src/config /bot/config

RUN npm ci

VOLUME /bot/config

CMD ["node", "lib/index.js"]
