import Phaser from 'phaser';
import { PIXEL as FONT } from '../fonts.js';
import * as audio from '../audio.js';

export default class End extends Phaser.Scene {
  constructor() { super('End'); }

  create() {
    const { width: w } = this.scale;
    const r = this.registry.get('result') || { freed: 0, seconds: 0, names: [] };
    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(500, 0, 0, 0);
    audio.sfx('start');

    const t = (y, s, size, color, extra = {}) => this.add.text(w / 2, y, s, {
      fontFamily: FONT, fontSize: `${size}px`, color, align: 'center', lineSpacing: Math.round(size * 0.7), ...extra,
    }).setOrigin(0.5);

    t(64, 'THANK YOU FOR YOUR INTEREST!', 24, '#fcfcfc');
    t(112, 'BUT OUR OFFER IS IN', 24, '#f87858');
    t(150, 'ANOTHER CASTLE.', 24, '#f87858');
    t(216, "REASON: THE VP OF FINANCE HIRED THEIR\nNEPHEW, WHO CAN'T OPEN EXCEL.", 14, '#bcbcbc');

    const verdict = r.freed === 5 ? 'EVERY CANDIDATE GOT CLOSURE.' : `${5 - r.freed} STILL WAITING IN THE VOID.`;
    t(296, `CANDIDATES FREED ${r.freed}/5    TIME ${r.seconds}s\n${verdict}`, 16, '#58d854');

    const url = location.href.split('?')[0];
    this.button(w / 2 - 250, 380, 'SHARE ON LINKEDIN', '#0058f8', () => {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener');
    });
    const copy = this.button(w / 2 + 40, 380, 'COPY LINK', '#3c3c3c', async () => {
      try { await navigator.clipboard.writeText(url); copy.setText('COPIED!'); } catch { copy.setText(url); }
    });
    this.button(w / 2 + 250, 380, 'PLAY AGAIN', '#00a800', () => this.scene.start('Title'));

    // Assembled at runtime so the address isn't sitting in the page as one scrapeable string.
    const mail = ['colby', 'colbyangusblack.com'].join('@');
    this.button(w / 2, 440, 'EMAIL COLBY', '#d82800', () => {
      window.location.href = `mailto:${mail}?subject=${encodeURIComponent('Hiring HeRo')}`;
    });

    const tbc = t(490, 'TO BE CONTINUED?', 20, '#f8b800');
    this.tweens.add({ targets: tbc, alpha: 0.25, yoyo: true, repeat: -1, duration: 600, ease: 'Stepped', easeParams: [2] });
    t(520, "HIRING HeRo  WORLD 1-1  HUMANITY ISN'T JUST A RESOURCE.", 10, '#7c7c7c');
  }

  button(x, y, label, bg, onClick) {
    const b = this.add.text(x, y, label, {
      fontFamily: FONT, fontSize: '16px', color: '#fcfcfc', backgroundColor: bg, padding: { x: 14, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    b.on('pointerup', () => { audio.sfx('select'); onClick(); });
    return b;
  }
}
