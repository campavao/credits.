// Post-export step: Expo's single-page web output uses a built-in HTML template
// that we can't customize via +html.tsx, so we inject the bits we need here.
// Runs after `expo export -p web` (see vercel.json buildCommand).
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';

const SITE_URL = 'https://creditz.vercel.app';
const TITLE = 'creditz.';
const DESCRIPTION =
  'Track actors, not just movies. Mark what you’ve watched, swipe through filmographies, and see how you compare with friends.';

const FILE = 'dist/index.html';
let html = readFileSync(FILE, 'utf8');

// 1. Copy the social-share image into the web root so /og-image.png resolves.
if (existsSync('assets/og-image.png')) {
  copyFileSync('assets/og-image.png', 'dist/og-image.png');
}

// 2. Theme/PWA chrome + Open Graph / Twitter Card so shared links show a rich
//    preview (iMessage, Slack, Twitter, etc.) instead of a generic URL.
if (!html.includes('name="theme-color"')) {
  const head = `
    <meta name="theme-color" content="#000000" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="description" content="${DESCRIPTION}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${TITLE}" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESCRIPTION}" />
    <meta property="og:url" content="${SITE_URL}" />
    <meta property="og:image" content="${SITE_URL}/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${TITLE}" />
    <meta name="twitter:description" content="${DESCRIPTION}" />
    <meta name="twitter:image" content="${SITE_URL}/og-image.png" />
    <style>html, body { background-color: #000000; }</style>
  `;
  html = html.replace('</head>', `${head}</head>`);
}

// 3. viewport-fit=cover lets content extend under the notch / home indicator.
html = html.replace(
  'content="width=device-width, initial-scale=1, shrink-to-fit=no"',
  'content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"'
);

writeFileSync(FILE, html);
console.log('✓ Injected meta (theme-color, Open Graph, Twitter) + copied og-image.png');
