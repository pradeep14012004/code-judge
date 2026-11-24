FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libc6-dev util-linux procps coreutils \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /queue/inbox /queue/processing /queue/outbox /tmp \
    && chmod 0700 /queue /queue/inbox /queue/processing /queue/outbox \
    && chmod 0755 /tmp

WORKDIR /app
COPY worker.js ./worker.js

ENV NODE_ENV=production
CMD ["node", "worker.js"]
