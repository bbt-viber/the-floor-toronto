#!/usr/bin/env node
/**
 * Category Synchronization & Validation Utility for The Floor Toronto
 *
 * Single-command synchronization (`node scripts/sync-categories.js`):
 * 1. Scans `games/*.json` (the single source of truth for each category).
 * 2. Validates every prompt's image path on disk and normalizes metadata (`icon`, `cluesCount`).
 * 3. Generates `games/<id>.js` browser/CommonJS bundles so `.json` and `.js` never drift.
 * 4. Generates `games/index.json` and `games/games-manifest.js`.
 * 5. Synchronizes `<script src="games/...">` tags in `index.html` and category buttons in `host.html`.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAMES_DIR = path.join(ROOT_DIR, 'games');

// Canonical order for existing categories; any new categories in `games/*.json` are appended automatically
const CANONICAL_ORDER = [
  'nba-wnba',
  'car-logos',
  'marvel-characters',
  'dog-breeds',
  'candy-bar-trivia',
  'taylor-swift',
  'friends-trivia',
  'drinks-trivia',
  'hip-hop-rnb-trivia',
  'beauty-products-trivia',
  'phone-apps-trivia'
];

const DEFAULT_ICONS = {
  'nba-wnba': '🏀',
  'car-logos': '🚗',
  'marvel-characters': '🦸',
  'dog-breeds': '🐕',
  'candy-bar-trivia': '🍫',
  'taylor-swift': '✨',
  'friends-trivia': '☕',
  'drinks-trivia': '🍹',
  'hip-hop-rnb-trivia': '🎤',
  'beauty-products-trivia': '💄',
  'phone-apps-trivia': '📱'
};

function toGlobalVarName(id) {
  return 'GAME_' + String(id).toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

function writeFileIfChanged(filePath, content) {
  const normalizedNew = content.replace(/\r\n/g, '\n');
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
    if (existing === normalizedNew) {
      return false;
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

function syncCategories(options = { quiet: false }) {
  const log = (...args) => {
    if (!options.quiet) console.log(...args);
  };

  if (!fs.existsSync(GAMES_DIR)) {
    throw new Error(`Games directory not found: ${GAMES_DIR}`);
  }

  // 1. Discover all category JSON files
  const allJsonFiles = fs.readdirSync(GAMES_DIR).filter(
    f => f.endsWith('.json') && f !== 'index.json'
  );

  const packsByFileBase = new Map();
  for (const file of allJsonFiles) {
    const base = path.basename(file, '.json');
    const fullPath = path.join(GAMES_DIR, file);
    const pack = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    packsByFileBase.set(base, { base, file, fullPath, pack });
  }

  // Sort by CANONICAL_ORDER first, then alphabetically for any new categories
  const sortedEntries = Array.from(packsByFileBase.values()).sort((a, b) => {
    const idxA = CANONICAL_ORDER.indexOf(a.pack.id || a.base);
    const idxB = CANONICAL_ORDER.indexOf(b.pack.id || b.base);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return (a.pack.id || a.base).localeCompare(b.pack.id || b.base);
  });

  let totalClues = 0;
  let missingImages = [];
  let updatedFilesCount = 0;

  // 2. Validate & normalize each category JSON + generate matching .js file
  for (const entry of sortedEntries) {
    const { base, fullPath, pack } = entry;
    const id = pack.id || base;
    const icon = pack.icon || DEFAULT_ICONS[id] || '🎯';
    const clues = Array.isArray(pack.clues) ? pack.clues : [];

    // Verify all clue images exist on disk
    for (let i = 0; i < clues.length; i++) {
      const c = clues[i];
      if (!c.image) {
        missingImages.push(`${id} [clue #${i + 1}]: missing image property`);
        continue;
      }
      const imgDiskPath = path.join(ROOT_DIR, c.image);
      if (!fs.existsSync(imgDiskPath)) {
        missingImages.push(`${id} [clue #${i + 1} "${c.answer}"]: file not found -> ${c.image}`);
      }
    }

    totalClues += clues.length;

    // Normalize pack structure with consistent key ordering
    const normalizedPack = {
      id,
      title: pack.title || id,
      icon,
      description: pack.description || 'Fast-paced 1v1 visual identification duel.',
      category: pack.category || 'General',
      difficulty: pack.difficulty || 'Progressive',
      cluesCount: clues.length,
      defaultTimer: pack.defaultTimer || 45,
      bannerColor: pack.bannerColor || 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      clues
    };

    entry.pack = normalizedPack;
    entry.varName = toGlobalVarName(id);

    // Save normalized .json if changed
    const jsonContent = JSON.stringify(normalizedPack, null, 2) + '\n';
    if (writeFileIfChanged(fullPath, jsonContent)) {
      updatedFilesCount++;
      log(`  [UPDATED] games/${base}.json`);
    }

    // Generate matching .js bundle
    const jsPath = path.join(GAMES_DIR, `${base}.js`);
    const jsContent = [
      `// ${normalizedPack.title} Game Pack - ${normalizedPack.cluesCount} Visual Trivia Prompts`,
      `const ${entry.varName} = ${JSON.stringify(normalizedPack, null, 2)};`,
      ``,
      `if (typeof window !== 'undefined') {`,
      `  window.__FLOOR_GAMES__ = window.__FLOOR_GAMES__ || [];`,
      `  window.__FLOOR_GAMES__.push(${entry.varName});`,
      `}`,
      ``,
      `if (typeof module !== 'undefined' && module.exports) {`,
      `  module.exports = ${entry.varName};`,
      `}`,
      ``
    ].join('\n');

    if (writeFileIfChanged(jsPath, jsContent)) {
      updatedFilesCount++;
      log(`  [UPDATED] games/${base}.js`);
    }
  }

  if (missingImages.length > 0) {
    console.error('\n[ERROR] Missing or invalid clue images detected:');
    missingImages.forEach(m => console.error(`  - ${m}`));
    throw new Error(`Category validation failed with ${missingImages.length} missing image(s).`);
  }

  // 3. Generate games/index.json
  const indexEntries = sortedEntries.map(({ base, pack }) => ({
    id: pack.id,
    title: pack.title,
    icon: pack.icon,
    description: pack.description,
    difficulty: pack.difficulty,
    category: pack.category,
    cluesCount: pack.cluesCount,
    defaultTimer: pack.defaultTimer,
    bannerColor: pack.bannerColor,
    file: `${base}.json`
  }));

  const indexJsonPath = path.join(GAMES_DIR, 'index.json');
  if (writeFileIfChanged(indexJsonPath, JSON.stringify(indexEntries, null, 2) + '\n')) {
    updatedFilesCount++;
    log(`  [UPDATED] games/index.json`);
  }

  // 4. Generate games/games-manifest.js
  const manifestLines = [
    `// Central Game Directory Manifest for The Floor Toronto`,
    `// Auto-generated by scripts/sync-categories.js`,
    `const GAMES_DIRECTORY = (function () {`,
    `  const explicit = [`,
    ...sortedEntries.map((e, i) => {
      const comma = i < sortedEntries.length - 1 ? ',' : '';
      return `    typeof ${e.varName} !== 'undefined' ? ${e.varName} : null${comma}`;
    }),
    `  ].filter(Boolean);`,
    ``,
    `  const registered = (typeof window !== 'undefined' && Array.isArray(window.__FLOOR_GAMES__))`,
    `    ? window.__FLOOR_GAMES__`,
    `    : [];`,
    ``,
    `  const map = new Map();`,
    `  for (const g of [...explicit, ...registered]) {`,
    `    if (g && g.id && !map.has(g.id)) {`,
    `      map.set(g.id, g);`,
    `    }`,
    `  }`,
    `  return Array.from(map.values());`,
    `})();`,
    ``,
    `// Helper functions for accessing and managing games`,
    `const GameRegistry = {`,
    `  getAll: function () {`,
    `    const list = [...GAMES_DIRECTORY];`,
    `    try {`,
    `      const customSaved = localStorage.getItem('the_floor_custom_games');`,
    `      if (customSaved) {`,
    `        const parsed = JSON.parse(customSaved);`,
    `        if (Array.isArray(parsed)) {`,
    `          list.push(...parsed);`,
    `        }`,
    `      }`,
    `    } catch (e) {`,
    `      console.warn('Could not load custom games', e);`,
    `    }`,
    `    return list;`,
    `  },`,
    ``,
    `  getById: function (id) {`,
    `    const all = this.getAll();`,
    `    return all.find(g => g.id === id) || null;`,
    `  },`,
    ``,
    `  saveCustom: function (game) {`,
    `    try {`,
    `      const customSaved = localStorage.getItem('the_floor_custom_games');`,
    `      let parsed = customSaved ? JSON.parse(customSaved) : [];`,
    `      const idx = parsed.findIndex(g => g.id === game.id);`,
    `      if (idx >= 0) {`,
    `        parsed[idx] = game;`,
    `      } else {`,
    `        parsed.unshift(game);`,
    `      }`,
    `      localStorage.setItem('the_floor_custom_games', JSON.stringify(parsed));`,
    `    } catch (e) {`,
    `      console.warn('Could not save custom game', e);`,
    `    }`,
    `  }`,
    `};`,
    ``
  ];

  const manifestPath = path.join(GAMES_DIR, 'games-manifest.js');
  if (writeFileIfChanged(manifestPath, manifestLines.join('\n'))) {
    updatedFilesCount++;
    log(`  [UPDATED] games/games-manifest.js`);
  }

  // 5. Update <script src="games/..."> block in index.html
  const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    const scriptTags = [
      ...sortedEntries.map(e => `  <script src="games/${e.base}.js"></script>`),
      `  <script src="games/games-manifest.js"></script>`
    ].join('\n');

    const scriptBlockRegex = /(?:[ \t]*<script src="games\/[^"]+\.js"><\/script>\r?\n?)+/;
    if (scriptBlockRegex.test(html)) {
      const updatedHtml = html.replace(scriptBlockRegex, scriptTags + '\n');
      if (writeFileIfChanged(indexHtmlPath, updatedHtml)) {
        updatedFilesCount++;
        log(`  [UPDATED] index.html (game script tags)`);
      }
    }
  }

  // 6. Update Category Switcher buttons in host.html
  const hostHtmlPath = path.join(ROOT_DIR, 'host.html');
  if (fs.existsSync(hostHtmlPath)) {
    const hostHtml = fs.readFileSync(hostHtmlPath, 'utf8');
    const buttonsHtml = sortedEntries.map(({ pack }) => [
      `      <button class="category-item-btn" onclick="selectGame('${pack.id}')">`,
      `        <span>${pack.icon} ${pack.title}</span>`,
      `        <span style="font-size: 0.8rem; color: var(--gold);">${pack.cluesCount} Clues</span>`,
      `      </button>`
    ].join('\n')).join('\n');

    const hostButtonsRegex = /(?:[ \t]*<button class="category-item-btn" onclick="selectGame\('[^']+'\)">[\s\S]*?<\/button>\r?\n?)+/;
    if (hostButtonsRegex.test(hostHtml)) {
      const updatedHostHtml = hostHtml.replace(hostButtonsRegex, buttonsHtml + '\n');
      if (writeFileIfChanged(hostHtmlPath, updatedHostHtml)) {
        updatedFilesCount++;
        log(`  [UPDATED] host.html (category switcher buttons)`);
      }
    }
  }

  log(`✓ Validated ${sortedEntries.length} categories (${totalClues} total clues, 0 missing images). Updated ${updatedFilesCount} file(s).`);
  return {
    categoriesCount: sortedEntries.length,
    totalClues,
    updatedFilesCount
  };
}

if (require.main === module) {
  try {
    syncCategories();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { syncCategories };
