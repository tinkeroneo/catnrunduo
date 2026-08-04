(function exposeLevelGenerator(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CatLevelGenerator = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const DEFAULTS = {
    worldWidth: 2600,
    worldHeight: 720,
    maxLevel: 52,
    movingVMinY: 180,
    movingVMaxY: 550,
    bossLevelInterval: 10,
  };

  function rand01(seed, index) {
    const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function platformTypeForRoll(roll) {
    if (roll > 0.96) return 'spring';
    if (roll > 0.94) return 'moving_v';
    if (roll > 0.86) return 'moving';
    if (roll < 0.12) return 'crumbly';
    return 'normal';
  }

  function generateLevelConfig(level, overrides = {}) {
    const options = { ...DEFAULTS, ...overrides };
    const {
      worldWidth,
      worldHeight,
      maxLevel,
      movingVMinY,
      movingVMaxY,
      bossLevelInterval,
    } = options;
    const groundPickupY = overrides.groundPickupY ?? worldHeight - 88;
    const groundSpringY = overrides.groundSpringY ?? worldHeight - 64;
    const seed = level * 97;
    const progress = Math.min(1, Math.max(0, (level - 3) / Math.max(1, maxLevel - 3)));
    const platformCount = 10 + Math.floor(progress * 8);
    const platforms = [];
    const xStart = 320;
    const xStep = (worldWidth - 520) / Math.max(1, platformCount - 1);

    for (let index = 0; index < platformCount; index += 1) {
      const x = Math.round(xStart + index * xStep);
      const wave = Math.sin((index + level * 0.3) * 0.9) * 95;
      const jitter = (rand01(seed, index) - 0.5) * (90 + progress * 70);
      const y = clamp(Math.round(380 + wave + jitter), 210, 510);
      const type = index > 0 && index < platformCount - 1
        ? platformTypeForRoll(rand01(seed + 201, index))
        : 'normal';
      let range = Math.round(80 + rand01(seed + 211, index) * 90);
      if (type === 'moving_v') {
        const upRoom = Math.max(35, y - movingVMinY);
        const downRoom = Math.max(35, movingVMaxY - y);
        const maxRange = Math.max(35, Math.min(110, upRoom, downRoom));
        range = Math.round(35 + rand01(seed + 211, index) * (maxRange - 35));
      }
      const speed = Math.round(60 + rand01(seed + 223, index) * 55);
      platforms.push({ x, y, type, range, speed });
    }

    const groundSpringCount = progress > 0.55 ? 2 : 1;
    for (let index = 0; index < groundSpringCount; index += 1) {
      const x = Math.round(620 + index * 930 + rand01(seed + 407, index) * 320);
      platforms.push({ x: clamp(x, 260, worldWidth - 260), y: groundSpringY, type: 'spring' });
    }

    const mice = [[220, groundPickupY], [worldWidth - 80, groundPickupY]];
    const mouseTarget = 12 + Math.floor(progress * 10);
    for (let index = 0; index < platforms.length && mice.length < mouseTarget; index += 1) {
      const { x, y } = platforms[index];
      mice.push([x, y - 40]);
      if (mice.length < mouseTarget && index % 3 === 1) mice.push([x + 35, y - 52]);
    }

    const enemies = [];
    const enemyCount = 4 + Math.floor(progress * 7);
    const segmentWidth = (worldWidth - 520) / enemyCount;
    for (let index = 0; index < enemyCount; index += 1) {
      const center = Math.round(340 + index * segmentWidth + segmentWidth * 0.5);
      const patrol = Math.round(110 + progress * 80 + rand01(seed + 11, index) * 60);
      enemies.push({
        x: center,
        y: worldHeight - 90,
        minX: clamp(center - patrol, 180, worldWidth - 220),
        maxX: clamp(center + patrol, 220, worldWidth - 120),
        speed: Math.round(80 + progress * 65 + rand01(seed + 29, index) * 22),
        type: index % 3 === 1 || rand01(seed + 911, index) > 0.86 ? 'hunter' : 'patrol',
      });
    }

    const catnips = [];
    const catnipCount = 2 + Math.floor(progress * 4);
    for (let index = 0; index < catnipCount; index += 1) {
      const x = Math.round(300 + index * ((worldWidth - 600) / Math.max(1, catnipCount - 1))
        + (rand01(seed + 509, index) - 0.5) * 180);
      catnips.push([clamp(x, 220, worldWidth - 220), groundPickupY]);
    }

    const hiddenLives = [];
    if (level % 4 === 0 || rand01(seed + 307, 1) > 0.92) {
      const lifeCount = progress > 0.72 && rand01(seed + 313, 2) > 0.65 ? 2 : 1;
      const candidates = platforms.filter((platform) => (
        platform.type === 'normal' && platform.y >= 250 && platform.y <= 460
      ));
      for (let index = 0; index < lifeCount && candidates.length; index += 1) {
        const candidateIndex = Math.floor(rand01(seed + 317, index) * candidates.length) % candidates.length;
        const platform = candidates[candidateIndex];
        hiddenLives.push([platform.x, platform.y]);
      }
    }

    const config = { platforms, mice, enemies, catnips, hiddenLives };
    if (level % bossLevelInterval === 0) {
      config.boss = {
        x: worldWidth - 140,
        y: worldHeight - 92,
        minX: worldWidth - 280,
        maxX: worldWidth - 80,
        speed: 90 + Math.floor(progress * 20),
        hp: 4 + Math.floor(progress * 3),
      };
    }
    return config;
  }

  return { generateLevelConfig, platformTypeForRoll, rand01 };
}));
