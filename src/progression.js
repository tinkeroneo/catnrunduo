(function initCatProgression(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CatProgression = api;
})(typeof window !== 'undefined' ? window : globalThis, function createCatProgression() {
  const LEVEL_MODIFIERS = [
    { key: 'normal', label: 'Normal', gravityMul: 1, runMul: 1, enemySpeedMul: 1, windX: 0, challengeBonusMul: 1.0 },
    { key: 'low_gravity', label: 'Low Gravity', gravityMul: 0.86, runMul: 1, enemySpeedMul: 1, windX: 0, challengeBonusMul: 1.04 },
    { key: 'sticky', label: 'Sticky Ground', gravityMul: 1, runMul: 0.84, enemySpeedMul: 1, windX: 0, challengeBonusMul: 1.06 },
    { key: 'wind_right', label: 'Wind →', gravityMul: 1, runMul: 1, enemySpeedMul: 1, windX: 24, challengeBonusMul: 1.1 },
    { key: 'wind_left', label: '← Wind', gravityMul: 1, runMul: 1, enemySpeedMul: 1, windX: -24, challengeBonusMul: 1.1 },
    { key: 'fast_patrol', label: 'Schnelle Patrouille', gravityMul: 1, runMul: 1, enemySpeedMul: 1.16, windX: 0, challengeBonusMul: 1.14 },
  ];
  const LEVEL_CHALLENGES = [
    { key: 'no_hit', label: 'Kein Treffer' },
    { key: 'combo5', label: 'Combo x1.5 (5er)' },
    { key: 'stomps2', label: '2 Gegner besiegen' },
  ];

  function getLevelModifier(level) {
    if (level <= 1) return LEVEL_MODIFIERS[0];
    const idx = 1 + ((level - 2) % (LEVEL_MODIFIERS.length - 1));
    return LEVEL_MODIFIERS[idx];
  }

  function getLevelChallenge(level) {
    if (level <= 1) return { key: 'intro', label: 'Aufwärmen', bonus: 0 };
    const definition = LEVEL_CHALLENGES[(level - 2) % LEVEL_CHALLENGES.length];
    return { key: definition.key, label: definition.label, bonus: 220 + level * 18 };
  }

  function evaluateLevelChallenge(challenge, { livesLost = 0, maxCombo = 0, stomps = 0 } = {}) {
    if (!challenge || challenge.key === 'intro') return { completed: false, bonus: 0, key: 'intro' };
    let completed = false;
    if (challenge.key === 'no_hit') completed = livesLost === 0;
    else if (challenge.key === 'combo5') completed = maxCombo >= 5;
    else if (challenge.key === 'stomps2') completed = stomps >= 2;
    else return { completed: false, bonus: 0, key: challenge.key };
    return { completed, bonus: challenge.bonus, key: challenge.key };
  }

  function calculateChallengeBonus(baseBonus, currentStreak, modifier) {
    const modifierMultiplier = modifier?.challengeBonusMul ?? 1;
    const streakMultiplier = 1 + Math.min(3, Math.max(0, currentStreak)) * 0.1;
    return Math.round(baseBonus * modifierMultiplier * streakMultiplier);
  }

  function createLevelSummary({
    level = 1,
    nextLevel = level + 1,
    levelClearBonus = 0,
    challengeLabel = 'Aufgabe',
    challengeState = 'neutral',
    challengeBonus = 0,
    discoveryLabel = '',
    discoveryCompleted = false,
    discoveryBonus = 0,
    streak = 0,
    livesLost = 0,
    maxCombo = 0,
    stomps = 0,
    score = 0,
  } = {}) {
    const safeLevelBonus = Math.max(0, Math.round(Number(levelClearBonus) || 0));
    const safeChallengeBonus = Math.max(0, Math.round(Number(challengeBonus) || 0));
    const safeDiscoveryBonus = Math.max(0, Math.round(Number(discoveryBonus) || 0));
    const state = ['completed', 'missed'].includes(challengeState) ? challengeState : 'neutral';
    const challengeText = state === 'completed'
      ? `${challengeLabel} geschafft`
      : state === 'missed'
        ? `${challengeLabel} verpasst`
        : 'Einführung abgeschlossen';
    return {
      title: `Level ${Math.max(1, Math.floor(level))} geschafft!`,
      challengeText,
      challengeState: state,
      levelBonus: safeLevelBonus,
      challengeBonus: safeChallengeBonus,
      discoveryLabel: String(discoveryLabel || ''),
      discoveryCompleted: Boolean(discoveryCompleted),
      discoveryBonus: safeDiscoveryBonus,
      totalBonus: safeLevelBonus + safeChallengeBonus + safeDiscoveryBonus,
      streak: Math.max(0, Math.floor(Number(streak) || 0)),
      livesLost: Math.max(0, Math.floor(Number(livesLost) || 0)),
      maxCombo: Math.max(0, Math.floor(Number(maxCombo) || 0)),
      stomps: Math.max(0, Math.floor(Number(stomps) || 0)),
      score: Math.max(0, Math.floor(Number(score) || 0)),
      nextLevel: Math.max(1, Math.floor(nextLevel)),
    };
  }

  return {
    LEVEL_MODIFIERS,
    LEVEL_CHALLENGES,
    getLevelModifier,
    getLevelChallenge,
    evaluateLevelChallenge,
    calculateChallengeBonus,
    createLevelSummary,
  };
});
