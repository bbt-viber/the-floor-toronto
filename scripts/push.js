#!/usr/bin/env node
/**
 * Smart Incremental GitHub Sync & Push CLI for The Floor Toronto
 *
 * Usage:
 *   node scripts/push.js --status                  # Show modified, added, and deleted files vs origin/main
 *   node scripts/push.js "Commit message"          # Sync categories, upload changed blobs, commit & push to main
 *   node scripts/push.js "Commit message" --prune  # Also remove remote files that no longer exist locally
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { syncCategories } = require('./sync-categories');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');

const OWNER = 'bbt-viber';
const REPO = 'the-floor-toronto';
const BRANCH = 'main';

const IGNORED_NAMES = new Set([
  '.env',
  '.env.local',
  '.token',
  'credentials.json',
  'node_modules',
  '.git',
  '.DS_Store',
  'saved_floors.json'
]);

const BINARY_EXTS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.ico',
  '.mp3',
  '.wav',
  '.ogg',
  '.woff',
  '.woff2',
  '.ttf'
]);

function getGitHubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error(`Missing .env file at ${ENV_PATH} and GITHUB_TOKEN env var is not set.`);
  }
  const envContent = fs.readFileSync(ENV_PATH, 'utf8');
  const match = envContent.match(/GITHUB_TOKEN=([^\r\n]+)/);
  if (!match || !match[1].trim()) {
    throw new Error('GITHUB_TOKEN not found in .env');
  }
  return match[1].trim();
}

function apiRequest(token, method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const dataStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}${endpoint}`,
      method,
      headers: {
        'User-Agent': 'TheFloorToronto-SyncCLI',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(dataStr ? { 'Content-Length': Buffer.byteLength(dataStr) } : {})
      }
    }, res => {
      let d = '';
      res.on('data', chunk => { d += chunk; });
      res.on('end', () => {
        try {
          const parsed = d ? JSON.parse(d) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`GitHub API ${res.statusCode} (${method} ${endpoint}): ${parsed.message || d}`));
          }
        } catch (e) {
          reject(new Error(`Parse error ${res.statusCode}: ${d}`));
        }
      });
    });
    req.on('error', reject);
    if (dataStr) req.write(dataStr);
    req.end();
  });
}

async function createBlobWithRetry(token, content, encoding, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await apiRequest(token, 'POST', '/git/blobs', { content, encoding });
      return res.sha;
    } catch (e) {
      if (attempt === retries) throw e;
      console.warn(`  [Retry ${attempt}/${retries}] Blob upload failed: ${e.message}`);
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
}

async function poolAll(items, fn, concurrency = 4) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    if (concurrency <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

function computeGitBlobSha(buffer) {
  const header = `blob ${buffer.length}\0`;
  const store = Buffer.concat([Buffer.from(header, 'binary'), buffer]);
  return crypto.createHash('sha1').update(store).digest('hex');
}

function walkWorkspace(dir, relBase = '') {
  const filesMap = new Map();
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_NAMES.has(entry.name) || entry.name.endsWith('.log')) continue;

    const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);

    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (err) {
      console.warn(`  [WARN] Skipping unreadable path ${relPath}: ${err.message}`);
      continue;
    }

    if (stat.isDirectory()) {
      for (const [k, v] of walkWorkspace(fullPath, relPath)) {
        filesMap.set(k, v);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      const isBinary = BINARY_EXTS.has(ext);
      const rawBuffer = fs.readFileSync(fullPath);
      const sha = computeGitBlobSha(rawBuffer);
      filesMap.set(relPath, {
        relPath,
        fullPath,
        isBinary,
        rawBuffer,
        sha
      });
    }
  }

  return filesMap;
}

async function main() {
  const args = process.argv.slice(2);
  const isStatusOnly = args.includes('--status') || args.includes('-s');
  const shouldPrune = args.includes('--prune');
  const skipSync = args.includes('--no-sync');
  const messageArgs = args.filter(a => !a.startsWith('-'));
  const commitMessage = messageArgs.join(' ').trim() || 'Update The Floor Toronto';

  if (!skipSync) {
    console.log('--- 1. Validating & Syncing Categories ---');
    syncCategories();
  }

  const token = getGitHubToken();

  console.log(`--- 2. Fetching Remote Branch (${OWNER}/${REPO}@${BRANCH}) ---`);
  const refRes = await apiRequest(token, 'GET', `/git/ref/heads/${BRANCH}`);
  const headSha = refRes.object.sha;
  const commitRes = await apiRequest(token, 'GET', `/git/commits/${headSha}`);
  const baseTreeSha = commitRes.tree.sha;
  console.log(`  HEAD Commit: ${headSha.slice(0, 7)} ("${commitRes.message.split('\n')[0]}")`);

  const treeRes = await apiRequest(token, 'GET', `/git/trees/${baseTreeSha}?recursive=1`);
  const remoteBlobs = new Map();
  for (const item of treeRes.tree) {
    if (item.type === 'blob') {
      remoteBlobs.set(item.path, item.sha);
    }
  }

  const localFiles = walkWorkspace(ROOT_DIR);

  const added = [];
  const modified = [];
  const deleted = [];

  for (const [relPath, info] of localFiles) {
    if (!remoteBlobs.has(relPath)) {
      added.push(info);
    } else if (remoteBlobs.get(relPath) !== info.sha) {
      modified.push(info);
    }
  }

  for (const [remotePath] of remoteBlobs) {
    if (!localFiles.has(remotePath)) {
      deleted.push(remotePath);
    }
  }

  console.log(`--- 3. Workspace Diff Summary ---`);
  console.log(`  Added:    ${added.length} file(s)`);
  added.forEach(f => console.log(`    + ${f.relPath}`));
  console.log(`  Modified: ${modified.length} file(s)`);
  modified.forEach(f => console.log(`    ~ ${f.relPath}`));
  console.log(`  Remote-only (deleted locally): ${deleted.length} file(s)${shouldPrune ? ' [will prune]' : ' [pass --prune to delete]'}`);
  if (deleted.length > 0 && deleted.length <= 15) {
    deleted.forEach(p => console.log(`    - ${p}`));
  } else if (deleted.length > 15) {
    deleted.slice(0, 10).forEach(p => console.log(`    - ${p}`));
    console.log(`    ... and ${deleted.length - 10} more`);
  }

  if (isStatusOnly) {
    return;
  }

  const filesToUpload = [...added, ...modified];
  const filesToDelete = shouldPrune ? deleted : [];

  if (filesToUpload.length === 0 && filesToDelete.length === 0) {
    console.log('\n✓ Everything is already up-to-date with origin/main!');
    return;
  }

  // Deduplicate blob uploads by SHA-1 (identical files across folders only upload once!)
  const uniqueBySha = new Map();
  for (const item of filesToUpload) {
    if (!uniqueBySha.has(item.sha)) {
      uniqueBySha.set(item.sha, item);
    }
  }

  const uniqueItems = Array.from(uniqueBySha.values());
  console.log(`--- 4. Uploading ${uniqueItems.length} Unique Git Blob(s) ---`);
  let uploadedCount = 0;
  const uploadedShaMap = new Map();

  await poolAll(uniqueItems, async (item) => {
    const content = item.isBinary
      ? item.rawBuffer.toString('base64')
      : item.rawBuffer.toString('utf8');
    const encoding = item.isBinary ? 'base64' : 'utf-8';
    const remoteSha = await createBlobWithRetry(token, content, encoding);
    uploadedShaMap.set(item.sha, remoteSha);
    uploadedCount++;
    console.log(`  [${uploadedCount}/${uniqueItems.length}] ${item.relPath} -> ${remoteSha.slice(0, 7)}`);
  }, 4);

  const treeEntries = [];
  for (const item of filesToUpload) {
    treeEntries.push({
      path: item.relPath,
      mode: '100644',
      type: 'blob',
      sha: uploadedShaMap.get(item.sha) || item.sha
    });
  }

  for (const delPath of filesToDelete) {
    treeEntries.push({
      path: delPath,
      mode: '100644',
      type: 'blob',
      sha: null
    });
  }

  console.log(`--- 5. Creating Git Tree (${treeEntries.length} entry updates) ---`);
  const newTreeRes = await apiRequest(token, 'POST', '/git/trees', {
    base_tree: baseTreeSha,
    tree: treeEntries
  });

  console.log(`--- 6. Creating Commit & Updating ${BRANCH} ---`);
  const newCommitRes = await apiRequest(token, 'POST', '/git/commits', {
    message: commitMessage,
    tree: newTreeRes.sha,
    parents: [headSha]
  });

  await apiRequest(token, 'PATCH', `/git/refs/heads/${BRANCH}`, {
    sha: newCommitRes.sha
  });

  console.log(`\n✓ Pushed to ${OWNER}/${REPO}@${BRANCH}`);
  console.log(`  Commit SHA: ${newCommitRes.sha}`);
  console.log(`  Message:    ${commitMessage}`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('\n[PUSH ERROR]', err.message);
    process.exit(1);
  });
}

module.exports = { main };
