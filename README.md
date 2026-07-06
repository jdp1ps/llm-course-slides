# Présentations reveal.js — charte Université Paris 1 Panthéon-Sorbonne

Plusieurs présentations **reveal.js** côte à côte, partageant la même charte de
marque (**Paris 1**), les mêmes mécanismes (export PDF) et les mêmes dépendances.
Chaque présentation (« deck ») vit dans son propre dossier avec ses images, sa
configuration et, au besoin, sa feuille de style.

## Structure

```
├── shared/                     éléments communs à tous les decks
│   ├── css/paris1-theme.css    charte de base (couleurs, typo, gabarits, pied de page)
│   ├── css/pdf.css             styles d'export PDF
│   ├── assets/logo-paris1.png  logo Paris 1
│   └── js/deck.mjs             init reveal.js commune : initDeck()
├── scripts/
│   ├── serve.mjs               serveur de dev (npm run dev <deck>)
│   └── export-pdf.mjs          export PDF (npm run export:pdf <deck>)
├── summer-2026-llm-survival-kit/   deck « Kit de survie IA » (Module 1)
│   ├── index.html
│   ├── css/deck.css            styles spécifiques au deck
│   ├── img/                    images du deck
│   └── config.sample.js        (copier en config.local.js — hors VCS)
├── slideshow-template/         modèle vierge (une diapo de chaque gabarit)
└── 2026-07-sovisuplus-news-and-proposals/   deck DRIS (diapo de titre)
```

Chaque `deck/index.html` référence la charte commune via `../shared/…`, reveal.js
via `../node_modules/…`, puis sa propre `css/deck.css`, et s'initialise avec
`import { initDeck } from '../shared/js/deck.mjs'; initDeck();`.

## Démarrer

```bash
npm install                                   # dépendances (reveal.js, serve)
npm run dev summer-2026-llm-survival-kit      # sert le deck demandé
```

`npm run dev <deck>` sert la racine du dépôt sur `http://localhost:8000` et affiche
l'URL du deck : `http://localhost:8000/<deck>/`. Sans argument, le deck par défaut
est `summer-2026-llm-survival-kit`.

Decks disponibles : `summer-2026-llm-survival-kit`, `slideshow-template`,
`2026-07-sovisuplus-news-and-proposals`.

## Exporter en PDF

```bash
npm run export:pdf <deck> [sortie.pdf]        # ex. npm run export:pdf slideshow-template
```

Le script démarre un serveur temporaire, rend `<deck>/?print-pdf` via Chrome
headless (DevTools Protocol) et écrit `<deck>.pdf` (ignoré par Git). Nécessite
`google-chrome-stable`.

*Alternative manuelle* : `npm run dev <deck>`, ouvrir
`http://localhost:8000/<deck>/?print-pdf`, imprimer (Ctrl/Cmd+P) → « Enregistrer
au format PDF », marges *Aucune*, cocher *Graphiques d'arrière-plan*.

## Créer un nouveau deck

1. Copier `slideshow-template/` sous un nouveau nom.
2. Y placer ses `img/`, éditer `index.html` (les chemins `../shared`, `../node_modules`
   restent valables) et compléter `css/deck.css` pour les styles propres au deck.
3. `npm run dev <nouveau-deck>`.

## Configuration du playground (deck « Kit de survie »)

L'adresse et le mot de passe du playground (diapo « Expérience ») sont lus depuis
un fichier local **non versionné** :

```bash
cd summer-2026-llm-survival-kit
cp config.sample.js config.local.js           # puis renseigner les valeurs
```

```js
window.SLIDE_CONFIG = {
  PLAYGROUND_IP: 'http://192.0.2.10:8000',
  PLAYGROUND_PASSWORD: 'MonMotDePasse',
};
```

`**/config.local.js` est ignoré par Git — **ne jamais le committer**. Si une valeur
est vide (ou le fichier absent), la diapo affiche « lien fourni en séance ».

## Gabarits & briques (voir `shared/css/paris1-theme.css`)

```html
<section class="title-slide"   data-background-color="#00386E"> … </section>  <!-- titre -->
<section class="section-slide" data-background-color="#ED9B27">                <!-- intercalaire -->
  <span class="num">2.</span><h2>Titre de section</h2>
</section>
<section class="content-slide">                                              <!-- contenu -->
  <h2>Titre</h2> …
  <div class="slide-footer"><span class="center">…</span><span class="num"></span></div>
</section>
```

Logo et numéro du pied de page sont injectés automatiquement (`shared/js/deck.mjs`).

Briques : `.cols`/`.col-narrow`, `.card` (+ `.gold` `.teal` `.red` `.purple`),
`.pill` (+ variantes), `.muted`/`.big`, listes à puces dorées, citations, tableaux,
code coloré (highlight.js).

## Charte

| Rôle | Couleur |
|------|---------|
| Bleu primaire | `#00386E` |
| Or (intercalaires) | `#ED9B27` |
| Turquoise / Rouge / Violet / Bleu ciel / Vert | `#9CD6D1` `#F94D49` `#58239C` `#3C99DE` `#2E4D49` |

Titres en **serif** (type Times), corps en **Arial**.

## Logo

`shared/assets/logo-paris1.png` est un dépannage basse résolution extrait de
`model.pptx` ; le remplacer par le fichier officiel HD en conservant le nom.
