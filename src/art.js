// Pixel-map sprites: each string row is one pixel row, each character a palette key ('.' = transparent).
// Kept in code so the art can be iterated without an image pipeline; swap for sprite sheets later.

export function pix(scene, key, layers) {
  const rows0 = layers[0].rows;
  const w = Math.max(...layers.flatMap((l) => l.rows.map((r) => r.length + (l.dx || 0))));
  const h = Math.max(...layers.map((l) => l.rows.length + (l.dy || 0)));
  const g = scene.add.graphics();
  for (const { rows, pal, dx = 0, dy = 0 } of layers) {
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === '.' || ch === ' ' || pal[ch] === undefined) return;
        g.fillStyle(pal[ch]).fillRect(x + dx, y + dy, 1, 1);
      });
    });
  }
  g.generateTexture(key, Math.max(w, rows0[0].length), h);
  g.destroy();
}

const K = 0x141414;

// ---------- Sam ----------
const SAM_HEAD_BOY = [
  '....k.k..k.k....',
  '...kHkHkkHkHk...',
  '..kHHHHHHHHHHk..',
  '..kHHhHHHHhHHHk.',
  '..kHHSSSSSHHHk..',
  '..kHSSSSSkSSk...',
  '..kSSSSSSkSSk...',
  '...kSSSSSSSSk...',
  '...kSSSSkkSk....',
  '....kkSSSSkk....',
];
const SAM_HEAD_GIRL = [
  '....kkkkkk......',
  '...kHHHHHHkk....',
  '..kHHhHHHHHHk...',
  '.kHHHHHHHHHHHk..',
  'kHHHHSSSSSHHk...',
  'kHHkSSSSSkSSk...',
  'kHHkSSSSSkSSk...',
  '.kHkSSSSSSSSk...',
  '.kHHkSSSRRSk....',
  '..kk.kkSSSkk....',
];
const SAM_BODY = [
  '...kWWWkTkWWk...',
  '..kWWWWkTTkWWk..',
  '..kWWWWWTTWWWWk.',
  '..kWWkWWTTWWSSgg',
  '..kWWkWWWTWWkggk',
  '..kSSkWWWWWWk.k.',
  '...kk.kPPPPk....',
];
const LEGS = {
  stand: [
    '......kPPPPk....',
    '......kPPkPPk...',
    '......kPPkPPk...',
    '......kPPkPPk...',
    '.....kPPk.kPPk..',
    '.....kBBk.kBBk..',
    '....kBBBk.kBBBk.',
  ],
  run: [
    '......kPPkPPk...',
    '.....kPPk.kPPk..',
    '....kPPk...kPPk.',
    '...kPPk.....kPk.',
    '..kBBk......kBBk',
    '.kBBBk......kBBk',
    '................',
  ],
  jump: [
    '......kPPPPPk...',
    '.....kPPkkPPPk..',
    '....kPPk..kPPk..',
    '...kBBk...kBBk..',
    '...kBBk...kBBk..',
    '................',
    '................',
  ],
};

export function drawSam(scene) {
  const variants = {
    sam: { head: SAM_HEAD_BOY, H: 0x8b4a1c, h: 0xb86a2c, W: 0xf0f0f0, P: 0x2c3e50 },
    samF: { head: SAM_HEAD_GIRL, H: 0x3a1c0c, h: 0x6a3a1c, W: 0xf0f0f0, P: 0x3a2c50 },
  };
  for (const [key, v] of Object.entries(variants)) {
    const pal = { k: K, H: v.H, h: v.h, S: 0xf0c090, W: v.W, T: 0xd82800, P: v.P, B: 0x1b1b1b, g: 0x7c5c3c, R: 0xc0392b };
    for (const [frame, legs] of Object.entries(LEGS)) {
      pix(scene, `${key}_${frame}`, [{ rows: [...v.head, ...SAM_BODY, ...legs], pal }]);
    }
  }
}

// ---------- Ghosts ----------
const GHOST = [
  '.....kkkkkk.....',
  '...kkGGGGGGkk...',
  '..kGGGGGGGGGGk..',
  '.kGGGGGGGGGGGLk.',
  '.kGGkkGGGGkkGLk.',
  '.kGGkkGGGGkkGLk.',
  '.kGGGGGGGGGGGLk.',
  '.kGGGGGkkGGGGLk.',
  '.kGGGGGGGGGGGLk.',
  '.kGGGGGGGGGGGLk.',
  '.kGGGGGGGGGGGLk.',
  '.kGGGGGGGGGGGLk.',
  '.kGGkGGGkGGGkLk.',
  '.kGk.kGk.kGk.kk.',
  '..k...k...k.....',
];
const PROPS = {
  pen: { dx: 10, dy: 6, rows: ['....k', '...kY', '..kYk', '.kYk.', 'kRk..'], pal: { k: K, Y: 0xf8b800, R: 0xd82800 } },
  keyboard: { dx: 6, dy: 8, rows: ['kkkkkkkkkk', 'kAkAkAkAAk', 'kAAkAkAkAk', 'kkkkkkkkkk'], pal: { k: K, A: 0xbcbcbc } },
  chart: { dx: 9, dy: 6, rows: ['kkkkkkk', 'kCCCCCk', 'kCCYYCk', 'kCYYRRk', 'kCYRRRk', 'kkkkkkk'], pal: { k: K, C: 0x3cbcfc, Y: 0xf8b800, R: 0xd82800 } },
  quill: { dx: 10, dy: 3, rows: ['...kW', '..kWW', '.kWWk', '.kWk.', 'kWk..', 'kk...'], pal: { k: K, W: 0xfcfcfc } },
  mug: { dx: 10, dy: 8, rows: ['kkkkk.', 'kMMMkk', 'kMMMk.k', 'kMMMkk', 'kkkkk.'], pal: { k: K, M: 0xd82800 } },
};

export function drawGhosts(scene) {
  const pal = { k: 0x2c4a5c, G: 0xdff4ff, L: 0x9fc6dd };
  pix(scene, 'ghost', [{ rows: GHOST, pal }]);
  for (const [name, prop] of Object.entries(PROPS)) {
    pix(scene, `ghost_${name}`, [{ rows: GHOST, pal }, prop]);
  }
}

// Display names for the two Sam looks. "Sam" stays the nickname in dialogue.
export const SAM_NAMES = { sam: 'SAMUEL', samF: 'SAMANTHA' };
