'use strict';
// Read-only access to data/raw/YYYY-MM-DD/ rounds.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const RAW_DIR = path.join(ROOT, 'data', 'raw');
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

const rel = (abs) => path.relative(ROOT, abs).split(path.sep).join('/');

// Days that have a completed round (a _manifest.json with complete: true), oldest first.
function listDays(rawDir = RAW_DIR) {
  if (!fs.existsSync(rawDir)) return [];
  return fs.readdirSync(rawDir).filter((d) => DAY_RE.test(d)).sort().filter((d) => {
    const m = readManifest(d, rawDir);
    return m && m.complete === true;
  });
}

function readManifest(day, rawDir = RAW_DIR) {
  const f = path.join(rawDir, day, '_manifest.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}

// Load a repo-relative raw file ("data/raw/<day>/<name>.json"). Refuses paths outside data/raw.
function loadRawFile(file, root = ROOT) {
  const abs = path.resolve(root, file);
  const r = path.relative(path.join(root, 'data', 'raw'), abs);
  if (!r || r.startsWith('..') || path.isAbsolute(r)) throw new Error(`not a raw data file: ${file}`);
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

module.exports = { ROOT, RAW_DIR, DAY_RE, rel, listDays, readManifest, loadRawFile };
