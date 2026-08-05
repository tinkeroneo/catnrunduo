(function initJourneyProgress(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CatJourneyProgress = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createJourneyProgressApi() {
  'use strict';

  const JOURNEY_VERSION = 1;
  const JOURNEY_KEY = 'catPlatformer.journey.v1';

  function safeInteger(value, min, max, fallback) {
    const number = Number(value);
    return Number.isSafeInteger(number) && number >= min && number <= max ? number : fallback;
  }

  function createJourney() {
    return { version: JOURNEY_VERSION, maxUnlocked: 1, levels: {} };
  }

  function normalizeLevelRecord(value) {
    if (!value || typeof value !== 'object' || value.cleared !== true) return null;
    const bestTimeMs = safeInteger(value.bestTimeMs, 0, 24 * 60 * 60 * 1000, null);
    const bestScore = safeInteger(value.bestScore, 0, Number.MAX_SAFE_INTEGER, 0);
    return {
      cleared: true,
      bestTimeMs,
      bestScore,
      challenge: value.challenge === true,
      discovery: value.discovery === true,
    };
  }

  function normalizeJourney(value, maxLevel = 52) {
    if (!value || typeof value !== 'object' || value.version !== JOURNEY_VERSION) return createJourney();
    const levels = {};
    for (let level = 1; level <= maxLevel; level += 1) {
      const record = normalizeLevelRecord(value.levels?.[level]);
      if (record) levels[level] = record;
    }
    const highestCleared = Object.keys(levels).reduce((max, key) => Math.max(max, Number(key)), 0);
    const storedUnlocked = safeInteger(value.maxUnlocked, 1, maxLevel, 1);
    return {
      version: JOURNEY_VERSION,
      maxUnlocked: Math.min(maxLevel, Math.max(storedUnlocked, Math.min(maxLevel, highestCleared + 1))),
      levels,
    };
  }

  function loadJourney(storage, maxLevel = 52) {
    try {
      const raw = storage?.getItem?.(JOURNEY_KEY);
      return raw ? normalizeJourney(JSON.parse(raw), maxLevel) : createJourney();
    } catch {
      return createJourney();
    }
  }

  function saveJourney(storage, journey, maxLevel = 52) {
    const normalized = normalizeJourney(journey, maxLevel);
    try {
      storage?.setItem?.(JOURNEY_KEY, JSON.stringify(normalized));
      return true;
    } catch {
      return false;
    }
  }

  function recordLevelResult(journey, result, maxLevel = 52) {
    const normalized = normalizeJourney(journey, maxLevel);
    const level = safeInteger(result?.level, 1, maxLevel, null);
    if (level === null) return normalized;
    const previous = normalized.levels[level] || {};
    const timeMs = safeInteger(result?.timeMs, 0, 24 * 60 * 60 * 1000, null);
    const score = safeInteger(result?.score, 0, Number.MAX_SAFE_INTEGER, 0);
    normalized.levels[level] = {
      cleared: true,
      bestTimeMs: previous.bestTimeMs == null
        ? timeMs
        : timeMs == null ? previous.bestTimeMs : Math.min(previous.bestTimeMs, timeMs),
      bestScore: Math.max(previous.bestScore || 0, score),
      challenge: previous.challenge === true || result?.challenge === true,
      discovery: previous.discovery === true || result?.discovery === true,
    };
    normalized.maxUnlocked = Math.max(normalized.maxUnlocked, Math.min(maxLevel, level + 1));
    return normalized;
  }

  function getJourneyCounts(journey, maxLevel = 52) {
    const normalized = normalizeJourney(journey, maxLevel);
    return Object.values(normalized.levels).reduce((counts, level) => ({
      cleared: counts.cleared + 1,
      challenges: counts.challenges + (level.challenge ? 1 : 0),
      discoveries: counts.discoveries + (level.discovery ? 1 : 0),
    }), { cleared: 0, challenges: 0, discoveries: 0 });
  }

  return {
    JOURNEY_VERSION,
    JOURNEY_KEY,
    createJourney,
    normalizeJourney,
    loadJourney,
    saveJourney,
    recordLevelResult,
    getJourneyCounts,
  };
}));
