import Phaser from 'phaser';
import Boot from './scenes/Boot.js';
import Title from './scenes/Title.js';
import Intro from './scenes/Intro.js';
import Select from './scenes/Select.js';
import Story from './scenes/Story.js';
import Level1 from './scenes/Level1.js';
import Hud from './scenes/Hud.js';
import End from './scenes/End.js';

// 960x540 canvas; the level camera runs at zoom 2, so the world is drawn at 480x270 "pixel art" scale
// while UI text stays crisp.
// Exposed for automated playtests in a headless browser.
window.__game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  pixelArt: true,
  backgroundColor: '#071114',
  physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 4 },
  scene: [Boot, Title, Select, Story, Intro, Level1, Hud, End],
});
