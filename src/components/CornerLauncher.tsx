import { MessageSquare, Play, Terminal } from 'lucide-react'
import { isLocale, localizeUrl, DEFAULT_LOCALE } from '../i18n/config'
import { getT } from '../i18n/t'
import { mainUrl } from '../lib/site'
import { useSignedIn } from '../lib/auth-hint'

/**
 * The corner launcher: ONE block in the bottom-right corner — the wide PLAY
 * button, with CONSOLE and CHAT as squares beside it.
 *
 * The twin of website-city's `CornerLauncher` (`src/app/_components/lib/
 * corner_launcher.tsx`), and of website-processing's copy of it — a reader who
 * walks from the docs into the app must not find the same control in a different
 * place, or wearing a different coat. Keep the three in step, and keep the
 * stylesheet (`src/styles/components/CornerLauncher.css`, copied from city's) in
 * step with them too.
 *
 * WHAT THIS BLOCK IS A SLICE OF. Over there it is the friends card: who is
 * online, one press to invite them, and this row as its footer. The rows need a
 * session, a tRPC client and a presence poll, none of which a static Astro build
 * has, so what renders here is the FOOTER ALONE — at city's card width, so the
 * three controls land on exactly the same pixels whichever shell served the
 * page. Crossing into the app, the block simply grows upward.
 *
 * EVERY CONTROL IS A LINK, which is the other forced difference. City's chat and
 * console halves are toggles that open a panel in place; here they are addresses
 * — `/messages` and `/console`, the pages those panels are shortcuts to. And
 * because a panel can be opened over a sign-in dialog but a static page cannot,
 * the signed-out state is a link to `/login` rather than city's modal. The cookie
 * hint (`lib/auth-hint`) is all this side knows: a yes/no, no identity, so there
 * is no unread badge and no pressed state either.
 *
 * The two squares are greyed signed-out, exactly as city greys them — the
 * feature must stay visible to the people who have not signed up for it — but
 * they keep an ordinary pointer and a "Sign in" title, because unlike city's
 * disabled-looking button this one really does go somewhere.
 *
 * Play carries its label; the squares do not. A word inside a control that sits
 * over the page on every route at every width is a word that has to be
 * translated, has to fit, and pushes the block wider on exactly the phone
 * screens with the least room for it — and city labels the same one and only
 * one.
 *
 * Hydrated (`client:idle` in `Layout.astro`), which it did not used to be: the
 * signed-in coat is read from the cookie after mount. First paint is the
 * signed-out state on both server and client, so there is nothing for hydration
 * to disagree about. On a docs-subdomain deploy that cookie only arrives if
 * website-city's `AUTH_COOKIE_DOMAIN` is the shared parent — otherwise every
 * reader here reads as signed out and the squares point at `/login`, which is
 * wrong but harmless.
 */
export default function CornerLauncher({ locale = 'en' }: { locale?: string }) {
    const t = getT(locale)
    const loc = isLocale(locale) ? locale : DEFAULT_LOCALE
    const signedIn = useSignedIn()

    /* Every destination belongs to website-city, not to this build — so they go
       through `mainUrl` as well as `localizeUrl`, exactly as every non-docs href
       in the shell does (see `i18n/link.tsx`). On a `/learn`-on-the-main-domain
       deploy `MAIN_URL` is empty and these stay relative; on a docs-subdomain
       deploy they become absolute, or a `/play` here would resolve against the
       docs host and 404. */
    const play = mainUrl(localizeUrl('/play', loc))
    const login = mainUrl(localizeUrl('/login', loc))
    const chat = signedIn ? mainUrl(localizeUrl('/messages', loc)) : login
    const term = signedIn ? mainUrl(localizeUrl('/console', loc)) : login

    /* The squares' shared shape. Signed in, chat is the accent and the console
       is the quiet one beside it — the pairing city uses, and the reason the
       play button is the accent taken DOWN rather than a token of its own. */
    const square =
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition'
    const greyed = `${square} border border-border bg-surface-secondary text-muted hover:text-foreground`

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-end gap-2">
            {/*
             * Rounded and bordered on all four sides: the block FLOATS over the
             * page rather than being docked into it. Flush was tried and
             * reverted over there — `fixed right-0` resolves against the
             * viewport minus a classic scrollbar, leaving an 8px strip of
             * scrollbar track beside the card in the card's own colour.
             */}
            <div className="pointer-events-auto relative flex w-[min(17rem,calc(100vw-2rem))] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-background/95 shadow-xl backdrop-blur">
                <div className="flex items-stretch gap-1.5 p-1.5">
                    <a
                        href={play}
                        /*
                         * Attributes, not a handler. The hydration this
                         * component now does is for the signed-in hrefs alone;
                         * the Umami script reads these off the DOM, so the
                         * clicks cost no listener either way.
                         */
                        data-umami-event="docs_launcher"
                        data-umami-event-half="play"
                        aria-label={t('dock.playAria')}
                        title={t('dock.playAria')}
                        className="corner-launcher-play relative flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-xl text-xs font-semibold text-white transition"
                    >
                        {/*
                         * The sheen: one tinted band crossing the button every
                         * seven seconds and parked off the edge in between. It
                         * replaced an outline that chased the block's perimeter
                         * without ever stopping — see the CSS file for why a
                         * border that never rests is the wrong thing to put over
                         * somebody else's page. `overflow-hidden` on the link
                         * trims the band to the rounded corners; it is wider
                         * than the button on purpose.
                         */}
                        <span aria-hidden className="corner-launcher-sheen" />

                        {/* Filled, so it reads as a play button rather than an
                            outlined arrow at this size. */}
                        <Play className="h-3.5 w-3.5 shrink-0 fill-current" />
                        <span className="truncate">{t('dock.play')}</span>
                    </a>

                    {/*
                     * The console: a square rather than a word on the block. It
                     * is a power tool, and the people who want it will find a
                     * `>_` in the corner faster than they would read a label.
                     */}
                    <a
                        href={term}
                        data-umami-event="docs_launcher"
                        data-umami-event-half="console"
                        aria-label={t('dock.console')}
                        title={signedIn ? t('dock.console') : t('dock.signIn')}
                        className={
                            signedIn
                                ? `${square} border border-border bg-surface-secondary text-muted hover:text-accent`
                                : greyed
                        }
                    >
                        <Terminal className="h-4 w-4" />
                    </a>

                    <a
                        href={chat}
                        data-umami-event="docs_launcher"
                        data-umami-event-half="chat"
                        aria-label={t('dock.chat')}
                        title={signedIn ? t('dock.chat') : t('dock.signIn')}
                        className={
                            signedIn
                                ? `${square} bg-accent text-white hover:brightness-110`
                                : greyed
                        }
                    >
                        <MessageSquare className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </div>
    )
}
