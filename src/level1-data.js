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
  [123, 8, 4], // the ledge you can only reach by gliding
  [171, 10, 4],
  [184, 10, 4],
];

// Ghosted candidates. `hidden` = behind a breakable object; `gives` = suit unlock.
export const ghosts = [
  { col: 22, row: 13, name: 'Maya', role: 'Graphic Designer',
    line: 'Thanks for respecting my humanity, Sam!' },
  { col: 47, row: 9, name: 'Marcus', role: 'IT Specialist',
    line: 'Appreciate the dignity power-up!' },
  { col: 66, row: 13, name: 'Jordan', role: 'Data Analyst', hidden: 'stack',
    line: "Thanks for telling me I'm not right for this one. My friend would be a perfect fit!" },
  { col: 86, row: 11, name: 'Sarah', role: 'Copywriter', gives: 'feather',
    line: 'Take my quill, Sam. Hold JUMP to glide on pure buzzwords.' },
  { col: 125, row: 7, name: 'Riley', role: 'Office Coordinator', hidden: 'cabinet',
    line: "I'll recommend this company to friends who need a job." },
];

// Breakables sit on top of a surface: [col, surfaceRow, kind]
export const breakables = [
  [66, 14, 'stack'],
  [125, 8, 'cabinet'],
];

// Buzzword Flashbangs: [col, row, patrol range in tiles]
export const orbs = [
  [55, 11, 3],
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
  [61, 'Those resumes look... unread.'],
  [97, 'SCOPE CREEP. Wait for it.'],
  [104, 'Something is stuck across that gap.'],
  [157, 'ATS OVERLORD AHEAD. Every candidate you free fights beside you.'],
];

// Boss arena spans these columns (exactly one screen wide at zoom 2)
export const arenaStart = 166;
export const arenaEnd = 196;

export const groundTopRow = (col) => {
  for (const [a, b, h] of ground) if (col >= a && col < b) return ROWS - h;
  return ROWS - 3;
};
