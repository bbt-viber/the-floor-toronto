# 🍁 The Floor Toronto

A web application based on the hit game show **The Floor**, built for high-stakes 1v1 visual identification duels. Two players face off with chess-style countdown clocks, taking turns identifying visual prompts as fast as possible. Whoever runs out of time first loses!

---

## 🚀 Quick Start (Local Run)

The application is completely self-contained with **zero external dependencies** and runs locally right out of the box.

### Option 1: 1-Click Launch (Windows)
Double-click `start.bat` in the project folder.

### Option 2: Run via Built-in Server
Open PowerShell or your terminal in this directory:
```bash
agy-node server.js
# or: node server.js
```
- **Local Screen:** `http://localhost:3000`
- **Friends / Mobile on the same Wi-Fi:** `http://<your-lan-ip>:3000` (printed in the terminal)

### Option 3: Direct Browser Launch
Simply double-click `index.html` to open it in Chrome, Edge, Safari, or Firefox.

---

## 🎮 Host Keyboard Controls

As the host, you control the pace of the duel using standard keyboard shortcuts:

| Key | Action | Behavior |
| :--- | :--- | :--- |
| **`Space`** | **Start / Correct** | **First press:** Starts the duel timer for Player 1.<br>**During duel:** Records correct answer, stops active player's clock, immediately passes turn to the opponent, and loads the next clue. |
| **`Tab`** | **Pass** | Passes the current prompt with a 3-second clock penalty (configurable), keeps the turn with the active player, and serves a new visual prompt. *(Browser tab-navigation is intercepted).* |
| **`Esc`** | **Pause / Resume** | Pauses the active clock and dims the display; resumes on press. |
| **`R`** | **Reset Round** | Resets both player timers back to the starting duration (e.g. 45s) and restarts the clue sequence. |

> **Host Answer Peek:** On the single-screen display, the correct answer is displayed subtly under the clue screen with a hover/click reveal toggle, allowing the host to verify answers at a glance without players seeing it from across the room.

---

## 📚 Game Library & Category Index

Click **📚 Game Library** in the navigation bar (or **⇄ Change Game** on the arena screen) to browse and select any game category:

1. **🌍 Countries (Cultural Stereotypes & National Icons)**
   - 12 photorealistic cultural prompts stored in [`countries/`](countries) where the file name matches the answer:
     - **France** (`France.jpg`): French baguette, wool beret, croissant & café coffee on a Parisian bistro table.
     - **Canada** (`Canada.jpg`): Pure amber maple syrup bottle, red-and-black lumberjack flannel jacket, snowshoes & pine cones.
     - **Japan** (`Japan.jpg`): Sushi and sashimi wooden platter, cherry blossoms (sakura), ceramic sake carafe & chopsticks.
     - **Italy** (`Italy.jpg`): Wood-fired Neapolitan pizza, Parmigiano Reggiano wedge, extra virgin olive oil & moka espresso pot.
     - **Mexico** (`Mexico.jpg`): Embroidered sombrero, vibrant serape blanket, street tacos with lime wedges & maracas.
     - **Germany** (`Germany.jpg`): Bavarian lederhosen, giant salted soft pretzel & frothy ceramic beer stein.
     - **United Kingdom** (`United Kingdom.jpg`): Steaming English tea, bowler hat, red telephone box & red double-decker bus.
     - **United States** (`United States.jpg`): Juicy cheeseburger with fries, vintage baseball glove & warm apple pie.
     - **Brazil** (`Brazil.jpg`): Rio Carnival feather headdress, yellow & green #10 soccer jersey & ball on Copacabana beach.
     - **Switzerland** (`Switzerland.jpg`): Open Swiss Army pocket knife, Emmental cheese wedge, Alpine cowbell & chocolate.
     - **Australia** (`Australia.jpg`): Bushman cork hat, wooden boomerang on red outback sand & Vegemite on toast.
     - **India** (`India.jpg`): Brass bowls of colorful spices (turmeric, chili, cardamom), masala chai & marigold garland.
2. **🍦 Ice Cream Flavours (Progressive: Easy → Obscure)**
   - 20 progressive visual identification clues. Starts with universal classics and ramps up into rare gourmet and international treats:
     - **Round 1–5 (Very Easy / Easy):** Vanilla, Chocolate, Strawberry, Mint Chocolate Chip, Cookies and Cream
     - **Round 6–10 (Medium / Parlor Staples):** Pistachio, Neapolitan, Butter Pecan, Rocky Road, Mango
     - **Round 11–15 (Hard / Specialty):** Salted Caramel, Matcha, Ube (Purple Yam), Tiger Tail (Canadian Orange & Licorice), Rum Raisin
     - **Round 16–20 (Obscure / Gourmet):** Cotton Candy, Lavender Honey, Black Sesame, Durian (King of Fruits), Wasabi
3. **🍁 Landmarks of Toronto (Mixed Classics)**
   - 10 iconic Toronto landmarks & cultural staples: CN Tower, Rogers Centre, Casa Loma, Royal Ontario Museum, TTC Streetcar, Nathan Phillips Square, Raptors, BeaverTails, St. Lawrence Market, Maple Leafs.
4. **➕ Custom Pack Builder**
   - Upload custom JPEG/PNG prompts, configure answers, and save your own categories.

---

## 🤖 Category Agent

The project includes a dedicated **Category Agent** (`category-agent`) trained to invent, propose, and compile complete 45-prompt categories for *The Floor*:

- **Novelty Guaranteed:** Analyzes existing game categories to propose fresh, unplayed duel topics.
- **Difficulty & Obscurity Tuning:** Accepts user direction to make visual clues easier or more obscure.
- **The 45-Prompt Proposal Table:** Always drafts a complete table of 45 clues with descriptions, answers, and difficulty tiers for user approval first.
- **Automatic Packaging:** Once approved, creates the local folder `categories/[category_name]/`, generates or downloads photorealistic images named after the prompt answers (`[Answer].jpg`), and registers the pack into the game manifest.
*(See [`.agents/category-agent.md`](.agents/category-agent.md) for full agent specifications).*

---

## 🖼️ Uploading Visual Prompts & Game Data

Click **⚙️ Setup & Prompts** in the navigation bar to configure games:

1. **Game Details:** Set the Category Title (e.g., *Landmarks of Toronto*, *Toronto Sports*, *World Cuisines*), Player 1 name, Player 2 name, and Starting Timer (15s to 90s, default 45s).
2. **Pass Rules:** Choose between 3-Second Penalty (TV show standard), Instant New Clue (0s penalty), or Heavy Penalty (5s).
3. **Upload JPEGs:** Drag and drop JPEG/PNG images directly into the dropzone.
   - **Smart Autofill:** Filenames automatically generate the expected answer (e.g. `01_CN-Tower.jpeg` auto-populates as `"CN Tower"`).
   - **Inline Editing:** Type or tweak the expected answer string right next to the thumbnail.
4. **Starter Pack:** Click **Load Toronto Starter Pack** at any time to restore the built-in Toronto landmarks pack (CN Tower, Rogers Centre, Casa Loma, Royal Ontario Museum, TTC Streetcar, Nathan Phillips Square, Raptors, BeaverTails, St. Lawrence Market, Maple Leafs).
5. **Export & Import (.json):** Save entire games (including images and answers) into a portable `.json` file to trade packs or load them later without re-uploading.

---

## 📺 Single-Screen vs. Dual-Screen Mode

- **Single-Screen Mode (Option A):** All players, the host, and friends look at the same screen (e.g. laptop hooked to a TV). Host can use the keyboard shortcuts or tap the on-screen buttons.
- **Dual-Screen Mode (Option B Ready):** Click **📺 Dual-Screen** in the top bar to pop open `arena.html`. Drag that window to your TV or secondary monitor. It displays an audience view (no answers, no host buttons), which synchronizes with the host's laptop in real time with 0ms latency using browser-native `BroadcastChannel`.

---

---

## 📱 Wireless Mobile Host Remote & QR Code

The web app is partitioned into two synchronized views connected in real-time over WebSockets / Server-Sent Events (SSE):

1. **Player View (`index.html`)**:
   - The main display intended for the TV, projector, or big laptop screen where contestants and the audience look.
   - Shows contestants, countdown clocks, visual clues, and game-over celebrations with authentic TV sound effects.
   - **Zero answers are shown on this screen** so players cannot peek.
   - Click **📱 Host Remote (QR)** in the header (or **📱 Show Host QR** below the clue) to generate a high-contrast QR code.

2. **Host Remote View (`host.html`)**:
   - Point any smartphone camera at the QR code on the player screen to open the Host Remote controller instantly.
   - **Prominently reveals the expected answer** for the current prompt (e.g. `🎯 VERIFY: VANILLA`), plus an upcoming answer preview.
   - Giant thumb-friendly touch buttons for **✓ CORRECT** and **↷ PASS** with physical haptic vibration feedback.
   - Live synchronized timer readout and active player turn banners (`👉 ALEX'S TURN`).
   - Also supports full desktop keyboard shortcuts (`Space`: Correct, `Tab`: Pass, `Esc`: Pause, `R`: Reset).

---

## ☁️ How to Deploy Online (Free & Fast)

Because the project is built with standard Node.js without heavy build steps, you can deploy it online to play with friends anywhere in minutes:

### Option 1: Render.com (Recommended Free Web Service)
1. Push this directory to your GitHub account (e.g., `github.com/<your-username>/the-floor-toronto`).
2. Log into [Render.com](https://render.com) and click **New +** → **Web Service**.
3. Select your repository.
4. Set:
   - **Environment:** `Node`
   - **Build Command:** *(leave blank)*
   - **Start Command:** `node server.js`
5. Click **Create Web Service**. Within ~60 seconds, Render will provide a free public HTTPS URL (e.g. `https://the-floor-toronto.onrender.com`).
*(A `render.yaml` blueprint is already included in the root folder for automatic configuration).*

### Option 2: Railway.app (1-Click Deployment)
1. Go to [Railway.app](https://railway.app), log in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Railway automatically detects `package.json` and runs `node server.js`, giving you a live URL.

### Option 3: Instant Tunnel (Play Tonight Without Cloud Accounts)
If you are running the app locally on your laptop (`agy-node server.js`) and want friends to join from anywhere:
```bash
# Using Cloudflare Tunnel:
npx cloudflared tunnel --url http://localhost:3000

# Or using localtunnel:
npx localtunnel --port 3000
```
This prints an instant public `https://...` link that you can share with your friends or load on any phone.

