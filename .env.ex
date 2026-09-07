# Copy to `.env` (`cp .env.ex .env`) before the first build.
#
# This one file does two jobs, because the deployment lives in the repo root
# and there is no second place for it:
#
#   * docker compose reads it for the host port mapping;
#   * the Dockerfile mounts it at /app/.env for `astro build`, which inlines
#     every PUBLIC_* value into the static output. A built site has no runtime
#     left to read them in, so anything not set here is baked in at its
#     default.
#
# Astro exposes PUBLIC_* to the CLIENT bundle, so nothing below may ever be a
# secret. The one secret this build needs — the GitHub Packages read token —
# lives in secrets/npmrc instead.

# ---- Where the container binds on the host ---------------------------------
# 8002 is website-city and 8003 is website-processing; this site is the third
# on the same domain.
BIND_ADDR=127.0.0.1
BIND_PORT=54242

# The port nginx listens on inside the container.
INTERNAL_PORT=3000

# ---- Build-time site configuration (src/layouts/Layout.astro) --------------
# All optional. The values shown are the defaults the pages fall back to.

# PUBLIC_URL=https://moddingcommunity.com
# PUBLIC_TITLE=The Modding Community Docs
# PUBLIC_TITLE_MAIN=Documentation - The Modding Community
# PUBLIC_DESCRIPTION=
# PUBLIC_FAV_ICON=/favicon.ico
# PUBLIC_SOCIAL_MEDIA_IMAGE=/images/banner.png

# ---- Analytics — both are off unless their script src is set ---------------

# Plausible
# PUBLIC_PA_SRC=https://plausible.example.com/js/script.js
# PUBLIC_PA_DOMAIN=moddingcommunity.com
# PUBLIC_PA_API=https://plausible.example.com/api/event

# Umami
# PUBLIC_UMAMI_SRC=https://umami.example.com/script.js
# PUBLIC_UMAMI_WEBSITE_ID=
