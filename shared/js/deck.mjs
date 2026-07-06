// Initialisation commune des decks reveal.js (charte Paris 1).
// Dans chaque deck :  import { initDeck } from '../shared/js/deck.mjs'; initDeck();
import Reveal from '../../node_modules/reveal.js/dist/reveal.mjs';
import Highlight from '../../node_modules/reveal.js/dist/plugin/highlight.mjs';
import Notes from '../../node_modules/reveal.js/dist/plugin/notes.mjs';

// Chemin du logo relatif à la PAGE du deck (deck/index.html → ../shared/…).
const LOGO = '../shared/assets/logo-paris1.png';

export function initDeck(options = {}) {
  const deck = new Reveal({
    width: 1280,
    height: 720,
    margin: 0.04,
    center: false,          // contenu aligné en haut → le pied de page reste ancré en bas
    hash: true,
    slideNumber: false,
    transition: 'fade',
    pdfSeparateFragments: false,   // export PDF : une page par diapo (fragments tous visibles)
    pdfMaxPagesPerSlide: 1,        // une diapo = exactement une page (pas de débordement)
    plugins: [Highlight, Notes],
    ...options,
  });

  return deck.initialize().then(() => {
    // Pour chaque diapo de contenu : insère le logo à gauche du pied de page
    // et renseigne le numéro de diapo à droite (évite de répéter le HTML).
    [...document.querySelectorAll('.slides > section')].forEach((s, i) => {
      const footer = s.querySelector('.slide-footer');
      if (!footer) return;
      const logo = document.createElement('img');
      logo.src = LOGO;
      logo.alt = 'Université Paris 1 Panthéon-Sorbonne';
      footer.prepend(logo);
      const num = footer.querySelector('.num');
      if (num) num.textContent = (i + 1);
    });

    // Identifiants du playground injectés depuis config.local.js (hors VCS).
    const cfg = window.SLIDE_CONFIG || {};
    const link = document.getElementById('playground-link');
    if (link && cfg.PLAYGROUND_IP) {
      link.href = cfg.PLAYGROUND_IP;
      link.textContent = '→ ' + cfg.PLAYGROUND_IP;
    }
    const pass = document.getElementById('playground-pass');
    if (pass && cfg.PLAYGROUND_PASSWORD) {
      pass.textContent = cfg.PLAYGROUND_PASSWORD;
    }

    // Avancer en cliquant n'importe où sur la diapo (révèle ligne par ligne,
    // puis passe à la diapo suivante). Les liens et les flèches restent actifs.
    document.querySelector('.reveal').addEventListener('click', (e) => {
      if (e.target.closest('a, button, .controls, .progress, .slide-number, .navigate-left, .navigate-right')) return;
      deck.next();
    });

    return deck;
  });
}
