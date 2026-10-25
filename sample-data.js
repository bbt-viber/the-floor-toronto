// Pre-loaded Toronto Starter Pack for instant play
const TORONTO_STARTER_PACK = [
  {
    id: "clue_cn_tower",
    answer: "CN Tower",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <defs>
        <linearGradient id="sky1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="%230b192c" />
          <stop offset="60%" stop-color="%231e3e62" />
          <stop offset="100%" stop-color="%23d65a31" />
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(%23sky1)"/>
      <circle cx="300" cy="380" r="140" fill="%23ffd369" opacity="0.4"/>
      <!-- CN Tower Silhouette & Glow -->
      <!-- Base Legs -->
      <polygon points="275,580 325,580 308,350 292,350" fill="%23111" />
      <line x1="300" y1="580" x2="300" y2="350" stroke="%23222" stroke-width="12" />
      <!-- Main Pod -->
      <ellipse cx="300" cy="270" rx="60" ry="24" fill="%23222" />
      <ellipse cx="300" cy="265" rx="54" ry="12" fill="%2300ADB5" />
      <ellipse cx="300" cy="255" rx="42" ry="16" fill="%23393E46" />
      <!-- SkyPod -->
      <ellipse cx="300" cy="180" rx="22" ry="12" fill="%23222" />
      <ellipse cx="300" cy="178" rx="18" ry="6" fill="%2300ADB5" />
      <!-- Needle & Antenna -->
      <polygon points="296,255 304,255 302,185 298,185" fill="%23393E46"/>
      <polygon points="298,172 302,172 301,60 299,60" fill="%23eeeeee"/>
      <circle cx="300" cy="58" r="4" fill="%23ff2e63" />
      <!-- Night Skyline elements -->
      <rect x="50" y="440" width="70" height="160" fill="%23151b29"/>
      <rect x="140" y="480" width="90" height="120" fill="%23182030"/>
      <rect x="370" y="460" width="85" height="140" fill="%23151b29"/>
      <rect x="475" y="420" width="75" height="180" fill="%23182030"/>
    </svg>`
  },
  {
    id: "clue_rogers_centre",
    answer: "Rogers Centre",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <defs>
        <linearGradient id="domeSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%23102040"/>
          <stop offset="100%" stop-color="%231c3b70"/>
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(%23domeSky)"/>
      <!-- Retractable Dome Structure -->
      <path d="M 100 450 Q 300 150 500 450 Z" fill="%23e0e0e0" stroke="%23333" stroke-width="4"/>
      <!-- Dome Panels -->
      <path d="M 140 450 Q 300 200 460 450 Z" fill="%23cccccc" opacity="0.6"/>
      <path d="M 180 450 Q 300 250 420 450 Z" fill="%23b0b0b0" opacity="0.7"/>
      <!-- Stadium Base -->
      <rect x="80" y="440" width="440" height="90" rx="10" fill="%23334466"/>
      <!-- Blue Jays accent stripe -->
      <rect x="80" y="465" width="440" height="14" fill="%23134a8e"/>
      <circle cx="300" cy="472" r="24" fill="%23e81932"/>
      <circle cx="300" cy="472" r="18" fill="%23ffffff"/>
    </svg>`
  },
  {
    id: "clue_casa_loma",
    answer: "Casa Loma",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <defs>
        <linearGradient id="castleBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%232b3a4a"/>
          <stop offset="100%" stop-color="%23485d73"/>
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(%23castleBg)"/>
      <!-- Castle Turrets & Walls -->
      <polygon points="120,250 160,130 200,250" fill="%23852020"/>
      <rect x="130" y="250" width="60" height="250" fill="%238c8275"/>
      <polygon points="400,220 450,90 500,220" fill="%23852020"/>
      <rect x="415" y="220" width="70" height="280" fill="%238c8275"/>
      <!-- Main Castle Body -->
      <rect x="180" y="270" width="240" height="230" fill="%23a3988b"/>
      <!-- Battlements -->
      <rect x="175" y="255" width="250" height="25" fill="%23736a5f"/>
      <polygon points="260,255 300,160 340,255" fill="%23852020"/>
      <!-- Arched Windows -->
      <rect x="230" y="320" width="30" height="45" rx="15" fill="%23ffd369"/>
      <rect x="340" y="320" width="30" height="45" rx="15" fill="%23ffd369"/>
      <rect x="280" y="420" width="40" height="80" rx="20" fill="%233e2723"/>
    </svg>`
  },
  {
    id: "clue_rom",
    answer: "ROM",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <rect width="600" height="600" fill="%231a1c23"/>
      <!-- Heritage Stone Wing -->
      <rect x="60" y="250" width="200" height="260" fill="%23b89f81"/>
      <!-- Historic Arched Windows -->
      <rect x="90" y="300" width="35" height="60" rx="17" fill="%235c4033"/>
      <rect x="150" y="300" width="35" height="60" rx="17" fill="%235c4033"/>
      <!-- Michael Lee-Chin Crystal (Deconstructivist Prisms) -->
      <polygon points="180,510 320,120 480,310 380,510" fill="%234facfe" opacity="0.8"/>
      <polygon points="320,120 540,240 480,310" fill="%2300f2fe" opacity="0.9"/>
      <polygon points="380,510 480,310 560,460" fill="%232b5876" opacity="0.85"/>
      <polygon points="230,350 360,260 330,440" fill="%23ffffff" opacity="0.3"/>
      <!-- Crystal Facet Lines -->
      <line x1="320" y1="120" x2="380" y2="510" stroke="%23ffffff" stroke-width="4"/>
      <line x1="320" y1="120" x2="480" y2="310" stroke="%231a1c23" stroke-width="3"/>
    </svg>`
  },
  {
    id: "clue_streetcar",
    answer: "TTC Streetcar",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <rect width="600" height="600" fill="%23282c34"/>
      <!-- Street Road -->
      <rect x="0" y="470" width="600" height="130" fill="%231e2125"/>
      <line x1="0" y1="520" x2="600" y2="520" stroke="%23999" stroke-width="6"/>
      <line x1="0" y1="560" x2="600" y2="560" stroke="%23999" stroke-width="6"/>
      <!-- Red TTC Modern Streetcar (Flexity) -->
      <rect x="70" y="240" width="460" height="230" rx="30" fill="%23da291c"/>
      <!-- White roof / upper body -->
      <path d="M 90 240 L 510 240 Q 530 240 530 290 L 70 290 Q 70 240 90 240 Z" fill="%23f4f4f4"/>
      <!-- Black Window Band -->
      <rect x="90" y="295" width="420" height="95" rx="10" fill="%23111111"/>
      <!-- Windows -->
      <rect x="110" y="305" width="65" height="75" rx="5" fill="%2368c5db"/>
      <rect x="195" y="305" width="70" height="75" rx="5" fill="%2368c5db"/>
      <rect x="285" y="305" width="70" height="75" rx="5" fill="%2368c5db"/>
      <rect x="375" y="305" width="70" height="75" rx="5" fill="%2368c5db"/>
      <!-- Headlights & details -->
      <circle cx="510" cy="410" r="16" fill="%23fff275"/>
      <circle cx="90" cy="410" r="16" fill="%23ff3838"/>
      <!-- Pantograph on top -->
      <line x1="260" y1="240" x2="280" y2="180" stroke="%23444" stroke-width="8"/>
      <line x1="280" y1="180" x2="330" y2="180" stroke="%23444" stroke-width="8"/>
    </svg>`
  },
  {
    id: "clue_toronto_sign",
    answer: "Nathan Phillips Square",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <rect width="600" height="600" fill="%230c1427"/>
      <!-- City Hall Towers in Background -->
      <path d="M 120 400 C 120 200, 180 180, 240 160 L 240 450 Z" fill="%232e384d"/>
      <path d="M 480 400 C 480 160, 420 140, 360 120 L 360 450 Z" fill="%2338455e"/>
      <ellipse cx="300" cy="380" rx="50" ry="20" fill="%234f5d75"/>
      <!-- Reflecting Pool -->
      <rect x="40" y="450" width="520" height="110" rx="10" fill="%230f3057"/>
      <!-- Glowing 3D TORONTO Sign -->
      <text x="300" y="440" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="900" text-anchor="middle" fill="%2300ffcc" letter-spacing="8" filter="drop-shadow(0 0 15px %2300ffcc)">TORONTO</text>
      <!-- Maple Leaf -->
      <path d="M 500 420 L 515 400 L 510 415 L 530 410 L 520 425 L 535 435 L 515 435 L 510 445 L 505 435 L 485 435 L 500 425 Z" fill="%23ff2e63"/>
    </svg>`
  },
  {
    id: "clue_raptors",
    answer: "Toronto Raptors",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <rect width="600" height="600" fill="%23000000"/>
      <!-- Circular Badge -->
      <circle cx="300" cy="300" r="230" fill="%23ce1141"/>
      <circle cx="300" cy="300" r="215" fill="%23000000"/>
      <circle cx="300" cy="300" r="200" fill="%23b4975a"/>
      <!-- Basketball with Claw Marks -->
      <circle cx="300" cy="300" r="185" fill="%23ce1141"/>
      <!-- Claw Slash Marks -->
      <path d="M 170 200 Q 250 280 200 420 Q 220 380 270 290 Z" fill="%23ffffff"/>
      <path d="M 270 160 Q 320 280 300 440 Q 330 360 350 240 Z" fill="%23ffffff"/>
      <path d="M 370 190 Q 400 300 400 420 Q 420 340 430 260 Z" fill="%23ffffff"/>
    </svg>`
  },
  {
    id: "clue_beavertails",
    answer: "BeaverTails",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <defs>
        <radialGradient id="pastryGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%23e8a84a"/>
          <stop offset="80%" stop-color="%23b3681b"/>
          <stop offset="100%" stop-color="%23703c05"/>
        </radialGradient>
      </defs>
      <rect width="600" height="600" fill="%231a252c"/>
      <!-- Paper Serving Wrap -->
      <polygon points="150,520 450,520 500,320 100,320" fill="%23f5ebe1" opacity="0.9"/>
      <text x="300" y="470" font-family="'Impact', Arial Black" font-size="34" fill="%23c0392b" text-anchor="middle" font-weight="bold">QUEBEC / TORONTO</text>
      <!-- Beaver Tail Pastry Oval Shaped -->
      <ellipse cx="300" cy="270" rx="210" ry="110" fill="url(%23pastryGlow)" stroke="%235a2e04" stroke-width="6"/>
      <!-- Cinnamon Sugar Texture & Lemon Slice -->
      <ellipse cx="300" cy="270" rx="190" ry="90" fill="none" stroke="%23ffdf9e" stroke-dasharray="8 12" stroke-width="4"/>
      <!-- Lemon Wedge -->
      <path d="M 390 220 A 45 45 0 0 1 450 280 Z" fill="%23ffeb3b" stroke="%23fbc02d" stroke-width="4"/>
    </svg>`
  },
  {
    id: "clue_st_lawrence",
    answer: "St. Lawrence Market",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <rect width="600" height="600" fill="%231f2937"/>
      <!-- Victorian Red Brick Hall -->
      <rect x="80" y="240" width="440" height="260" fill="%239e2a2b"/>
      <!-- Mansard / Gabled Roof with pediment -->
      <polygon points="60,240 300,120 540,240" fill="%23335c67"/>
      <!-- Central Round Window Clock -->
      <circle cx="300" cy="200" r="38" fill="%23fff3b0" stroke="%23335c67" stroke-width="6"/>
      <line x1="300" y1="200" x2="300" y2="175" stroke="%23333" stroke-width="4"/>
      <line x1="300" y1="200" x2="315" y2="200" stroke="%23333" stroke-width="4"/>
      <!-- Brick Arch Entrance & Windows -->
      <rect x="120" y="320" width="55" height="120" rx="25" fill="%23fff3b0"/>
      <rect x="230" y="300" width="140" height="200" rx="70" fill="%23540b0e"/>
      <rect x="425" y="320" width="55" height="120" rx="25" fill="%23fff3b0"/>
      <text x="300" y="275" font-family="Arial" font-size="20" font-weight="bold" fill="%23fff3b0" text-anchor="middle">ST. LAWRENCE</text>
    </svg>`
  },
  {
    id: "clue_maple_leafs",
    answer: "Toronto Maple Leafs",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <rect width="600" height="600" fill="%2300205b"/>
      <!-- Stylized Hockey Maple Leaf Silhouette -->
      <g transform="translate(300,310) scale(1.4)">
        <path d="M 0,-150 L 15,-105 L 45,-120 L 35,-85 L 75,-85 L 60,-55 L 110,-45 L 85,-15 L 125,10 L 85,25 L 105,60 L 65,55 L 70,85 L 35,75 L 30,110 L 10,100 L 5,140 L -5,140 L -10,100 L -30,110 L -35,75 L -70,85 L -65,55 L -105,60 L -85,25 L -125,10 L -85,-15 L -110,-45 L -60,-55 L -75,-85 L -35,-85 L -45,-120 L -15,-105 Z" fill="%23ffffff"/>
      </g>
      <!-- Leaf Blue Inner Detail -->
      <g transform="translate(300,310) scale(1.25)">
        <path d="M 0,-150 L 15,-105 L 45,-120 L 35,-85 L 75,-85 L 60,-55 L 110,-45 L 85,-15 L 125,10 L 85,25 L 105,60 L 65,55 L 70,85 L 35,75 L 30,110 L 10,100 L 5,140 L -5,140 L -10,100 L -30,110 L -35,75 L -70,85 L -65,55 L -105,60 L -85,25 L -125,10 L -85,-15 L -110,-45 L -60,-55 L -75,-85 L -35,-85 L -45,-120 L -15,-105 Z" fill="%2300205b"/>
      </g>
      <text x="300" y="295" font-family="'Arial Black', Impact" font-size="28" fill="%23ffffff" text-anchor="middle">TORONTO</text>
      <text x="300" y="335" font-family="'Arial Black', Impact" font-size="22" fill="%23ffffff" text-anchor="middle">MAPLE LEAFS</text>
    </svg>`
  }
];

if (typeof window !== 'undefined') {
  window.TORONTO_STARTER_PACK = TORONTO_STARTER_PACK;
} else if (typeof global !== 'undefined') {
  global.TORONTO_STARTER_PACK = TORONTO_STARTER_PACK;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TORONTO_STARTER_PACK;
}

