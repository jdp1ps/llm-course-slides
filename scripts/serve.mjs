// Serveur de développement pour les decks côte à côte.
//   npm run dev <nom-du-deck>
// Sert la racine du dépôt sur :8000 (pour que ../node_modules et ../shared
// soient accessibles) puis affiche l'URL du deck demandé.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_DECK = 'summer-2026-llm-survival-kit';
const PORT = process.env.PORT || 8000;

function listDecks() {
  return readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(ROOT, d.name, 'index.html')))
    .map((d) => d.name);
}

const deck = process.argv[2] || DEFAULT_DECK;
if (!existsSync(join(ROOT, deck, 'index.html'))) {
  console.error(`\n  ✗ Deck introuvable : « ${deck} »\n`);
  console.error('  Decks disponibles :');
  for (const d of listDecks()) console.error(`    · ${d}`);
  console.error(`\n  Usage : npm run dev <nom-du-deck>\n`);
  process.exit(1);
}

const serveBin = join(ROOT, 'node_modules', '.bin', 'serve');
const srv = spawn(serveBin, ['-l', String(PORT), '.'], { cwd: ROOT, stdio: 'inherit' });

console.log(`\n  ➜  Deck « ${deck} »  →  http://localhost:${PORT}/${deck}/\n`);

const stop = () => { try { srv.kill('SIGINT'); } catch {} process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
srv.on('exit', (code) => process.exit(code ?? 0));
