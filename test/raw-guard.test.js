'use strict';
// raw-guard plugin hook: blocks writes to data/raw/ (file tools and shell), allows reads and the fetch script.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { spawnSync } = require('child_process');
const { decide } = require('../plugins/raw-guard/hooks/guard-raw');

const ROOT = path.resolve(__dirname, '..');
const call = (tool_name, tool_input) => decide({ tool_name, tool_input }, ROOT);

test('file tools: block inside data/raw, allow elsewhere', () => {
  assert.ok(call('Edit', { file_path: path.join(ROOT, 'data', 'raw', '2026-11-18', 'deal-196149.json') }));
  assert.ok(call('Write', { file_path: 'data/raw/2026-11-19/x.json' }));
  assert.equal(call('Write', { file_path: 'data/brief.json' }), null);
  assert.equal(call('Edit', { file_path: 'data/rawish/x.json' }), null);
  assert.equal(call('Read', { file_path: 'data/raw/2026-11-18/stores.json' }), null);
});

test('reasons never contain absolute local paths', () => {
  const r1 = call('Edit', { file_path: path.join(ROOT, 'data', 'raw', 'd', 'x.json') });
  assert.match(r1, /Edit on data\/raw\/d\/x\.json/);
  assert.ok(!r1.includes(ROOT));
  const r2 = call('Bash', { command: 'rm C:\\Users\\someone\\proj\\data\\raw\\x.json' });
  assert.ok(r2 && !/Users\\someone/.test(r2), r2);
  assert.match(r2, /rm ~\\proj\\data\\raw/);
  // Git Bash and POSIX forms, including the repo root itself in /c/... form
  const { redact } = require('../plugins/raw-guard/hooks/guard-raw');
  assert.equal(redact('rm /c/Users/someone/proj/data/raw/x.json', 'D:\\elsewhere'), 'rm ~/proj/data/raw/x.json');
  assert.equal(redact('rm /home/someone/p/data/raw/x', '/srv/r'), 'rm ~/p/data/raw/x');
  assert.equal(redact('rm /d/work/repo/data/raw/x', 'D:\\work\\repo'), 'rm ./data/raw/x');
  const r3 = call('Bash', { command: 'rm /c/Users/someone/inblack-b/data/raw/x.json' });
  assert.ok(r3 && !r3.includes('someone'), r3);
});

test('shell: block writes/deletes touching data/raw, allow reads and npm run fetch', () => {
  for (const cmd of [
    'sed -i s/98/99/ data/raw/2026-11-18/deal-196149.json',
    'echo {} > data/raw/2026-11-18/x.json',
    'rm -rf data/raw/2026-11-18',
    'node -e "require(\'fs\').writeFileSync(\'data/raw/2026-11-18/a.json\',\'1\')"',
    'git checkout -- data/raw',
    'Set-Content data\\raw\\2026-11-18\\a.json 1',
  ]) assert.ok(call('Bash', { command: cmd }), cmd);
  // chained after the allowed fetch command -> still checked
  for (const cmd of ['npm run fetch && rm -rf data/raw/2026-11-18', 'node scripts/fetch-raw.js ; echo 1 > data/raw/x.json', 'npm run fetch\nrm data/raw/x']) {
    assert.ok(call('Bash', { command: cmd }), cmd);
  }
  for (const cmd of ['cat data/raw/2026-11-18/stores.json', 'ls data/raw', 'node scripts/fetch-raw.js', 'npm run fetch', 'git diff -- data/raw',
    'ls data/raw 2>/dev/null', 'cat data/raw/2026-11-18/stores.json > /tmp/x.json', 'grep -n copy data/raw/2026-11-18/stores.json', 'ls data/raw-old']) {
    assert.equal(call('Bash', { command: cmd }), null, cmd);
  }
});

test('hook process: exit 2 with reason on stderr when blocked, exit 0 otherwise', () => {
  const hook = path.join(ROOT, 'plugins', 'raw-guard', 'hooks', 'guard-raw.js');
  const os = require('os');
  const fs = require('fs');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'guard-'));
  try {
    const env = { ...process.env, CLAUDE_PROJECT_DIR: tmp };
    const blocked = spawnSync(process.execPath, [hook], { input: JSON.stringify({ tool_name: 'Write', tool_input: { file_path: 'data/raw/d/x.json' }, session_id: 't' }), env, encoding: 'utf8' });
    assert.equal(blocked.status, 2);
    assert.match(blocked.stderr, /Blocked by raw-guard/);
    assert.match(fs.readFileSync(path.join(tmp, 'AGENT_LOG', 'hook-events.md'), 'utf8'), /Write blocked by raw-guard/);
    const ok = spawnSync(process.execPath, [hook], { input: JSON.stringify({ tool_name: 'Write', tool_input: { file_path: 'site/x.html' } }), env, encoding: 'utf8' });
    assert.equal(ok.status, 0);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
