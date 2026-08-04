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

test('game actions and onboarding are semantic and keyboard reachable', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  const game = fs.readFileSync(path.join(root, 'src/game.js'), 'utf8');

  for (const id of ['restartControl', 'pauseControl', 'audioControl', 'touchProfileControl', 'helpControl']) {
    assert.match(html, new RegExp(`<button id="${id}"[^>]*aria-label=`));
  }
  assert.match(html, /<dialog id="helpDialog"[^>]*aria-labelledby="helpTitle"[^>]*aria-describedby="helpIntro"/);
  assert.match(html, /id="game"[^>]*aria-label="Seitlich scrollendes Plattformspiel mit einer Katze"/);
  assert.ok(html.indexOf('src/ui-text.js') < html.indexOf('src/game.js'));
  assert.match(css, /\.game-controls button \{[\s\S]*width: 46px;[\s\S]*height: 46px/);
  assert.match(css, /\.game-controls button:focus-visible/);
  assert.match(game, /catPlatformer\.onboardingSeen\.v1/);
  assert.match(game, /if \(isHelpDialogOpen\(\)\) return/);
  assert.doesNotMatch(game, /createMobileRoundButton/);
});
