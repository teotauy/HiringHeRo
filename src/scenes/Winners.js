import Phaser from 'phaser';
import { PIXEL } from '../fonts.js';

// Cold open: a parody of the 1989 arcade "Winners Don't Use Drugs" screen.
// The seal is an original OmniCorp design; no real agency insignia is used.
const HOLD = 4200;

export default class Winners extends Phaser.Scene {
  constructor() { super('Winners'); }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#1820b8');
    this.drawSeal(w / 2, 186);

    const quote = this.add.text(w / 2, 404, '"WINNERS DON\'T GHOST CANDIDATES"', {
      fontFamily: PIXEL, fontSize: '24px', color: '#f8d800', stroke: '#6c4800', strokeThickness: 4,
    }).setOrigin(0.5);
    const by = this.add.text(w / 2, 450, 'Sam . Jr. Recruiter . OmniCorp HR', {
      fontFamily: PIXEL, fontSize: '16px', color: '#f8d800',
    }).setOrigin(0.5);
    this.add.text(w - 40, h - 24, 'CALLBACKS: 0', { fontFamily: PIXEL, fontSize: '14px', color: '#fcfcfc' }).setOrigin(1, 0.5);
    quote.setAlpha(0); by.setAlpha(0);
    this.tweens.add({ targets: quote, alpha: 1, delay: 500, duration: 10 });
    this.tweens.add({ targets: by, alpha: 1, delay: 1100, duration: 10 });

    // CRT scanlines over everything.
    const lines = this.add.graphics().setDepth(10);
    lines.fillStyle(0x000000, 0.28);
    for (let y = 0; y < h; y += 4) lines.fillRect(0, y, w, 2);

    this.cameras.main.fadeIn(250, 0, 0, 0);
    let done = false;
    const next = () => {
      if (done) return;
      done = true;
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Title'));
    };
    this.time.delayedCall(HOLD, next);
    // Skippable, but not by a stray input in the first half second.
    this.time.delayedCall(500, () => {
      this.input.keyboard.once('keydown', next);
      this.input.once('pointerdown', next);
    });
  }

  drawSeal(cx, cy) {
    const g = this.add.graphics();
    // Gold scalloped outer edge.
    g.fillStyle(0xd88800);
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      g.fillCircle(cx + Math.cos(a) * 148, cy + Math.sin(a) * 148, 14);
    }
    g.fillStyle(0xf8b800).fillCircle(cx, cy, 148);
    g.fillStyle(0x0c1050).fillCircle(cx, cy, 136);
    // White lettering band.
    g.fillStyle(0xfcfcfc).fillCircle(cx, cy, 128);
    g.fillStyle(0x0c1050).fillCircle(cx, cy, 126).fillCircle(cx, cy, 98);
    g.fillStyle(0xf8b800).fillCircle(cx, cy, 98);
    g.fillStyle(0x0c1050).fillCircle(cx, cy, 95);
    // Ring of stars.
    g.fillStyle(0xf8b800);
    for (let i = 0; i < 13; i++) {
      const a = -Math.PI / 2 + (i / 13) * Math.PI * 2;
      const x = cx + Math.cos(a) * 80; const y = cy + Math.sin(a) * 80;
      g.fillTriangle(x - 6, y, x + 6, y, x, y - 7).fillTriangle(x - 6, y, x + 6, y, x, y + 4);
    }
    // Green laurels.
    g.lineStyle(6, 0x00a844);
    g.beginPath(); g.arc(cx, cy + 6, 50, Math.PI * 0.55, Math.PI * 1.25); g.strokePath();
    g.beginPath(); g.arc(cx, cy + 6, 50, Math.PI * 1.75, Math.PI * 2.45); g.strokePath();
    // A ghost where the shield would be.
    this.add.image(cx, cy + 2, 'ghost').setScale(4);

    this.ringText('OMNICORP DEPT. OF HUMAN RESOURCES', cx, cy, 112, -Math.PI * 0.92, Math.PI * 0.84, false);
    this.ringText('EST. 1989', cx, cy, 112, Math.PI * 0.62, Math.PI * 0.24, true);
  }

  // Letters set around an arc. `bottom` runs them right-to-left so they read upright along the bottom.
  ringText(str, cx, cy, r, start, span, bottom) {
    const n = str.length;
    [...str].forEach((ch, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const a = bottom ? start - t * span : start + t * span;
      this.add.text(cx + Math.cos(a) * r, cy + Math.sin(a) * r, ch, {
        fontFamily: PIXEL, fontSize: '12px', color: '#fcfcfc',
      }).setOrigin(0.5).setRotation(bottom ? a - Math.PI / 2 : a + Math.PI / 2);
    });
  }
}
