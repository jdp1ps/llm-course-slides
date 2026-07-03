# Cycle de formations IA pour les SHS — Module 1

Slides **reveal.js** à la charte **Université Paris 1 Panthéon-Sorbonne**, reconstituée
à partir de `model.pptx`.

> Modèles de langage, modèles conversationnels, modèles agentiques :
> kit de survie pour le chercheur en sciences humaines et sociales.

Ce dépôt contient le **gabarit de marque** + un squelette de ~7 diapositives
montrant chaque type de mise en page. Le contenu pédagogique est à compléter.

## Démarrer

```bash
npm install          # installe reveal.js (et serve)
npm start            # sert la présentation sur http://localhost:8000
```

Ouvrir <http://localhost:8000> dans un navigateur.

## Configuration du playground (identifiants)

L'adresse et le mot de passe du playground utilisé sur la diapo **« Expérience »**
sont lus depuis un fichier local **non versionné** (`config.local.js`), afin de
ne pas exposer ces informations dans le dépôt.

```bash
cp config.sample.js config.local.js   # créer sa copie locale
```

Puis renseigner les valeurs dans `config.local.js` :

```js
window.SLIDE_CONFIG = {
  PLAYGROUND_IP: 'http://192.0.2.10:8000',   // adresse du playground
  PLAYGROUND_PASSWORD: 'MonMotDePasse',       // mot de passe de connexion
};
```

- `config.local.js` est ignoré par Git (voir `.gitignore`) — **ne jamais le committer**.
- `config.sample.js` (versionné) sert de modèle.
- Les valeurs sont injectées automatiquement dans la diapo au chargement.
  Si une valeur est **vide** (ou le fichier absent), la diapo affiche
  « lien fourni en séance » / « (fourni en séance) ».

| Touche | Action |
|--------|--------|
| `→` `←` `Espace` | naviguer |
| `F` | plein écran |
| `S` | vue présentateur (notes) |
| `Esc` / `O` | vue d'ensemble des diapos |
| `B` | écran noir (pause) |

**Exporter en PDF** : ouvrir `http://localhost:8000/index.html?print-pdf`
puis imprimer (Ctrl/Cmd+P) → « Enregistrer au format PDF », marges *Aucune*,
cocher *Graphiques d'arrière-plan*.

## Modifier les diapos

Tout est dans **`index.html`** — une diapo = un `<section>`. Trois gabarits :

```html
<!-- Diapo de titre (fond bleu) -->
<section class="title-slide" data-background-color="#00386E"> … </section>

<!-- Intercalaire de section (fond or) -->
<section class="section-slide" data-background-color="#ED9B27">
  <span class="num">2.</span>
  <h2>Titre de section</h2>
</section>

<!-- Diapo de contenu (fond blanc) -->
<section class="content-slide">
  <h2>Titre</h2>
  …
  <div class="slide-footer"><span class="center">…</span><span class="num"></span></div>
</section>
```

Le **logo** et le **numéro** de chaque pied de page sont injectés
automatiquement (voir le script en bas de `index.html`) — il suffit d'ajouter
un `<div class="slide-footer">` à chaque diapo de contenu.

### Briques de mise en page disponibles (voir `css/paris1-theme.css`)

- `.cols` / `.col-narrow` — colonnes
- `.card` (+ `.gold` `.teal` `.red` `.purple`) — encadrés à filet coloré
- `.pill` (+ variantes) — étiquettes thématiques
- `.muted` `.big` — variantes de texte
- listes à puces dorées, citations, tableaux, code coloré (highlight.js)

## Charte (extraite de `model.pptx`)

| Rôle | Couleur |
|------|---------|
| Bleu primaire | `#00386E` |
| Or (intercalaires) | `#ED9B27` |
| Turquoise / Rouge / Violet / Bleu ciel / Vert | `#9CD6D1` `#F94D49` `#58239C` `#3C99DE` `#2E4D49` |

Titres en **serif** (type Times), corps en **Arial** — fidèle au modèle Paris 1.

## Logo

`assets/logo-paris1.png` est un **dépannage basse résolution** extrait de
`model.pptx`. Pour un rendu impeccable, le remplacer par le fichier officiel
haute définition (service communication de l'université) en conservant le même
nom de fichier.
