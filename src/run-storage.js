(function initRunStorage(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CatRunStorage = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createRunStorageApi() {
  'use strict';

  const RUN_VERSION = 1;
  const RUN_KEY = 'catPlatformer.run.v1';
  const AUDIO_KEY = 'catPlatformer.audioMode';

  function toInteger(value, min, max) {
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < min || number > max) return null;
    return number;
  }

  function normalizeRun(value, maxLevel = 52) {
    if (!value || typeof value !== 'object' || value.version !== RUN_VERSION) return null;
    const level = toInteger(value.level, 1, maxLevel);
    const score = toInteger(value.score, 0, Number.MAX_SAFE_INTEGER);
    const lives = toInteger(value.lives, 1, 99);
    const totalMiceCollected = toInteger(value.totalMiceCollected, 0, Number.MAX_SAFE_INTEGER);
    const nextMouseLifeMilestone = toInteger(value.nextMouseLifeMilestone, 1, Number.MAX_SAFE_INTEGER);
    const challengeSuccessStreak = toInteger(value.challengeSuccessStreak, 0, maxLevel);
    const challengeMissStreak = toInteger(value.challengeMissStreak, 0, maxLevel);
    const elapsedMs = toInteger(value.elapsedMs, 0, 7 * 24 * 60 * 60 * 1000);
    if ([
      level,
      score,
      lives,
      totalMiceCollected,
      nextMouseLifeMilestone,
      challengeSuccessStreak,
      challengeMissStreak,
      elapsedMs,
    ].some((entry) => entry === null)) return null;

    return {
      version: RUN_VERSION,
      level,
      score,
      lives,
      totalMiceCollected,
      nextMouseLifeMilestone,
      challengeSuccessStreak,
      challengeMissStreak,
      elapsedMs,
      savedAt: Number.isFinite(Number(value.savedAt)) ? Number(value.savedAt) : Date.now(),
    };
  }

  function clearRun(storage) {
    try {
      storage?.removeItem?.(RUN_KEY);
      return true;
    } catch {
      return false;
    }
  }

  function loadRun(storage, maxLevel = 52) {
    try {
      const raw = storage?.getItem?.(RUN_KEY);
      if (!raw) return null;
      const run = normalizeRun(JSON.parse(raw), maxLevel);
      if (!run) clearRun(storage);
      return run;
    } catch {
      clearRun(storage);
      return null;
    }
  }

  function saveRun(storage, value, maxLevel = 52) {
    const run = normalizeRun({ ...value, version: RUN_VERSION, savedAt: Date.now() }, maxLevel);
    if (!run) return false;
    try {
      storage?.setItem?.(RUN_KEY, JSON.stringify(run));
      return true;
    } catch {
      return false;
    }
  }

  function normalizeAudioMode(value, fallback = 'primary') {
    const mode = typeof value === 'string' ? value.trim().toLowerCase() : '';
    return /^(off|[a-z0-9_-]{1,64})$/.test(mode) ? mode : fallback;
  }

  function loadAudioMode(storage, fallback = 'primary') {
    try {
      return normalizeAudioMode(storage?.getItem?.(AUDIO_KEY), fallback);
    } catch {
      return fallback;
    }
  }

  function saveAudioMode(storage, mode) {
    const normalized = normalizeAudioMode(mode, 'off');
    try {
      storage?.setItem?.(AUDIO_KEY, normalized);
      return true;
    } catch {
      return false;
    }
  }

  function shouldConfirmRestart({ gameOver = false, gameWon = false, level = 1, score = 0 } = {}) {
    if (gameOver || gameWon) return false;
    return Number(level) > 1 || Number(score) > 0;
  }

  return {
    AUDIO_KEY,
    RUN_KEY,
    RUN_VERSION,
    clearRun,
    loadAudioMode,
    loadRun,
    normalizeAudioMode,
    normalizeRun,
    saveAudioMode,
    saveRun,
    shouldConfirmRestart,
  };
}));
