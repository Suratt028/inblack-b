// Shared helpers for the 3 pages. All numbers come from data/site-data.json (built from data/raw/** by
// scripts/build-site-data.js); nothing is computed from outside data.
'use strict';
const VERDICT_TH = { buy: 'ซื้อ', wait: 'รอ', skip: 'ไม่ซื้อ' };
const REPO = 'https://github.com/Suratt028/inblack-b/blob/main/';

function esc(s) {
  return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const thb = (n) => Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd = (n) => '$' + Number(n).toFixed(2);
const badge = (v) => `<span class="badge ${esc(v)}">${esc(VERDICT_TH[v] || v)}</span>`;
// Evidence pointer: link to the raw file on GitHub + JSON pointer text.
const src = (s) => (s && s.file ? `<span class="src"><a href="${REPO}${esc(s.file)}">${esc(s.file)}</a> ${esc(s.pointer)}</span>` : '');
function thaiTime(iso) {
  return new Date(iso).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'long', timeStyle: 'short' }) + ' น.';
}
async function loadData() {
  const r = await fetch('data/site-data.json', { cache: 'no-store' });
  if (!r.ok) throw new Error(`โหลดข้อมูลไม่ได้ (HTTP ${r.status})`);
  return r.json();
}
function fail(e) {
  document.querySelector('main').innerHTML = `<p class="note">${esc(e.message)}</p>`;
}
