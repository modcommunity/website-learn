import { MessageSquare, Play } from 'lucide-react'
import { isLocale, localizeUrl, DEFAULT_LOCALE } from '../i18n/config'
import { getT } from '../i18n/t'
import { mainUrl } from '../lib/site'

/**
 * The corner launcher: ONE block in the bottom-right corner, split down the
 * middle into PLAY (left) and CHAT (right).
 *
 * The twin of website-city's `CornerLauncher` (`src/app/_components/lib/
 * corner_launcher.tsx`), and of website-processing's copy of it — a reader who
 * walks from the docs into the app must not find the same control in a different
 * place, or wearing a different coat. Keep the three in step, and keep the
 * stylesheet (`src/styles/components/CornerLauncher.css`, copied from city's) in
 * step with it too.
 *
 * ONE DIFFERENCE, and it is forced: city's chat half is a BUTTON that opens the
 * chat panel in place, which needs a session, a tRPC client and a socket. This
 * is a static Astro build with none of the three, so here the chat half is a
 * plain link to `/messages` — the page city's panel is a shortcut to. Same
 * corner, same colour, same glyph; it just takes you to the conversation instead
 * of bringing the conversation to you. For the same reason there is no unread
 * badge and no signed-out state: nothing here knows either.
 *
 * Both halves are icon-only squares. The label lives in `aria-label`/`title`
 * rather than beside the glyph: this sits over the page on every route, at every
 * width, and a word inside it is a word that has to be translated, has to fit,
 * and pushes the block wider on exactly the phone screens with the least room
 * for it.
 *
 * Rendered WITHOUT a `client:*` directive — it is two links and a CSS
 * animation, so it ships as static HTML and no JavaScript at all.
 */
export default function CornerLauncher({ locale = 'en' }: { locale?: string }) {
    const t = getT(locale)
    const loc = isLocale(locale) ? locale : DEFAULT_LOCALE

    /* Both destinations belong to website-city, not to this build — so they go
       through `mainUrl` as well as `localizeUrl`, exactly as every non-docs href
       in the shell does (see `i18n/link.tsx`). On a `/learn`-on-the-main-domain
       deploy `MAIN_URL` is empty and these stay relative; on a docs-subdomain
       deploy they become absolute, or a `/play` here would resolve against the
       docs host and 404. */
    const play = mainUrl(localizeUrl('/play', loc))
    const chat = mainUrl(localizeUrl('/messages', loc))

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-end">
            <div className="pointer-events-auto relative shrink-0 rounded-xl shadow-lg">
                <div className="flex items-stretch">
                    <a
                        href={play}
                        /*
                         * Attributes, not a handler. This component renders
                         * WITHOUT a `client:*` directive — it is two links and
                         * a CSS animation, and it ships as static HTML with no
                         * JavaScript at all. A click handler would hydrate it
                         * on every page of the site to record two clicks; the
                         * Umami script already reads these off the DOM.
                         */
                        data-umami-event="docs_launcher"
                        data-umami-event-half="play"
                        aria-label={t('dock.play')}
                        title={t('dock.play')}
                        className="corner-launcher-play flex h-10 w-10 items-center justify-center rounded-l-xl text-white transition"
                    >
                        {/* Filled, so it reads as a play button rather than an
                            outlined arrow at this size. */}
                        <Play className="h-4 w-4 fill-current" />
                    </a>

                    <a
                        href={chat}
                        data-umami-event="docs_launcher"
                        data-umami-event-half="chat"
                        aria-label={t('dock.chat')}
                        title={t('dock.chat')}
                        className="flex h-10 w-10 items-center justify-center rounded-r-xl border-l border-white/15 bg-accent text-white transition hover:brightness-110"
                    >
                        <MessageSquare className="h-4 w-4" />
                    </a>
                </div>

                {/*
                 * The outline, over the block rather than behind it: a static
                 * track and three dashed laps at different patterns and periods,
                 * which is what keeps the movement from reading as a loop — see
                 * the CSS file. `pathLength` normalises the perimeter to 100
                 * units, so one set of dash numbers fits any width the block
                 * takes.
                 */}
                <svg className="corner-launcher-ring" aria-hidden="true">
                    <rect
                        className="corner-launcher-track"
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        rx="12"
                    />
                    {/* Grouped so the bloom is one filter pass over the three
                        laps, and so it never reaches the track underneath. */}
                    <g className="corner-launcher-glow">
                        {(['a', 'b', 'c'] as const).map((lap) => (
                            <rect
                                key={lap}
                                className={`corner-launcher-chase corner-launcher-chase-${lap}`}
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                rx="12"
                                pathLength="100"
                            />
                        ))}
                    </g>
                </svg>
            </div>
        </div>
    )
}
