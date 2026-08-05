const assert = require('node:assert/strict');
const test = require('node:test');

const {
  calculateChallengeBonus,
  createLevelSummary,
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

test('level summary distinguishes neutral introduction, success and missed tasks', () => {
  const neutral = createLevelSummary({ level: 1, levelClearBonus: 500, score: 900 });
  assert.equal(neutral.challengeState, 'neutral');
  assert.equal(neutral.challengeText, 'Einführung abgeschlossen');
  assert.equal(neutral.totalBonus, 500);

  const completed = createLevelSummary({
    level: 4,
    nextLevel: 5,
    levelClearBonus: 2000,
    challengeLabel: '2 Gegner besiegen',
    challengeState: 'completed',
    challengeBonus: 350,
    discoveryLabel: 'Wipfelspur',
    discoveryCompleted: true,
    discoveryBonus: 408,
    streak: 3,
    livesLost: 0,
    maxCombo: 6,
    stomps: 2,
    score: 7200,
  });
  assert.deepEqual(completed, {
    title: 'Level 4 geschafft!',
    challengeText: '2 Gegner besiegen geschafft',
    challengeState: 'completed',
    levelBonus: 2000,
    challengeBonus: 350,
    discoveryLabel: 'Wipfelspur',
    discoveryCompleted: true,
    discoveryBonus: 408,
    totalBonus: 2758,
    streak: 3,
    livesLost: 0,
    maxCombo: 6,
    stomps: 2,
    score: 7200,
    nextLevel: 5,
  });

  const missed = createLevelSummary({ challengeLabel: 'Kein Treffer', challengeState: 'missed' });
  assert.equal(missed.challengeText, 'Kein Treffer verpasst');
});
