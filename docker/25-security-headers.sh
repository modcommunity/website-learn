#!/bin/sh
# Writes the Content-Security-Policy for the docs pages as two nginx variables,
# $learn_csp_report_only and $learn_csp_enforce, which every location in
# default.conf sends with add_header (an empty value sends no header). Run by
# the nginx image's entrypoint before nginx starts, from the container's .env:
#
#   CSP_MODE        report (default, and any unknown value) | enforce | off
#   CSP_REPORT_URI  optional report-uri
#   PUBLIC_UMAMI_SRC, PUBLIC_PA_SRC, PUBLIC_PA_API
#                   the analytics script/endpoint the pages were built with;
#                   their origins are allowed, so no host is named here.
#
# CSP_CONF_OUT overrides the output path (the test uses it).
set -eu

out="${CSP_CONF_OUT:-/etc/nginx/conf.d/00-security-headers.conf}"
mode="$(printf '%s' "${CSP_MODE:-report}" | tr '[:upper:]' '[:lower:]' | tr -d ' ')"
case "$mode" in
    report | enforce | off) ;;
    *)
        echo "security-headers: unknown CSP_MODE '$mode', using report" >&2
        mode=report
        ;;
esac

# The scheme://host[:port] of an absolute http(s) URL, else nothing (a
# relative URL is already 'self').
origin() {
    printf '%s' "${1:-}" | sed -nE 's#^(https?://[^/?#"]+).*#\1#p'
}

umami="$(origin "${PUBLIC_UMAMI_SRC:-}")"
pa_src="$(origin "${PUBLIC_PA_SRC:-}")"
pa_api="$(origin "${PUBLIC_PA_API:-}")"

# Umami posts to its script's own origin; Plausible to its API origin, which
# defaults to its hosted one when unset (PlausibleAnalytics.astro).
if [ -n "${PUBLIC_PA_SRC:-}" ] && [ -z "$pa_api" ] && [ -z "${PUBLIC_PA_API:-}" ]; then
    pa_api="https://plausible.io"
fi

uniq_words() {
    printf '%s\n' "$@" | awk 'NF && !seen[$0]++' | tr '\n' ' ' | sed 's/ $//'
}

script="$(uniq_words "'self'" "'unsafe-inline'" "$umami" "$pa_src")"
connect="$(uniq_words "'self'" "$umami" "$pa_api")"

policy="default-src 'self'; script-src $script; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self' data:; connect-src $connect; media-src 'self' https:; frame-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"
if [ -n "${CSP_REPORT_URI:-}" ]; then
    policy="$policy; report-uri ${CSP_REPORT_URI}"
fi

case "$policy" in
    *'"'* | *'\'*)
        echo "security-headers: refusing a policy with a quote or backslash" >&2
        exit 1
        ;;
esac

report_only=""
enforce=""
[ "$mode" = report ] && report_only="$policy"
[ "$mode" = enforce ] && enforce="$policy"

cat > "$out" <<CONF
# Written by /docker-entrypoint.d/25-security-headers.sh at container start
# (CSP_MODE=$mode). Do not edit; change .env and restart.
map \$host \$learn_csp_report_only { default "$report_only"; }
map \$host \$learn_csp_enforce { default "$enforce"; }
CONF
echo "security-headers: CSP_MODE=$mode" >&2
