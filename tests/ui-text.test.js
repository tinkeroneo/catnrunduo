const assert = require('node:assert/strict');
const test = require('node:test');

const { formatRunContext, formatScoreSummary } = require('../src/ui-text.js');

test('HUD summaries use readable German labels and hierarchy', () => {
  assert.equal(
    formatScoreSummary({ level: 4, maxLevel: 52, mice: 3, miceTotal: 5, score: 1200, lives: 2 }),
    'Level 4/52  ·  Mäuse 3/5  ·  Punkte 1200  ·  Leben 2'
  );
  assert.equal(
    formatRunContext({ variant: 'Wind', assist: true, focus: false, boost: '-', boss: '-' }),
    'Variante Wind (Assistenz)  ·  Boost -  ·  Boss -'
  );
  assert.doesNotMatch(
    formatScoreSummary({ level: 1, maxLevel: 2, mice: 0, miceTotal: 1, score: 0, lives: 3 }),
    /Maeuse|Mod /
  );
});
