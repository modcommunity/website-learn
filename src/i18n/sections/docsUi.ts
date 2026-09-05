import type { LocaleT } from '../config'

/**
 * The documentation shell's own chrome: the tree, the search dialog, the "on
 * this page" rail, the pager, the copy-code buttons.
 *
 * These strings have no counterpart in website-city — they belong to a surface
 * only this site has — so unlike `shellNav` / `shellFooter` / `shellSidebar`
 * there is no upstream catalogue to stay in sync with, and translating them
 * here is not a divergence.
 *
 * Every locale is complete. There are only ~25 keys and they are the furniture
 * a reader touches on every page; a half-translated search box is worse than an
 * untranslated body, because the body at least announces itself as English
 * (see `docs.fallback`).
 */
type DocsUi = {
    brand: string
    home: string
    fallback: string
    anchor: string
    nav: {
        label: string
        browse: string
        close: string
        expand: string
        collapse: string
    }
    toc: { label: string }
    pager: { label: string; prev: string; next: string }
    search: {
        placeholder: string
        title: string
        close: string
        loading: string
        failed: string
        hint: string
        empty: string
        keyOpen: string
        keyMove: string
        keyClose: string
    }
    badge: { new: string; updated: string; draft: string }
    code: { copy: string; copied: string; failed: string }
}

export const docsUi: Record<LocaleT, DocsUi> = {
    en: {
        brand: 'The Modding Community Docs',
        home: 'Docs',
        fallback:
            'This page has not been translated yet, so it is shown in English.',
        anchor: 'Link to this section',
        nav: {
            label: 'Documentation',
            browse: 'Browse docs',
            close: 'Close',
            expand: 'Expand {section}',
            collapse: 'Collapse {section}',
        },
        toc: { label: 'On this page' },
        pager: { label: 'Page navigation', prev: 'Previous', next: 'Next' },
        search: {
            placeholder: 'Search the docs',
            title: 'Search the documentation',
            close: 'Close search',
            loading: 'Loading the search index…',
            failed: 'The search index could not be loaded.',
            hint: 'Start typing to search every page.',
            empty: 'Nothing matches “{query}”.',
            keyOpen: 'to open',
            keyMove: 'to move',
            keyClose: 'to close',
        },
        badge: { new: 'New', updated: 'Updated', draft: 'Draft' },
        code: { copy: 'Copy', copied: 'Copied', failed: 'Press Ctrl+C' },
    },

    es: {
        brand: 'Documentación de The Modding Community',
        home: 'Documentación',
        fallback:
            'Esta página aún no está traducida, por lo que se muestra en inglés.',
        anchor: 'Enlazar a esta sección',
        nav: {
            label: 'Documentación',
            browse: 'Ver la documentación',
            close: 'Cerrar',
            expand: 'Desplegar {section}',
            collapse: 'Plegar {section}',
        },
        toc: { label: 'En esta página' },
        pager: {
            label: 'Navegación de páginas',
            prev: 'Anterior',
            next: 'Siguiente',
        },
        search: {
            placeholder: 'Buscar en la documentación',
            title: 'Buscar en la documentación',
            close: 'Cerrar la búsqueda',
            loading: 'Cargando el índice de búsqueda…',
            failed: 'No se ha podido cargar el índice de búsqueda.',
            hint: 'Empieza a escribir para buscar en todas las páginas.',
            empty: 'No hay resultados para «{query}».',
            keyOpen: 'para abrir',
            keyMove: 'para moverse',
            keyClose: 'para cerrar',
        },
        badge: { new: 'Nuevo', updated: 'Actualizado', draft: 'Borrador' },
        code: { copy: 'Copiar', copied: 'Copiado', failed: 'Pulsa Ctrl+C' },
    },

    fr: {
        brand: 'Documentation de The Modding Community',
        home: 'Documentation',
        fallback:
            "Cette page n'est pas encore traduite, elle s'affiche donc en anglais.",
        anchor: 'Lien vers cette section',
        nav: {
            label: 'Documentation',
            browse: 'Parcourir la documentation',
            close: 'Fermer',
            expand: 'Déplier {section}',
            collapse: 'Replier {section}',
        },
        toc: { label: 'Sur cette page' },
        pager: {
            label: 'Navigation entre les pages',
            prev: 'Précédent',
            next: 'Suivant',
        },
        search: {
            placeholder: 'Rechercher dans la documentation',
            title: 'Rechercher dans la documentation',
            close: 'Fermer la recherche',
            loading: "Chargement de l'index de recherche…",
            failed: "L'index de recherche n'a pas pu être chargé.",
            hint: 'Commencez à taper pour chercher dans toutes les pages.',
            empty: 'Aucun résultat pour « {query} ».',
            keyOpen: 'pour ouvrir',
            keyMove: 'pour se déplacer',
            keyClose: 'pour fermer',
        },
        badge: { new: 'Nouveau', updated: 'Mis à jour', draft: 'Brouillon' },
        code: { copy: 'Copier', copied: 'Copié', failed: 'Appuyez sur Ctrl+C' },
    },

    de: {
        brand: 'Dokumentation von The Modding Community',
        home: 'Dokumentation',
        fallback:
            'Diese Seite ist noch nicht übersetzt und wird daher auf Englisch angezeigt.',
        anchor: 'Link zu diesem Abschnitt',
        nav: {
            label: 'Dokumentation',
            browse: 'Dokumentation durchsuchen',
            close: 'Schließen',
            expand: '{section} ausklappen',
            collapse: '{section} einklappen',
        },
        toc: { label: 'Auf dieser Seite' },
        pager: {
            label: 'Seitennavigation',
            prev: 'Zurück',
            next: 'Weiter',
        },
        search: {
            placeholder: 'Dokumentation durchsuchen',
            title: 'Dokumentation durchsuchen',
            close: 'Suche schließen',
            loading: 'Suchindex wird geladen…',
            failed: 'Der Suchindex konnte nicht geladen werden.',
            hint: 'Tippe los, um alle Seiten zu durchsuchen.',
            empty: 'Keine Treffer für „{query}“.',
            keyOpen: 'zum Öffnen',
            keyMove: 'zum Navigieren',
            keyClose: 'zum Schließen',
        },
        badge: { new: 'Neu', updated: 'Aktualisiert', draft: 'Entwurf' },
        code: { copy: 'Kopieren', copied: 'Kopiert', failed: 'Strg+C drücken' },
    },

    ru: {
        brand: 'Документация The Modding Community',
        home: 'Документация',
        fallback:
            'Эта страница ещё не переведена, поэтому показана на английском.',
        anchor: 'Ссылка на этот раздел',
        nav: {
            label: 'Документация',
            browse: 'Открыть документацию',
            close: 'Закрыть',
            expand: 'Развернуть «{section}»',
            collapse: 'Свернуть «{section}»',
        },
        toc: { label: 'На этой странице' },
        pager: {
            label: 'Навигация по страницам',
            prev: 'Назад',
            next: 'Далее',
        },
        search: {
            placeholder: 'Поиск по документации',
            title: 'Поиск по документации',
            close: 'Закрыть поиск',
            loading: 'Загрузка поискового индекса…',
            failed: 'Не удалось загрузить поисковый индекс.',
            hint: 'Начните вводить, чтобы искать по всем страницам.',
            empty: 'Ничего не найдено по запросу «{query}».',
            keyOpen: 'открыть',
            keyMove: 'перемещение',
            keyClose: 'закрыть',
        },
        badge: { new: 'Новое', updated: 'Обновлено', draft: 'Черновик' },
        code: {
            copy: 'Копировать',
            copied: 'Скопировано',
            failed: 'Нажмите Ctrl+C',
        },
    },

    nl: {
        brand: 'Documentatie van The Modding Community',
        home: 'Documentatie',
        fallback:
            'Deze pagina is nog niet vertaald en wordt daarom in het Engels getoond.',
        anchor: 'Link naar dit onderdeel',
        nav: {
            label: 'Documentatie',
            browse: 'Documentatie bekijken',
            close: 'Sluiten',
            expand: '{section} uitklappen',
            collapse: '{section} inklappen',
        },
        toc: { label: 'Op deze pagina' },
        pager: {
            label: 'Paginanavigatie',
            prev: 'Vorige',
            next: 'Volgende',
        },
        search: {
            placeholder: 'Zoek in de documentatie',
            title: 'Zoek in de documentatie',
            close: 'Zoeken sluiten',
            loading: 'Zoekindex laden…',
            failed: 'De zoekindex kon niet worden geladen.',
            hint: 'Begin te typen om alle pagina’s te doorzoeken.',
            empty: 'Geen resultaten voor “{query}”.',
            keyOpen: 'om te openen',
            keyMove: 'om te navigeren',
            keyClose: 'om te sluiten',
        },
        badge: { new: 'Nieuw', updated: 'Bijgewerkt', draft: 'Concept' },
        code: {
            copy: 'Kopiëren',
            copied: 'Gekopieerd',
            failed: 'Druk op Ctrl+C',
        },
    },

    ja: {
        brand: 'The Modding Community ドキュメント',
        home: 'ドキュメント',
        fallback:
            'このページはまだ翻訳されていないため、英語で表示しています。',
        anchor: 'このセクションへのリンク',
        nav: {
            label: 'ドキュメント',
            browse: 'ドキュメントを見る',
            close: '閉じる',
            expand: '{section} を展開',
            collapse: '{section} を折りたたむ',
        },
        toc: { label: 'このページの内容' },
        pager: { label: 'ページ移動', prev: '前へ', next: '次へ' },
        search: {
            placeholder: 'ドキュメントを検索',
            title: 'ドキュメントを検索',
            close: '検索を閉じる',
            loading: '検索インデックスを読み込み中…',
            failed: '検索インデックスを読み込めませんでした。',
            hint: '入力するとすべてのページを検索します。',
            empty: '「{query}」に一致する結果はありません。',
            keyOpen: '開く',
            keyMove: '移動',
            keyClose: '閉じる',
        },
        badge: { new: '新規', updated: '更新', draft: '下書き' },
        code: { copy: 'コピー', copied: 'コピーしました', failed: 'Ctrl+C を押す' },
    },

    zh: {
        brand: 'The Modding Community 文档',
        home: '文档',
        fallback: '本页尚未翻译，因此以英文显示。',
        anchor: '链接到本节',
        nav: {
            label: '文档',
            browse: '浏览文档',
            close: '关闭',
            expand: '展开{section}',
            collapse: '折叠{section}',
        },
        toc: { label: '本页目录' },
        pager: { label: '页面导航', prev: '上一页', next: '下一页' },
        search: {
            placeholder: '搜索文档',
            title: '搜索文档',
            close: '关闭搜索',
            loading: '正在加载搜索索引…',
            failed: '无法加载搜索索引。',
            hint: '开始输入即可搜索全部页面。',
            empty: '没有与“{query}”匹配的结果。',
            keyOpen: '打开',
            keyMove: '移动',
            keyClose: '关闭',
        },
        badge: { new: '新增', updated: '已更新', draft: '草稿' },
        code: { copy: '复制', copied: '已复制', failed: '请按 Ctrl+C' },
    },

    pt: {
        brand: 'Documentação da The Modding Community',
        home: 'Documentação',
        fallback:
            'Esta página ainda não foi traduzida, por isso é apresentada em inglês.',
        anchor: 'Ligação para esta secção',
        nav: {
            label: 'Documentação',
            browse: 'Ver a documentação',
            close: 'Fechar',
            expand: 'Expandir {section}',
            collapse: 'Recolher {section}',
        },
        toc: { label: 'Nesta página' },
        pager: {
            label: 'Navegação de páginas',
            prev: 'Anterior',
            next: 'Seguinte',
        },
        search: {
            placeholder: 'Pesquisar na documentação',
            title: 'Pesquisar na documentação',
            close: 'Fechar a pesquisa',
            loading: 'A carregar o índice de pesquisa…',
            failed: 'Não foi possível carregar o índice de pesquisa.',
            hint: 'Comece a escrever para pesquisar em todas as páginas.',
            empty: 'Nada corresponde a «{query}».',
            keyOpen: 'para abrir',
            keyMove: 'para navegar',
            keyClose: 'para fechar',
        },
        badge: { new: 'Novo', updated: 'Atualizado', draft: 'Rascunho' },
        code: { copy: 'Copiar', copied: 'Copiado', failed: 'Prima Ctrl+C' },
    },
}
