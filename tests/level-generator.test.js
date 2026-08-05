const assert = require('node:assert/strict');
const test = require('node:test');
const { DISCOVERY_ROUTES, generateLevelConfig, platformTypeForRoll } = require('../src/level-generator');

test('platform roll ranges make every intended type reachable', () => {
  assert.equal(platformTypeForRoll(0.97), 'spring');
  assert.equal(platformTypeForRoll(0.95), 'moving_v');
  assert.equal(platformTypeForRoll(0.90), 'moving');
  assert.equal(platformTypeForRoll(0.08), 'crumbly');
  assert.equal(platformTypeForRoll(0.50), 'normal');
});

test('levels 3 through 52 are deterministic and structurally valid', () => {
  const types = new Set();
  for (let level = 3; level <= 52; level += 1) {
    const first = generateLevelConfig(level);
    const second = generateLevelConfig(level);
    assert.deepEqual(first, second, `level ${level} must be deterministic`);
    assert.ok(first.platforms.length >= 11, `level ${level} needs platforms and a spring pad`);
    assert.ok(first.mice.length >= 12, `level ${level} needs collectible coverage`);
    assert.ok(first.discoveryRoute, `level ${level} needs an optional discovery route`);
    assert.equal(first.discoveryRoute.mice.length, 4, `level ${level} route needs four gold mice`);
    assert.ok(first.discoveryRoute.bonus > 0, `level ${level} route needs a reward`);
    for (const [x, y] of first.discoveryRoute.mice) {
      assert.ok(x >= 0 && x <= 2600, `level ${level} discovery x out of bounds`);
      assert.ok(y >= 0 && y <= 720, `level ${level} discovery y out of bounds`);
    }
    for (const platform of first.platforms) {
      types.add(platform.type);
      assert.ok(platform.x >= 0 && platform.x <= 2600, `level ${level} platform x out of bounds`);
      assert.ok(platform.y >= 0 && platform.y <= 720, `level ${level} platform y out of bounds`);
    }
    for (const enemy of first.enemies) {
      assert.ok(enemy.minX <= enemy.x && enemy.x <= enemy.maxX, `level ${level} patrol bounds invalid`);
    }
    assert.equal(Boolean(first.boss), level % 10 === 0, `level ${level} boss cadence changed`);
  }
  assert.deepEqual([...types].sort(), ['crumbly', 'moving', 'moving_v', 'normal', 'spring']);
  assert.deepEqual(
    [3, 4, 5].map((level) => generateLevelConfig(level).discoveryRoute.key),
    DISCOVERY_ROUTES.map((route) => route.key),
  );
});
