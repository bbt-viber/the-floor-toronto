// Ice Cream Flavours Game Pack - Progressive from Common to Obscure
const GAME_ICE_CREAM = {
  id: "ice-cream-flavours",
  title: "Ice Cream Flavours",
  description: "Identify the flavour from the visual clue! Progresses from parlor classics to rare and obscure gourmet creations.",
  category: "Food & Treats",
  difficulty: "Progressive (Easy → Obscure)",
  cluesCount: 20,
  defaultTimer: 45,
  bannerColor: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 50%, #7afcff 100%)",
  clues: [
    // 1. Easy: Vanilla
    {
      id: "ice_1_vanilla",
      answer: "Vanilla",
      difficulty: "Very Easy",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%23242038"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="260" y1="320" x2="350" y2="440" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="340" y1="320" x2="250" y2="440" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Vanilla Scoop (Creamy ivory with black bean specks) -->
        <circle cx="300" cy="270" r="115" fill="%23fffdf0"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%23fffbee"/>
        <!-- Real vanilla bean pod & orchid flower -->
        <path d="M 170 330 Q 150 200 240 180" stroke="%232b1700" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M 180 340 Q 160 210 250 190" stroke="%233a2000" stroke-width="7" stroke-linecap="round" fill="none"/>
        <!-- Vanilla bean black flecks -->
        <circle cx="280" cy="240" r="2.5" fill="%232b1700"/>
        <circle cx="310" cy="230" r="2" fill="%232b1700"/>
        <circle cx="325" cy="265" r="3" fill="%232b1700"/>
        <circle cx="265" cy="275" r="2" fill="%232b1700"/>
        <circle cx="295" cy="285" r="2.5" fill="%232b1700"/>
        <circle cx="340" cy="240" r="2" fill="%232b1700"/>
      </svg>`
    },
    // 2. Easy: Chocolate
    {
      id: "ice_2_chocolate",
      answer: "Chocolate",
      difficulty: "Very Easy",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%231a1514"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Rich Chocolate Scoop -->
        <circle cx="300" cy="270" r="115" fill="%234a2c1b"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%23381e10"/>
        <!-- Chocolate syrup drip and curls -->
        <path d="M 230 240 Q 240 280 250 310 Q 270 260 290 320 Q 320 250 350 315" stroke="%23211107" stroke-width="12" fill="none" stroke-linecap="round"/>
        <!-- Shaved Dark Chocolate Bar Curls -->
        <rect x="330" y="180" width="45" height="55" rx="5" fill="%232d1509" transform="rotate(25 330 180)"/>
        <rect x="338" y="186" width="30" height="42" rx="3" fill="%231a0b04" transform="rotate(25 330 180)"/>
      </svg>`
    },
    // 3. Easy: Strawberry
    {
      id: "ice_3_strawberry",
      answer: "Strawberry",
      difficulty: "Very Easy",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%232b1e28"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Pink Strawberry Scoop -->
        <circle cx="300" cy="270" r="115" fill="%23ff94b2"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%23f77f9e"/>
        <!-- Real Strawberry Berry on top -->
        <path d="M 270 170 C 250 190, 260 230, 300 240 C 340 230, 350 190, 330 170 C 315 155, 285 155, 270 170 Z" fill="%23e63946"/>
        <!-- Strawberry seeds -->
        <circle cx="285" cy="185" r="2" fill="%23ffe66d"/>
        <circle cx="315" cy="185" r="2" fill="%23ffe66d"/>
        <circle cx="300" cy="205" r="2" fill="%23ffe66d"/>
        <circle cx="290" cy="220" r="2" fill="%23ffe66d"/>
        <circle cx="310" cy="220" r="2" fill="%23ffe66d"/>
        <!-- Green leaf crown -->
        <polygon points="300,165 285,150 295,160 270,160 290,168 300,165 310,168 330,160 305,160 315,150" fill="%2352b788"/>
      </svg>`
    },
    // 4. Easy: Mint Chocolate Chip
    {
      id: "ice_4_mint_chip",
      answer: "Mint Chocolate Chip",
      difficulty: "Easy",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%23132a26"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Pastel Mint Green Scoop -->
        <circle cx="300" cy="270" r="115" fill="%2384e3c3"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%2368cfae"/>
        <!-- Fresh mint leaf garnish -->
        <path d="M 300 170 Q 330 140 340 180 Q 320 190 300 170 Z" fill="%232d6a4f"/>
        <path d="M 300 170 Q 270 150 260 185 Q 285 190 300 170 Z" fill="%2340916c"/>
        <!-- Dark Chocolate Chips embedded -->
        <polygon points="240,240 252,246 244,258 234,250" fill="%232b1700"/>
        <polygon points="320,220 335,225 328,240 315,232" fill="%232b1700"/>
        <polygon points="280,260 295,268 288,280 274,272" fill="%232b1700"/>
        <polygon points="340,270 354,276 348,290 335,282" fill="%232b1700"/>
        <polygon points="255,295 268,300 260,314 248,306" fill="%232b1700"/>
        <polygon points="310,300 324,306 317,320 304,312" fill="%232b1700"/>
      </svg>`
    },
    // 5. Easy: Cookies and Cream
    {
      id: "ice_5_cookies_cream",
      answer: "Cookies and Cream",
      difficulty: "Easy",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%231e232a"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Cream Scoop -->
        <circle cx="300" cy="270" r="115" fill="%23f4f1de"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%23e8e4cf"/>
        <!-- Half Oreo / Dark Sandwich Cookie on Top -->
        <path d="M 240 180 A 60 60 0 0 1 360 180 Z" fill="%231b1b1b" stroke="%233d3d3d" stroke-width="3"/>
        <rect x="250" y="176" width="100" height="6" fill="%23ffffff"/>
        <!-- Crumbled black cookie chunks & crumbs throughout -->
        <rect x="240" y="230" width="22" height="18" rx="4" fill="%231b1b1b" transform="rotate(15 240 230)"/>
        <rect x="310" y="240" width="28" height="20" rx="5" fill="%231b1b1b" transform="rotate(-20 310 240)"/>
        <rect x="270" y="275" width="24" height="16" rx="4" fill="%231b1b1b" transform="rotate(35 270 275)"/>
        <rect x="330" y="280" width="20" height="16" rx="4" fill="%231b1b1b" transform="rotate(10 330 280)"/>
        <circle cx="280" cy="235" r="4" fill="%231b1b1b"/>
        <circle cx="340" cy="230" r="3" fill="%231b1b1b"/>
        <circle cx="260" cy="310" r="3.5" fill="%231b1b1b"/>
        <circle cx="305" cy="315" r="4" fill="%231b1b1b"/>
      </svg>`
    },
    // 6. Medium: Pistachio
    {
      id: "ice_6_pistachio",
      answer: "Pistachio",
      difficulty: "Medium",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%231c2621"/>
        <!-- Glass bowl -->
        <path d="M 170 340 Q 300 480 430 340 Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="4"/>
        <line x1="300" y1="430" x2="300" y2="520" stroke="rgba(255,255,255,0.4)" stroke-width="12"/>
        <ellipse cx="300" cy="520" rx="70" ry="14" fill="rgba(255,255,255,0.2)"/>
        <!-- Pale Olive Pistachio Scoop -->
        <circle cx="300" cy="280" r="115" fill="%23b8d8a0"/>
        <ellipse cx="300" cy="340" rx="125" ry="30" fill="%23a4c88a"/>
        <!-- Crushed Roasted Green Pistachio Kernels -->
        <ellipse cx="270" cy="240" rx="14" ry="9" fill="%23709752" transform="rotate(25 270 240)"/>
        <ellipse cx="330" cy="250" rx="12" ry="8" fill="%23608544" transform="rotate(-30 330 250)"/>
        <ellipse cx="300" cy="290" rx="15" ry="9" fill="%23709752" transform="rotate(10 300 290)"/>
        <!-- Pistachio nutshell on side -->
        <path d="M 370 220 Q 405 200 400 240 Q 365 240 370 220 Z" fill="%23c2a688" stroke="%239e8063" stroke-width="3"/>
        <ellipse cx="385" cy="225" rx="8" ry="12" fill="%23608544" transform="rotate(35 385 225)"/>
      </svg>`
    },
    // 7. Medium: Neapolitan
    {
      id: "ice_7_neapolitan",
      answer: "Neapolitan",
      difficulty: "Medium",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%23221c24"/>
        <!-- Oval serving dish -->
        <ellipse cx="300" cy="440" rx="220" ry="60" fill="%233a3340"/>
        <ellipse cx="300" cy="430" rx="200" ry="45" fill="%23f8f9fa"/>
        <!-- Distinct Tri-color 3 Scoops: Chocolate, Vanilla, Strawberry -->
        <!-- 1. Chocolate (Left) -->
        <circle cx="210" cy="320" r="80" fill="%234a2c1b"/>
        <!-- 2. Vanilla (Center) -->
        <circle cx="300" cy="310" r="85" fill="%23fffbee"/>
        <!-- 3. Strawberry (Right) -->
        <circle cx="390" cy="320" r="80" fill="%23ff94b2"/>
        <text x="300" y="530" font-family="'Arial Black'" font-size="24" fill="%23ffd369" text-anchor="middle" letter-spacing="4">TRIO COLOUR</text>
      </svg>`
    },
    // 8. Medium: Butter Pecan
    {
      id: "ice_8_butter_pecan",
      answer: "Butter Pecan",
      difficulty: "Medium",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%23261c14"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Buttery Golden Tan Scoop -->
        <circle cx="300" cy="270" r="115" fill="%23f3d5a3"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%23e3be85"/>
        <!-- Whole roasted pecans with characteristic ridges -->
        <g transform="translate(260,230) rotate(-20)">
          <ellipse cx="0" cy="0" rx="26" ry="16" fill="%2378350f" stroke="%23451a03" stroke-width="3"/>
          <line x1="-22" y1="0" x2="22" y2="0" stroke="%23451a03" stroke-width="3"/>
          <line x1="-10" y1="-10" x2="-10" y2="10" stroke="%23451a03" stroke-width="2"/>
          <line x1="10" y1="-10" x2="10" y2="10" stroke="%23451a03" stroke-width="2"/>
        </g>
        <g transform="translate(340,250) rotate(35)">
          <ellipse cx="0" cy="0" rx="24" ry="15" fill="%2378350f" stroke="%23451a03" stroke-width="3"/>
          <line x1="-20" y1="0" x2="20" y2="0" stroke="%23451a03" stroke-width="3"/>
        </g>
        <g transform="translate(290,295) rotate(5)">
          <ellipse cx="0" cy="0" rx="25" ry="15" fill="%2378350f" stroke="%23451a03" stroke-width="3"/>
          <line x1="-21" y1="0" x2="21" y2="0" stroke="%23451a03" stroke-width="3"/>
        </g>
      </svg>`
    },
    // 9. Medium: Rocky Road
    {
      id: "ice_9_rocky_road",
      answer: "Rocky Road",
      difficulty: "Medium",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%231a1412"/>
        <!-- Waffle Bowl -->
        <path d="M 170 340 Q 300 460 430 340 Z" fill="%23d4a373"/>
        <!-- Chocolate Scoop -->
        <circle cx="300" cy="270" r="115" fill="%23503220"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%233e2415"/>
        <!-- Puffy White Mini Marshmallows -->
        <rect x="250" y="220" width="28" height="20" rx="7" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2" transform="rotate(15 250 220)"/>
        <rect x="320" y="235" width="26" height="19" rx="7" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2" transform="rotate(-25 320 235)"/>
        <rect x="280" y="280" width="28" height="20" rx="7" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2" transform="rotate(10 280 280)"/>
        <!-- Sliced Roasted Almonds -->
        <ellipse cx="300" cy="225" rx="16" ry="9" fill="%23d6a265" stroke="%238a5323" stroke-width="2" transform="rotate(40 300 225)"/>
        <ellipse cx="345" cy="285" rx="15" ry="8" fill="%23d6a265" stroke="%238a5323" stroke-width="2" transform="rotate(-30 345 285)"/>
        <ellipse cx="235" cy="270" rx="15" ry="8" fill="%23d6a265" stroke="%238a5323" stroke-width="2" transform="rotate(20 235 270)"/>
      </svg>`
    },
    // 10. Medium: Mango
    {
      id: "ice_10_mango",
      answer: "Mango",
      difficulty: "Medium",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%231a2228"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Vibrant Orange-Gold Tropical Mango Scoop -->
        <circle cx="300" cy="270" r="115" fill="%23ff9f1c"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%23f77f00"/>
        <!-- Fresh Mango Slice on side (Hedgehog cut cube pattern) -->
        <g transform="translate(340, 160) rotate(15)">
          <path d="M 0 0 C 40 -15, 80 10, 70 50 C 50 80, 0 60, 0 0 Z" fill="%23ffba08" stroke="%23e85d04" stroke-width="3"/>
          <line x1="20" y1="5" x2="35" y2="60" stroke="%23e85d04" stroke-width="3"/>
          <line x1="45" y1="10" x2="55" y2="55" stroke="%23e85d04" stroke-width="3"/>
          <line x1="10" y1="30" x2="65" y2="25" stroke="%23e85d04" stroke-width="3"/>
        </g>
      </svg>`
    },
    // 11. Hard: Salted Caramel
    {
      id: "ice_11_salted_caramel",
      answer: "Salted Caramel",
      difficulty: "Hard",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%23221915"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Warm Caramel Tan Scoop -->
        <circle cx="300" cy="270" r="115" fill="%23e0a96d"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%23cb8b47"/>
        <!-- Glossy Deep Golden Amber Caramel Drizzle -->
        <path d="M 230 220 Q 250 310 270 240 Q 300 330 330 230 Q 355 310 370 250" stroke="%239c4a0c" stroke-width="16" fill="none" stroke-linecap="round"/>
        <!-- Coarse Flaky Square White Sea Salt Crystals -->
        <rect x="250" y="240" width="10" height="10" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1" transform="rotate(20 250 240)"/>
        <rect x="285" y="260" width="9" height="9" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1" transform="rotate(-15 285 260)"/>
        <rect x="325" y="245" width="11" height="11" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1" transform="rotate(35 325 245)"/>
        <rect x="300" y="295" width="8" height="8" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1" transform="rotate(10 300 295)"/>
      </svg>`
    },
    // 12. Hard: Matcha
    {
      id: "ice_12_matcha",
      answer: "Matcha",
      difficulty: "Hard",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%231a261c"/>
        <!-- Ceramic Japanese Chawan Bowl -->
        <path d="M 160 330 Q 300 480 440 330 Z" fill="%232d3748" stroke="%234a5568" stroke-width="6"/>
        <!-- Deep Earthy Jade Green Matcha Scoop -->
        <circle cx="300" cy="270" r="115" fill="%23608038"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%234d692b"/>
        <!-- Fine Green Tea Powder Dusting -->
        <circle cx="280" cy="230" r="12" fill="%237ca34b" opacity="0.6"/>
        <circle cx="320" cy="240" r="15" fill="%237ca34b" opacity="0.6"/>
        <circle cx="295" cy="275" r="18" fill="%237ca34b" opacity="0.5"/>
        <!-- Bamboo Chasen Whisk on side -->
        <path d="M 390 190 L 440 140 L 455 155 L 405 205 Z" fill="%23d4a373"/>
        <path d="M 390 190 Q 360 210 375 235 L 405 205 Z" fill="%23e9c46a"/>
      </svg>`
    },
    // 13. Hard: Ube
    {
      id: "ice_13_ube",
      answer: "Ube",
      difficulty: "Hard",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%231e1528"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Stunning Royal Purple / Violet Filipino Yam Scoop -->
        <circle cx="300" cy="270" r="115" fill="%237b2cbf"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%235a189a"/>
        <!-- Purple Yam highlights & coconut string garnish -->
        <path d="M 240 250 Q 280 200 350 240" stroke="%239d4edd" stroke-width="10" stroke-linecap="round" fill="none"/>
        <!-- White toasted macapuno / coconut flakes -->
        <rect x="270" y="230" width="16" height="4" rx="2" fill="%23ffffff" transform="rotate(25 270 230)"/>
        <rect x="320" y="240" width="18" height="4" rx="2" fill="%23ffffff" transform="rotate(-35 320 240)"/>
        <rect x="290" y="280" width="15" height="4" rx="2" fill="%23ffffff" transform="rotate(15 290 280)"/>
        <rect x="335" y="275" width="14" height="4" rx="2" fill="%23ffffff" transform="rotate(-10 335 275)"/>
      </svg>`
    },
    // 14. Hard (Canadian Classic!): Tiger Tail
    {
      id: "ice_14_tiger_tail",
      answer: "Tiger Tail",
      difficulty: "Hard",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%231e2124"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Distinctive Bright Orange Ice Cream Base -->
        <circle cx="300" cy="270" r="115" fill="%23ff7900"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%23e06100"/>
        <!-- Jet Black Licorice Swirl Ribbons (Iconic Tiger Stripes) -->
        <path d="M 205 280 Q 260 250 310 290 Q 360 250 395 280" stroke="%23111111" stroke-width="18" fill="none" stroke-linecap="round"/>
        <path d="M 225 220 Q 280 190 340 230 Q 370 210 380 230" stroke="%23111111" stroke-width="16" fill="none" stroke-linecap="round"/>
        <path d="M 250 315 Q 300 295 350 320" stroke="%23111111" stroke-width="14" fill="none" stroke-linecap="round"/>
        <text x="300" y="530" font-family="'Arial Black'" font-size="20" fill="%23ff7900" text-anchor="middle" letter-spacing="3">CANADIAN ICON</text>
      </svg>`
    },
    // 15. Hard: Rum Raisin
    {
      id: "ice_15_rum_raisin",
      answer: "Rum Raisin",
      difficulty: "Hard",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%23241b18"/>
        <!-- Dessert Cup -->
        <path d="M 170 330 Q 300 460 430 330 Z" fill="%234a3b32" stroke="%23735747" stroke-width="4"/>
        <!-- Spiced Rum Amber-Cream Scoop -->
        <circle cx="300" cy="270" r="115" fill="%23edd8b9"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%23d6bd96"/>
        <!-- Plump Wrinkled Dark Rum-Soaked Raisins -->
        <ellipse cx="260" cy="235" rx="16" ry="12" fill="%23381622" stroke="%23220c14" stroke-width="2" transform="rotate(-15 260 235)"/>
        <ellipse cx="330" cy="245" rx="17" ry="13" fill="%23381622" stroke="%23220c14" stroke-width="2" transform="rotate(25 330 245)"/>
        <ellipse cx="290" cy="285" rx="18" ry="13" fill="%23381622" stroke="%23220c14" stroke-width="2" transform="rotate(-5 290 285)"/>
        <ellipse cx="350" cy="295" rx="15" ry="11" fill="%23381622" stroke="%23220c14" stroke-width="2" transform="rotate(35 350 295)"/>
        <!-- Amber rum splash bottle accent -->
        <rect x="380" y="150" width="22" height="40" rx="4" fill="%23c96a24" transform="rotate(25 380 150)"/>
        <rect x="386" y="140" width="10" height="15" fill="%238a410b" transform="rotate(25 386 140)"/>
      </svg>`
    },
    // 16. Obscure: Cotton Candy
    {
      id: "ice_16_cotton_candy",
      answer: "Cotton Candy",
      difficulty: "Hard",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%23192338"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Bright Sky Blue & Electric Pink Swirled Scoop -->
        <circle cx="300" cy="270" r="115" fill="%234cc9f0"/>
        <!-- Pink Carnival Swirls -->
        <path d="M 220 230 Q 300 200 340 270 Q 280 320 240 290" fill="%23f72585"/>
        <path d="M 310 220 Q 370 240 380 300 Q 340 310 320 260" fill="%23f72585"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%234361ee" opacity="0.6"/>
        <!-- Spun Sugar cloud puff on top -->
        <circle cx="280" cy="180" r="28" fill="%23f72585" opacity="0.4"/>
        <circle cx="320" cy="175" r="32" fill="%234cc9f0" opacity="0.5"/>
        <circle cx="300" cy="160" r="25" fill="%23ffffff" opacity="0.6"/>
      </svg>`
    },
    // 17. Obscure: Lavender Honey
    {
      id: "ice_17_lavender_honey",
      answer: "Lavender Honey",
      difficulty: "Obscure",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%23231f2d"/>
        <!-- Waffle Cone -->
        <polygon points="210,320 390,320 300,560" fill="%23d4a373"/>
        <line x1="230" y1="320" x2="330" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <line x1="370" y1="320" x2="270" y2="480" stroke="%23bc6c25" stroke-width="3"/>
        <!-- Delicate Floral Pastel Lilac / Violet Scoop -->
        <circle cx="300" cy="270" r="115" fill="%23c8b6ff"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%23b8a2f8"/>
        <!-- Golden Honey Drizzle Drip -->
        <path d="M 250 200 Q 260 270 280 250 Q 300 320 320 260 Q 340 300 360 240" stroke="%23ffb703" stroke-width="14" fill="none" stroke-linecap="round"/>
        <!-- Purple Lavender flower sprig -->
        <line x1="350" y1="230" x2="410" y2="140" stroke="%23588157" stroke-width="4"/>
        <circle cx="380" cy="180" r="6" fill="%237209b7"/>
        <circle cx="395" cy="160" r="6" fill="%237209b7"/>
        <circle cx="410" cy="140" r="6" fill="%237209b7"/>
        <circle cx="370" cy="195" r="5" fill="%239d4edd"/>
      </svg>`
    },
    // 18. Obscure: Black Sesame
    {
      id: "ice_18_black_sesame",
      answer: "Black Sesame",
      difficulty: "Obscure",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%2315181c"/>
        <!-- Minimalist Japanese Black Stoneware Bowl -->
        <ellipse cx="300" cy="420" rx="160" ry="40" fill="%230f1115"/>
        <path d="M 180 340 Q 300 450 420 340 Z" fill="%231a1e24" stroke="%232c323d" stroke-width="4"/>
        <!-- Deep Charcoal Grey Scoop -->
        <circle cx="300" cy="270" r="115" fill="%23495057"/>
        <ellipse cx="300" cy="325" rx="125" ry="30" fill="%23343a40"/>
        <!-- Sprinkled Shiny Toasted Black Sesame Seeds -->
        <ellipse cx="260" cy="230" rx="5" ry="8" fill="%23111111" stroke="%23222" stroke-width="1" transform="rotate(30 260 230)"/>
        <ellipse cx="320" cy="225" rx="5" ry="8" fill="%23111111" stroke="%23222" stroke-width="1" transform="rotate(-20 320 225)"/>
        <ellipse cx="285" cy="255" rx="5" ry="8" fill="%23111111" stroke="%23222" stroke-width="1" transform="rotate(45 285 255)"/>
        <ellipse cx="335" cy="260" rx="5" ry="8" fill="%23111111" stroke="%23222" stroke-width="1" transform="rotate(-40 335 260)"/>
        <ellipse cx="265" cy="285" rx="5" ry="8" fill="%23111111" stroke="%23222" stroke-width="1" transform="rotate(15 265 285)"/>
        <ellipse cx="310" cy="295" rx="5" ry="8" fill="%23111111" stroke="%23222" stroke-width="1" transform="rotate(-10 310 295)"/>
        <!-- Sesame paste swirl -->
        <path d="M 235 260 Q 290 280 355 240" stroke="%23212529" stroke-width="12" fill="none" stroke-linecap="round"/>
      </svg>`
    },
    // 19. Obscure: Durian
    {
      id: "ice_19_durian",
      answer: "Durian",
      difficulty: "Very Obscure",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%2322261a"/>
        <!-- Waffle Bowl -->
        <path d="M 180 340 Q 300 460 420 340 Z" fill="%23d4a373"/>
        <!-- Custard Yellow Durian Scoop -->
        <circle cx="270" cy="270" r="105" fill="%23ffeaa7"/>
        <ellipse cx="270" cy="325" rx="115" ry="28" fill="%23fdcb6e"/>
        <!-- The King of Fruits: Spiky Green/Brown Durian Pod beside it -->
        <g transform="translate(390, 240)">
          <ellipse cx="0" cy="0" rx="70" ry="90" fill="%23606c38" stroke="%23283618" stroke-width="4"/>
          <!-- Sharp exterior spikes -->
          <polygon points="-70,0 -85,-10 -65,-20" fill="%23283618"/>
          <polygon points="-65,-40 -80,-55 -55,-60" fill="%23283618"/>
          <polygon points="-40,-75 -45,-95 -25,-85" fill="%23283618"/>
          <polygon points="0,-90 0,-108 20,-90" fill="%23283618"/>
          <polygon points="40,-75 60,-90 45,-60" fill="%23283618"/>
          <polygon points="65,-40 85,-45 65,-20" fill="%23283618"/>
          <polygon points="70,0 88,10 68,20" fill="%23283618"/>
          <polygon points="60,40 80,55 55,60" fill="%23283618"/>
          <!-- Creamy yellow fruit pod inside cut section -->
          <ellipse cx="-15" cy="5" rx="35" ry="50" fill="%23fdcb6e"/>
        </g>
        <text x="300" y="530" font-family="'Arial Black'" font-size="18" fill="%23fdcb6e" text-anchor="middle" letter-spacing="3">KING OF FRUITS</text>
      </svg>`
    },
    // 20. Extreme / Obscure: Wasabi
    {
      id: "ice_20_wasabi",
      answer: "Wasabi",
      difficulty: "Very Obscure",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="%231a241b"/>
        <!-- Black Lacquered Japanese Sushi Board -->
        <rect x="100" y="420" width="400" height="40" rx="6" fill="%23141414" stroke="%23333333" stroke-width="3"/>
        <rect x="130" y="460" width="40" height="40" fill="%23141414"/>
        <rect x="430" y="460" width="40" height="40" fill="%23141414"/>
        <!-- Pale Wasabi Lime-Green Scoop -->
        <circle cx="270" cy="280" r="110" fill="%23a7c957"/>
        <ellipse cx="270" cy="335" rx="120" ry="28" fill="%236a994e"/>
        <!-- Pickled Pink Sushi Ginger (Gari) Rosette beside it -->
        <path d="M 400 320 C 370 290, 430 260, 440 300 C 460 270, 480 320, 450 340 Z" fill="%23ffafcc" stroke="%23ff8fab" stroke-width="3"/>
        <!-- Fresh green wasabi root (grated) & Bamboo Chopsticks -->
        <line x1="160" y1="200" x2="440" y2="390" stroke="%23bc6c25" stroke-width="7" stroke-linecap="round"/>
        <line x1="180" y1="190" x2="455" y2="375" stroke="%23dda15e" stroke-width="7" stroke-linecap="round"/>
        <text x="300" y="540" font-family="'Arial Black'" font-size="20" fill="%23a7c957" text-anchor="middle" letter-spacing="4">SPICY CONDIMENT</text>
      </svg>`
    }
  ]
};

if (typeof window !== 'undefined') {
  window.GAME_ICE_CREAM = GAME_ICE_CREAM;
} else if (typeof global !== 'undefined') {
  global.GAME_ICE_CREAM = GAME_ICE_CREAM;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME_ICE_CREAM;
}

