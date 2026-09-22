import { Logo, type LinkComponent } from '@modcommunity/shared'

/*
 * The artwork as a FILE rather than the package's data URI default.
 *
 * `@modcommunity/shared` carries the mark two ways: `LOGO_SRC`, a base64 data
 * URI that needs no asset pipeline, and the `./logo01.webp` export subpath,
 * which hands Vite a real file to hash and emit. The data URI is the wrong one
 * for a server-rendered site: it is ~14 kB of base64 in the island's JS *and*
 * inlined again into the HTML at each of the three places the shell draws the
 * mark, on every page. The file is one request the browser caches forever.
 *
 * website-city passes the same two assets to the same <Logo> (its own
 * bundler's URLs), so all three sites draw one piece of artwork and a new logo
 * in tmc-global reaches every surface with a version bump.
 */
import lockup from '@modcommunity/shared/logo01.webp'
import mark from '@modcommunity/shared/logo01-mark.webp'

/**
 * The brand mark for this site's shell.
 *
 * `linkComponent` is the caller's, not a default: the shared <Header> and
 * <Footer> hand their own locale-aware link to the logo they build, so a mark
 * passed in as a slot has to be given the same one or it is the single link in
 * the chrome that drops the reader back into English.
 */
export default function BrandLogo({
    linkComponent,
    href = '/',
    compact = false,
}: {
    linkComponent?: LinkComponent
    href?: string
    compact?: boolean
}) {
    return (
        <Logo
            src={lockup}
            markSrc={mark}
            href={href}
            compact={compact}
            linkComponent={linkComponent}
        />
    )
}
