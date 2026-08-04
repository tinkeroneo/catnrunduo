const assert = require('node:assert/strict');
const test = require('node:test');

const {
  calculateChallengeBonus,
  evaluateLevelChallenge,
  getLevelChallenge,
  getLevelModifier,
} = require('../src/progression.js');

test('level variants and tasks rotate deterministically after the introduction', () => {
  assert.equal(getLevelModifier(1).key, 'normal');
  assert.equal(getLevelChallenge(1).key, 'intro');
  assert.deepEqual(
    [2, 3, 4, 5, 6].map((level) => getLevelModifier(level).key),
    ['low_gravity', 'sticky', 'wind_right', 'wind_left', 'fast_patrol']
  );
  assert.equal(getLevelModifier(7).key, 'low_gravity');
  assert.deepEqual(
    [2, 3, 4, 5].map((level) => getLevelChallenge(level).key),
    ['no_hit', 'combo5', 'stomps2', 'no_hit']
  );
  assert.equal(getLevelChallenge(4).bonus, 292);
});

test('task evaluation covers success thresholds and unknown tasks safely', () => {
  const noHit = { key: 'no_hit', bonus: 250 };
  const combo = { key: 'combo5', bonus: 260 };
  const stomps = { key: 'stomps2', bonus: 270 };

  assert.equal(evaluateLevelChallenge(noHit, { livesLost: 0 }).completed, true);
  assert.equal(evaluateLevelChallenge(noHit, { livesLost: 1 }).completed, false);
  assert.equal(evaluateLevelChallenge(combo, { maxCombo: 5 }).completed, true);
  assert.equal(evaluateLevelChallenge(stomps, { stomps: 2 }).completed, true);
  assert.deepEqual(evaluateLevelChallenge({ key: 'future', bonus: 999 }), {
    completed: false,
    bonus: 0,
    key: 'future',
  });
});

test('task bonus applies modifier and a capped non-negative streak', () => {
  const modifier = { challengeBonusMul: 1.1 };
  assert.equal(calculateChallengeBonus(100, -2, modifier), 110);
  assert.equal(calculateChallengeBonus(100, 2, modifier), 132);
  assert.equal(calculateChallengeBonus(100, 99, modifier), 143);
});
