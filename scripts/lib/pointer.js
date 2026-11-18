'use strict';
// RFC 6901 JSON Pointer lookup. Returns { found, value }.
function getPointer(doc, pointer) {
  if (pointer === '') return { found: true, value: doc };
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) return { found: false, value: undefined };
  let cur = doc;
  for (const raw of pointer.slice(1).split('/')) {
    const key = raw.replace(/~1/g, '/').replace(/~0/g, '~');
    if (cur === null || typeof cur !== 'object') return { found: false, value: undefined };
    if (Array.isArray(cur)) {
      if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= cur.length) return { found: false, value: undefined };
      cur = cur[Number(key)];
    } else {
      if (!Object.prototype.hasOwnProperty.call(cur, key)) return { found: false, value: undefined };
      cur = cur[key];
    }
  }
  return { found: true, value: cur };
}

const escapeToken = (t) => String(t).replace(/~/g, '~0').replace(/\//g, '~1');
const makePointer = (...tokens) => '/' + tokens.map(escapeToken).join('/');

module.exports = { getPointer, makePointer };
