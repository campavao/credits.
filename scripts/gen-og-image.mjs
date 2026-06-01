// Generates the social-share (Open Graph) image: assets/og-image.png (1200x630).
// One-off / regenerate-on-demand — requires sharp:  npm install --no-save sharp
// Then:  node scripts/gen-og-image.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="36%" r="62%">
      <stop offset="0%" stop-color="#6366F1" stop-opacity="0.30"/>
      <stop offset="60%" stop-color="#6366F1" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#09090B"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="600" y="335" font-family="Segoe UI, Arial, sans-serif" font-size="156"
        font-weight="700" letter-spacing="-5" fill="#FFFFFF" text-anchor="middle">creditz<tspan fill="#6366F1">.</tspan></text>
  <text x="600" y="410" font-family="Segoe UI, Arial, sans-serif" font-size="40"
        font-weight="400" fill="#A1A1AA" text-anchor="middle">Track actors, not just movies — compare with friends.</text>
  <text x="600" y="565" font-family="Segoe UI, Arial, sans-serif" font-size="26"
        font-weight="600" letter-spacing="2" fill="#52525B" text-anchor="middle">CREDITZ.VERCEL.APP</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(join(root, 'assets', 'og-image.png'));
console.log('✓ wrote assets/og-image.png');
