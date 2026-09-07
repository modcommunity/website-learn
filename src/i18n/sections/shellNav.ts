import type { LocaleT } from '../config'

/**
 * Header navigation labels + dropdown descriptions, ported verbatim from
 * website-city's `locales/<lang>/nav.json` (`items.*`) so the two headers read
 * identically in all nine languages.
 *
 * Keep in sync with website-city's PRIMARY_NAV — that config is the source of
 * truth for which entries the header shows and in what order — and with its
 * nav.json, which is the source of truth for the words. City translates every
 * one of these keys itself now, so nothing here is English-only; a key it ever
 * carries in English alone must stay English here too, since city's request
 * pipeline merges English under every locale and translating it on this side
 * alone would make the two shells disagree in the other eight languages.
 * `getT` falls back to English per key, so a gap never leaks a raw key.
 */
export type NavEntry = { label: string; desc: string }

/**
 * A locale's header strings: one `{ label, desc }` per nav entry, plus the bare
 * `more` string the shared <Header/> labels its overflow dropdown with (city
 * passes its `nav.more` there, so it is a header string like the rest and lives
 * with them rather than in the generic shell catalogue).
 */
export type NavCatalog = Record<LocaleT, Record<string, NavEntry | string>>

export const shellNav: NavCatalog = {
    en: {
        more: 'More',
        explore: {
            label: 'Explore',
            desc: 'Everything the community has published, in one place',
        },
        apps: {
            label: 'Apps',
            desc: 'Games & applications we support',
        },
        mods: {
            label: 'Mods',
            desc: 'Community-built modifications',
        },
        servers: {
            label: 'Servers',
            desc: 'Find & track game servers',
        },
        assets: {
            label: 'Assets',
            desc: 'Game dev, tools & more',
        },
        collections: {
            label: 'Collections',
            desc: 'Curated line-ups of mods, assets and more',
        },
        communities: {
            label: 'Communities',
            desc: 'User-run gaming and modding communities',
        },
        articles: {
            label: 'Articles',
            desc: 'Guides, write-ups and news',
        },
        media: {
            label: 'Media',
            desc: 'Screenshots, videos and artwork from the community.',
        },
        parties: {
            label: 'Parties',
            desc: 'Find a game to jump into or start your own',
        },
        groups: {
            label: 'Groups',
            desc: 'Teams and organizations on the site',
        },
        feed: {
            label: 'Feed',
            desc: 'What people are making, posting and playing right now',
        },
        community: {
            label: 'Community',
            desc: "What's new with the community",
        },
        discord: {
            label: 'Discord Server',
            desc: 'Join our Discord community',
        },
        roadmap: {
            label: 'Roadmap',
            desc: "Where we're headed",
        },
        feedback: {
            label: 'Feedback',
            desc: 'Suggest, report and vote',
        },
        discussions: {
            label: 'Discussions',
            desc: 'The site-wide board, plus every app that runs one.',
        },
        contact: {
            label: 'Contact Us',
            desc: 'Reach the team by email, Discord or staff directory',
        },
        resources: {
            label: 'Resources',
            desc: 'Bug tracker, changelog and site status',
        },
        bugs: {
            label: 'Bug Tracker',
            desc: "Report a defect, or say you're hitting one too",
        },
        changelog: {
            label: 'Changelog',
            desc: "What we've shipped, newest first",
        },
        docs: {
            label: 'Docs',
            desc: 'Guides, references and the full API documentation',
        },
        status: {
            label: 'Site Status',
            desc: 'Is anything broken right now? Incidents and live checks',
        },
        blog: {
            label: 'Blog',
            desc: 'News & write-ups',
        },
    },
    es: {
        more: 'Más',
        explore: {
            label: 'Descubrir',
            desc: 'Todo lo que la comunidad ha publicado',
        },
        apps: {
            label: 'Aplicaciones',
            desc: 'Juegos y aplicaciones compatibles',
        },
        mods: {
            label: 'Mods',
            desc: 'Modificaciones creadas por la comunidad',
        },
        servers: {
            label: 'Servidores',
            desc: 'Encuentra y monitoriza servidores de juego',
        },
        assets: {
            label: 'Recursos',
            desc: 'Desarrollo de juegos, herramientas y más',
        },
        collections: {
            label: 'Colecciones',
            desc: 'Selecciones de mods, recursos y más',
        },
        communities: {
            label: 'Comunidades',
            desc: 'Comunidades de juego y modding gestionadas por usuarios',
        },
        articles: {
            label: 'Artículos',
            desc: 'Guías, reportajes y noticias',
        },
        media: {
            label: 'Multimedia',
            desc: 'Capturas, vídeos y arte de la comunidad.',
        },
        parties: {
            label: 'Partidas',
            desc: 'Encuentra una partida a la que unirte o crea la tuya',
        },
        groups: {
            label: 'Grupos',
            desc: 'Equipos y organizaciones del sitio',
        },
        feed: {
            label: 'Feed',
            desc: 'Lo que la gente está creando, publicando y jugando ahora mismo',
        },
        community: {
            label: 'Comunidad',
            desc: 'Novedades de la comunidad',
        },
        discord: {
            label: 'Servidor de Discord',
            desc: 'Únete a nuestra comunidad de Discord',
        },
        roadmap: {
            label: 'Hoja de ruta',
            desc: 'Hacia dónde vamos',
        },
        feedback: {
            label: 'Sugerencias',
            desc: 'Propón, informa y vota',
        },
        discussions: {
            label: 'Debates',
            desc:
                'El tablón de todo el sitio, además de cada aplicación que tiene el suyo.',
        },
        contact: {
            label: 'Contacto',
            desc:
                'Contacta con el equipo por correo, Discord o el directorio de personal',
        },
        resources: {
            label: 'Recursos del sitio',
            desc: 'Rastreador de errores, changelog y estado del sitio',
        },
        bugs: {
            label: 'Registro de errores',
            desc: 'Informa de un fallo o di que también lo sufres',
        },
        changelog: {
            label: 'Novedades',
            desc: 'Lo que hemos publicado, lo más reciente primero',
        },
        docs: {
            label: 'Documentación',
            desc: 'Guías, referencias y la documentación completa de la API',
        },
        status: {
            label: 'Estado del sitio',
            desc:
                '¿Hay algo que no funcione ahora mismo? Incidencias y comprobaciones en vivo',
        },
        blog: {
            label: 'Blog',
            desc: 'Noticias y artículos',
        },
    },
    fr: {
        more: 'Plus',
        explore: {
            label: 'Explorer',
            desc: 'Tout ce que la communauté a publié',
        },
        apps: {
            label: 'Applis',
            desc: 'Jeux et applications pris en charge',
        },
        mods: {
            label: 'Mods',
            desc: 'Modifications créées par la communauté',
        },
        servers: {
            label: 'Serveurs',
            desc: 'Trouver et suivre des serveurs de jeu',
        },
        assets: {
            label: 'Ressources',
            desc: 'Développement de jeux, outils et plus',
        },
        collections: {
            label: 'Collections',
            desc: 'Sélections de mods, ressources et plus',
        },
        communities: {
            label: 'Communautés',
            desc: 'Communautés de jeu et de modding gérées par les membres',
        },
        articles: {
            label: 'Articles',
            desc: 'Guides, articles de fond et actualités',
        },
        media: {
            label: 'Médias',
            desc: "Captures d'écran, vidéos et illustrations de la communauté.",
        },
        parties: {
            label: 'Sessions',
            desc: 'Trouvez une partie à rejoindre ou lancez la vôtre',
        },
        groups: {
            label: 'Groupes',
            desc: 'Équipes et organisations du site',
        },
        feed: {
            label: 'Flux',
            desc: 'Ce que les gens créent, publient et jouent en ce moment',
        },
        community: {
            label: 'Communauté',
            desc: 'Les nouveautés de la communauté',
        },
        discord: {
            label: 'Serveur Discord',
            desc: 'Rejoignez notre communauté Discord',
        },
        roadmap: {
            label: 'Feuille de route',
            desc: 'Nos prochaines étapes',
        },
        feedback: {
            label: 'Suggestions',
            desc: 'Proposer, signaler et voter',
        },
        discussions: {
            label: 'Discussions',
            desc: 'Le forum du site entier, plus chaque appli qui en tient un.',
        },
        contact: {
            label: 'Nous contacter',
            desc: "Joignez l'équipe par e-mail, Discord ou l'annuaire du staff",
        },
        resources: {
            label: 'Ressources du site',
            desc: 'Suivi des bugs, changelog et état du site',
        },
        bugs: {
            label: 'Suivi des bugs',
            desc: 'Signalez un défaut, ou dites que vous le rencontrez aussi',
        },
        changelog: {
            label: 'Journal des modifications',
            desc: 'Ce que nous avons livré, du plus récent au plus ancien',
        },
        docs: {
            label: 'Documentation',
            desc: 'Guides, références et la documentation complète de l\'API',
        },
        status: {
            label: 'État du site',
            desc:
                'Quelque chose est-il en panne en ce moment ? Incidents et vérifications en direct',
        },
        blog: {
            label: 'Blog',
            desc: 'Actualités et articles',
        },
    },
    de: {
        more: 'Mehr',
        explore: {
            label: 'Entdecken',
            desc: 'Alles, was die Community veröffentlicht hat',
        },
        apps: {
            label: 'Apps',
            desc: 'Spiele & Anwendungen, die wir unterstützen',
        },
        mods: {
            label: 'Mods',
            desc: 'Von der Community erstellte Modifikationen',
        },
        servers: {
            label: 'Server',
            desc: 'Game-Server finden & verfolgen',
        },
        assets: {
            label: 'Assets',
            desc: 'Gamedev, Tools und mehr',
        },
        collections: {
            label: 'Sammlungen',
            desc: 'Kuratierte Zusammenstellungen von Mods, Assets und mehr',
        },
        communities: {
            label: 'Communitys',
            desc: 'Von Nutzern geführte Gaming- und Modding-Communitys',
        },
        articles: {
            label: 'Artikel',
            desc: 'Guides, Berichte und News',
        },
        media: {
            label: 'Medien',
            desc: 'Screenshots, Videos und Artworks aus der Community.',
        },
        parties: {
            label: 'Partys',
            desc: 'Finde eine Runde zum Mitspielen oder starte deine eigene',
        },
        groups: {
            label: 'Gruppen',
            desc: 'Teams und Organisationen auf der Seite',
        },
        feed: {
            label: 'Feed',
            desc: 'Was die Leute gerade erstellen, posten und spielen',
        },
        community: {
            label: 'Community',
            desc: 'Was es Neues in der Community gibt',
        },
        discord: {
            label: 'Discord-Server',
            desc: 'Treten Sie unserer Discord-Community bei',
        },
        roadmap: {
            label: 'Roadmap',
            desc: 'Wohin es für uns geht',
        },
        feedback: {
            label: 'Feedback',
            desc: 'Vorschlagen, melden und abstimmen',
        },
        discussions: {
            label: 'Diskussionen',
            desc:
                'Das seitenweite Board und jede App, die ein eigenes betreibt.',
        },
        contact: {
            label: 'Kontakt',
            desc: 'Erreiche das Team per E-Mail, Discord oder Team-Verzeichnis',
        },
        resources: {
            label: 'Ressourcen',
            desc: 'Bug-Tracker, Changelog und Seitenstatus',
        },
        bugs: {
            label: 'Bug-Tracker',
            desc:
                'Melden Sie einen Fehler, oder sagen Sie, dass Sie ihn auch haben',
        },
        changelog: {
            label: 'Änderungsprotokoll',
            desc: 'Was wir veröffentlicht haben, neueste zuerst',
        },
        docs: {
            label: 'Dokumentation',
            desc: 'Anleitungen, Referenzen und die vollständige API-Dokumentation',
        },
        status: {
            label: 'Seitenstatus',
            desc: 'Gibt es gerade Störungen? Vorfälle und Live-Prüfungen',
        },
        blog: {
            label: 'Blog',
            desc: 'News & Berichte',
        },
    },
    ru: {
        more: 'Ещё',
        explore: {
            label: 'Каталог',
            desc: 'Всё, что опубликовало сообщество',
        },
        apps: {
            label: 'Игры',
            desc: 'Игры и приложения, которые мы поддерживаем',
        },
        mods: {
            label: 'Моды',
            desc: 'Модификации от сообщества',
        },
        servers: {
            label: 'Серверы',
            desc: 'Поиск и отслеживание игровых серверов',
        },
        assets: {
            label: 'Ресурсы',
            desc: 'Геймдев, инструменты и не только',
        },
        collections: {
            label: 'Коллекции',
            desc: 'Подборки модов, ресурсов и не только',
        },
        communities: {
            label: 'Сообщества',
            desc: 'Игровые и моддинг-сообщества, созданные пользователями',
        },
        articles: {
            label: 'Статьи',
            desc: 'Гайды, обзоры и новости',
        },
        media: {
            label: 'Медиа',
            desc: 'Скриншоты, видео и арт от сообщества.',
        },
        parties: {
            label: 'Пати',
            desc:
                'Найдите игру, к которой можно присоединиться, или создайте свою',
        },
        groups: {
            label: 'Группы',
            desc: 'Команды и организации на сайте',
        },
        feed: {
            label: 'Лента',
            desc: 'Что люди создают, публикуют и во что играют прямо сейчас',
        },
        community: {
            label: 'Сообщество',
            desc: 'Что нового в сообществе',
        },
        discord: {
            label: 'Сервер Discord',
            desc: 'Присоединяйтесь к нашему сообществу в Discord',
        },
        roadmap: {
            label: 'Планы развития',
            desc: 'Куда мы движемся',
        },
        feedback: {
            label: 'Отзывы',
            desc: 'Предлагайте, сообщайте и голосуйте',
        },
        discussions: {
            label: 'Обсуждения',
            desc: 'Общесайтовый форум и форумы всех игр, где они есть.',
        },
        contact: {
            label: 'Связаться с нами',
            desc:
                'Свяжитесь с командой по почте, в Discord или через список персонала',
        },
        resources: {
            label: 'Материалы',
            desc: 'Баг-трекер, список изменений и статус сайта',
        },
        bugs: {
            label: 'Трекер багов',
            desc: 'Сообщите о дефекте или отметьте, что столкнулись с ним тоже',
        },
        changelog: {
            label: 'Список изменений',
            desc: 'Что мы выпустили — сначала новое',
        },
        docs: {
            label: 'Документация',
            desc: 'Руководства, справочники и полная документация API',
        },
        status: {
            label: 'Состояние сайта',
            desc:
                'Что-то не работает прямо сейчас? Инциденты и проверки в реальном времени',
        },
        blog: {
            label: 'Блог',
            desc: 'Новости и статьи',
        },
    },
    nl: {
        more: 'Meer',
        explore: {
            label: 'Ontdekken',
            desc: 'Alles wat de community heeft gepubliceerd',
        },
        apps: {
            label: 'Apps',
            desc: 'Games en applicaties die we ondersteunen',
        },
        mods: {
            label: 'Mods',
            desc: 'Modificaties gemaakt door de community',
        },
        servers: {
            label: 'Servers',
            desc: 'Vind en volg game servers',
        },
        assets: {
            label: 'Assets',
            desc: 'Gamedev, tools en meer',
        },
        collections: {
            label: 'Collecties',
            desc: 'Samengestelde lijsten met mods, assets en meer',
        },
        communities: {
            label: 'Communities',
            desc: 'Door gebruikers beheerde gaming- en moddingcommunities',
        },
        articles: {
            label: 'Artikelen',
            desc: 'Gidsen, verhalen en nieuws',
        },
        media: {
            label: 'Media',
            desc: "Screenshots, video's en artwork uit de community.",
        },
        parties: {
            label: "Party's",
            desc: 'Vind een spel om aan mee te doen of start je eigen party',
        },
        groups: {
            label: 'Groepen',
            desc: 'Teams en organisaties op de site',
        },
        feed: {
            label: 'Feed',
            desc: 'Wat mensen nu maken, posten en spelen',
        },
        community: {
            label: 'Community',
            desc: 'Wat er nieuw is in de community',
        },
        discord: {
            label: 'Discord-server',
            desc: 'Word lid van onze Discord-community',
        },
        roadmap: {
            label: 'Roadmap',
            desc: 'Waar we naartoe gaan',
        },
        feedback: {
            label: 'Feedback',
            desc: 'Voorstellen, melden en stemmen',
        },
        discussions: {
            label: 'Discussies',
            desc: 'Het sitebrede board, plus elke app die er zelf een heeft.',
        },
        contact: {
            label: 'Contact',
            desc: 'Bereik het team via e-mail, Discord of de stafflijst',
        },
        resources: {
            label: 'Bronnen',
            desc: 'Bugtracker, changelog en sitestatus',
        },
        bugs: {
            label: 'Bugtracker',
            desc: 'Meld een defect, of laat weten dat jij het ook hebt',
        },
        changelog: {
            label: 'Changelog',
            desc: 'Wat we hebben uitgebracht, nieuwste eerst',
        },
        docs: {
            label: 'Documentatie',
            desc: 'Handleidingen, naslagwerk en de volledige API-documentatie',
        },
        status: {
            label: 'Sitestatus',
            desc: 'Werkt er nu iets niet? Incidenten en live controles',
        },
        blog: {
            label: 'Blog',
            desc: 'Nieuws en artikelen',
        },
    },
    ja: {
        more: 'その他',
        explore: {
            label: '探索',
            desc: 'コミュニティが公開したすべて',
        },
        apps: {
            label: 'アプリ',
            desc: '対応しているゲーム・アプリケーション',
        },
        mods: {
            label: 'MOD',
            desc: 'コミュニティが作った MOD',
        },
        servers: {
            label: 'サーバー',
            desc: 'ゲームサーバーを検索・追跡',
        },
        assets: {
            label: 'アセット',
            desc: 'ゲーム開発、ツールなど',
        },
        collections: {
            label: 'コレクション',
            desc: 'MODやアセットなどの厳選リスト',
        },
        communities: {
            label: 'コミュニティ',
            desc: 'ユーザーが運営するゲーム・モッディングコミュニティ',
        },
        articles: {
            label: '記事',
            desc: 'ガイド、レポート、ニュース',
        },
        media: {
            label: 'メディア',
            desc: 'コミュニティのスクリーンショット・動画・アートワーク。',
        },
        parties: {
            label: 'パーティー',
            desc: '参加できるゲームを探す、または自分で立てる',
        },
        groups: {
            label: 'グループ',
            desc: 'サイト上のチームや団体',
        },
        feed: {
            label: 'フィード',
            desc: 'いま誰が何を作り、投稿し、遊んでいるか',
        },
        community: {
            label: 'コミュニティ',
            desc: 'コミュニティの最新情報',
        },
        discord: {
            label: 'Discord サーバー',
            desc: 'Discord コミュニティに参加',
        },
        roadmap: {
            label: 'ロードマップ',
            desc: '今後の展望',
        },
        feedback: {
            label: 'フィードバック',
            desc: '提案・報告・投票',
        },
        discussions: {
            label: 'ディスカッション',
            desc: 'サイト全体の掲示板と、板を持つ各アプリ。',
        },
        contact: {
            label: 'お問い合わせ',
            desc: 'メール・Discord・スタッフ一覧からチームに連絡',
        },
        resources: {
            label: 'リソース',
            desc: 'バグトラッカー、変更履歴、サイトステータス',
        },
        bugs: {
            label: 'バグトラッカー',
            desc: '不具合を報告する、または同じ症状だと伝える',
        },
        changelog: {
            label: '変更履歴',
            desc: 'リリースした内容を新しい順に',
        },
        docs: {
            label: 'ドキュメント',
            desc: 'ガイド、リファレンス、API ドキュメント一式',
        },
        status: {
            label: 'サイトステータス',
            desc: '現在、障害は発生していますか？インシデントとライブチェック',
        },
        blog: {
            label: 'ブログ',
            desc: 'ニュースと記事',
        },
    },
    zh: {
        more: '更多',
        explore: {
            label: '探索',
            desc: '社区发布的一切内容',
        },
        apps: {
            label: '游戏',
            desc: '我们支持的游戏与应用',
        },
        mods: {
            label: '模组',
            desc: '社区制作的模组',
        },
        servers: {
            label: '服务器',
            desc: '查找并追踪游戏服务器',
        },
        assets: {
            label: '资源',
            desc: '游戏开发、工具等',
        },
        collections: {
            label: '合集',
            desc: '精选的模组、资源等',
        },
        communities: {
            label: '社区',
            desc: '由用户运营的游戏与模组社区',
        },
        articles: {
            label: '文章',
            desc: '指南、专题与新闻',
        },
        media: {
            label: '媒体',
            desc: '来自社区的截图、视频与美术作品。',
        },
        parties: {
            label: '组队',
            desc: '找一局加入，或者自己开一局',
        },
        groups: {
            label: '群组',
            desc: '站点上的团队与组织',
        },
        feed: {
            label: '动态',
            desc: '此刻大家正在创作、发布和游玩的内容',
        },
        community: {
            label: '社区',
            desc: '社区的最新动态',
        },
        discord: {
            label: 'Discord 服务器',
            desc: '加入我们的 Discord 社区',
        },
        roadmap: {
            label: '路线图',
            desc: '我们的未来规划',
        },
        feedback: {
            label: '反馈',
            desc: '提出建议、反馈问题并投票',
        },
        discussions: {
            label: '讨论',
            desc: '全站讨论区，以及各应用自己的版块。',
        },
        contact: {
            label: '联系我们',
            desc: '通过邮件、Discord 或管理团队名录联系我们',
        },
        resources: {
            label: '站点资源',
            desc: '缺陷追踪、更新日志与站点状态',
        },
        bugs: {
            label: '缺陷追踪',
            desc: '报告缺陷，或表示你也遇到了',
        },
        changelog: {
            label: '更新日志',
            desc: '我们发布的内容，最新在前',
        },
        docs: {
            label: '文档',
            desc: '指南、参考资料与完整的 API 文档',
        },
        status: {
            label: '网站状态',
            desc: '当前是否有故障？事件与实时检查',
        },
        blog: {
            label: '博客',
            desc: '新闻与文章',
        },
    },
    pt: {
        more: 'Mais',
        explore: {
            label: 'Descobrir',
            desc: 'Tudo o que a comunidade publicou',
        },
        apps: {
            label: 'Aplicações',
            desc: 'Jogos e aplicações que suportamos',
        },
        mods: {
            label: 'Mods',
            desc: 'Modificações criadas pela comunidade',
        },
        servers: {
            label: 'Servidores',
            desc: 'Encontre e acompanhe servidores de jogo',
        },
        assets: {
            label: 'Recursos',
            desc: 'Desenvolvimento de jogos, ferramentas e mais',
        },
        collections: {
            label: 'Coleções',
            desc: 'Seleções de mods, recursos e mais',
        },
        communities: {
            label: 'Comunidades',
            desc: 'Comunidades de jogos e modding geridas por utilizadores',
        },
        articles: {
            label: 'Artigos',
            desc: 'Guias, artigos e notícias',
        },
        media: {
            label: 'Multimédia',
            desc: 'Capturas de ecrã, vídeos e arte da comunidade.',
        },
        parties: {
            label: 'Partidas',
            desc: 'Encontre um jogo para entrar ou crie a sua',
        },
        groups: {
            label: 'Grupos',
            desc: 'Equipes e organizações do site',
        },
        feed: {
            label: 'Feed',
            desc: 'O que as pessoas estão a criar, publicar e jogar agora mesmo',
        },
        community: {
            label: 'Comunidade',
            desc: 'As novidades da comunidade',
        },
        discord: {
            label: 'Servidor Discord',
            desc: 'Junte-se à nossa comunidade no Discord',
        },
        roadmap: {
            label: 'Roteiro',
            desc: 'Para onde vamos',
        },
        feedback: {
            label: 'Sugestões',
            desc: 'Sugerir, reportar e votar',
        },
        discussions: {
            label: 'Discussões',
            desc: 'O fórum de todo o site, mais cada aplicação que tem o seu.',
        },
        contact: {
            label: 'Contacte-nos',
            desc:
                'Contacte a equipa por e-mail, Discord ou o diretório da equipa',
        },
        resources: {
            label: 'Recursos do site',
            desc: 'Rastreador de bugs, changelog e estado do site',
        },
        bugs: {
            label: 'Registo de erros',
            desc: 'Reporte um defeito ou diga que também o está a ter',
        },
        changelog: {
            label: 'Novidades',
            desc: 'O que lançámos, começando pelo mais recente',
        },
        docs: {
            label: 'Documentação',
            desc: 'Guias, referências e a documentação completa da API',
        },
        status: {
            label: 'Estado do site',
            desc:
                'Há algo com problemas agora? Incidentes e verificações em direto',
        },
        blog: {
            label: 'Blog',
            desc: 'Notícias e artigos',
        },
    },
}
