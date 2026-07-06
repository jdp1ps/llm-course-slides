// Export d'un deck reveal.js en PDF via le Chrome DevTools Protocol.
//   npm run export:pdf <nom-du-deck> [sortie.pdf]
// Démarre un serveur statique temporaire, rend le deck en mode ?print-pdf,
// puis écrit le PDF. `--print-to-pdf` (CLI) ignore la taille @page et les
// fonds ; printToPDF + printBackground respecte la mise en page paysage de reveal.
import { spawn } from 'node:child_process';
import { writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_DECK = 'summer-2026-llm-survival-kit';
const PORT = 8000;
const DBG = 9222;

function listDecks() {
  return readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(ROOT, d.name, 'index.html')))
    .map((d) => d.name);
}

const deck = process.argv[2] || DEFAULT_DECK;
if (!existsSync(join(ROOT, deck, 'index.html'))) {
  console.error(`\n  ✗ Deck introuvable : « ${deck} »\n  Decks : ${listDecks().join(', ')}\n`);
  process.exit(1);
}
// Le serveur redirige /index.html vers / ; viser le dossier du deck, pas le fichier.
const URL = `http://localhost:${PORT}/${deck}/?print-pdf`;
const OUT = process.argv[3] || join(ROOT, `${deck}.pdf`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// La taille doit correspondre à la config du deck (width/height, shared/js/deck.mjs)
// pour que reveal mette chaque diapo en pleine page. Reveal gonfle de (1 + margin).
const SLIDE_W = 1280, SLIDE_H = 720, MARGIN = 0.04;
const PAGE_W_IN = (SLIDE_W * (1 + MARGIN)) / 96;
const PAGE_H_IN = (SLIDE_H * (1 + MARGIN)) / 96;

const serveBin = join(ROOT, 'node_modules', '.bin', 'serve');
const server = spawn(serveBin, ['-l', String(PORT), '.'], { cwd: ROOT, stdio: 'ignore' });

const chrome = spawn('google-chrome-stable', [
  '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${DBG}`, '--remote-allow-origins=*',
  '--force-device-scale-factor=1', `--window-size=${SLIDE_W},${SLIDE_H}`,
  'about:blank',
], { stdio: 'ignore' });

async function rpc(ws, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const onMsg = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) { ws.removeEventListener('message', onMsg); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); }
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

try {
  // Attendre que le serveur statique réponde.
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(URL); if (r.ok) break; } catch {}
    await sleep(200);
  }

  // Attendre l'endpoint de debug, puis ouvrir un onglet.
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    try {
      const r = await fetch(`http://localhost:${DBG}/json/new?${encodeURIComponent(URL)}`, { method: 'PUT' });
      target = await r.json();
    } catch { await sleep(250); }
  }
  if (!target) throw new Error('Chrome debugging endpoint not reachable');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });

  let id = 0;
  await rpc(ws, ++id, 'Page.enable');
  // Laisser reveal construire les .pdf-page et faire la mise en page.
  await sleep(3500);
  const { data } = await rpc(ws, ++id, 'Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: false,
    landscape: false,
    paperWidth: PAGE_W_IN, paperHeight: PAGE_H_IN,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
  });
  writeFileSync(OUT, Buffer.from(data, 'base64'));
  ws.close();
  console.log(`Wrote ${OUT}`);
} finally {
  chrome.kill();
  server.kill();
}
