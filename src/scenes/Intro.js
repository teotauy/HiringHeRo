import Phaser from 'phaser';
import { PIXEL } from '../fonts.js';

// "WORLD 1-1" card between the title screen and the level.
export default class Intro extends Phaser.Scene {
  constructor() { super('Intro'); }

  create() {
    const { width: w } = this.scale;
    this.cameras.main.setBackgroundColor('#000000');
    const t = (y, s, size, color) => this.add.text(w / 2, y, s, { fontFamily: PIXEL, fontSize: `${size}px`, color }).setOrigin(0.5);
    t(170, 'WORLD 1-1', 32, '#fcfcfc');
    t(228, 'OMNICORP HQ', 20, '#58d854');
    this.add.image(w / 2 - 70, 312, 'ghost').setScale(3);
    this.add.text(w / 2 - 30, 314, '\u00D7 5', { fontFamily: PIXEL, fontSize: '24px', color: '#fcfcfc' }).setOrigin(0, 0.5);
    t(400, 'CANDIDATES LOST IN THE VOID', 14, '#7c7c7c');
    this.time.delayedCall(2400, () => this.scene.start('Level1'));
  }
}
