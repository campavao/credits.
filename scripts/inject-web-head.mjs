// Post-export step: Expo's single-page web output uses a built-in HTML template
// that we can't customize via +html.tsx, so we inject the bits we need here.
// Runs after `expo export -p web` (see vercel.json buildCommand).
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'dist/index.html';
let html = readFileSync(FILE, 'utf8');

// 1. Tint Safari's status/URL bars to match the app, keep status bar dark in PWA
//    mode, and add safe-area + dark-background CSS for overscroll regions.
if (!html.includes('name="theme-color"')) {
  const head = `
    <meta name="theme-color" content="#000000" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="mobile-web-app-capable" content="yes" />
    <style>html, body { background-color: #000000; }</style>
  `;
  html = html.replace('</head>', `${head}</head>`);
}

// 2. viewport-fit=cover lets content extend under the notch / home indicator.
html = html.replace(
  'content="width=device-width, initial-scale=1, shrink-to-fit=no"',
  'content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"'
);

writeFileSync(FILE, html);
console.log('✓ Injected theme-color + dark background into dist/index.html');
