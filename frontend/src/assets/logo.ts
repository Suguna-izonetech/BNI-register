/**
 * BNI-TPL 2026 — official logo, transparent background.
 * viewBox: 900 x 320  (wide enough for all text + ball)
 * Layout mirrors the original image exactly.
 */

export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 320">
  <title>BNI-TPL 2026 | Trichy Premier League</title>
  <defs>
    <radialGradient id="bg2026" cx="36%" cy="30%" r="68%">
      <stop offset="0%"   stop-color="#f05050"/>
      <stop offset="45%"  stop-color="#c0201a"/>
      <stop offset="100%" stop-color="#7a0e0a"/>
    </radialGradient>
  </defs>

  <!-- ══════════════════════════════════════
       BNI® TRICHY wordmark — top left
       ══════════════════════════════════════ -->
  <rect x="2" y="4" width="108" height="56" rx="5" fill="#d13b2a"/>
  <text x="12"  y="50" font-family="Arial Black,sans-serif" font-weight="900" font-size="40" fill="#ffffff">B</text>
  <text x="44"  y="50" font-family="Arial Black,sans-serif" font-weight="900" font-size="40" fill="#ffffff">N</text>
  <text x="76"  y="50" font-family="Arial Black,sans-serif" font-weight="900" font-size="40" fill="#ffffff">I</text>
  <!-- White top-bar accent on I -->
  <rect x="76" y="4" width="20" height="8" rx="2" fill="#ffffff" opacity="0.85"/>
  <!-- ® mark -->
  <text x="100" y="18" font-family="Arial,sans-serif" font-size="13" fill="#d13b2a">®</text>
  <!-- TRICHY label -->
  <text x="2" y="80" font-family="Arial,sans-serif" font-weight="700" font-size="15"
        fill="#2d2d2d" letter-spacing="6">TRICHY</text>

  <!-- ══════════════════════════════════════
       Gold batsman silhouette — left-center
       ══════════════════════════════════════ -->
  <g transform="translate(4, 96) scale(0.75)" fill="#c9a84c">
    <!-- Head + helmet -->
    <circle cx="88" cy="52" r="26"/>
    <ellipse cx="106" cy="62" rx="18" ry="8" transform="rotate(-8,106,62)"/>
    <!-- Torso -->
    <ellipse cx="80" cy="128" rx="24" ry="44"/>
    <!-- Raised arm -->
    <ellipse cx="48" cy="96" rx="10" ry="34" transform="rotate(-52,48,96)"/>
    <!-- Bat blade -->
    <rect x="8" y="18" width="12" height="82" rx="5" transform="rotate(-42,8,18)"/>
    <!-- Bat handle -->
    <rect x="20" y="6" width="7" height="30" rx="3" transform="rotate(-42,20,6)"/>
    <!-- Lower arm -->
    <ellipse cx="112" cy="114" rx="9" ry="27" transform="rotate(18,112,114)"/>
    <!-- Legs -->
    <ellipse cx="68"  cy="206" rx="12" ry="32" transform="rotate(-10,68,206)"/>
    <ellipse cx="94"  cy="212" rx="11" ry="30" transform="rotate(10,94,212)"/>
    <!-- Boots -->
    <ellipse cx="58"  cy="234" rx="16" ry="9" transform="rotate(-4,58,234)"/>
    <ellipse cx="98"  cy="238" rx="15" ry="8" transform="rotate(4,98,238)"/>
  </g>

  <!-- ══════════════════════════════════════
       Red cricket ball + trail — top right
       Ball center at (840, 68), trail going left
       ══════════════════════════════════════ -->
  <!-- Trail lines -->
  <line x1="660" y1="80" x2="790" y2="36" stroke="#d13b2a" stroke-width="6"   stroke-linecap="round" opacity="0.9"/>
  <line x1="668" y1="96" x2="792" y2="54" stroke="#d13b2a" stroke-width="4"   stroke-linecap="round" opacity="0.65"/>
  <line x1="678" y1="110" x2="794" y2="70" stroke="#d13b2a" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
  <!-- Gold sparks -->
  <circle cx="730" cy="50" r="3.5" fill="#c9a84c" opacity="0.9"/>
  <circle cx="752" cy="42" r="2.5" fill="#c9a84c" opacity="0.7"/>
  <circle cx="712" cy="62" r="2"   fill="#c9a84c" opacity="0.55"/>
  <!-- Ball -->
  <circle cx="840" cy="68" r="48" fill="url(#bg2026)"/>
  <!-- Seam curves -->
  <path d="M816 34 Q840 68 816 102" stroke="#6b0e08" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <path d="M864 34 Q840 68 864 102" stroke="#6b0e08" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <!-- Stitches left seam -->
  <line x1="820" y1="46" x2="828" y2="42" stroke="#6b0e08" stroke-width="2.2"/>
  <line x1="818" y1="62" x2="826" y2="58" stroke="#6b0e08" stroke-width="2.2"/>
  <line x1="820" y1="78" x2="828" y2="82" stroke="#6b0e08" stroke-width="2.2"/>
  <!-- Stitches right seam -->
  <line x1="852" y1="46" x2="860" y2="42" stroke="#6b0e08" stroke-width="2.2"/>
  <line x1="854" y1="62" x2="862" y2="58" stroke="#6b0e08" stroke-width="2.2"/>
  <line x1="852" y1="78" x2="860" y2="82" stroke="#6b0e08" stroke-width="2.2"/>
  <!-- Shine -->
  <ellipse cx="824" cy="50" rx="13" ry="9" fill="white" opacity="0.2" transform="rotate(-20,824,50)"/>

  <!-- ══════════════════════════════════════
       BNI – TPL 2026  (main title)
       Measured: starts x=168, font-size 90
       At 900px wide this fits comfortably
       ══════════════════════════════════════ -->
  <text x="168" y="192"
        font-family="Arial Black,Impact,sans-serif"
        font-weight="900"
        font-size="90"
        fill="#d13b2a"
        letter-spacing="-1">BNI – TPL 2026</text>

  <!-- ══════════════════════════════════════
       TRICHY PREMIER LEAGUE  (subtitle)
       ══════════════════════════════════════ -->
  <text x="168" y="240"
        font-family="Arial Black,Impact,sans-serif"
        font-weight="900"
        font-size="36"
        fill="#2d2d2d"
        letter-spacing="3">TRICHY PREMIER LEAGUE</text>

  <!-- ══════════════════════════════════════
       Tagline with gold rules
       ══════════════════════════════════════ -->
  <circle cx="168" cy="276" r="5.5" fill="#c9a84c"/>
  <line x1="181" y1="276" x2="202" y2="276" stroke="#c9a84c" stroke-width="2"/>
  <text x="208" y="282"
        font-family="Georgia,'Times New Roman',serif"
        font-style="italic"
        font-size="20"
        fill="#444444"
        letter-spacing="0.6">Building Business Beyond Boundaries</text>
  <line x1="590" y1="276" x2="611" y2="276" stroke="#c9a84c" stroke-width="2"/>
  <circle cx="618" cy="276" r="5.5" fill="#c9a84c"/>
</svg>`;

export const LOGO_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_SVG)}`;
