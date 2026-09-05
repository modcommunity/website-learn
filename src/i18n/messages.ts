import { LOCALES, type LocaleT } from './config'
import { shellNav } from './sections/shellNav'
import { shellSidebar } from './sections/shellSidebar'
import { shellFooter } from './sections/shellFooter'
import { notFound } from './sections/notFound'
import { docsUi } from './sections/docsUi'

/**
 * The docs site's message catalogue. `en` is the reference (complete) shape;
 * every other locale is a deep-partial that falls back to English per-key (see
 * ./t.ts), so a half-translated locale still renders — it just shows English for
 * the keys it hasn't filled yet.
 *
 * This block is the SHELL only — the header, the rail, the account button, the
 * theme toggle, the language picker — and it is a verbatim copy of
 * website-processing's, because it is the same shell. The docs' own chrome
 * (tree, search, pager, "on this page") lives in `sections/docsUi.ts` under the
 * `docs` namespace, and the page bodies are not here at all: they are MDX files
 * under `src/content/docs/<locale>/`.
 */
export const en = {
    sidebar: {
        expand: 'Expand sidebar',
        collapse: 'Collapse sidebar',
        // The rail rests collapsed and opens on hover, so its toggle PINS
        // rather than expands — these are the labels the shared <Sidebar/>
        // uses for it then, and city carries the same pair.
        pin: 'Keep sidebar open',
        unpin: 'Unpin sidebar',
    },
    // Labels for the mobile drawer trigger, ported verbatim from website-city's
    // `nav.mobile.*` so both shells announce the menu identically.
    mobile: {
        open: 'Open navigation menu',
        close: 'Close menu',
        title: 'Navigation menu',
    },
    account: {
        signIn: 'Sign In',
        myAccount: 'My Account',
    },
    theme: {
        toLight: 'Switch to light mode',
        toDark: 'Switch to dark mode',
    },
    picker: {
        select: 'Select a language',
        current: 'Language: {name}',
    },
}

export type Messages = typeof en

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

const es: DeepPartial<Messages> = {
    sidebar: {
        expand: 'Expandir barra lateral',
        collapse: 'Contraer barra lateral',
        pin: 'Mantener la barra lateral abierta',
        unpin: 'Desanclar la barra lateral',
    },
    mobile: {
        open: 'Abrir menú de navegación',
        close: 'Cerrar menú',
        title: 'Menú de navegación',
    },
    account: { signIn: 'Iniciar sesión', myAccount: 'Mi cuenta' },
    theme: {
        toLight: 'Cambiar al modo claro',
        toDark: 'Cambiar al modo oscuro',
    },
    picker: { select: 'Selecciona un idioma', current: 'Idioma: {name}' },
}

const fr: DeepPartial<Messages> = {
    sidebar: {
        expand: 'Déplier la barre latérale',
        collapse: 'Replier la barre latérale',
        pin: 'Garder la barre latérale ouverte',
        unpin: 'Détacher la barre latérale',
    },
    mobile: {
        open: 'Ouvrir le menu de navigation',
        close: 'Fermer le menu',
        title: 'Menu de navigation',
    },
    account: { signIn: 'Se connecter', myAccount: 'Mon compte' },
    theme: {
        toLight: 'Passer au mode clair',
        toDark: 'Passer au mode sombre',
    },
    picker: {
        select: 'Sélectionner une langue',
        current: 'Langue : {name}',
    },
}

const de: DeepPartial<Messages> = {
    sidebar: {
        expand: 'Seitenleiste ausklappen',
        collapse: 'Seitenleiste einklappen',
        pin: 'Seitenleiste offen halten',
        unpin: 'Seitenleiste lösen',
    },
    mobile: {
        open: 'Navigationsmenü öffnen',
        close: 'Menü schließen',
        title: 'Navigationsmenü',
    },
    account: { signIn: 'Anmelden', myAccount: 'Mein Konto' },
    theme: {
        toLight: 'Zu hellem Modus wechseln',
        toDark: 'Zu dunklem Modus wechseln',
    },
    picker: {
        select: 'Sprache auswählen',
        current: 'Sprache: {name}',
    },
}

const ru: DeepPartial<Messages> = {
    sidebar: {
        expand: 'Развернуть боковую панель',
        collapse: 'Свернуть боковую панель',
        pin: 'Закрепить боковую панель',
        unpin: 'Открепить боковую панель',
    },
    mobile: {
        open: 'Открыть меню навигации',
        close: 'Закрыть меню',
        title: 'Меню навигации',
    },
    account: { signIn: 'Войти', myAccount: 'Мой аккаунт' },
    theme: {
        toLight: 'Переключить на светлую тему',
        toDark: 'Переключить на тёмную тему',
    },
    picker: { select: 'Выберите язык', current: 'Язык: {name}' },
}

const nl: DeepPartial<Messages> = {
    sidebar: {
        expand: 'Zijbalk uitklappen',
        collapse: 'Zijbalk inklappen',
        pin: 'Zijbalk open houden',
        unpin: 'Zijbalk losmaken',
    },
    mobile: {
        open: 'Navigatiemenu openen',
        close: 'Menu sluiten',
        title: 'Navigatiemenu',
    },
    account: { signIn: 'Inloggen', myAccount: 'Mijn account' },
    theme: {
        toLight: 'Overschakelen naar lichte modus',
        toDark: 'Overschakelen naar donkere modus',
    },
    picker: { select: 'Kies een taal', current: 'Taal: {name}' },
}

const ja: DeepPartial<Messages> = {
    sidebar: {
        expand: 'サイドバーを開く',
        collapse: 'サイドバーを閉じる',
        pin: 'サイドバーを開いたままにする',
        unpin: 'サイドバーの固定を解除',
    },
    mobile: {
        open: 'ナビゲーションメニューを開く',
        close: 'メニューを閉じる',
        title: 'ナビゲーションメニュー',
    },
    account: { signIn: 'ログイン', myAccount: 'マイアカウント' },
    theme: {
        toLight: 'ライトモードに切り替え',
        toDark: 'ダークモードに切り替え',
    },
    picker: { select: '言語を選択', current: '言語: {name}' },
}

const zh: DeepPartial<Messages> = {
    sidebar: {
        expand: '展开侧边栏',
        collapse: '收起侧边栏',
        pin: '保持侧边栏展开',
        unpin: '取消固定侧边栏',
    },
    mobile: {
        open: '打开导航菜单',
        close: '关闭菜单',
        title: '导航菜单',
    },
    account: { signIn: '登录', myAccount: '我的账户' },
    theme: {
        toLight: '切换到浅色模式',
        toDark: '切换到深色模式',
    },
    picker: { select: '选择语言', current: '语言：{name}' },
}

const pt: DeepPartial<Messages> = {
    sidebar: {
        expand: 'Expandir barra lateral',
        collapse: 'Recolher barra lateral',
        pin: 'Manter a barra lateral aberta',
        unpin: 'Desafixar a barra lateral',
    },
    mobile: {
        open: 'Abrir menu de navegação',
        close: 'Fechar menu',
        title: 'Menu de navegação',
    },
    account: { signIn: 'Entrar', myAccount: 'Minha conta' },
    theme: {
        toLight: 'Mudar para o modo claro',
        toDark: 'Mudar para o modo escuro',
    },
    picker: { select: 'Selecione um idioma', current: 'Idioma: {name}' },
}

const SHELL: Record<LocaleT, DeepPartial<Messages>> = {
    en,
    es,
    fr,
    de,
    ru,
    nl,
    ja,
    zh,
    pt,
}

// Filled by iterating LOCALES, so every key is present. Built with a typed
// accumulator rather than Object.fromEntries, whose `{ [k: string]: … }` return
// type can't be cast to a Record with required locale keys.
const BY_LOCALE = {} as Record<LocaleT, Record<string, unknown>>

for (const loc of LOCALES) {
    BY_LOCALE[loc] = {
        ...SHELL[loc],
        // Header nav labels/descriptions, shared verbatim with website-city.
        nav: shellNav[loc],
        /*
         * Primary-sidebar labels, likewise ported from city. Its own namespace
         * rather than a merge into the shell strings above: the rail needs ~35
         * strings, most of which (Overview, My Mods, Live now, …) mean nothing
         * outside it, and keeping them together is what makes "does this match
         * city's SIDEBAR_SECTIONS?" answerable by reading one file.
         */
        rail: shellSidebar[loc],
        /*
         * Footer slogan, copyright, headings and link labels, ported from
         * city's `locales/<lang>/footer.json`. Its own namespace for the same
         * reason as `rail`: it mirrors ONE of city's catalogues one-to-one, so
         * "does this match city's footer?" is a single-file diff. The labels
         * used to be spread through a generic `common.*` block that no other
         * surface read, which is how the two footers drifted apart.
         */
        footer: shellFooter[loc],
        /*
         * The 404 copy. Also its own namespace because 404.astro ships the
         * whole catalogue to the browser and picks a locale at runtime — the
         * static build cannot know which language an unmatched URL was meant
         * to be.
         */
        notFound: notFound[loc],
        /*
         * The documentation shell's own strings. Its own namespace, like the
         * three above — but unlike them it mirrors nothing in website-city,
         * because the docs chrome is a surface only this site has.
         */
        docs: docsUi[loc],
    }
}

/** Every locale's shell strings plus the docs chrome. */
export const MESSAGES: Record<LocaleT, Record<string, unknown>> = BY_LOCALE
