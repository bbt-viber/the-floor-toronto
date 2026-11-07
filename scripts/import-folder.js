#!/usr/bin/env node
/**
 * Automated Category Folder Importer for The Floor Toronto
 *
 * Usage:
 *   node scripts/import-folder.js <folderName> [--id <gameId>] [--title "<Title>"] [--icon "<Emoji>"] [--category "<Genre>"] [--desc "<Description>"] [--push]
 *
 * Automatically:
 * 1. Scans `<folderName>/` for image files (`.png`, `.jpg`, `.jpeg`, `.webp`).
 * 2. Parses `<folderName>/README.txt` (if present) to extract Easy / Medium / Hard difficulty tiers and optional hints.
 * 3. Creates or updates `games/<gameId>.json`.
 * 4. Runs `syncCategories()` to update `games/<gameId>.js`, `games/index.json`, `games/games-manifest.js`, `index.html`, and `host.html`.
 * 5. Optionally pushes directly to GitHub if `--push` is passed.
 */

const fs = require('fs');
const path = require('path');
const { syncCategories } = require('./sync-categories');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAMES_DIR = path.join(ROOT_DIR, 'games');
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

function parseArgs(argv) {
  const opts = { folder: null, push: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--push') opts.push = true;
    else if (arg === '--id' && argv[i + 1]) opts.id = argv[++i];
    else if (arg === '--title' && argv[i + 1]) opts.title = argv[++i];
    else if (arg === '--icon' && argv[i + 1]) opts.icon = argv[++i];
    else if (arg === '--category' && argv[i + 1]) opts.category = argv[++i];
    else if (arg === '--desc' && argv[i + 1]) opts.description = argv[++i];
    else if (arg === '--banner' && argv[i + 1]) opts.bannerColor = argv[++i];
    else if (!arg.startsWith('-') && !opts.folder) opts.folder = arg;
  }
  return opts;
}

function toTitleCase(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function toSlugId(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Parses a README.txt with EASY / MEDIUM / HARD sections.
 * Supports both:
 *  - Comma-separated lists across multiple lines
 *  - Line-by-line "Song — Year — Artist" or "Clue — Answer" lists
 */
function parseReadmeTiers(readmeText) {
  const tiers = { Easy: [], Medium: [], Hard: [] };
  const lines = readmeText.split(/\r?\n/);
  let currentTier = null;
  let buffer = [];

  function flushTier() {
    if (!currentTier || buffer.length === 0) return;
    const rawBlock = buffer.join('\n').trim();
    if (!rawBlock) {
      buffer = [];
      return;
    }

    // Check if lines use " — " (em-dash) format: e.g. "No Diggity — 1996 — Blackstreet"
    const nonEmptyLines = buffer.map(l => l.trim()).filter(Boolean);
    const usesEmDash = nonEmptyLines.every(l => l.includes('—') || l.includes(' - '));

    if (usesEmDash) {
      for (const line of nonEmptyLines) {
        const parts = line.split(/\s*(?:—| - )\s*/).map(s => s.trim()).filter(Boolean);
        const answer = parts[parts.length - 1];
        const hintParts = parts.slice(0, -1);
        const hint = hintParts.length === 2
          ? `"${hintParts[0]}" (${hintParts[1]})`
          : hintParts.join(' — ');
        tiers[currentTier].push({ answer, hint });
      }
    } else {
      // Comma-separated or middle-dot (·) separated list wrapped across lines
      const joined = nonEmptyLines.join(' ');
      const delimiter = joined.includes('·') ? /\s*·\s*/ : /\s*,\s*/;
      const items = joined.split(delimiter).map(s => s.trim()).filter(Boolean);
      for (const rawItem of items) {
        const hexMatch = rawItem.match(/^(.*?)\s+(#[0-9A-Fa-f]{6})$/);
        if (hexMatch) {
          tiers[currentTier].push({
            answer: hexMatch[1].trim(),
            hint: `Hex: ${hexMatch[2].toUpperCase()}`
          });
        } else {
          tiers[currentTier].push({ answer: rawItem, hint: '' });
        }
      }
    }
    buffer = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^EASY\s*(\(\d+\))?$/i.test(trimmed)) {
      flushTier();
      currentTier = 'Easy';
      continue;
    }
    if (/^MEDIUM\s*(\(\d+\))?$/i.test(trimmed)) {
      flushTier();
      currentTier = 'Medium';
      continue;
    }
    if (/^HARD\s*(\(\d+\))?$/i.test(trimmed)) {
      flushTier();
      currentTier = 'Hard';
      continue;
    }
    if (currentTier) {
      // Stop collecting if we hit a blank line after collecting items, or an uppercase section header
      if (trimmed === '' && buffer.length > 0) {
        flushTier();
        currentTier = null;
        continue;
      }
      if (/^[A-Z][A-Z\s\/]{4,}$/.test(trimmed)) {
        flushTier();
        currentTier = null;
        continue;
      }
      if (trimmed !== '') {
        buffer.push(trimmed);
      }
    }
  }
  flushTier();

  return tiers;
}

function importFolder(opts) {
  if (!opts.folder) {
    throw new Error('Usage: node scripts/import-folder.js <folderName> [--id <id>] [--title "<Title>"]');
  }

  const folderName = opts.folder.replace(/[\\/]+$/, '');
  const folderPath = path.join(ROOT_DIR, folderName);
  if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    throw new Error(`Directory not found: ${folderPath}`);
  }

  const gameId = opts.id || folderName;
  const existingJsonPath = path.join(GAMES_DIR, `${gameId}.json`);
  const existingPack = fs.existsSync(existingJsonPath)
    ? JSON.parse(fs.readFileSync(existingJsonPath, 'utf8'))
    : {};

  // Index existing clues by lowercase answer to preserve custom aliases/hints if updating
  const existingCluesByAnswer = new Map();
  if (Array.isArray(existingPack.clues)) {
    for (const c of existingPack.clues) {
      if (c.answer) existingCluesByAnswer.set(c.answer.toLowerCase().trim(), c);
    }
  }

  // Scan image files in folder
  const allFiles = fs.readdirSync(folderPath);
  const imageFileByAnswer = new Map();
  for (const f of allFiles) {
    const ext = path.extname(f).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) continue;
    const answerName = f.slice(0, f.length - ext.length);
    imageFileByAnswer.set(answerName.toLowerCase().trim(), {
      answer: answerName,
      fileName: f,
      relPath: `${folderName}/${f}`
    });
  }

  const readmePath = path.join(folderPath, 'README.txt');
  let orderedItems = [];
  let tierCounts = { Easy: 0, Medium: 0, Hard: 0 };

  if (fs.existsSync(readmePath)) {
    const readmeText = fs.readFileSync(readmePath, 'utf8');
    const tiers = parseReadmeTiers(readmeText);
    for (const difficulty of ['Easy', 'Medium', 'Hard']) {
      for (const item of tiers[difficulty]) {
        const key = item.answer.toLowerCase().trim();
        const imgEntry = imageFileByAnswer.get(key);
        if (!imgEntry) {
          throw new Error(`Image file missing in ${folderName}/ for README answer: "${item.answer}"`);
        }
        orderedItems.push({
          answer: item.answer,
          difficulty,
          hint: item.hint,
          relPath: imgEntry.relPath
        });
        tierCounts[difficulty]++;
      }
    }
  }

  // Fallback if README didn't list items
  if (orderedItems.length === 0) {
    const entries = Array.from(imageFileByAnswer.values());
    entries.forEach((imgEntry, idx) => {
      const difficulty = idx < 15 ? 'Easy' : (idx < 30 ? 'Medium' : 'Hard');
      tierCounts[difficulty]++;
      orderedItems.push({
        answer: imgEntry.answer,
        difficulty,
        hint: '',
        relPath: imgEntry.relPath
      });
    });
  }

  const prefix = toSlugId(gameId.replace(/-trivia$/, ''));
  const clues = orderedItems.map(item => {
    const prev = existingCluesByAnswer.get(item.answer.toLowerCase().trim());
    return {
      id: (prev && prev.id) || `clue_${prefix}_${toSlugId(item.answer)}`,
      answer: item.answer,
      aliases: (prev && Array.isArray(prev.aliases)) ? prev.aliases : [],
      difficulty: item.difficulty,
      image: item.relPath,
      hint: item.hint || (prev && prev.hint) || `Identify: ${item.answer}`
    };
  });

  const difficultyLabel = `Progressive (${tierCounts.Easy} Easy → ${tierCounts.Medium} Medium → ${tierCounts.Hard} Hard)`;

  const newPack = {
    id: gameId,
    title: opts.title || existingPack.title || toTitleCase(gameId.replace(/-trivia$/, '')),
    icon: opts.icon || existingPack.icon || '🎯',
    description: opts.description || existingPack.description || 'Fast-paced 1v1 visual identification duel.',
    category: opts.category || existingPack.category || 'General',
    difficulty: difficultyLabel,
    cluesCount: clues.length,
    defaultTimer: existingPack.defaultTimer || 45,
    bannerColor: opts.bannerColor || existingPack.bannerColor || 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    clues
  };

  fs.writeFileSync(existingJsonPath, JSON.stringify(newPack, null, 2) + '\n', 'utf8');
  console.log(`✓ Generated games/${gameId}.json (${clues.length} clues: ${tierCounts.Easy} Easy, ${tierCounts.Medium} Medium, ${tierCounts.Hard} Hard)`);

  syncCategories();
  return newPack;
}

if (require.main === module) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    importFolder(opts);
  } catch (err) {
    console.error('[IMPORT ERROR]', err.message);
    process.exit(1);
  }
}

module.exports = { importFolder };
