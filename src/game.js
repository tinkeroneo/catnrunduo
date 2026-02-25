const WORLD_WIDTH = 2600;
const WORLD_HEIGHT = 720;
const MAX_LEVEL = 52;
const MOVING_V_MIN_Y = 180;
const MOVING_V_MAX_Y = WORLD_HEIGHT - 170;
const DEBUG_SHOW_HIDDEN_LIFE_BLOCKS = false;
const CAT_SHEET_SCALE = 0.25;
const DOG_SHEET_SCALE = 0.12;
const DOG_BOSS_SCALE = 0.17;
const CLEAN_FRAME_ALPHA_THRESHOLD = 170;
const CAT_FRAME_BLEED_GUARD_PX = 2;
const CAT_CLEAN_TRIM_RIGHT_PX = 1;
const CAT_CLEAN_RUN_FRAME_ORDER = [0, 1, 3, 1];
const MOUSE_GRID_COLS = 2;
const MOUSE_GRID_ROWS = 3;
const MOUSE_FRAME_COUNT = 6;
const MOUSE_TARGET_FRAME_W = 256;
const MOUSE_TARGET_FRAME_H = 256;
const MOUSE_BASELINE_Y = 220;
const ENABLE_MOUSE_DOG_SHEETS = true;
const DOG_FRAME_COUNT = 12;
const DOG_GRID_COLS = 3;
const DOG_GRID_ROWS = 4;
const DOG_FRAME_WIDTH = 384;
const DOG_FRAME_HEIGHT = 342;
const DOG_RUN_FRAME_SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const DOG_BASELINE_Y = 333;
const DOG_MIN_CONNECTED_PIXELS = 180;
const DOG_MIN_COMPONENT_HEIGHT = 60;
const DOG_BG_DETECTION_ALPHA_OPAQUE_RATIO = 0.98;
const DOG_BG_COLOR_DISTANCE_THRESHOLD = 55;
const DOG_CHASE_DISTANCE = 320;
const DOG_CHASE_SPEED_MUL = 1.45;
const BOSS_LEVEL_INTERVAL = 10;
const MICE_PER_EXTRA_LIFE = 53;
const MOUSE_COLLECT_RADIUS_X = 26;
const MOUSE_COLLECT_RADIUS_Y = 22;
const ENEMY_STOMP_WINDOW_NORMAL = 18;
const ENEMY_STOMP_WINDOW_BOSS = 24;
const ENEMY_STOMP_MIN_DESCEND_SPEED = 35;
const CAMERA_LOOKAHEAD_X = 140;
const CAMERA_LOOKAHEAD_LERP = 0.18;
const TOUCH_MOVE_DEADZONE_PX = 10;
const TOUCH_SWIPE_UP_MIN_PX = 20;
const TOUCH_SWIPE_SIDE_MIN_PX = 12;
const JUMP_COYOTE_MS = 130;
const JUMP_BUFFER_MS = 140;
const DOG_SHEET_KEYS = ['dog_sheet_new', 'dog_sheet_legacy'];
const DOG_CHASE_SHEET_KEYS = ['dog_chase_sheet_new', 'dog_chase_sheet_new_nodot', 'dog_chase_sheet_legacy'];
const THEMES = [
  {
    key: 'forest',
    label: 'Wald',
    sky: '#9bdcff',
    ground: { B: '#4d341f', 7: '#8fbf78', 6: '#7fb06a', 5: '#739f5f', 4: '#678f55', 3: '#5b7f4b', 2: '#4f7141' },
    gameplay: { enemySpeedMul: 0.95, mousePoints: 100, catnipMs: 7000, stompPoints: 140 },
  },
  {
    key: 'ocean',
    label: 'Ozean',
    sky: '#86c9ff',
    ground: { B: '#3e2f27', 7: '#d2be8b', 6: '#c7b47f', 5: '#baa672', 4: '#ac9766', 3: '#9d8658', 2: '#8d764b' },
    gameplay: { enemySpeedMul: 0.9, mousePoints: 95, catnipMs: 7800, stompPoints: 130 },
  },
  {
    key: 'desert',
    label: 'Wueste',
    sky: '#ffd7a6',
    ground: { B: '#5a3f28', 7: '#dcb26e', 6: '#d3a763', 5: '#c99a58', 4: '#bd8d4f', 3: '#b08046', 2: '#a1713d' },
    gameplay: { enemySpeedMul: 1.12, mousePoints: 110, catnipMs: 5200, stompPoints: 165 },
  },
  {
    key: 'mountain',
    label: 'Berg',
    sky: '#b8d2f0',
    ground: { B: '#3c3c45', 7: '#9ca5b7', 6: '#909aad', 5: '#828d9f', 4: '#747f90', 3: '#687284', 2: '#5a6475' },
    gameplay: { enemySpeedMul: 1.06, mousePoints: 105, catnipMs: 6000, stompPoints: 155 },
  },
  {
    key: 'city',
    label: 'Stadt',
    sky: '#c6d6e6',
    ground: { B: '#33343b', 7: '#8f8f97', 6: '#84848d', 5: '#787982', 4: '#6d6e78', 3: '#61636d', 2: '#545762' },
    gameplay: { enemySpeedMul: 1.1, mousePoints: 115, catnipMs: 5600, stompPoints: 170 },
  },
];

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'game',
  backgroundColor: '#8fd3ff',
  pixelArt: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  audio: {
    noAudio: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

let player;
let cursors;
let wasd;
let canDoubleJump = false;
let jumpPressed = false;
let lastGroundedAt = 0;
let jumpBufferedUntil = 0;
let gameWon = false;
let gameOver = false;
let gamePaused = false;
let mice;
let enemies;
let checkpoints;
let catnips;
let boss;
let springPlatforms;
let crumblyPlatforms;
let movingPlatforms;
let lifePickups;
let hiddenLifeBlocks;
let miceTotal = 0;
let miceCollected = 0;
let totalMiceCollected = 0;
let nextMouseLifeMilestone = MICE_PER_EXTRA_LIFE;
let lives = 3;
let hitCooldown = 0;
let boostUntilMs = 0;
let score = 0;
let runStartMs = 0;
let bestTimeMs = null;
let currentLevel = 1;
let currentTheme = THEMES[0];
let respawnX = 100;
let respawnY = WORLD_HEIGHT - 120;
let scoreText;
let lifeText;
let timerText;
let bestText;
let levelText;
let boostText;
let bossText;
let statusText;
let statusClearAt = 0;
let statusFadeStartAt = 0;
let restartKey;
let pauseKey;
let pauseText;
let restartTouchButton;
let sceneRef;
let parallaxLayers = [];
let backgroundClouds = [];
let sfxAudioCtx = null;
let sfxUnlockBound = false;
let useSheetCat = false;
let useCleanSheetCat = false;
let catRunAnimKey = 'cat_run';
let catJumpTextureKey = 'cat_jump';
let useSheetMouse = false;
let useSheetDog = false;
let mouseTextureKey = 'mouse';
let enemyTextureKey = 'enemy';
let enemyRunAnimKey = null;
let enemyChaseAnimKey = null;
let mobileFullscreenRequested = false;
let mobileViewportBound = false;
let mobileViewportHandler = null;
let cameraLookAheadX = 0;
let touchControls = {
  movePointerId: null,
  moveMode: 'drag',
  moveStartX: 0,
  moveX: 0,
  moveDir: 0,
  swipePointers: new Map(),
  jumpQueued: false,
  swipeLatchPointerId: null,
  swipeLatchDir: 0,
};

function preload() {
  if (!this.textures.exists('cat_sheet')) {
    this.load.spritesheet('cat_sheet', 'assets/cat/cat_default16_4x4.png', {
      frameWidth: 252,
      frameHeight: 252,
    });
  }
  if (!this.textures.exists('mouse_sheet')) {
    this.load.image('mouse_sheet', 'assets/mouse_default6_2x3.png');
  }
  if (!this.textures.exists('dog_sheet_new')) {
    this.load.image('dog_sheet_new', 'assets/dog_default12_3x4.png');
  }
  if (!this.textures.exists('dog_sheet_legacy')) {
    this.load.image('dog_sheet_legacy', 'assets/dog sprite.png');
  }
  if (!this.textures.exists('dog_chase_sheet_new')) {
    this.load.image('dog_chase_sheet_new', 'assets/dog_chase12_3x4.png');
  }
  if (!this.textures.exists('dog_chase_sheet_new_nodot')) {
    this.load.image('dog_chase_sheet_new_nodot', 'assets/dog_chase12_3x4_png');
  }
  if (!this.textures.exists('dog_chase_sheet_legacy')) {
    this.load.image('dog_chase_sheet_legacy', 'assets/dog chase sprite.png');
  }

  if (!this.textures.exists('ground')) this.textures.generate('ground', {
    data: [
      'BBBBBBBB',
      'B777777B',
      'B666666B',
      'B555555B',
      'B444444B',
      'B333333B',
      'B222222B',
      'BBBBBBBB',
    ],
    pixelWidth: 8,
    palette: {
      B: '#5a3a1f',
      7: '#b08d57',
      6: '#aa854f',
      5: '#a37e48',
      4: '#9a7641',
      3: '#926f3b',
      2: '#876534',
    },
  });

  if (!this.textures.exists('cat_run_0')) this.textures.generate('cat_run_0', {
    data: [
      '..............',
      '..OO....OO....',
      '.OOOO..OOOO...',
      '.OOOOOOOOOO...',
      '.OO0OOOO0OO...',
      '.OOOOOOOOOO...',
      '.OOO1111OOO...',
      '..OO1111OO....',
      '...OOOOOO.....',
      '..OOOOOOOO....',
      '..O22OO22O....',
    ],
    pixelWidth: 4,
    palette: {
      O: '#f0a35e',
      0: '#1f1f1f',
      1: '#fff0d7',
      2: '#d68645',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('cat_run_1')) this.textures.generate('cat_run_1', {
    data: [
      '..............',
      '..OO....OO....',
      '.OOOO..OOOO...',
      '.OOOOOOOOOO...',
      '.OO0OOOO0OO...',
      '.OOOOOOOOOO...',
      '.OOO1111OOO...',
      '...OO1111OO...',
      '..OOOOOOOO....',
      '.OOOOOO.......',
      '.O22OO22O.....',
    ],
    pixelWidth: 4,
    palette: {
      O: '#f0a35e',
      0: '#1f1f1f',
      1: '#fff0d7',
      2: '#d68645',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('cat_jump')) this.textures.generate('cat_jump', {
    data: [
      '..............',
      '..OO....OO....',
      '.OOOO..OOOO...',
      '.OOOOOOOOOO...',
      '.OO0OOOO0OO...',
      '.OOOOOOOOOO...',
      '.OOO1111OOO...',
      '.OOOO1111OO...',
      '..OOOOOOOO....',
      '...OOOOOO.....',
      '..O22OO22O....',
    ],
    pixelWidth: 4,
    palette: {
      O: '#f0a35e',
      0: '#1f1f1f',
      1: '#fff0d7',
      2: '#d68645',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('mouse')) this.textures.generate('mouse', {
    data: [
      '....M....',
      '...MMM...',
      '..MMMMM..',
      '..MM0MM..',
      '..MMMMM..',
      '...MMM...',
      '....M....',
      '...M.....',
    ],
    pixelWidth: 3,
    palette: {
      M: '#9ca4b8',
      0: '#222222',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('flag')) this.textures.generate('flag', {
    data: [
      'P.......',
      'P.RRRR..',
      'P.RRRR..',
      'P.RRRR..',
      'P.......',
      'P.......',
      'P.......',
      'PPPPPPPP',
    ],
    pixelWidth: 4,
    palette: {
      P: '#e9e7db',
      R: '#ff5a5f',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('enemy')) this.textures.generate('enemy', {
    data: [
      '..EEEE....',
      '.EEEEEE...',
      'EEEEEEEE..',
      'EE0EE0EE..',
      'EEEEEEEE..',
      '.E1EE1E...',
      '..EEEE....',
      '...EE.....',
    ],
    pixelWidth: 3,
    palette: {
      E: '#454545',
      0: '#151515',
      1: '#b7b7b7',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('boss')) this.textures.generate('boss', {
    data: [
      '...BBBBBB....',
      '..BBBBBBBB...',
      '.BBB0BB0BBB..',
      'BBBBBBBBBBBB.',
      'BBBB2222BBBB.',
      '.BBBBBBBBBB..',
      '..BB....BB...',
      '..BB....BB...',
    ],
    pixelWidth: 4,
    palette: {
      B: '#5c3a3a',
      0: '#161616',
      2: '#cfa4a4',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('checkpoint_off')) this.textures.generate('checkpoint_off', {
    data: [
      '....P...',
      '....P.BB',
      '....P.BB',
      '....P.BB',
      '....P...',
      '..CCPCC.',
      '.CCCCCCC',
      '.CCCCCCC',
    ],
    pixelWidth: 4,
    palette: {
      P: '#d8d8d8',
      B: '#6bb4ff',
      C: '#7d5a38',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('checkpoint_on')) this.textures.generate('checkpoint_on', {
    data: [
      '....P...',
      '....P.RR',
      '....P.RR',
      '....P.RR',
      '....P...',
      '..CCPCC.',
      '.CCCCCCC',
      '.CCCCCCC',
    ],
    pixelWidth: 4,
    palette: {
      P: '#f0f0f0',
      R: '#ff5a5f',
      C: '#7d5a38',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('catnip')) this.textures.generate('catnip', {
    data: [
      '..G..',
      '.GGG.',
      '.G2G.',
      '..G..',
      '..S..',
      '..S..',
    ],
    pixelWidth: 4,
    palette: {
      G: '#6bd86b',
      2: '#3f9f3f',
      S: '#5f8f3a',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('life_pickup')) this.textures.generate('life_pickup', {
    data: [
      '..RR..',
      '.R11R.',
      'R1111R',
      'R1111R',
      '.R11R.',
      '..RR..',
    ],
    pixelWidth: 4,
    palette: {
      R: '#ff5f73',
      1: '#ffd7dc',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('hidden_life_block')) this.textures.generate('hidden_life_block', {
    data: [
      'BBBBBBBB',
      'B777777B',
      'B7....7B',
      'B7....7B',
      'B7....7B',
      'B7....7B',
      'B777777B',
      'BBBBBBBB',
    ],
    pixelWidth: 8,
    palette: {
      B: '#6d4a2a',
      7: '#caa06b',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('hidden_life_block_debug')) this.textures.generate('hidden_life_block_debug', {
    data: [
      'BBBBBBBB',
      'B7D7D77B',
      'BD7777DB',
      'B777777B',
      'BD7777DB',
      'B7D7D77B',
      'B777777B',
      'BBBBBBBB',
    ],
    pixelWidth: 8,
    palette: {
      B: '#6d4a2a',
      7: '#f0c88a',
      D: '#ff5f73',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('hidden_life_block_used')) this.textures.generate('hidden_life_block_used', {
    data: [
      'BBBBBBBB',
      'B555555B',
      'B544445B',
      'B544445B',
      'B544445B',
      'B544445B',
      'B555555B',
      'BBBBBBBB',
    ],
    pixelWidth: 8,
    palette: {
      B: '#6d4a2a',
      5: '#a1805a',
      4: '#8f6f4f',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('platform_spring')) this.textures.generate('platform_spring', {
    data: [
      'BBBBBBBB',
      'B666666B',
      'B2A2A2AB',
      'B777777B',
      'B444444B',
      'B333333B',
      'B222222B',
      'BBBBBBBB',
    ],
    pixelWidth: 8,
    palette: {
      B: '#4d341f',
      7: '#8fbf78',
      6: '#7fb06a',
      4: '#678f55',
      3: '#5b7f4b',
      2: '#4f7141',
      A: '#ff6a6a',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('platform_crumbly')) this.textures.generate('platform_crumbly', {
    data: [
      'BBBBBBBB',
      'B777777B',
      'B66.666B',
      'B55.555B',
      'B4...44B',
      'B333333B',
      'B222222B',
      'BBBBBBBB',
    ],
    pixelWidth: 8,
    palette: {
      B: '#4d341f',
      7: '#c7a06f',
      6: '#be9364',
      5: '#b28658',
      4: '#a6784c',
      3: '#966945',
      2: '#865a3c',
      '.': 'rgba(0,0,0,0)',
    },
  });

  if (!this.textures.exists('platform_moving')) this.textures.generate('platform_moving', {
    data: [
      'BBBBBBBB',
      'B777777B',
      'B66AA66B',
      'B55AA55B',
      'B444444B',
      'B333333B',
      'B222222B',
      'BBBBBBBB',
    ],
    pixelWidth: 8,
    palette: {
      B: '#3f2d1c',
      7: '#8ea8c7',
      6: '#829dbe',
      5: '#7691b3',
      4: '#6984a7',
      3: '#5f7a9d',
      2: '#536e90',
      A: '#e8f1ff',
      '.': 'rgba(0,0,0,0)',
    },
  });
}

function create() {
  gameWon = false;
  gameOver = false;
  gamePaused = false;
  hitCooldown = 0;
  boostUntilMs = 0;
  boss = null;

  if (currentLevel === 1) {
    lives = 3;
    score = 0;
    runStartMs = this.time.now;
    totalMiceCollected = 0;
    nextMouseLifeMilestone = MICE_PER_EXTRA_LIFE;
  }

  respawnX = 100;
  respawnY = WORLD_HEIGHT - 120;
  sceneRef = this;

  if (currentLevel === 1) {
    try {
      const raw = window.localStorage.getItem('catPlatformer.bestTimeMs');
      bestTimeMs = raw ? Number(raw) : null;
      if (!Number.isFinite(bestTimeMs)) bestTimeMs = null;
    } catch {
      bestTimeMs = null;
    }
  }

  this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  const theme = getThemeForLevel(currentLevel);
  currentTheme = theme;
  createParallaxBackground(this, theme);
  const groundKey = ensureGroundTexture(this, theme);
  const platforms = this.physics.add.staticGroup();
  springPlatforms = this.physics.add.staticGroup();
  crumblyPlatforms = this.physics.add.staticGroup();
  movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
  lifePickups = this.physics.add.staticGroup();
  hiddenLifeBlocks = this.physics.add.staticGroup();
  for (let x = 0; x < WORLD_WIDTH; x += 128) {
    platforms.create(x + 64, WORLD_HEIGHT - 40, groundKey).setScale(2, 1).refreshBody();
  }

  const levelConfig = getLevelConfig(currentLevel);
  levelConfig.platforms.forEach((entry) => {
    const p = normalizePlatformEntry(entry);
    if (p.type === 'spring') {
      springPlatforms.create(p.x, p.y, 'platform_spring').setScale(1.4, 0.8).refreshBody();
      return;
    }
    if (p.type === 'crumbly') {
      const plat = crumblyPlatforms.create(p.x, p.y, 'platform_crumbly').setScale(1.4, 0.8).refreshBody();
      plat.setData('broken', false);
      return;
    }
    if (p.type === 'moving' || p.type === 'moving_v') {
      const plat = movingPlatforms.create(p.x, p.y, 'platform_moving');
      plat.setScale(1.4, 0.8);
      plat.setImmovable(true);
      plat.body.allowGravity = false;
      plat.body.moves = false;
      plat.body.setSize(plat.displayWidth, plat.displayHeight, true);
      const range = p.range ?? 120;
      const speed = p.speed ?? 75;
      const axis = p.type === 'moving_v' ? 'y' : 'x';
      const verticalBounds = getVerticalTravelBounds(p.y, range);
      plat.setData('axis', axis);
      plat.setData('minX', axis === 'x' ? p.x - range : p.x);
      plat.setData('maxX', axis === 'x' ? p.x + range : p.x);
      plat.setData('minY', axis === 'y' ? verticalBounds.minY : p.y);
      plat.setData('maxY', axis === 'y' ? verticalBounds.maxY : p.y);
      plat.setData('speed', speed);
      plat.setData('dir', 1);
      plat.setData('prevX', p.x);
      plat.setData('prevY', p.y);
      return;
    }
    platforms.create(p.x, p.y, groundKey).setScale(1.4, 0.8).refreshBody();
  });

  useSheetCat = this.textures.exists('cat_sheet');
  useCleanSheetCat = false;
  catRunAnimKey = useSheetCat ? 'cat_run_sheet' : 'cat_run';
  catJumpTextureKey = 'cat_jump';
  useSheetMouse = ENABLE_MOUSE_DOG_SHEETS && this.textures.exists('mouse_sheet');
  const dogSheetKey = pickExistingTextureKey(this, DOG_SHEET_KEYS);
  const dogChaseSheetKey = pickExistingTextureKey(this, DOG_CHASE_SHEET_KEYS);
  useSheetDog = ENABLE_MOUSE_DOG_SHEETS && !!dogSheetKey;
  mouseTextureKey = useSheetMouse ? 'mouse_sheet_clean_0' : 'mouse';
  enemyTextureKey = 'enemy';
  enemyRunAnimKey = null;
  enemyChaseAnimKey = null;

  if (useSheetMouse) {
    const mouseKeys = buildMouseFrames(this, 'mouse_sheet', 'mouse_sheet_clean');
    if (mouseKeys.length > 0) {
      mouseTextureKey = mouseKeys[0];
    } else {
      useSheetMouse = false;
      mouseTextureKey = 'mouse';
    }
  }

  if (useSheetDog) {
    const useCleanRunFrames = !isNewDogSheetKey(dogSheetKey);
    const dogRunKeys = buildDogPrimaryFrames(this, dogSheetKey, 'dog_sheet_clean', DOG_RUN_FRAME_SEQUENCE, useCleanRunFrames);
    const dogChaseKeys = dogChaseSheetKey
      ? buildDogPrimaryFrames(this, dogChaseSheetKey, 'dog_chase_sheet_clean', DOG_RUN_FRAME_SEQUENCE, !isNewDogSheetKey(dogChaseSheetKey))
      : [];
    if (dogRunKeys.length > 0) {
      enemyTextureKey = dogRunKeys[0];
      enemyRunAnimKey = 'dog_run_raw';
      if (this.anims.exists(enemyRunAnimKey)) this.anims.remove(enemyRunAnimKey);
      this.anims.create({
        key: enemyRunAnimKey,
        frames: dogRunKeys.map((key) => ({ key })),
        frameRate: 10,
        repeat: -1,
      });
    } else {
      useSheetDog = false;
      enemyTextureKey = 'enemy';
    }
    if (dogChaseKeys.length > 0) {
      enemyChaseAnimKey = 'dog_chase_raw';
      if (this.anims.exists(enemyChaseAnimKey)) this.anims.remove(enemyChaseAnimKey);
      this.anims.create({
        key: enemyChaseAnimKey,
        frames: dogChaseKeys.map((key) => ({ key })),
        frameRate: 12,
        repeat: -1,
      });
    } else {
      enemyChaseAnimKey = null;
    }
  }

  if (useSheetCat) {
    const cleanKeys = buildCleanCatFrames(this);
    if (cleanKeys.length >= 2) {
      useCleanSheetCat = true;
      catRunAnimKey = 'cat_run_sheet_clean';
      const orderedRunKeys = CAT_CLEAN_RUN_FRAME_ORDER
        .map((idx) => cleanKeys[idx])
        .filter(Boolean);
      const runKeys = orderedRunKeys.length >= 2
        ? orderedRunKeys
        : cleanKeys.slice(0, Math.min(4, cleanKeys.length));
      catJumpTextureKey = cleanKeys[0] || runKeys[0];
      if (this.anims.exists('cat_run_sheet_clean')) this.anims.remove('cat_run_sheet_clean');
      this.anims.create({
        key: 'cat_run_sheet_clean',
        frames: runKeys.map((key) => ({ key })),
        frameRate: 11,
        repeat: -1,
      });
    }
  }

  player = useSheetCat
    ? this.physics.add.sprite(100, WORLD_HEIGHT - 120, useCleanSheetCat ? 'cat_sheet_clean_0' : 'cat_sheet', useCleanSheetCat ? undefined : 0)
    : this.physics.add.sprite(100, WORLD_HEIGHT - 120, 'cat_run_0');
  if (useSheetCat) player.setScale(CAT_SHEET_SCALE);
  player.setCollideWorldBounds(true);
  player.setBounce(0.02);
  if (useSheetCat) {
    // Fixed pixel body to avoid scale-proportional drift with cleaned sheet frames.
    player.body.setSize(100, 22);
    // Align body bottom with paw line so sprite no longer appears to sink into ground.
    player.body.setOffset(30, 192);
  } else {
    player.body.setSize(player.displayWidth * 0.7, player.displayHeight * 0.9);
    player.body.setOffset(player.displayWidth * 0.15, player.displayHeight * 0.08);
  }

  if (useSheetCat && !useCleanSheetCat && !this.anims.exists('cat_run_sheet')) {
    this.anims.create({
      key: 'cat_run_sheet',
      frames: this.anims.generateFrameNumbers('cat_sheet', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  if (!useSheetCat && !this.anims.exists('cat_run')) {
    this.anims.create({
      key: 'cat_run',
      frames: [{ key: 'cat_run_0' }, { key: 'cat_run_1' }],
      frameRate: 8,
      repeat: -1,
    });
  }

  mice = this.physics.add.staticGroup();
  levelConfig.mice.forEach(([x, y]) => {
    const mouse = mice.create(x, y, mouseTextureKey);
    if (useSheetMouse) {
      mouse.setScale(0.12);
      mouse.refreshBody();
    }
  });
  miceTotal = levelConfig.mice.length;
  miceCollected = 0;

  enemies = this.physics.add.group({ allowGravity: true, collideWorldBounds: true });
  levelConfig.enemies.forEach((spawn) => {
    const enemySpeed = Math.round(spawn.speed * getThemeGameplay().enemySpeedMul);
    const enemy = enemies.create(spawn.x, spawn.y, enemyTextureKey);
    if (useSheetDog) enemy.setScale(DOG_SHEET_SCALE);
    if (useSheetDog) enemy.setFrame(0);
    if (useSheetDog) {
      enemy.body.setSize(18, 12);
      enemy.body.setOffset(60, 298);
    } else {
      enemy.body.setSize(enemy.displayWidth * 0.75, enemy.displayHeight * 0.9);
      enemy.body.setOffset(enemy.displayWidth * 0.13, enemy.displayHeight * 0.06);
    }
    enemy.setData('minX', spawn.minX);
    enemy.setData('maxX', spawn.maxX);
    enemy.setData('speed', enemySpeed);
    enemy.setData('baseSpeed', enemySpeed);
    enemy.setData('dir', -1);
    enemy.setData('isChasing', false);
    enemy.setVelocityX(-enemySpeed);
    if (enemyRunAnimKey) enemy.anims.play(enemyRunAnimKey, true);
  });

  if (levelConfig.boss) {
    boss = enemies.create(levelConfig.boss.x, levelConfig.boss.y, useSheetDog ? enemyTextureKey : 'boss');
    if (useSheetDog) boss.setScale(DOG_BOSS_SCALE);
    if (useSheetDog) boss.setFrame(0);
    if (useSheetDog) {
      boss.body.setSize(26, 16);
      boss.body.setOffset(9, 24);
    } else {
      boss.body.setSize(boss.displayWidth * 0.78, boss.displayHeight * 0.9);
      boss.body.setOffset(boss.displayWidth * 0.11, boss.displayHeight * 0.05);
    }
    boss.setData('isBoss', true);
    boss.setData('hp', levelConfig.boss.hp);
    boss.setData('maxHp', levelConfig.boss.hp);
    boss.setData('minX', levelConfig.boss.minX);
    boss.setData('maxX', levelConfig.boss.maxX);
    const bossSpeed = Math.round(levelConfig.boss.speed * getThemeGameplay().enemySpeedMul);
    boss.setData('speed', bossSpeed);
    boss.setData('baseSpeed', bossSpeed);
    boss.setData('dir', -1);
    boss.setData('isChasing', false);
    boss.setVelocityX(-bossSpeed);
    if (enemyRunAnimKey) boss.anims.play(enemyRunAnimKey, true);
  }

  const flag = this.physics.add.staticSprite(WORLD_WIDTH - 90, WORLD_HEIGHT - 88, 'flag');

  checkpoints = this.physics.add.staticGroup();
  [
    [900, WORLD_HEIGHT - 88],
    [1700, WORLD_HEIGHT - 88],
    [2340, WORLD_HEIGHT - 88],
  ].forEach(([x, y]) => {
    const checkpoint = checkpoints.create(x, y, 'checkpoint_off');
    checkpoint.setData('activated', false);
  });

  catnips = this.physics.add.staticGroup();
  (levelConfig.catnips || []).forEach(([x, y]) => {
    catnips.create(x, y, 'catnip');
  });
  (levelConfig.hiddenLives || []).forEach(([x, y]) => {
    const blockKey = DEBUG_SHOW_HIDDEN_LIFE_BLOCKS ? 'hidden_life_block_debug' : 'hidden_life_block';
    const block = hiddenLifeBlocks.create(x, y, blockKey);
    block.setData('used', false);
    if (DEBUG_SHOW_HIDDEN_LIFE_BLOCKS) {
      block.setVisible(true);
      block.setAlpha(0.72);
    } else {
      block.setVisible(false);
      block.setAlpha(0);
    }
  });

  this.physics.add.collider(player, platforms, () => {
    if (player.body.blocked.down) canDoubleJump = true;
  });
  this.physics.add.collider(player, springPlatforms, onSpringPlatform, null, this);
  this.physics.add.collider(player, crumblyPlatforms, onCrumblyPlatform, null, this);
  this.physics.add.collider(player, movingPlatforms, onMovingPlatform, null, this);
  this.physics.add.collider(player, hiddenLifeBlocks, hitHiddenLifeBlock, null, this);

  this.physics.add.overlap(player, mice, collectMouse, canCollectMouse, this);
  this.physics.add.overlap(player, flag, reachFlag, null, this);
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);
  this.physics.add.overlap(player, checkpoints, touchCheckpoint, null, this);
  this.physics.add.overlap(player, catnips, collectCatnip, null, this);
  this.physics.add.overlap(player, lifePickups, collectLifePickup, null, this);
  this.physics.add.collider(enemies, platforms);
  this.physics.add.collider(enemies, springPlatforms);
  this.physics.add.collider(enemies, crumblyPlatforms);
  this.physics.add.collider(enemies, movingPlatforms);

  this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  this.cameras.main.setBackgroundColor(theme.sky);
  this.cameras.main.startFollow(player, true, 0.08, 0.08);
  this.cameras.main.setFollowOffset(0, 0);
  this.cameras.main.roundPixels = true;
  this.cameras.main.setDeadzone(220, 90);

  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys('W,A,D');
  restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  setupTouchControls(this);
  bindMobileViewportSync(this);
  syncMobileViewport(this);

  levelText = this.add
    .text(16, 40, `Level: ${currentLevel}/${MAX_LEVEL}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#1f2a44',
      backgroundColor: '#ffffffaa',
      padding: { x: 8, y: 4 },
    })
    .setScrollFactor(0)
    .setDepth(10);
  levelText.setVisible(false);

  scoreText = this.add
    .text(16, 52, `L${currentLevel}/${MAX_LEVEL}  Maeuse ${miceCollected}/${miceTotal}  Punkte ${score}  Leben ${lives}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '16px',
      color: '#1f2a44',
      backgroundColor: '#ffffffaa',
      padding: { x: 8, y: 4 },
    })
    .setScrollFactor(0)
    .setDepth(10);

  lifeText = this.add
    .text(16, 118, `Leben: ${'?'.repeat(lives)}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#1f2a44',
      backgroundColor: '#ffffffaa',
      padding: { x: 8, y: 4 },
    })
    .setScrollFactor(0)
    .setDepth(10);
  lifeText.setVisible(false);

  timerText = this.add
    .text(16, 80, `Zeit ${formatMs(Math.max(0, Math.floor(this.time.now - runStartMs)))}  Best ${bestTimeMs == null ? '-' : formatMs(bestTimeMs)}  Boost -  Boss -`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '16px',
      color: '#1f2a44',
      backgroundColor: '#ffffffaa',
      padding: { x: 8, y: 4 },
    })
    .setScrollFactor(0)
    .setDepth(10);

  statusText = this.add
    .text(16, 108, ' ', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '16px',
      color: '#1f2a44',
      backgroundColor: '#ffffffaa',
      padding: { x: 8, y: 4 },
    })
    .setScrollFactor(0)
    .setDepth(10);

  bestText = this.add
    .text(16, 214, `Bestzeit: ${bestTimeMs == null ? '-' : formatMs(bestTimeMs)}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#1f2a44',
      backgroundColor: '#ffffffaa',
      padding: { x: 8, y: 4 },
    })
    .setScrollFactor(0)
    .setDepth(10);
  bestText.setVisible(false);

  boostText = this.add
    .text(16, 246, 'Boost: -', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#1f2a44',
      backgroundColor: '#ffffffaa',
      padding: { x: 8, y: 4 },
    })
    .setScrollFactor(0)
    .setDepth(10);
  boostText.setVisible(false);

  bossText = this.add
    .text(16, 278, boss ? `Boss HP: ${boss.getData('hp')}/${boss.getData('maxHp')}` : 'Boss: -', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#1f2a44',
      backgroundColor: '#ffffffaa',
      padding: { x: 8, y: 4 },
    })
    .setScrollFactor(0)
    .setDepth(10);
  bossText.setVisible(false);

  pauseText = this.add
    .text(480, 270, 'PAUSE (P zum Fortsetzen)', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '30px',
      color: '#1f2a44',
      backgroundColor: '#ffffffdd',
      padding: { x: 16, y: 10 },
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(20)
    .setVisible(false);

  const isMobileUi = window.matchMedia?.('(max-width: 900px)').matches ?? false;
  if (isMobileUi) {
    restartTouchButton = this.add
      .text(940, 14, 'Restart', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#1f2a44cc',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(40)
      .setInteractive({ useHandCursor: true });
    restartTouchButton.on('pointerdown', () => {
      restartRun();
    });
  } else {
    restartTouchButton = null;
  }

  initSfx(this);
  setStatus(`Level ${currentLevel}: Sammle alle Maeuse und erreiche die Flagge.`, 2600);
}

function collectMouse(playerSprite, mouse) {
  const spawnX = mouse.x;
  const spawnY = mouse.y;
  mouse.disableBody(true, true);
  miceCollected += 1;
  totalMiceCollected += 1;
  score += getThemeGameplay().mousePoints;
  scoreText.setText(`L${currentLevel}/${MAX_LEVEL}  Maeuse ${miceCollected}/${miceTotal}  Punkte ${score}  Leben ${lives}`);

  if (totalMiceCollected >= nextMouseLifeMilestone) {
    spawnMilestoneLife(spawnX, spawnY);
    nextMouseLifeMilestone += MICE_PER_EXTRA_LIFE;
  }

  if (miceCollected === miceTotal) {
    setStatus('Alle Maeuse gesammelt. Zur Flagge!', 2200);
  }
}

function canCollectMouse(playerSprite, mouse) {
  if (!playerSprite?.body || !mouse?.body) return false;
  const dx = Math.abs(playerSprite.x - mouse.x);
  const dy = Math.abs(playerSprite.y - mouse.y);
  return dx <= MOUSE_COLLECT_RADIUS_X && dy <= MOUSE_COLLECT_RADIUS_Y;
}

function spawnMilestoneLife(x, y) {
  if (!lifePickups) return;
  const life = lifePickups.create(x, y - 28, 'life_pickup');
  life.setAlpha(0);
  life.setVisible(true);
  sceneRef.tweens.add({
    targets: life,
    y: life.y - 12,
    alpha: 1,
    duration: 180,
    ease: 'Quad.Out',
    onUpdate: () => life.refreshBody(),
    onComplete: () => life.refreshBody(),
  });
  setStatus(`Bonus! ${MICE_PER_EXTRA_LIFE} Maeuse: Extra-Leben gespawnt.`, 1800);
}

function reachFlag() {
  if (gameWon || gameOver) return;

  if (miceCollected < miceTotal) {
    setStatus('Sammle zuerst alle Maeuse.', 1600);
    return;
  }

  if (boss && boss.active) {
    setStatus('Der Boss blockiert den Ausgang.', 1800);
    return;
  }

  const levelClearBonus = 500 * currentLevel;
  score += levelClearBonus;
  scoreText.setText(`L${currentLevel}/${MAX_LEVEL}  Maeuse ${miceCollected}/${miceTotal}  Punkte ${score}  Leben ${lives}`);

  if (currentLevel < MAX_LEVEL) {
    gameWon = true;
    setStatus(`Level ${currentLevel} geschafft! Weiter zu Level ${currentLevel + 1}...`, 0);
    player.setVelocity(0, 0);
    player.anims.stop();
    setCatIdleTexture(player);
    sceneRef.time.delayedCall(700, () => {
      currentLevel += 1;
      sceneRef.scene.restart();
    });
    return;
  }

  gameWon = true;
  const runTimeMs = Math.max(0, Math.floor(sceneRef.time.now - runStartMs));
  const lifeBonus = lives * 250;
  score += lifeBonus;
  scoreText.setText(`L${currentLevel}/${MAX_LEVEL}  Maeuse ${miceCollected}/${miceTotal}  Punkte ${score}  Leben ${lives}`);

  if (bestTimeMs == null || runTimeMs < bestTimeMs) {
    bestTimeMs = runTimeMs;
    try {
      window.localStorage.setItem('catPlatformer.bestTimeMs', String(bestTimeMs));
    } catch {
      // Ignore storage issues.
    }
    bestText.setText(`Bestzeit: ${formatMs(bestTimeMs)} (neu)`);
  }

  setStatus(`Geschafft! Zeit ${formatMs(runTimeMs)}. R fuer Neustart.`, 0);
  player.setVelocity(0, 0);
  player.anims.stop();
  setCatIdleTexture(player);
}

function hitEnemy(playerSprite, enemy) {
  if (gameWon || gameOver || gamePaused || hitCooldown > 0) return;

  const isBoss = !!enemy.getData('isBoss');
  const stompWindow = isBoss ? ENEMY_STOMP_WINDOW_BOSS : ENEMY_STOMP_WINDOW_NORMAL;
  const isDescending = playerSprite.body.velocity.y > ENEMY_STOMP_MIN_DESCEND_SPEED;
  const fromAboveByTop = playerSprite.body.bottom <= enemy.body.top + stompWindow;
  const fromAboveByCenter = playerSprite.body.center.y < enemy.body.center.y;
  const fromAbove = fromAboveByTop || fromAboveByCenter;

  if (isDescending && fromAbove) {
    if (isBoss) {
      const nextHp = Math.max(0, enemy.getData('hp') - 1);
      enemy.setData('hp', nextHp);
      playerSprite.setVelocityY(-460);
      score += Math.round(getThemeGameplay().stompPoints * 1.6);
      scoreText.setText(`L${currentLevel}/${MAX_LEVEL}  Maeuse ${miceCollected}/${miceTotal}  Punkte ${score}  Leben ${lives}`);
      if (nextHp <= 0) {
        enemy.disableBody(true, true);
        setStatus('Boss besiegt! Zur Flagge!', 2400);
      } else {
        setStatus('Treffer! Boss geschwaecht.', 1400);
      }
      return;
    }

    enemy.disableBody(true, true);
    playerSprite.setVelocityY(-430);
    score += getThemeGameplay().stompPoints;
    scoreText.setText(`L${currentLevel}/${MAX_LEVEL}  Maeuse ${miceCollected}/${miceTotal}  Punkte ${score}  Leben ${lives}`);
    setStatus('Boing! Gegner besiegt.', 1100);
    return;
  }

  hitCooldown = 60;
  const pushDir = playerSprite.x < enemy.x ? -1 : 1;
  playerSprite.setVelocityX(250 * pushDir);
  playerSprite.setVelocityY(-420);

  loseLife('Autsch! Ein Gegner hat dich erwischt.');
}

function loseLife(message) {
  if (gameWon || gameOver) return;

  lives -= 1;
  lifeText.setText(`Leben: ${'?'.repeat(Math.max(0, lives))}`);
  scoreText.setText(`L${currentLevel}/${MAX_LEVEL}  Maeuse ${miceCollected}/${miceTotal}  Punkte ${score}  Leben ${lives}`);
  setStatus(message, 1600);

  if (lives <= 0) {
    gameOver = true;
    player.setVelocity(0, 0);
    player.anims.stop();
    setCatIdleTexture(player);
    player.setTint(0xaa4444);
    setStatus('Game Over. Druecke R fuer Neustart.', 0);
    return;
  }

  respawnPlayer();
}

function updateEnemies() {
  enemies.children.iterate((enemy) => {
    if (!enemy || !enemy.active || !enemy.body) return;

    const minX = enemy.getData('minX');
    const maxX = enemy.getData('maxX');
    const baseSpeed = enemy.getData('baseSpeed') ?? enemy.getData('speed');
    let speed = baseSpeed;
    let dir = enemy.getData('dir');
    let isChasing = false;

    if (useSheetDog && player && player.active && !gameOver && !gameWon) {
      const dx = player.x - enemy.x;
      const dy = Math.abs(player.y - enemy.y);
      const inRangeX = Math.abs(dx) <= DOG_CHASE_DISTANCE;
      const inRangeY = dy <= 120;
      const insidePatrol = player.x >= minX - 48 && player.x <= maxX + 48;
      if (inRangeX && inRangeY && insidePatrol) {
        isChasing = true;
        speed = Math.round(baseSpeed * DOG_CHASE_SPEED_MUL);
        dir = dx >= 0 ? 1 : -1;
      }
    }

    if (enemy.x <= minX) dir = 1;
    if (enemy.x >= maxX) dir = -1;

    enemy.setData('isChasing', isChasing);
    enemy.setData('speed', speed);
    enemy.setData('dir', dir);
    enemy.setVelocityX(speed * dir);
    enemy.setFlipX(dir < 0);

    if (useSheetDog) {
      const targetAnim = isChasing && enemyChaseAnimKey ? enemyChaseAnimKey : enemyRunAnimKey;
      if (targetAnim && enemy.anims.currentAnim?.key !== targetAnim) {
        enemy.anims.play(targetAnim, true);
      }
    }
  });
}

function touchCheckpoint(playerSprite, checkpoint) {
  if (checkpoint.getData('activated')) return;

  checkpoint.setData('activated', true);
  checkpoint.setTexture('checkpoint_on');
  respawnX = checkpoint.x;
  respawnY = checkpoint.y - 30;
  setStatus('Checkpoint aktiviert.', 1400);
}

function collectCatnip(playerSprite, catnip) {
  catnip.disableBody(true, true);
  const now = sceneRef.time.now;
  boostUntilMs = Math.max(boostUntilMs, now) + getThemeGameplay().catnipMs;
  score += 75;
  scoreText.setText(`L${currentLevel}/${MAX_LEVEL}  Maeuse ${miceCollected}/${miceTotal}  Punkte ${score}  Leben ${lives}`);
  setStatus('Catnip! Kurz schneller und hoeher.', 1800);
}

function collectLifePickup(playerSprite, pickup) {
  if (!pickup?.active) return;
  pickup.disableBody(true, true);
  triggerSfx('life_pickup');

  if (lives < 6) {
    lives += 1;
    setStatus('Geheimes Herz! +1 Leben.', 1700);
  } else {
    score += 250;
    setStatus('Geheimes Herz gefunden: +250 Punkte.', 1700);
  }

  lifeText.setText(`Leben: ${'?'.repeat(Math.max(0, lives))}`);
  scoreText.setText(`L${currentLevel}/${MAX_LEVEL}  Maeuse ${miceCollected}/${miceTotal}  Punkte ${score}  Leben ${lives}`);
}

function hitHiddenLifeBlock(playerSprite, block) {
  if (gameWon || gameOver || gamePaused) return;
  if (!block?.active || block.getData('used')) return;

  const upward = playerSprite.body.velocity.y < -110;
  const belowBlock = playerSprite.body.top >= block.body.bottom - 14;
  const mostlyUnder = Math.abs(playerSprite.x - block.x) < 34;
  if (!upward || !belowBlock || !mostlyUnder) return;

  block.setData('used', true);
  block.setTexture('hidden_life_block_used');
  block.setVisible(true);
  block.setAlpha(1);
  triggerSfx('secret_block_hit');

  const life = lifePickups.create(block.x, block.y - 34, 'life_pickup');
  life.setAlpha(0);
  life.setVisible(true);
  sceneRef.tweens.add({
    targets: life,
    y: life.y - 14,
    alpha: 1,
    duration: 160,
    ease: 'Quad.Out',
  });

  sceneRef.tweens.add({
    targets: block,
    y: block.y - 4,
    duration: 55,
    yoyo: true,
    ease: 'Sine.Out',
    onUpdate: () => {
      block.refreshBody();
    },
    onComplete: () => {
      block.refreshBody();
    },
  });

  setStatus('Geheimer Block! Herz erscheint.', 1000);
}

function triggerSfx(name) {
  // Hook for future audio wiring without coupling gameplay code to an audio asset pipeline.
  if (!sceneRef?.events) return;
  sceneRef.events.emit('sfx', name);
}

function setCatIdleTexture(catSprite) {
  if (useCleanSheetCat) {
    catSprite.setTexture('cat_sheet_clean_0');
  } else if (useSheetCat) {
    catSprite.setTexture('cat_sheet', 0);
  } else {
    catSprite.setTexture('cat_run_0');
  }
}

function buildCleanCatFrames(scene) {
  return buildCleanSheetFrames(scene, 'cat_sheet', 'cat_sheet_clean', 16, 256, 256, 220, CAT_CLEAN_TRIM_RIGHT_PX);
}

function buildMouseFrames(scene, sourceTextureKey, outputPrefix) {
  return buildGridCleanFrames(
    scene,
    sourceTextureKey,
    outputPrefix,
    MOUSE_GRID_COLS,
    MOUSE_GRID_ROWS,
    MOUSE_FRAME_COUNT,
    MOUSE_TARGET_FRAME_W,
    MOUSE_TARGET_FRAME_H,
    MOUSE_BASELINE_Y
  );
}

function buildCleanSheetFrames(scene, sourceTextureKey, outputPrefix, frameCount, targetW, targetH, baseLineY, trimRightPx = 0) {
  const keys = [];
  if (!scene.textures.exists(sourceTextureKey)) return keys;
  const tex = scene.textures.get(sourceTextureKey);

  for (let i = 0; i < frameCount; i++) {
    const frame = tex.get(i);
    if (!frame || !frame.source || !frame.source.image) continue;

    const key = `${outputPrefix}_${i}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);

    const guard = Math.min(
      CAT_FRAME_BLEED_GUARD_PX,
      Math.floor(frame.cutWidth / 4),
      Math.floor(frame.cutHeight / 4)
    );
    const srcX = frame.cutX + guard;
    const srcY = frame.cutY + guard;
    const srcW = Math.max(1, frame.cutWidth - guard * 2);
    const srcH = Math.max(1, frame.cutHeight - guard * 2);

    const probe = document.createElement('canvas');
    probe.width = srcW;
    probe.height = srcH;
    const pctx = probe.getContext('2d');
    pctx.imageSmoothingEnabled = false;
    pctx.drawImage(
      frame.source.image,
      srcX,
      srcY,
      srcW,
      srcH,
      0,
      0,
      srcW,
      srcH
    );

    const bounds = findOpaqueBounds(pctx, probe.width, probe.height, CLEAN_FRAME_ALPHA_THRESHOLD);
    if (!bounds) continue;
    const drawW = Math.max(1, bounds.w - Math.max(0, trimRightPx));

    const out = scene.textures.createCanvas(key, targetW, targetH);
    if (!out) continue;

    const octx = out.context;
    octx.imageSmoothingEnabled = false;
    octx.clearRect(0, 0, targetW, targetH);
    const dx = Math.floor((targetW - drawW) * 0.5);
    const dy = Math.floor(baseLineY - bounds.h);
    octx.drawImage(probe, bounds.x, bounds.y, drawW, bounds.h, dx, dy, drawW, bounds.h);
    out.refresh();
    keys.push(key);
  }

  return keys;
}

function buildGridCleanFrames(scene, sourceTextureKey, outputPrefix, cols, rows, frameCount, targetW, targetH, baseLineY) {
  const keys = [];
  if (!scene.textures.exists(sourceTextureKey)) return keys;
  const tex = scene.textures.get(sourceTextureKey);
  const sourceImage = tex.getSourceImage ? tex.getSourceImage() : (tex.source?.[0]?.image ?? null);
  if (!sourceImage) return keys;

  for (let i = 0; i < frameCount; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    if (row >= rows) break;

    const sx0 = Math.round((col * sourceImage.width) / cols);
    const sx1 = Math.round(((col + 1) * sourceImage.width) / cols);
    const sy0 = Math.round((row * sourceImage.height) / rows);
    const sy1 = Math.round(((row + 1) * sourceImage.height) / rows);
    const cutW = Math.max(1, sx1 - sx0);
    const cutH = Math.max(1, sy1 - sy0);

    const key = `${outputPrefix}_${i}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);

    const probe = document.createElement('canvas');
    probe.width = cutW;
    probe.height = cutH;
    const pctx = probe.getContext('2d');
    pctx.imageSmoothingEnabled = false;
    pctx.drawImage(sourceImage, sx0, sy0, cutW, cutH, 0, 0, cutW, cutH);

    const bounds = findOpaqueBounds(pctx, cutW, cutH, CLEAN_FRAME_ALPHA_THRESHOLD);
    if (!bounds) continue;

    const out = scene.textures.createCanvas(key, targetW, targetH);
    if (!out) continue;
    const octx = out.context;
    octx.imageSmoothingEnabled = false;
    octx.clearRect(0, 0, targetW, targetH);
    const dx = Math.floor((targetW - bounds.w) * 0.5);
    const dy = Math.floor(baseLineY - bounds.h);
    octx.drawImage(probe, bounds.x, bounds.y, bounds.w, bounds.h, dx, dy, bounds.w, bounds.h);
    out.refresh();
    keys.push(key);
  }

  return keys;
}

function pickExistingTextureKey(scene, keys) {
  for (let i = 0; i < keys.length; i += 1) {
    if (scene.textures.exists(keys[i])) return keys[i];
  }
  return null;
}

function isNewDogSheetKey(key) {
  return key === 'dog_sheet_new' || key === 'dog_chase_sheet_new' || key === 'dog_chase_sheet_new_nodot';
}

function findOpaqueBounds(ctx, width, height, alphaThreshold) {
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a < alphaThreshold) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function buildDogPrimaryFrames(scene, sourceTextureKey, outputPrefix, frameIndexes, useCleanExtraction = true) {
  const keys = [];
  if (!scene.textures.exists(sourceTextureKey)) return keys;
  const tex = scene.textures.get(sourceTextureKey);
  const sourceImage = tex.getSourceImage ? tex.getSourceImage() : (tex.source?.[0]?.image ?? null);
  if (!sourceImage) return keys;
  const gridCols = DOG_GRID_COLS;
  const gridRows = DOG_GRID_ROWS;

  frameIndexes.forEach((frameIdx, outIdx) => {
    const col = frameIdx % gridCols;
    const row = Math.floor(frameIdx / gridCols);
    if (row < 0 || row >= gridRows) return;

    // Use rounded grid boundaries derived from full image dimensions.
    // This avoids row bleeding when height is not evenly divisible by row count.
    const sx0 = Math.round((col * sourceImage.width) / gridCols);
    const sx1 = Math.round(((col + 1) * sourceImage.width) / gridCols);
    const sy0 = Math.round((row * sourceImage.height) / gridRows);
    const sy1 = Math.round(((row + 1) * sourceImage.height) / gridRows);
    const cutW = Math.max(1, sx1 - sx0);
    const cutH = Math.max(1, sy1 - sy0);

    const outKey = `${outputPrefix}_${outIdx}`;
    if (scene.textures.exists(outKey)) scene.textures.remove(outKey);

    const probe = document.createElement('canvas');
    probe.width = cutW;
    probe.height = cutH;
    const pctx = probe.getContext('2d');
    pctx.drawImage(
      sourceImage,
      sx0,
      sy0,
      cutW,
      cutH,
      0,
      0,
      cutW,
      cutH
    );

    const out = scene.textures.createCanvas(outKey, DOG_FRAME_WIDTH, DOG_FRAME_HEIGHT);
    if (!out) return;
    const octx = out.context;
    octx.clearRect(0, 0, DOG_FRAME_WIDTH, DOG_FRAME_HEIGHT);
    if (!useCleanExtraction) {
      // Direct grid extraction for transparent sheets (matches sprite tester behavior).
      const dx = Math.floor((DOG_FRAME_WIDTH - cutW) * 0.5);
      const dy = DOG_FRAME_HEIGHT - cutH;
      octx.drawImage(probe, 0, 0, cutW, cutH, dx, dy, cutW, cutH);
      out.refresh();
      keys.push(outKey);
      return;
    }

    const bounds = findBottomConnectedBounds(
      pctx,
      probe.width,
      probe.height,
      CLEAN_FRAME_ALPHA_THRESHOLD,
      DOG_MIN_CONNECTED_PIXELS
    );
    if (!bounds) return;
    const dx = Math.floor((DOG_FRAME_WIDTH - bounds.w) * 0.5);
    const dy = Math.floor(DOG_BASELINE_Y - bounds.h);
    octx.drawImage(probe, bounds.x, bounds.y, bounds.w, bounds.h, dx, dy, bounds.w, bounds.h);
    out.refresh();
    keys.push(outKey);
  });

  return keys;
}

function findBottomConnectedBounds(ctx, width, height, alphaThreshold, minPixels = 1) {
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const mask = new Uint8Array(width * height);
  let opaqueCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (rgba[idx * 4 + 3] >= alphaThreshold) {
        mask[idx] = 1;
        opaqueCount += 1;
      }
    }
  }

  const opaqueRatio = opaqueCount / Math.max(1, mask.length);
  if (opaqueRatio >= DOG_BG_DETECTION_ALPHA_OPAQUE_RATIO) {
    const bg = estimateBorderBackgroundColor(rgba, width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const o = idx * 4;
        const a = rgba[o + 3];
        if (a < 16) {
          mask[idx] = 0;
          continue;
        }
        const dist =
          Math.abs(rgba[o] - bg.r) +
          Math.abs(rgba[o + 1] - bg.g) +
          Math.abs(rgba[o + 2] - bg.b);
        mask[idx] = dist >= DOG_BG_COLOR_DISTANCE_THRESHOLD ? 1 : 0;
      }
    }
  }

  const visited = new Uint8Array(width * height);
  const components = [];

  for (let seed = 0; seed < mask.length; seed++) {
    if (!mask[seed] || visited[seed]) continue;

    const queue = [seed];
    visited[seed] = 1;
    let qh = 0;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let count = 0;

    while (qh < queue.length) {
      const idx = queue[qh++];
      const px = idx % width;
      const py = Math.floor(idx / width);
      count += 1;
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;

      const neighbors = [idx - 1, idx + 1, idx - width, idx + width];
      for (let i = 0; i < neighbors.length; i++) {
        const n = neighbors[i];
        if (n < 0 || n >= mask.length) continue;
        const nx = n % width;
        const ny = Math.floor(n / width);
        if (Math.abs(nx - px) + Math.abs(ny - py) !== 1) continue;
        if (!mask[n] || visited[n]) continue;
        visited[n] = 1;
        queue.push(n);
      }
    }

    if (maxX >= minX && maxY >= minY) {
      components.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, count });
    }
  }

  if (components.length === 0) return null;

  const eligible = components.filter((c) => c.count >= minPixels && c.h >= DOG_MIN_COMPONENT_HEIGHT);
  const pool = eligible.length > 0 ? eligible : components;
  pool.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return (b.y + b.h) - (a.y + a.h);
  });
  const best = pool[0];
  return { x: best.x, y: best.y, w: best.w, h: best.h };
}

function estimateBorderBackgroundColor(rgba, width, height) {
  const samples = [];
  const stepX = Math.max(1, Math.floor(width / 12));
  const stepY = Math.max(1, Math.floor(height / 12));

  for (let x = 0; x < width; x += stepX) {
    samples.push([x, 0], [x, height - 1]);
  }
  for (let y = 0; y < height; y += stepY) {
    samples.push([0, y], [width - 1, y]);
  }

  const buckets = new Map();
  samples.forEach(([x, y]) => {
    const idx = (y * width + x) * 4;
    const r = rgba[idx];
    const g = rgba[idx + 1];
    const b = rgba[idx + 2];
    const key = `${Math.round(r / 8)}|${Math.round(g / 8)}|${Math.round(b / 8)}`;
    const entry = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
    entry.count += 1;
    entry.r += r;
    entry.g += g;
    entry.b += b;
    buckets.set(key, entry);
  });

  let best = null;
  buckets.forEach((entry) => {
    if (!best || entry.count > best.count) best = entry;
  });

  if (!best || best.count <= 0) return { r: 0, g: 0, b: 0 };
  return {
    r: Math.round(best.r / best.count),
    g: Math.round(best.g / best.count),
    b: Math.round(best.b / best.count),
  };
}

function initSfx(scene) {
  scene.events.off('sfx', onSfxEvent);
  scene.events.on('sfx', onSfxEvent);

  if (sfxUnlockBound) return;
  sfxUnlockBound = true;

  const unlock = () => {
    if (!sfxAudioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      sfxAudioCtx = new Ctx();
    }
    if (sfxAudioCtx.state === 'suspended') {
      sfxAudioCtx.resume().catch(() => {
        // Ignore unlock failures; next gesture can retry.
      });
    }
    if (sfxAudioCtx.state === 'running') {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      sfxUnlockBound = false;
    }
  };

  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
}

function onSfxEvent(name) {
  if (!sfxAudioCtx || sfxAudioCtx.state !== 'running') return;
  if (name === 'secret_block_hit') {
    playTone(520, 0.05, 'square', 0.06, 0);
    playTone(780, 0.07, 'square', 0.045, 0.05);
    return;
  }
  if (name === 'life_pickup') {
    playTone(620, 0.08, 'triangle', 0.055, 0);
    playTone(930, 0.1, 'triangle', 0.05, 0.08);
  }
}

function playTone(freq, durationSec, type, volume, offsetSec) {
  const now = sfxAudioCtx.currentTime + (offsetSec || 0);
  const osc = sfxAudioCtx.createOscillator();
  const gain = sfxAudioCtx.createGain();
  osc.type = type || 'square';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume || 0.05, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.03, durationSec || 0.08));
  osc.connect(gain);
  gain.connect(sfxAudioCtx.destination);
  osc.start(now);
  osc.stop(now + Math.max(0.04, durationSec || 0.08) + 0.01);
}

function respawnPlayer() {
  player.clearTint();
  player.setPosition(respawnX, respawnY);
  player.setVelocity(0, 0);
  hitCooldown = 45;
}

function onSpringPlatform(playerSprite, platform) {
  if (gameWon || gameOver || gamePaused) return;
  const fromAbove = playerSprite.body.velocity.y >= 0 && playerSprite.body.bottom <= platform.body.top + 18;
  if (!fromAbove) return;
  const boosted = sceneRef.time.now < boostUntilMs;
  playerSprite.setVelocityY(boosted ? -840 : -760);
  canDoubleJump = true;
  setStatus('Federplattform!', 700);
}

function onCrumblyPlatform(playerSprite, platform) {
  if (gameWon || gameOver || gamePaused) return;
  if (platform.getData('broken')) return;
  const fromAbove = playerSprite.body.velocity.y >= -20 && playerSprite.body.bottom <= platform.body.top + 18;
  if (!fromAbove) return;

  platform.setData('broken', true);
  sceneRef.time.delayedCall(220, () => {
    if (!platform.active) return;
    platform.disableBody(true, true);
    sceneRef.time.delayedCall(2200, () => {
      if (gameOver || gameWon) return;
      platform.enableBody(false, platform.x, platform.y, true, true);
      platform.refreshBody();
      platform.setData('broken', false);
    });
  });
}

function onMovingPlatform(playerSprite, platform) {
  if (gameWon || gameOver || gamePaused) return;
  if (!platform?.body) return;
  const fromAbove = playerSprite.body.velocity.y >= -20 && playerSprite.body.bottom <= platform.body.top + 18;
  if (fromAbove) canDoubleJump = true;
}

function updateMovingPlatforms() {
  movingPlatforms.children.iterate((platform) => {
    if (!platform || !platform.active || !platform.body) return;

    const axis = platform.getData('axis') || 'x';
    const minX = platform.getData('minX');
    const maxX = platform.getData('maxX');
    const minY = platform.getData('minY');
    const maxY = platform.getData('maxY');
    const speed = platform.getData('speed');
    let dir = platform.getData('dir');
    const prevX = platform.x;
    const prevY = platform.y;
    const delta = sceneRef.game.loop.delta / 1000;

    if (axis === 'x') {
      if (platform.x <= minX) dir = 1;
      if (platform.x >= maxX) dir = -1;
    } else {
      if (platform.y <= minY) dir = 1;
      if (platform.y >= maxY) dir = -1;
    }

    platform.setData('dir', dir);
    platform.setData('prevX', prevX);
    platform.setData('prevY', prevY);
    if (axis === 'x') {
      platform.x += dir * speed * delta;
    } else {
      platform.y += dir * speed * delta;
    }
    platform.body.updateFromGameObject();
  });
}

function carryPlayerOnMovingPlatforms() {
  if (!player?.body || !movingPlatforms) return;
  if (player.body.velocity.y < -5) return;

  movingPlatforms.children.iterate((platform) => {
    if (!platform || !platform.active || !platform.body) return;
    const top = platform.body.top;
    const nearTop = Math.abs(player.body.bottom - top) <= 7;
    const inX = player.body.right > platform.body.left + 4 && player.body.left < platform.body.right - 4;
    if (!nearTop || !inX) return;

    const dx = platform.x - (platform.getData('prevX') ?? platform.x);
    const dy = platform.y - (platform.getData('prevY') ?? platform.y);
    if (Math.abs(dx) > 0.001) {
      player.x = clampValue(player.x + dx, 18, WORLD_WIDTH - 18);
    }
    if (Math.abs(dy) > 0.001) {
      player.y = clampValue(player.y + dy, 20, WORLD_HEIGHT + 200);
    }
  });
}

function update() {
  if (Phaser.Input.Keyboard.JustDown(pauseKey) && !gameWon && !gameOver) {
    gamePaused = !gamePaused;
    pauseText.setVisible(gamePaused);
    if (gamePaused) {
      sceneRef.physics.world.pause();
      setStatus('Spiel pausiert.', 0);
    } else {
      sceneRef.physics.world.resume();
      setStatus('Weiter gehts.', 900);
    }
  }

  if (gamePaused) {
    return;
  }

  updateEnemies();
  updateMovingPlatforms();
  carryPlayerOnMovingPlatforms();
  updateParallaxBackground();

  if (statusClearAt > 0 && sceneRef.time.now >= statusClearAt) {
    statusText.setText(' ');
    statusText.setAlpha(1);
    statusClearAt = 0;
    statusFadeStartAt = 0;
  } else if (statusClearAt > 0 && statusFadeStartAt > 0) {
    const left = statusClearAt - sceneRef.time.now;
    const fadeWindow = Math.max(1, statusClearAt - statusFadeStartAt);
    const t = clampValue(left / fadeWindow, 0, 1);
    statusText.setAlpha(t);
  } else {
    statusText.setAlpha(1);
  }

  const isBoosted = sceneRef.time.now < boostUntilMs;
  const boostLabel = isBoosted ? `${formatMs(Math.max(0, Math.floor(boostUntilMs - sceneRef.time.now))).slice(3)} aktiv` : '-';
  const bossLabel = boss ? (boss.active ? `${boss.getData('hp')}/${boss.getData('maxHp')}` : 'besiegt') : '-';
  const bestLabel = bestTimeMs == null ? '-' : formatMs(bestTimeMs);
  if (isBoosted) {
    const leftMs = Math.max(0, Math.floor(boostUntilMs - sceneRef.time.now));
    boostText.setText(`Boost: ${formatMs(leftMs).slice(3)} aktiv`);
  } else {
    boostText.setText('Boost: -');
  }

  if (!gameWon && !gameOver) {
    const elapsedMs = Math.max(0, Math.floor(sceneRef.time.now - runStartMs));
    timerText.setText(`Zeit ${formatMs(elapsedMs)}  Best ${bestLabel}  Boost ${boostLabel}  Boss ${bossLabel}`);
  }

  if (hitCooldown > 0) {
    hitCooldown -= 1;
    player.setAlpha(hitCooldown % 8 < 4 ? 0.55 : 1);
  } else {
    player.setAlpha(1);
  }

  if (gameWon || gameOver) {
    if (Phaser.Input.Keyboard.JustDown(restartKey)) {
      restartRun();
    }
    return;
  }

  const keyboardLeft = cursors.left.isDown || wasd.A.isDown;
  const keyboardRight = cursors.right.isDown || wasd.D.isDown;
  const keyboardJump = cursors.space.isDown || cursors.up.isDown || wasd.W.isDown;
  const now = sceneRef.time.now;
  if (player.body.blocked.down) lastGroundedAt = now;
  const touchLeft = touchControls.moveDir < 0 || touchControls.swipeLatchDir < 0;
  const touchRight = touchControls.moveDir > 0 || touchControls.swipeLatchDir > 0;
  const left = keyboardLeft || touchLeft;
  const right = keyboardRight || touchRight;
  const jumpDown = keyboardJump;
  const jumpRequested = (keyboardJump && !jumpPressed) || touchControls.jumpQueued;
  if (jumpRequested) jumpBufferedUntil = now + JUMP_BUFFER_MS;
  const canGroundJump = player.body.blocked.down || (now - lastGroundedAt) <= JUMP_COYOTE_MS;
  const runSpeed = isBoosted ? 330 : 260;
  const jumpMain = isBoosted ? -620 : -560;
  const jumpDouble = isBoosted ? -550 : -500;

  if (left) {
    player.setVelocityX(-runSpeed);
    player.setFlipX(true);
  } else if (right) {
    player.setVelocityX(runSpeed);
    player.setFlipX(false);
  } else {
    player.setVelocityX(0);
  }
  updateCameraLookAhead();

  if (jumpBufferedUntil >= now) {
    if (canGroundJump) {
      player.setVelocityY(jumpMain);
      canDoubleJump = true;
      jumpBufferedUntil = 0;
    } else if (canDoubleJump) {
      player.setVelocityY(jumpDouble);
      canDoubleJump = false;
      jumpBufferedUntil = 0;
    }
  }

  touchControls.jumpQueued = false;
  jumpPressed = jumpDown;

  if (!player.body.blocked.down) {
    player.anims.stop();
    if (useCleanSheetCat) {
      player.setTexture(catJumpTextureKey);
    } else if (useSheetCat) {
      player.setTexture('cat_sheet', 2);
    } else {
      player.setTexture('cat_jump');
    }
  } else if (Math.abs(player.body.velocity.x) > 5) {
    player.anims.play(catRunAnimKey, true);
  } else {
    player.anims.stop();
    setCatIdleTexture(player);
  }

  if (player.y > WORLD_HEIGHT + 120) {
    loseLife('Uff! Du bist runtergefallen.');
  }
}

function formatMs(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

function setStatus(message, durationMs = 2200) {
  statusText.setText(message);
  statusText.setAlpha(1);
  if (durationMs && durationMs > 0) {
    statusClearAt = sceneRef.time.now + durationMs;
    statusFadeStartAt = sceneRef.time.now + Math.max(0, durationMs - 420);
  } else {
    statusClearAt = 0;
    statusFadeStartAt = 0;
  }
}

function getThemeForLevel(level) {
  return THEMES[(Math.max(1, level) - 1) % THEMES.length];
}

function createParallaxBackground(scene, theme) {
  parallaxLayers.forEach((obj) => obj?.destroy());
  parallaxLayers = [];
  backgroundClouds = [];

  const palette = getParallaxPalette(theme);
  const span = WORLD_WIDTH + 900;
  const centerX = WORLD_WIDTH / 2;
  const key = theme?.key ?? 'forest';

  const haze = scene.add
    .rectangle(centerX, WORLD_HEIGHT * 0.38, span, WORLD_HEIGHT * 0.76, palette.haze)
    .setAlpha(0.34)
    .setScrollFactor(0.08)
    .setDepth(-45);
  parallaxLayers.push(haze);

  if (key !== 'city') {
    const cloudCount = key === 'ocean' ? 8 : 10;
    for (let i = 0; i < cloudCount; i++) {
      const x = 80 + i * 290 + rand01(currentLevel * 11, i) * 130;
      const y = 84 + rand01(currentLevel * 17, i) * 145;
      const width = 130 + rand01(currentLevel * 23, i) * 120;
      const height = 34 + rand01(currentLevel * 29, i) * 34;
      const cloud = scene.add
        .ellipse(x, y, width, height, palette.cloud, 0.32)
        .setScrollFactor(0.15)
        .setDepth(-42);
      parallaxLayers.push(cloud);
      backgroundClouds.push({
        shape: cloud,
        baseX: x,
        speed: 0.65 + rand01(currentLevel * 31, i) * 0.55,
        amp: 10 + rand01(currentLevel * 37, i) * 16,
        phase: rand01(currentLevel * 41, i) * Math.PI * 2,
      });
    }
  }

  if (key === 'forest') {
    for (let x = -240, i = 0; x <= WORLD_WIDTH + 360; x += 220, i++) {
      const hillWidth = 300 + rand01(currentLevel * 43, i) * 120;
      const hillHeight = 140 + rand01(currentLevel * 47, i) * 90;
      const hill = scene.add
        .ellipse(x, WORLD_HEIGHT - 110, hillWidth, hillHeight, palette.far, 0.95)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.34)
        .setDepth(-34);
      parallaxLayers.push(hill);
    }

    const farBase = scene.add
      .rectangle(centerX, WORLD_HEIGHT - 55, span, 126, palette.farBase)
      .setScrollFactor(0.34)
      .setDepth(-33);
    parallaxLayers.push(farBase);

    for (let x = -80, i = 0; x <= WORLD_WIDTH + 200; x += 170, i++) {
      const trunkH = 48 + rand01(currentLevel * 53, i) * 50;
      const trunk = scene.add
        .rectangle(x, WORLD_HEIGHT - 38, 14, trunkH, palette.near, 0.88)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.56)
        .setDepth(-28);
      const crown = scene.add
        .ellipse(x, WORLD_HEIGHT - 45 - trunkH, 68, 54, palette.accent, 0.9)
        .setScrollFactor(0.56)
        .setDepth(-29);
      parallaxLayers.push(trunk, crown);
    }
  } else if (key === 'ocean') {
    for (let x = -180, i = 0; x <= WORLD_WIDTH + 320; x += 260, i++) {
      const island = scene.add
        .ellipse(x, WORLD_HEIGHT - 122, 230 + rand01(currentLevel * 59, i) * 100, 70 + rand01(currentLevel * 61, i) * 34, palette.far, 0.92)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.3)
        .setDepth(-34);
      parallaxLayers.push(island);
    }
    const seaBack = scene.add
      .rectangle(centerX, WORLD_HEIGHT - 56, span, 128, palette.farBase, 0.93)
      .setScrollFactor(0.34)
      .setDepth(-33);
    const seaFront = scene.add
      .rectangle(centerX, WORLD_HEIGHT - 24, span, 72, palette.near, 0.82)
      .setScrollFactor(0.48)
      .setDepth(-29);
    parallaxLayers.push(seaBack, seaFront);
  } else if (key === 'desert') {
    for (let x = -220, i = 0; x <= WORLD_WIDTH + 360; x += 210, i++) {
      const dune = scene.add
        .ellipse(x, WORLD_HEIGHT - 95, 320 + rand01(currentLevel * 67, i) * 120, 120 + rand01(currentLevel * 71, i) * 50, palette.far, 0.93)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.32)
        .setDepth(-34);
      parallaxLayers.push(dune);
    }
    const sand = scene.add
      .rectangle(centerX, WORLD_HEIGHT - 50, span, 110, palette.farBase, 0.94)
      .setScrollFactor(0.34)
      .setDepth(-33);
    parallaxLayers.push(sand);
    for (let x = -60, i = 0; x <= WORLD_WIDTH + 180; x += 220, i++) {
      const h = 56 + rand01(currentLevel * 73, i) * 28;
      const cactusMain = scene.add
        .rectangle(x, WORLD_HEIGHT - 38, 14, h, palette.near, 0.9)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.56)
        .setDepth(-28);
      const arm = scene.add
        .rectangle(x + 10, WORLD_HEIGHT - 58, 10, 24, palette.near, 0.9)
        .setScrollFactor(0.56)
        .setDepth(-28);
      parallaxLayers.push(cactusMain, arm);
    }
  } else if (key === 'mountain') {
    for (let x = -180, i = 0; x <= WORLD_WIDTH + 300; x += 240, i++) {
      const ridge = scene.add
        .rectangle(x, WORLD_HEIGHT - 115, 150 + rand01(currentLevel * 79, i) * 70, 150 + rand01(currentLevel * 83, i) * 90, palette.far, 0.92)
        .setOrigin(0.5, 1)
        .setAngle(45)
        .setScrollFactor(0.32)
        .setDepth(-34);
      parallaxLayers.push(ridge);
    }
    const stone = scene.add
      .rectangle(centerX, WORLD_HEIGHT - 55, span, 120, palette.farBase, 0.94)
      .setScrollFactor(0.34)
      .setDepth(-33);
    parallaxLayers.push(stone);
    for (let x = -80, i = 0; x <= WORLD_WIDTH + 220; x += 200, i++) {
      const pine = scene.add
        .ellipse(x, WORLD_HEIGHT - 58, 62, 74 + rand01(currentLevel * 89, i) * 40, palette.near, 0.86)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.56)
        .setDepth(-28);
      parallaxLayers.push(pine);
    }
  } else {
    for (let x = -120, i = 0; x <= WORLD_WIDTH + 220; x += 120, i++) {
      const towerH = 120 + rand01(currentLevel * 97, i) * 190;
      const tower = scene.add
        .rectangle(x, WORLD_HEIGHT - 38, 78 + rand01(currentLevel * 101, i) * 24, towerH, palette.near, 0.86)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.56)
        .setDepth(-28);
      parallaxLayers.push(tower);
      if (i % 2 === 0) {
        const lit = scene.add
          .rectangle(x + 12, WORLD_HEIGHT - 38 - towerH * 0.6, 8, 24, palette.accent, 0.5)
          .setScrollFactor(0.56)
          .setDepth(-27);
        parallaxLayers.push(lit);
      }
    }
    const skyline = scene.add
      .rectangle(centerX, WORLD_HEIGHT - 62, span, 132, palette.farBase, 0.95)
      .setScrollFactor(0.38)
      .setDepth(-33);
    parallaxLayers.push(skyline);
  }
}

function updateParallaxBackground() {
  if (!sceneRef || backgroundClouds.length === 0) return;
  const t = sceneRef.time.now * 0.001;
  backgroundClouds.forEach((entry) => {
    entry.shape.x = entry.baseX + Math.sin(t * entry.speed + entry.phase) * entry.amp;
  });
}

function getParallaxPalette(theme) {
  const byTheme = {
    forest: { haze: 0xc4efd2, cloud: 0xf2fff5, far: 0x7ca788, farBase: 0x6d9478, near: 0x4f6f59, accent: 0x5d8a68 },
    ocean: { haze: 0xbce7ff, cloud: 0xf7fdff, far: 0x78a8c7, farBase: 0x6b97b4, near: 0x4f7288, accent: 0xcde9ff },
    desert: { haze: 0xffe9c9, cloud: 0xfff7e9, far: 0xd4b27a, farBase: 0xc39f69, near: 0x96744b, accent: 0xeed398 },
    mountain: { haze: 0xd7e5f7, cloud: 0xf7fbff, far: 0x8f9cb2, farBase: 0x7f8ba0, near: 0x5f697d, accent: 0xdfe7f3 },
    city: { haze: 0xdce4ee, cloud: 0xf9fcff, far: 0x8e939f, farBase: 0x7c818d, near: 0x595f6d, accent: 0xc8d2e3 },
  };
  return byTheme[theme?.key] ?? byTheme.forest;
}

function ensureGroundTexture(scene, theme) {
  const key = `ground_${theme.key}`;
  if (!scene.textures.exists(key)) {
    scene.textures.generate(key, {
      data: [
        'BBBBBBBB',
        'B777777B',
        'B666666B',
        'B555555B',
        'B444444B',
        'B333333B',
        'B222222B',
        'BBBBBBBB',
      ],
      pixelWidth: 8,
      palette: theme.ground,
    });
  }
  return key;
}

function getThemeGameplay() {
  return currentTheme?.gameplay ?? {
    enemySpeedMul: 1,
    mousePoints: 100,
    catnipMs: 6000,
    stompPoints: 150,
  };
}

function normalizePlatformEntry(entry) {
  if (Array.isArray(entry)) {
    return { x: entry[0], y: entry[1], type: 'normal' };
  }
  return {
    x: entry.x,
    y: entry.y,
    type: entry.type || 'normal',
    range: entry.range,
    speed: entry.speed,
  };
}

function getVerticalTravelBounds(baseY, range) {
  let minY = clampValue(baseY - range, MOVING_V_MIN_Y, MOVING_V_MAX_Y - 40);
  let maxY = clampValue(baseY + range, MOVING_V_MIN_Y + 40, MOVING_V_MAX_Y);
  if (maxY - minY < 40) {
    minY = clampValue(baseY - 20, MOVING_V_MIN_Y, MOVING_V_MAX_Y - 40);
    maxY = clampValue(baseY + 20, MOVING_V_MIN_Y + 40, MOVING_V_MAX_Y);
  }
  return { minY, maxY };
}

function getLevelConfig(level) {
  if (level === 1) {
    return {
      platforms: [
        [350, 520], [550, 430], { x: 760, y: 350, type: 'spring' }, [1020, 460], { x: 1250, y: 390, type: 'moving', range: 95, speed: 70 },
        [1480, 300], { x: 1740, y: 430, type: 'crumbly' }, [1980, 360], [2210, 280], [2420, 430],
      ],
      mice: [
        [220, WORLD_HEIGHT - 88], [350, 480], [550, 390], [760, 310], [1020, 420],
        [1250, 350], [1480, 260], [1740, 390], [1980, 320], [2210, 240], [2420, 390], [2520, WORLD_HEIGHT - 88],
      ],
      enemies: [
        { x: 640, y: WORLD_HEIGHT - 90, minX: 520, maxX: 760, speed: 75 },
        { x: 1360, y: WORLD_HEIGHT - 90, minX: 1260, maxX: 1490, speed: 90 },
        { x: 1860, y: WORLD_HEIGHT - 90, minX: 1760, maxX: 2000, speed: 80 },
        { x: 2290, y: 240, minX: 2140, maxX: 2430, speed: 65 },
      ],
      catnips: [[760, 310], [1740, 390]],
      hiddenLives: [[1480, 300]],
    };
  }

  if (level === 2) {
    return {
      platforms: [
        [320, 500], [500, 395], { x: 680, y: 305, type: 'spring' }, [900, 430], { x: 1120, y: 315, type: 'moving_v', range: 92, speed: 76 },
        [1350, 250], { x: 1580, y: 360, type: 'crumbly' }, [1810, 275], [2050, 205], [2270, 300], [2450, 410],
      ],
      mice: [
        [220, WORLD_HEIGHT - 88], [320, 460], [500, 355], [680, 265], [900, 390],
        [1120, 275], [1350, 210], [1580, 320], [1810, 235], [2050, 165], [2270, 260],
        [2450, 370], [2520, WORLD_HEIGHT - 88],
      ],
      enemies: [
        { x: 520, y: WORLD_HEIGHT - 90, minX: 380, maxX: 720, speed: 95 },
        { x: 1180, y: WORLD_HEIGHT - 90, minX: 1040, maxX: 1420, speed: 110 },
        { x: 1710, y: WORLD_HEIGHT - 90, minX: 1540, maxX: 1940, speed: 105 },
        { x: 2240, y: 370, minX: 2140, maxX: 2350, speed: 92 },
      ],
      catnips: [[880, 390], [1600, 320], [2320, 260]],
      hiddenLives: [[2050, 205]],
    };
  }

  return getGeneratedLevelConfig(level);
}

function getGeneratedLevelConfig(level) {
  const seed = level * 97;
  const progress = Math.min(1, (level - 3) / (MAX_LEVEL - 3));
  const platformCount = 10 + Math.floor(progress * 8);
  const platforms = [];
  const xStart = 320;
  const xStep = (WORLD_WIDTH - 520) / Math.max(1, platformCount - 1);

  for (let i = 0; i < platformCount; i++) {
    const x = Math.round(xStart + i * xStep);
    const wave = Math.sin((i + level * 0.3) * 0.9) * 95;
    const jitter = (rand01(seed, i) - 0.5) * (90 + progress * 70);
    const y = clampValue(Math.round(380 + wave + jitter), 210, 510);
    let type = 'normal';
    if (i > 0 && i < platformCount - 1) {
      const roll = rand01(seed + 201, i);
      if (roll > 0.94) type = 'moving_v';
      else if (roll > 0.86) type = 'moving';
      else if (roll > 0.82) type = 'spring';
      else if (roll < 0.12) type = 'crumbly';
    }
    let movingRange = Math.round(80 + rand01(seed + 211, i) * 90);
    if (type === 'moving_v') {
      const upRoom = Math.max(35, y - MOVING_V_MIN_Y);
      const downRoom = Math.max(35, MOVING_V_MAX_Y - y);
      const maxRange = Math.max(35, Math.min(110, upRoom, downRoom));
      movingRange = Math.round(35 + rand01(seed + 211, i) * (maxRange - 35));
    }
    const movingSpeed = Math.round(60 + rand01(seed + 223, i) * 55);
    platforms.push({ x, y, type, range: movingRange, speed: movingSpeed });
  }

  const mice = [];
  const mouseTarget = 12 + Math.floor(progress * 10);
  mice.push([220, WORLD_HEIGHT - 88]);
  mice.push([2520, WORLD_HEIGHT - 88]);

  for (let i = 0; i < platforms.length && mice.length < mouseTarget; i++) {
    const { x: px, y: py } = platforms[i];
    mice.push([px, py - 40]);
    if (mice.length < mouseTarget && i % 3 === 1) {
      mice.push([px + 35, py - 52]);
    }
  }

  const enemies = [];
  const enemyCount = 4 + Math.floor(progress * 7);
  const segmentWidth = (WORLD_WIDTH - 520) / enemyCount;
  for (let i = 0; i < enemyCount; i++) {
    const center = Math.round(340 + i * segmentWidth + segmentWidth * 0.5);
    const patrol = Math.round(110 + progress * 80 + rand01(seed + 11, i) * 60);
    const minX = clampValue(center - patrol, 180, WORLD_WIDTH - 220);
    const maxX = clampValue(center + patrol, 220, WORLD_WIDTH - 120);
    const speed = Math.round(80 + progress * 65 + rand01(seed + 29, i) * 22);
    enemies.push({ x: center, y: WORLD_HEIGHT - 90, minX, maxX, speed });
  }

  const catnips = [];
  const catnipCount = 2 + Math.floor(progress * 4);
  for (let i = 0; i < catnipCount; i++) {
    const p = platforms[(i * 3 + level) % platforms.length];
    catnips.push([p.x, p.y - 40]);
  }

  const hiddenLives = [];
  if (level % 4 === 0 || rand01(seed + 307, 1) > 0.92) {
    const lifeCount = progress > 0.72 && rand01(seed + 313, 2) > 0.65 ? 2 : 1;
    const candidates = platforms.filter((p) => p.type === 'normal' && p.y >= 250 && p.y <= 460);
    for (let i = 0; i < lifeCount; i++) {
      if (candidates.length === 0) break;
      const idx = Math.floor(rand01(seed + 317, i) * candidates.length) % candidates.length;
      const p = candidates[idx];
      hiddenLives.push([p.x, p.y]);
    }
  }

  const cfg = { platforms, mice, enemies, catnips, hiddenLives };

  if (level % BOSS_LEVEL_INTERVAL === 0) {
    const hp = 4 + Math.floor(progress * 3);
    cfg.boss = {
      x: 2460,
      y: WORLD_HEIGHT - 92,
      minX: 2320,
      maxX: 2520,
      speed: 90 + Math.floor(progress * 20),
      hp,
    };
  }

  return cfg;
}

function rand01(seed, idx) {
  const s = Math.sin(seed * 12.9898 + idx * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function clampValue(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function setupTouchControls(scene) {
  touchControls = {
    movePointerId: null,
    moveMode: 'drag',
    moveStartX: 0,
    moveX: 0,
    moveDir: 0,
    swipePointers: new Map(),
    jumpQueued: false,
    swipeLatchPointerId: null,
    swipeLatchDir: 0,
  };

  const onDown = (pointer) => {
    requestMobileFullscreen();
    // Gesture movement can start from anywhere on the screen.
    if (touchControls.movePointerId == null) {
      touchControls.movePointerId = pointer.id;
      touchControls.moveMode = 'drag';
      touchControls.moveStartX = pointer.x;
      touchControls.moveX = pointer.x;
      touchControls.moveDir = 0;
    }
    touchControls.swipePointers.set(pointer.id, {
      startX: pointer.x,
      startY: pointer.y,
      consumed: false,
    });
  };

  const onMove = (pointer) => {
    if (touchControls.movePointerId === pointer.id && touchControls.moveMode === 'drag') {
      touchControls.moveX = pointer.x;
      const dx = touchControls.moveX - touchControls.moveStartX;
      if (dx > TOUCH_MOVE_DEADZONE_PX) touchControls.moveDir = 1;
      else if (dx < -TOUCH_MOVE_DEADZONE_PX) touchControls.moveDir = -1;
      else touchControls.moveDir = 0;
    }

    const swipe = touchControls.swipePointers.get(pointer.id);
    if (swipe && !swipe.consumed) {
      const dx = pointer.x - swipe.startX;
      const up = swipe.startY - pointer.y;
      if (up >= TOUCH_SWIPE_UP_MIN_PX) {
        touchControls.jumpQueued = true;
        if (Math.abs(dx) >= TOUCH_SWIPE_SIDE_MIN_PX) {
          touchControls.swipeLatchPointerId = pointer.id;
          touchControls.swipeLatchDir = dx > 0 ? 1 : -1;
        }
        swipe.consumed = true;
      }
    }
  };

  const onUp = (pointer) => {
    if (touchControls.movePointerId === pointer.id) {
      touchControls.movePointerId = null;
      touchControls.moveMode = 'drag';
      touchControls.moveDir = 0;
    }
    if (touchControls.swipeLatchPointerId === pointer.id) {
      touchControls.swipeLatchPointerId = null;
      touchControls.swipeLatchDir = 0;
    }
    touchControls.swipePointers.delete(pointer.id);
  };

  scene.input.on('pointerdown', onDown);
  scene.input.on('pointermove', onMove);
  scene.input.on('pointerup', onUp);
  scene.input.on('pointerupoutside', onUp);

  scene.events.once('shutdown', () => {
    scene.input.off('pointerdown', onDown);
    scene.input.off('pointermove', onMove);
    scene.input.off('pointerup', onUp);
    scene.input.off('pointerupoutside', onUp);
  });
}

function requestMobileFullscreen() {
  if (mobileFullscreenRequested) return;
  mobileFullscreenRequested = true;
  const isMobile = window.matchMedia?.('(max-width: 900px)').matches ?? false;
  if (!isMobile) return;
  if (document.fullscreenElement) return;
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (typeof req === 'function') {
    try {
      req.call(el);
    } catch {
      // Ignore fullscreen failures (iOS/Safari restrictions etc).
    }
  }
}


function bindMobileViewportSync(scene) {
  if (mobileViewportBound) return;
  mobileViewportBound = true;
  mobileViewportHandler = () => syncMobileViewport(sceneRef || scene);
  window.addEventListener('resize', mobileViewportHandler, { passive: true });
  if (window.visualViewport?.addEventListener) {
    window.visualViewport.addEventListener('resize', mobileViewportHandler, { passive: true });
  }
}

function syncMobileViewport(scene) {
  const isMobile = window.matchMedia?.('(max-width: 900px)').matches ?? false;
  if (!isMobile) return;

  const viewportW = Math.round(window.visualViewport?.width || window.innerWidth || 0);
  const viewportH = Math.round(window.visualViewport?.height || window.innerHeight || 0);
  if (viewportW <= 0 || viewportH <= 0) return;

  document.documentElement.style.setProperty('--app-height', `${viewportH}px`);
  const gameEl = document.getElementById('game');
  if (gameEl) {
    gameEl.style.width = `${viewportW}px`;
    gameEl.style.height = `${viewportH}px`;
  }

  if (scene?.scale) {
    scene.scale.resize(viewportW, viewportH);
  }
}

function updateCameraLookAhead() {
  if (!sceneRef?.cameras?.main || !player) return;
  const target = player.flipX ? -CAMERA_LOOKAHEAD_X : CAMERA_LOOKAHEAD_X;
  cameraLookAheadX += (target - cameraLookAheadX) * CAMERA_LOOKAHEAD_LERP;
  sceneRef.cameras.main.setFollowOffset(Math.round(cameraLookAheadX), 0);
}

function restartRun() {
  currentLevel = 1;
  sceneRef.scene.restart();
}
