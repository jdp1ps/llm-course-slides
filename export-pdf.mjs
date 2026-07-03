// Export the reveal.js deck to PDF via the Chrome DevTools Protocol.
// CLI --print-to-pdf ignores @page size and backgrounds; printToPDF with
// preferCSSPageSize + printBackground honours reveal's landscape page size.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

// Use the root URL, not /index.html — `npx serve` 301-redirects /index.html and
// drops the ?print-pdf query, which would silently disable print mode.
const URL = process.argv[2] || 'http://localhost:8000/?print-pdf';
const OUT = process.argv[3] || 'slides-module1.pdf';
const PORT = 9222;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Slide size must match the deck config (width/height in index.html) so reveal
// lays each slide out full-bleed. Reveal inflates the print page by (1 + margin).
const SLIDE_W = 1280, SLIDE_H = 720, MARGIN = 0.04;
const PAGE_W_IN = (SLIDE_W * (1 + MARGIN)) / 96;
const PAGE_H_IN = (SLIDE_H * (1 + MARGIN)) / 96;

const chrome = spawn('google-chrome-stable', [
  '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
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
  // Wait for the debugging endpoint, then open a fresh tab.
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/json/new?${encodeURIComponent(URL)}`, { method: 'PUT' });
      target = await r.json();
    } catch { await sleep(250); }
  }
  if (!target) throw new Error('Chrome debugging endpoint not reachable');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });

  let id = 0;
  await rpc(ws, ++id, 'Page.enable');
  // Give reveal time to build .pdf-page wrappers and layout.
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
}
