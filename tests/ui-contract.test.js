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
  assert.ok(html.indexOf('src/progression.js') < html.indexOf('src/game.js'));
  assert.match(css, /\.game-controls button \{[\s\S]*width: 46px;[\s\S]*height: 46px/);
  assert.match(css, /\.game-controls button:focus-visible/);
  assert.match(game, /catPlatformer\.onboardingSeen\.v1/);
  assert.match(game, /if \(isHelpDialogOpen\(\) \|\| isLevelCompleteDialogOpen\(\)\) return/);
  assert.doesNotMatch(game, /createMobileRoundButton/);
});

test('mission HUD exposes progress, challenge and combo feedback', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  const game = fs.readFileSync(path.join(root, 'src/game.js'), 'utf8');

  assert.match(html, /id="runHud"[^>]*aria-label="Aktueller Lauf"/);
  assert.match(html, /id="levelProgress"[^>]*role="progressbar"/);
  assert.match(html, /id="challengeBadge"/);
  assert.match(html, /id="discoveryHud"[^>]*hidden/);
  assert.match(html, /id="discoveryProgress"/);
  assert.match(html, /id="comboHud"[^>]*aria-live="polite"/);
  assert.match(html, /id="runStatus"[^>]*role="status"/);
  assert.match(css, /\.run-hud \{/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(game, /function syncDomRunHud\(\)/);
  assert.match(game, /function spawnActionBurst\(/);
  assert.match(game, /function celebrateLevelClear\(/);
  assert.match(game, /function collectDiscoveryMouse\(/);
  assert.match(game, /mouse\.setTint\(0xffd05c\)/);
});

test('level completion is a deliberate accessible handoff instead of an automatic restart', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const game = fs.readFileSync(path.join(root, 'src/game.js'), 'utf8');

  assert.match(html, /<dialog id="levelCompleteDialog"[^>]*aria-labelledby="levelCompleteTitle"/);
  assert.match(html, /id="levelBonusResult"/);
  assert.match(html, /id="challengeBonusResult"/);
  assert.match(html, /id="discoveryBonusResult"/);
  assert.match(html, /id="continueLevelButton"/);
  assert.match(game, /PROGRESSION\.createLevelSummary\(/);
  assert.match(game, /showLevelCompleteDialog\(summary\)/);
  assert.doesNotMatch(game, /delayedCall\(700,[\s\S]*currentLevel \+= 1/);
});

test('level scenes have a cinematic handoff with a reduced-motion fallback', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  const game = fs.readFileSync(path.join(root, 'src/game.js'), 'utf8');

  assert.match(html, /id="sceneTransition"[^>]*aria-live="polite"/);
  assert.match(html, /id="sceneTransitionTitle"/);
  assert.match(html, /id="skipSceneTransition"[^>]*>Direkt loslaufen<\/button>/);
  assert.match(css, /@keyframes scene-curtain-open/);
  assert.match(css, /\.scene-transition\.is-enter\.is-compact/);
  assert.match(css, /\.scene-transition\.is-exit/);
  assert.match(css, /\.scene-transition\.is-preview/);
  assert.match(game, /function showLevelIntroTransition\(\)/);
  assert.match(game, /sceneRef\?\.physics\?\.world\?\.pause\(\)/);
  assert.match(game, /function finishSceneIntro\(\)/);
  assert.match(game, /cinematic \? 1650 : 780/);
  assert.match(game, /function runSceneExit\(/);
  assert.match(game, /preview'\) === 'transition'/);
});

test('world themes change the feel of movement and landing feedback', () => {
  const game = fs.readFileSync(path.join(root, 'src/game.js'), 'utf8');

  assert.match(game, /gravityMul: 0\.92/);
  assert.match(game, /runMul: 1\.08/);
  assert.match(game, /jumpMul: 1\.07/);
  assert.match(game, /function updateLandingFeedback\(\)/);
  assert.match(game, /spawnActionBurst\(player\.x, player\.body\.bottom/);
});
