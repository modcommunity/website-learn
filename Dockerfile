# syntax=docker/dockerfile:1

# The port nginx listens on inside the container. Declared here only so EXPOSE
# can document it; the running container reads the same value from the
# environment (see the template note in the runtime stage).
ARG INTERNAL_PORT=8005

FROM node:lts AS build
WORKDIR /app

# .npmrc carries the @modcommunity -> GitHub Packages scope mapping. The token
# that authenticates against it is NOT in it: @modcommunity/shared is a private
# package, so the install needs a read:packages token, and it arrives as a
# BuildKit secret mounted at /root/.npmrc for this layer only — never written
# into an image layer. docker-compose.yml supplies it from ./secrets/npmrc; for
# a bare build pass `--secret id=npmrc,src=./secrets/npmrc`.
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc,required=true npm ci

COPY . .

# `astro build` inlines every PUBLIC_* value the pages read — the canonical
# origin, the page metadata, the analytics script sources — into the static
# output. There is no runtime left afterwards to read them in, so .env belongs
# to THIS step and not to the nginx container. It is mounted rather than copied
# for the same reason as the npmrc: nothing in the context, nothing in a layer.
#
# required=false because every one of those values has a default, so a build
# with no .env at all is exactly the production build.
RUN --mount=type=secret,id=env,target=/app/.env npm run build

FROM nginx:alpine AS runtime
ARG INTERNAL_PORT

# nginx's own entrypoint envsubsts everything under templates/ into conf.d/ at
# startup. Going through a template rather than a finished config gives
# INTERNAL_PORT one source of truth (.env) instead of a hard-coded `listen`
# that has to be kept in step with the compose port mapping by hand.
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template

# The image ships a web root with its own index.html (the "Welcome to nginx!"
# page) and 50x.html in it, and COPY MERGES into a directory rather than
# replacing it. Nothing in dist/ is named index.html at the top level — every
# page on this site lives under /learn or /{lang}/learn — so the stock welcome
# page survives the copy and is what `curl http://host:port/` answers with.
RUN rm -rf /usr/share/nginx/html/*

# Astro's directory output, so `learn/api/content/index.html` and friends. The
# tree is served from its root: requests arrive already carrying /learn or
# /{lang}/learn, which is the shape the files are in.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE ${INTERNAL_PORT}
