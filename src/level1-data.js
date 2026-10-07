// Level 1 layout, in 16px tiles. Rows count from the top; the world is 17 rows tall.
export const T = 16;
export const ROWS = 17;
export const COLS = 196;

// [startCol, endCol (exclusive), ground height in tiles]
export const ground = [
  [0, 40, 3],
  [40, 60, 4],
  [60, 75, 3],
  [75, 90, 5],
  [90, 111, 3],
  [111, 128, 2], // low floor under the glide gap (safe, never a pit)
  [128, COLS, 3],
];

// [col, row, length] desk-top platforms
export const platforms = [
  [34, 11, 3],
  [46, 10, 3],
  [102, 11, 2],
  [105, 9, 2],
  [108, 7, 3],
  [115, 12, 2], // stair-step desks up to Riley's ledge from the low floor
  [118, 10, 2],
  [123, 8, 4], // Riley's ledge: glide across from the left, or climb the desks
  [171, 10, 4],
  [184, 10, 4],
];

// Ghosted candidates, in the order most players reach them. `reject` is Sam's honest feedback,
// escalating from gentle to absurd. `hidden` = behind a breakable object; `gives` = suit unlock.
export const ghosts = [
  { col: 22, row: 13, name: 'Maya', reject: "You're not the right fit.", role: 'Graphic Designer',
    prop: 'pen', line: 'Thanks for respecting my humanity, Sam!' },
  { col: 47, row: 12, name: 'Marcus', reject: "The position didn't get funding.", role: 'IT Specialist',
    prop: 'keyboard', line: 'Appreciate the dignity power-up!' },
  { col: 66, row: 13, name: 'Jordan', reject: 'We went another direction.', role: 'Data Analyst', hidden: 'stack', prop: 'chart',
    line: "Thanks for telling me I'm not right for this one. My friend would be a perfect fit!" },
  { col: 86, row: 11, name: 'Sarah', reject: "You're overqualified. And underqualified.", role: 'Copywriter', gives: 'feather', prop: 'quill',
    line: 'Take my quill, Sam. Hold JUMP to glide on pure buzzwords.' },
  { col: 125, row: 7, name: 'Riley', reject: 'We hired your ex.', role: 'Office Coordinator', hidden: 'cabinet', prop: 'mug',
    line: "I'll recommend this company to friends who need a job." },
];

// Breakables sit on top of a surface: [col, surfaceRow, kind]
export const breakables = [
  [66, 14, 'stack'],
  [125, 8, 'cabinet'],
];

// Buzzword Flashbangs: [col, row, patrol range in tiles]
export const orbs = [
  [55, 12, 3],
  [95, 12, 2],
];

// Scope Creep Beam column
export const beamCol = 99;

// Checkpoints by column
export const checkpoints = [2, 88, 156];

// Tutorial / flavor signs: [col, text]
export const signs = [
  [5, 'LEFT/RIGHT: MOVE'],
  [11, 'JUMP'],
  [17, 'FIRE: FREE THE CANDIDATES'],
  [40, 'BUZZWORDS HURT. SHOOT THEM DOWN.'],
  [61, 'Those resumes look... unread.'],
  [97, 'SCOPE CREEP. Wait for it.'],
  [104, 'Something is stuck across that gap.'],
  [157, 'ATS OVERLORD AHEAD. Every candidate you free fights beside you.'],
];

// Background props (no collision): [col, texture]. Fires sit on top of desks.
export const decor = [
  [8, 'officedesk'], [14, 'paperpile'], [27, 'officedesk', true], [31, 'stamp'],
  [43, 'paperpile'], [57, 'officedesk'], [63, 'stamp'], [72, 'paperpile'],
  [79, 'officedesk', true], [92, 'officedesk'], [114, 'paperpile'], [118, 'stamp'],
  [131, 'officedesk', true], [138, 'paperpile'], [146, 'officedesk'], [152, 'stamp'],
  [161, 'paperpile'], [163, 'officedesk', true],
];

// Boss arena spans these columns (exactly one screen wide at zoom 2)
export const arenaStart = 166;
export const arenaEnd = 196;

export const groundTopRow = (col) => {
  for (const [a, b, h] of ground) if (col >= a && col < b) return ROWS - h;
  return ROWS - 3;
};
