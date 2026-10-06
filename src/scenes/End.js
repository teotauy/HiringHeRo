import Phaser from 'phaser';

const FONT = 'ui-monospace, Menlo, monospace';

export default class End extends Phaser.Scene {
  constructor() { super('End'); }

  create() {
    const { width: w } = this.scale;
    const r = this.registry.get('result') || { freed: 0, seconds: 0, names: [] };
    this.cameras.main.setBackgroundColor('#fff3b0');
    this.cameras.main.fadeIn(500, 255, 243, 176);

    this.add.text(w / 2, 70, 'THANK YOU FOR YOUR INTEREST!', { fontFamily: FONT, fontSize: '40px', fontStyle: 'bold', color: '#0b1a1f' }).setOrigin(0.5);
    this.add.text(w / 2, 120, 'BUT OUR OFFER IS IN ANOTHER CASTLE.', { fontFamily: FONT, fontSize: '32px', fontStyle: 'bold', color: '#c0392b' }).setOrigin(0.5);
    this.add.text(w / 2, 185,
      "Reason: The VP of Finance decided to hire their nephew,\nwho doesn't know how to open Excel.", {
        fontFamily: FONT, fontSize: '20px', color: '#2c3e50', align: 'center', lineSpacing: 6,
      }).setOrigin(0.5);

    const verdict = r.freed === 5 ? 'Every candidate got closure.' : `${5 - r.freed} still waiting in the Void.`;
    this.add.text(w / 2, 265, `CANDIDATES FREED: ${r.freed}/5   ·   TIME: ${r.seconds}s\n${verdict}`, {
      fontFamily: FONT, fontSize: '22px', color: '#0b1a1f', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);

    const url = location.href.split('?')[0];
    this.button(w / 2 - 230, 380, 'SHARE ON LINKEDIN', '#0a66c2', () => {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener');
    });
    const copy = this.button(w / 2 + 50, 380, 'COPY LINK', '#2c3e50', async () => {
      try { await navigator.clipboard.writeText(url); copy.setText('COPIED!'); } catch { copy.setText(url); }
    });
    this.button(w / 2 + 250, 380, 'PLAY AGAIN', '#27ae60', () => this.scene.start('Level1'));

    this.add.text(w / 2, 470, 'Hiring HeRo · Level 1 of ? · Humanity isn\'t just a resource.', {
      fontFamily: FONT, fontSize: '16px', color: '#7f8c8d',
    }).setOrigin(0.5);
  }

  button(x, y, label, bg, onClick) {
    const t = this.add.text(x, y, label, {
      fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#ffffff', backgroundColor: bg, padding: { x: 16, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    t.on('pointerup', onClick);
    return t;
  }
}
