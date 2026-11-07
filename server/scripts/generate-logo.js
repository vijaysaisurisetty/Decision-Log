import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");
const publicDir = path.resolve(rootDir, "client/public");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Helper to generate 32-point star polygon points
function generateStarburstPoints(cx, cy, rOuter, rInner, pointsCount = 32) {
  const totalVertices = pointsCount * 2;
  const pts = [];
  for (let i = 0; i < totalVertices; i++) {
    const angle = (i * Math.PI) / pointsCount - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

// 1. Square Desktop Icon (512x512)
const starburstPts = generateStarburstPoints(395, 120, 68, 54, 32);
const starburstShadowPts = generateStarburstPoints(403, 128, 68, 54, 32);

const squareLogoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&amp;family=Inter:wght@800&amp;display=swap');
      .font-display {
        font-family: 'Archivo Black', Impact, 'Arial Black', sans-serif;
      }
      .font-ui {
        font-family: 'Inter', -apple-system, sans-serif;
        font-weight: 800;
      }
    </style>
    <pattern id="halftone-pattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="2.8" fill="#dc341e" opacity="0.35" />
    </pattern>
    <clipPath id="tile-clip">
      <rect x="24" y="24" width="440" height="440" rx="64" ry="64" />
    </clipPath>
  </defs>

  <!-- Hard Drop Shadow for Main Tile -->
  <rect x="40" y="40" width="440" height="440" rx="64" ry="64" fill="#0f0d0a" />

  <!-- Main Yellow Comic Tile -->
  <rect x="24" y="24" width="440" height="440" rx="64" ry="64" fill="#ffc900" stroke="#0f0d0a" stroke-width="12" />

  <!-- Halftone Ben-Day Dot Field (Top Right Half) -->
  <g clip-path="url(#tile-clip)">
    <path d="M 120 24 L 464 24 L 464 360 Z" fill="url(#halftone-pattern)" />
  </g>

  <!-- Comic Speech Bubble - Hard Drop Shadow -->
  <path d="M 80 120 L 380 120 A 24 24 0 0 1 404 144 L 404 340 A 24 24 0 0 1 380 364 L 190 364 L 130 412 L 142 364 L 80 364 A 24 24 0 0 1 56 340 L 56 144 A 24 24 0 0 1 80 120 Z"
        fill="#0f0d0a"
        transform="translate(12, 12)" />

  <!-- Comic Speech Bubble - White Body with 10px Ink Border -->
  <path d="M 80 120 L 380 120 A 24 24 0 0 1 404 144 L 404 340 A 24 24 0 0 1 380 364 L 190 364 L 130 412 L 142 364 L 80 364 A 24 24 0 0 1 56 340 L 56 144 A 24 24 0 0 1 80 120 Z"
        fill="#ffffff"
        stroke="#0f0d0a"
        stroke-width="10"
        stroke-linejoin="round" />

  <!-- Red 3D Extrusion Shadow for "DL" -->
  <text x="228" y="278"
        class="font-display"
        font-size="160"
        fill="#dc341e"
        text-anchor="middle"
        letter-spacing="-4">DL</text>

  <!-- Foreground "DL" in Pure Ink -->
  <text x="222" y="272"
        class="font-display"
        font-size="160"
        fill="#0f0d0a"
        text-anchor="middle"
        letter-spacing="-4">DL</text>

  <!-- Red Marker Underline Accent Under the "DL" -->
  <path d="M 104 316 Q 160 308 230 314 T 350 310"
        fill="none"
        stroke="#dc341e"
        stroke-width="9"
        stroke-linecap="round" />

  <!-- Small Tracked Sub-Label inside Bubble -->
  <text x="222" y="342"
        class="font-ui"
        font-size="16"
        fill="#0f0d0a"
        text-anchor="middle"
        letter-spacing="4">DECISION LOG</text>

  <!-- Starburst Badge - Shadow -->
  <polygon points="${starburstShadowPts}"
           fill="#0f0d0a" />

  <!-- Starburst Badge - Red Body -->
  <polygon points="${starburstPts}"
           fill="#dc341e"
           stroke="#0f0d0a"
           stroke-width="7"
           stroke-linejoin="round" />

  <!-- Text inside Starburst -->
  <g transform="rotate(-8 395 120)">
    <text x="395" y="126"
          class="font-display"
          font-size="28"
          fill="#ffffff"
          text-anchor="middle"
          dominant-baseline="central">WHY</text>
  </g>
</svg>
`;

// 2. Wide Desktop Navbar / Header Logo (420x110)
const wideStarburstPts = generateStarburstPoints(370, 36, 26, 20, 24);
const wideStarburstShadow = generateStarburstPoints(374, 40, 26, 20, 24);

const wideLogoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 110" width="460" height="110">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&amp;family=Inter:wght@700;800&amp;display=swap');
      .font-display { font-family: 'Archivo Black', Impact, sans-serif; }
      .font-ui { font-family: 'Inter', sans-serif; }
    </style>
  </defs>

  <!-- Icon Tile - Shadow -->
  <rect x="20" y="18" width="76" height="76" rx="16" ry="16" fill="#0f0d0a" />
  <!-- Icon Tile - Main -->
  <rect x="14" y="12" width="76" height="76" rx="16" ry="16" fill="#ffc900" stroke="#0f0d0a" stroke-width="4" />
  <!-- Icon "DL" -->
  <text x="52" y="68" class="font-display" font-size="44" fill="#0f0d0a" text-anchor="middle" letter-spacing="-1">DL</text>

  <!-- Brand Wordmark -->
  <text x="110" y="64" class="font-display" font-size="38" fill="#0f0d0a" letter-spacing="-1">DECISIONLOG</text>

  <!-- Tagline Comic Strip -->
  <g transform="translate(110, 76)">
    <rect x="0" y="0" width="180" height="20" rx="4" fill="#0f0d0a" />
    <rect x="-2" y="-2" width="180" height="20" rx="4" fill="#ffffff" stroke="#0f0d0a" stroke-width="2" />
    <text x="88" y="12" class="font-ui" font-weight="800" font-size="10" fill="#0f0d0a" text-anchor="middle" letter-spacing="1.5">REMEMBER THE WHY</text>
  </g>

  <!-- Starburst Badge -->
  <polygon points="${wideStarburstShadow}" fill="#0f0d0a" />
  <polygon points="${wideStarburstPts}" fill="#dc341e" stroke="#0f0d0a" stroke-width="3" stroke-linejoin="round" />
  <text x="370" y="38" class="font-display" font-size="12" fill="#ffffff" text-anchor="middle" dominant-baseline="central">NEW!</text>
</svg>
`;

// 3. Crisp Favicon / Taskbar Icon (64x64)
const favStarburstPts = generateStarburstPoints(48, 16, 13, 10, 16);

const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&amp;display=swap');
      .font-display { font-family: 'Archivo Black', Impact, sans-serif; }
    </style>
  </defs>
  <!-- Shadow -->
  <rect x="7" y="7" width="52" height="52" rx="12" ry="12" fill="#0f0d0a" />
  <!-- Yellow Canvas -->
  <rect x="4" y="4" width="52" height="52" rx="12" ry="12" fill="#ffc900" stroke="#0f0d0a" stroke-width="3.5" />
  <!-- Monogram -->
  <text x="29" y="43" class="font-display" font-size="30" fill="#0f0d0a" text-anchor="middle" letter-spacing="-1">DL</text>
  <!-- Starburst Badge -->
  <polygon points="${favStarburstPts}" fill="#dc341e" stroke="#0f0d0a" stroke-width="2" stroke-linejoin="round" />
</svg>
`;

// Write SVG files
fs.writeFileSync(path.join(publicDir, "logo.svg"), squareLogoSvg, "utf8");
fs.writeFileSync(path.join(publicDir, "desktop-logo.svg"), wideLogoSvg, "utf8");
fs.writeFileSync(path.join(publicDir, "favicon.svg"), faviconSvg, "utf8");

console.log("Successfully generated:");
console.log("- client/public/logo.svg (Square Desktop Icon 512x512)");
console.log("- client/public/desktop-logo.svg (Wide Desktop Logo 460x110)");
console.log("- client/public/favicon.svg (Favicon / Taskbar Icon 64x64)");

