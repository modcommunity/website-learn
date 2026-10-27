import type { LocaleT } from '../config'

/**
 * The app switcher's strings (the sidebar footer's "Find your game" menu),
 * ported from website-city's `locales/<lang>/nav.json` (`appSwitcher.*`) and
 * `app.json` (`contentType.<type>.plural`), so the switcher reads the same in
 * all nine languages. `loading` has no counterpart in city, which renders
 * nothing while its list loads.
 */
export type AppSwitcherStrings = {
    find: string
    open: string
    hint: string
    search: string
    none: string
    visit: string
    loading: string
    contentTypes: Record<string, string>
}

export const appSwitcher: Record<LocaleT, AppSwitcherStrings> = {
    en: {
        find: 'Find your game',
        open: 'Open the app menu',
        hint: 'Games, mods and servers',
        search: 'Search games…',
        none: 'No games match.',
        visit: 'Open game page',
        loading: 'Loading games…',
        contentTypes: {
            mod: 'Mods',
            server: 'Servers',
            asset: 'Assets',
            article: 'Articles',
            community: 'Communities',
            collection: 'Collections',
            group: 'Groups',
        },
    },
    es: {
        find: 'Encuentre su juego',
        open: 'Abrir el menú de la aplicación',
        hint: 'Juegos, mods y servidores',
        search: 'Buscar juegos…',
        none: 'Ningún juego coincide.',
        visit: 'Abrir la página del juego',
        loading: 'Cargando juegos…',
        contentTypes: {
            mod: 'Mods',
            server: 'Servidores',
            asset: 'Recursos',
            article: 'Artículos',
            community: 'Comunidades',
            collection: 'Colecciones',
            group: 'Grupos',
        },
    },
    fr: {
        find: 'Trouvez votre jeu',
        open: 'Ouvrir le menu de l\'application',
        hint: 'Jeux, mods et serveurs',
        search: 'Rechercher des jeux…',
        none: 'Aucun jeu ne correspond.',
        visit: 'Ouvrir la page du jeu',
        loading: 'Chargement des jeux…',
        contentTypes: {
            mod: 'Mods',
            server: 'Serveurs',
            asset: 'Ressources',
            article: 'Articles',
            community: 'Communautés',
            collection: 'Collections',
            group: 'Groupes',
        },
    },
    de: {
        find: 'Ihr Spiel finden',
        open: 'App-Menü öffnen',
        hint: 'Spiele, Mods und Server',
        search: 'Spiele suchen …',
        none: 'Keine passenden Spiele.',
        visit: 'Spielseite öffnen',
        loading: 'Spiele werden geladen …',
        contentTypes: {
            mod: 'Mods',
            server: 'Server',
            asset: 'Assets',
            article: 'Artikel',
            community: 'Communitys',
            collection: 'Sammlungen',
            group: 'Gruppen',
        },
    },
    ru: {
        find: 'Найдите свою игру',
        open: 'Открыть меню приложения',
        hint: 'Игры, моды и серверы',
        search: 'Поиск игр…',
        none: 'Подходящих игр нет.',
        visit: 'Открыть страницу игры',
        loading: 'Загрузка игр…',
        contentTypes: {
            mod: 'Моды',
            server: 'Серверы',
            asset: 'Ассеты',
            article: 'Статьи',
            community: 'Сообщества',
            collection: 'Коллекции',
            group: 'Группы',
        },
    },
    nl: {
        find: 'Vind uw game',
        open: 'Appmenu openen',
        hint: 'Games, mods en servers',
        search: 'Games zoeken…',
        none: 'Geen games gevonden.',
        visit: 'Gamepagina openen',
        loading: 'Games laden…',
        contentTypes: {
            mod: 'Mods',
            server: 'Servers',
            asset: 'Assets',
            article: 'Artikelen',
            community: 'Communities',
            collection: 'Collecties',
            group: 'Groepen',
        },
    },
    ja: {
        find: 'ゲームを探す',
        open: 'アプリメニューを開く',
        hint: 'ゲーム、MOD、サーバー',
        search: 'ゲームを検索…',
        none: '一致するゲームがありません。',
        visit: 'ゲームのページを開く',
        loading: 'ゲームを読み込み中…',
        contentTypes: {
            mod: 'MOD',
            server: 'サーバー',
            asset: 'アセット',
            article: '記事',
            community: 'コミュニティ',
            collection: 'コレクション',
            group: 'グループ',
        },
    },
    zh: {
        find: '查找您的游戏',
        open: '打开应用菜单',
        hint: '游戏、模组和服务器',
        search: '搜索游戏…',
        none: '没有匹配的游戏。',
        visit: '打开游戏页面',
        loading: '正在加载游戏…',
        contentTypes: {
            mod: '模组',
            server: '服务器',
            asset: '资源',
            article: '文章',
            community: '社区',
            collection: '合集',
            group: '群组',
        },
    },
    pt: {
        find: 'Encontre o seu jogo',
        open: 'Abrir o menu da aplicação',
        hint: 'Jogos, mods e servidores',
        search: 'Pesquisar jogos…',
        none: 'Nenhum jogo encontrado.',
        visit: 'Abrir a página do jogo',
        loading: 'A carregar jogos…',
        contentTypes: {
            mod: 'Mods',
            server: 'Servidores',
            asset: 'Recursos',
            article: 'Artigos',
            community: 'Comunidades',
            collection: 'Coleções',
            group: 'Grupos',
        },
    },
}
