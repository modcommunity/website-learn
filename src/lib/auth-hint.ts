import { useEffect, useState } from 'react'

/**
 * The non-HttpOnly `tmc_auth` hint cookie that website-city's middleware keeps
 * in sync with the (HttpOnly, unreadable) auth session. Both apps are served
 * from the same domain, so it is directly readable here.
 *
 * It carries no identity — just a yes/no. That is all this site needs: which
 * account button to show, and whether the signed-in-only nav leaves ("My Mods",
 * "Messages", …) belong in the rail and the header dropdowns.
 */
export function isSignedIn(): boolean {
    if (typeof document === 'undefined') return false

    return document.cookie.split('; ').some((c) => {
        const [name, value] = c.split('=')

        return name === 'tmc_auth' && value === '1'
    })
}

/**
 * {@link isSignedIn} as a hook, with the hydration dance every consumer needs:
 * SSR and first paint render the signed-out state deterministically, then it
 * reconciles to the real state after mount. Reading the cookie during render
 * would make the server and client markup disagree.
 */
export function useSignedIn(): boolean {
    const [signedIn, setSignedIn] = useState(false)

    useEffect(() => setSignedIn(isSignedIn()), [])

    return signedIn
}
