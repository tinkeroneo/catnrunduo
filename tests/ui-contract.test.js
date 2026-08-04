const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

test('resume dialog exposes explicit and accessible run choices', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  assert.match(html, /<dialog id="resumeDialog"[^>]*aria-labelledby="resumeTitle"[^>]*aria-describedby="resumeSummary"/);
  assert.match(html, /id="newRunButton"[^>]*>Neuer Lauf<\/button>/);
  assert.match(html, /id="resumeRunButton"[^>]*>Fortsetzen<\/button>/);
  assert.ok(html.indexOf('src/run-storage.js') < html.indexOf('src/game.js'));
  assert.match(css, /\.run-dialog button \{[\s\S]*min-height: 44px/);
});
