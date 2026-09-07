# Copy this file to `npmrc` (same directory) and fill in a GitHub token.
#
#   cp secrets/npmrc.ex secrets/npmrc
#   # then edit secrets/npmrc and replace the token below
#
# The token needs only the `read:packages` scope. A fine-grained or classic
# Personal Access Token works, as does a GITHUB_TOKEN inside GitHub Actions.
#
# docker compose mounts this file at /root/.npmrc during `npm ci` so the build
# can pull the private @modcommunity/shared package from GitHub Packages. It is
# never written into an image layer (BuildKit secret mount), and the real file
# is git- and docker-ignored.

@modcommunity:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_REPLACE_WITH_TOKEN_WITH_read:packages
