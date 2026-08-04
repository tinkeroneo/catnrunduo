const assert = require('node:assert/strict');
const test = require('node:test');

const storageApi = require('../src/run-storage.js');

function createStorage({ blocked = false } = {}) {
  const values = new Map();
  return {
    getItem(key) {
      if (blocked) throw new Error('blocked');
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      if (blocked) throw new Error('blocked');
      values.set(key, String(value));
    },
    removeItem(key) {
      if (blocked) throw new Error('blocked');
      values.delete(key);
    },
  };
}

const run = {
  level: 12,
  score: 14820,
  lives: 4,
  totalMiceCollected: 119,
  nextMouseLifeMilestone: 159,
  challengeSuccessStreak: 2,
  challengeMissStreak: 0,
  elapsedMs: 184223,
};

test('versioned run snapshots round-trip and reject corrupt data', () => {
  const storage = createStorage();
  assert.equal(storageApi.saveRun(storage, run), true);
  const loaded = storageApi.loadRun(storage);
  assert.deepEqual(loaded, {
    version: 1,
    ...run,
    savedAt: loaded.savedAt,
  });

  storage.setItem(storageApi.RUN_KEY, '{bad json');
  assert.equal(storageApi.loadRun(storage), null);
  assert.equal(storage.getItem(storageApi.RUN_KEY), null);
});

test('storage failures are safe and audio mode is persisted', () => {
  const blocked = createStorage({ blocked: true });
  assert.equal(storageApi.loadRun(blocked), null);
  assert.equal(storageApi.saveRun(blocked, run), false);
  assert.equal(storageApi.loadAudioMode(blocked, 'primary'), 'primary');

  const storage = createStorage();
  assert.equal(storageApi.saveAudioMode(storage, 'bgm_alt'), true);
  assert.equal(storageApi.loadAudioMode(storage), 'bgm_alt');
});

test('active runs require restart confirmation but terminal screens do not', () => {
  assert.equal(storageApi.shouldConfirmRestart({ level: 1, score: 0 }), false);
  assert.equal(storageApi.shouldConfirmRestart({ level: 1, score: 100 }), true);
  assert.equal(storageApi.shouldConfirmRestart({ level: 8, score: 0 }), true);
  assert.equal(storageApi.shouldConfirmRestart({ level: 8, score: 100, gameOver: true }), false);
  assert.equal(storageApi.shouldConfirmRestart({ level: 52, score: 100, gameWon: true }), false);
});
