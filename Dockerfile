# syntax=docker/dockerfile:1@sha256:93bfd3b68c109427185cd78b4779fc82b484b0b7618e36d0f104d4d801e66d25
ARG REGISTRY_URL="docker.io/library"
ARG NODE_IMAGE_VERSION=22

# 1. Transpile the project
FROM ${REGISTRY_URL}/node:${NODE_IMAGE_VERSION}-alpine as build

WORKDIR /app

# https://github.com/nodejs/corepack/issues/612
RUN npm install -g corepack@latest
RUN corepack enable

COPY ./ /app/

RUN pnpm i --frozen-lockfile
RUN node --run build

# 2. Run the NodeJS backend
FROM ${REGISTRY_URL}/node:${NODE_IMAGE_VERSION}-alpine as final

# https://github.com/nodejs/corepack/issues/612
RUN npm install -g corepack@latest
RUN corepack enable

# Sets to production, it also sets the install script to install deps only
ENV NODE_ENV production

WORKDIR /app

# In the container, listen to outside localhost by default
ENV OUCA_SERVER_HOST 0.0.0.0

COPY .npmrc ./

COPY /migrations/ migrations/

COPY package.json pnpm-*.yaml ./

RUN pnpm i --frozen-lockfile

COPY --from=build /app/dist/ dist/

WORKDIR /app/dist

ARG GIT_SHA
ENV SENTRY_RELEASE ${GIT_SHA}

ENTRYPOINT ["node", "--import", "@sentry/node/preload", "main.js"]

EXPOSE 4000/tcp
