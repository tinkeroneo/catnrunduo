const assert = require('node:assert/strict');
const test = require('node:test');

const journeyApi = require('../src/journey-progress.js');

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

test('journey progress keeps best results and unlocks only the next stage', () => {
  let journey = journeyApi.createJourney();
  journey = journeyApi.recordLevelResult(journey, {
    level: 1,
    timeMs: 42000,
    score: 800,
    challenge: false,
    discovery: false,
  });
  journey = journeyApi.recordLevelResult(journey, {
    level: 1,
    timeMs: 39000,
    score: 750,
    challenge: true,
    discovery: true,
  });

  assert.equal(journey.maxUnlocked, 2);
  assert.deepEqual(journey.levels[1], {
    cleared: true,
    bestTimeMs: 39000,
    bestScore: 800,
    challenge: true,
    discovery: true,
  });
});

test('journey storage is versioned, bounded and survives corrupt data', () => {
  const storage = createStorage();
  const journey = journeyApi.recordLevelResult(journeyApi.createJourney(), { level: 52, score: 10 });
  assert.equal(journeyApi.saveJourney(storage, journey), true);
  assert.equal(journeyApi.loadJourney(storage).maxUnlocked, 52);

  storage.setItem(journeyApi.JOURNEY_KEY, '{broken');
  assert.deepEqual(journeyApi.loadJourney(storage), journeyApi.createJourney());
  assert.deepEqual(journeyApi.getJourneyCounts({ version: 1, maxUnlocked: 99, levels: {} }), {
    cleared: 0,
    challenges: 0,
    discoveries: 0,
  });
});
