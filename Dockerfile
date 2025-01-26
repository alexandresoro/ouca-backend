# syntax=docker/dockerfile:1@sha256:93bfd3b68c109427185cd78b4779fc82b484b0b7618e36d0f104d4d801e66d25
ARG REGISTRY_URL="docker.io"
ARG BUN_IMAGE_VERSION=1.2

FROM ${REGISTRY_URL}/oven/bun:${BUN_IMAGE_VERSION}-alpine

WORKDIR /app

COPY bunfig.toml ./

COPY /migrations/ migrations/

COPY package.json bun.lock tsconfig.json ./

RUN bun install --production --frozen-lockfile

COPY src/ src/

ARG GIT_SHA
ENV SENTRY_RELEASE ${GIT_SHA}

ENTRYPOINT ["bun", "src/main.ts"]

EXPOSE 4000/tcp
