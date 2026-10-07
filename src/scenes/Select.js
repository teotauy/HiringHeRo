import Phaser from 'phaser';
import { PIXEL } from '../fonts.js';
import * as audio from '../audio.js';
import { SAM_NAMES } from '../art.js';

const CHOICES = ['sam', 'samF'];

// Pick Sam: two looks, same recruiter.
export default class Select extends Phaser.Scene {
  constructor() { super('Select'); }

  create() {
    const { width: w } = this.scale;
    this.cameras.main.setBackgroundColor('#000000');
    this.add.text(w / 2, 80, 'CHOOSE YOUR RECRUITER', { fontFamily: PIXEL, fontSize: '24px', color: '#fcfcfc' }).setOrigin(0.5);
    this.cursor = CHOICES.indexOf(this.registry.get('skin') || 'sam');
    this.cards = CHOICES.map((key, i) => {
      const x = w / 2 + (i === 0 ? -160 : 160);
      const frame = this.add.rectangle(x, 270, 200, 250, 0x000000).setStrokeStyle(4, 0x7c7c7c).setInteractive({ useHandCursor: true });
      const img = this.add.image(x, 270, `${key}_stand`).setScale(8);
      this.add.text(x, 420, SAM_NAMES[key], { fontFamily: PIXEL, fontSize: '20px', color: '#fcfcfc' }).setOrigin(0.5);
      frame.on('pointerdown', () => { this.cursor = i; this.refresh(); this.pick(); });
      return { frame, img };
    });
    this.add.text(w / 2, 490, 'LEFT/RIGHT TO CHOOSE   START TO CONFIRM', { fontFamily: PIXEL, fontSize: '12px', color: '#7c7c7c' }).setOrigin(0.5);
    this.refresh();
    this.input.keyboard.on('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (['arrowleft', 'a', 'arrowright', 'd'].includes(k)) { this.cursor = 1 - this.cursor; audio.sfx('move'); this.refresh(); } else if (['enter', ' ', 'j', 'z', 'x'].includes(k)) this.pick();
    });
  }

  refresh() {
    this.cards.forEach((c, i) => {
      const on = i === this.cursor;
      c.frame.setStrokeStyle(4, on ? 0xf8b800 : 0x3c3c3c);
      c.img.setTexture(`${CHOICES[i]}_${on ? 'run' : 'stand'}`).setAlpha(on ? 1 : 0.5);
    });
  }

  pick() {
    if (this.picked) return;
    this.picked = true;
    this.registry.set('skin', CHOICES[this.cursor]);
    audio.sfx('select');
    this.cameras.main.flash(150, 252, 252, 252);
    this.time.delayedCall(300, () => this.scene.start('Story'));
  }
}
