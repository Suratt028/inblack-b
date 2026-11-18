#!/usr/bin/env node
'use strict';
// raw-guard PreToolUse hook. Raw API responses in data/raw/ are the evidence every number on the site points to,
// so no agent may edit, overwrite or delete them; only `node scripts/fetch-raw.js` (npm run fetch) writes there.
// Blocked call: logs to AGENT_LOG/hook-events.md, prints the reason on stderr, exits 2 (Claude Code cancels the call
// and shows the reason to the agent). Everything else: exit 0 — including unparseable hook input (fail open: this is a
// guard against accidents, not a sandbox; e.g. `cd data && rm raw/x.json` or paths built in variables are not caught).
const fs = require('fs');
const path = require('path');

const FILE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);
const RAW_RE = /data[\\/]+raw(?:[\\/]|$|[\s"'`;&|)])/i;
// a redirect whose target is inside data/raw (fd redirects like 2>/dev/null to elsewhere are fine)
const REDIRECT_RE = /(^|[^\d&<>=!])>{1,2}\s*["']?[^\s"';&|]*data[\\/]+raw/i;
// write/delete commands only in command position (start, or after ; & | ( or `), so `grep copy data/raw/x` is a read
const CMD_RE = /(^|[;&|(`\n]\s*|\b(?:sudo|xargs)\s+)(rm|rmdir|mv|cp|tee|truncate|touch|dd|install|unlink|shred|del|erase|ren|move|copy)\b/i;
const OTHER_WRITE_RE = /\bsed\s+(-[a-z]*i|--in-place)|\bperl\s+-[a-z]*i|\b(Remove-Item|Set-Content|Add-Content|Out-File|Move-Item|Copy-Item|Rename-Item|Clear-Content|New-Item)\b|\bgit\s+(checkout|restore|rm|mv|clean|reset|stash)\b|writeFile|appendFile|unlinkSync|rmSync|renameSync|copyFileSync|open\([^)]*['"][wa]/i;
// only the bare fetch command is allowed; anything chained (; & | newline backtick $( ) is checked like any command
const ALLOWED_RE = /^\s*(node\s+(\.[\\/])?scripts[\\/]fetch-raw\.js|npm\s+run\s+fetch)\s*$/;
const isWrite = (cmd) => REDIRECT_RE.test(cmd) || CMD_RE.test(cmd) || OTHER_WRITE_RE.test(cmd);

// Strip absolute local paths (Windows, Git Bash /c/Users/..., Linux/mac home) so logs never contain a username.
function redact(cmd, root) {
  const fwd = root.split('\\').join('/');
  const bash = fwd.replace(/^([A-Za-z]):/, (m, d) => `/${d.toLowerCase()}`);
  let s = cmd;
  for (const r of [root, fwd, bash]) if (r) s = s.split(r).join('.');
  return s.replace(/[A-Z]:[\\/]+Users[\\/]+[^\\/\s"']+/gi, '~')
    .replace(/\/[a-z]\/Users\/[^/\s"']+/gi, '~')
    .replace(/\/(home|Users)\/[^/\s"']+/g, '~');
}

// Returns a reason string when the call must be blocked, else null.
function decide(input, root) {
  const tool = input && input.tool_name;
  const ti = (input && input.tool_input) || {};
  if (FILE_TOOLS.has(tool)) {
    const p = ti.file_path || ti.notebook_path;
    if (typeof p !== 'string') return null;
    const rel = path.relative(path.join(root, 'data', 'raw'), path.resolve(root, p));
    const shown = path.relative(root, path.resolve(root, p)).split(path.sep).join('/'); // never log absolute local paths
    if (rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))) return `${tool} on ${shown}: data/raw/ is immutable raw API evidence`;
    return null;
  }
  if (SHELL_TOOLS.has(tool)) {
    const cmd = typeof ti.command === 'string' ? ti.command : '';
    if (!RAW_RE.test(cmd) || ALLOWED_RE.test(cmd)) return null;
    const shown = redact(cmd, root).slice(0, 160);
    if (isWrite(cmd)) return `${tool} command may modify data/raw/ (immutable raw API evidence): ${shown}`;
  }
  return null;
}

function main() {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const reason = decide(input, root);
  if (!reason) process.exit(0);
  const msg = `Blocked by raw-guard: ${reason}. Raw data may only be written by \`npm run fetch\`. If a number looks wrong, report it as problem data instead of changing the evidence.`;
  try {
    const dir = path.join(root, 'AGENT_LOG');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'hook-events.md');
    if (!fs.existsSync(file)) fs.writeFileSync(file, '# hook-events\n_Real events only, appended by the raw-guard PreToolUse hook._\n');
    const when = new Date().toISOString().replace('T', ' ').slice(0, 16) + 'Z';
    fs.appendFileSync(file, `\n## ${when} — ${input.tool_name} blocked by raw-guard\n- session: ${input.session_id || 'unknown'}\n- reason: ${reason.replace(/\n/g, ' ')}\n`);
  } catch { /* logging must never hide the block */ }
  process.stderr.write(msg + '\n');
  process.exit(2);
}

if (require.main === module) main();
module.exports = { decide, redact };
