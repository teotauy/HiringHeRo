import Phaser from 'phaser';

const FONT = 'ui-monospace, Menlo, monospace';

// Runs on top of Level1 at 1x zoom: hearts, counters, toasts, boss bar, touch controls.
export default class Hud extends Phaser.Scene {
  constructor() { super('Hud'); }

  create() {
    this.level = this.scene.get('Level1');
    const { width: w, height: h } = this.scale;

    this.heartIcons = [0, 1, 2].map((i) => this.add.image(24 + i * 30, 26, 'heart').setScale(3));
    this.freedText = this.add.text(w - 20, 14, '', { fontFamily: FONT, fontSize: '22px', color: '#dff4ff', stroke: '#071114', strokeThickness: 5 }).setOrigin(1, 0);
    this.featherIcon = this.add.image(120, 26, 'feather').setScale(2.4).setVisible(false);

    this.toastText = this.add.text(w / 2, 70, '', {
      fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#f1c40f', stroke: '#071114', strokeThickness: 6, align: 'center',
    }).setOrigin(0.5).setAlpha(0);

    this.bossBarBg = this.add.rectangle(w / 2, 110, 404, 18, 0x071114).setStrokeStyle(2, 0x39ff88).setVisible(false);
    this.bossBar = this.add.rectangle(w / 2 - 200, 110, 400, 14, 0x39ff88).setOrigin(0, 0.5).setVisible(false);
    this.bossName = this.add.text(w / 2, 88, 'THE ATS OVERLORD', { fontFamily: FONT, fontSize: '18px', color: '#39ff88' }).setOrigin(0.5).setVisible(false);

    this.isTouch = this.sys.game.device.input.touch || new URLSearchParams(location.search).has('touch');
    this.buttons = [];
    if (this.isTouch) this.buildTouch(w, h);
  }

  buildTouch(w, h) {
    const mk = (id, x, y, r, label) => {
      const c = this.add.circle(x, y, r, 0xdff4ff, 0.14).setStrokeStyle(3, 0xdff4ff, 0.5);
      const t = this.add.text(x, y, label, { fontFamily: FONT, fontSize: `${Math.round(r * 0.55)}px`, fontStyle: 'bold', color: '#dff4ff' }).setOrigin(0.5).setAlpha(0.8);
      this.buttons.push({ id, x, y, r, c, t });
    };
    mk('left', 86, h - 86, 54, '◀');
    mk('right', 210, h - 86, 54, '▶');
    mk('fire', w - 220, h - 76, 52, 'FIRE');
    mk('jump', w - 96, h - 120, 62, 'JUMP');
  }

  update() {
    const lvl = this.level;
    if (!lvl || !lvl.sys.isActive()) return;

    this.heartIcons.forEach((ic, i) => ic.setTexture(i < lvl.hearts ? 'heart' : 'heartEmpty'));
    this.freedText.setText(`CANDIDATES FREED ${lvl.freedCount}/5`);
    this.featherIcon.setVisible(lvl.hasFeather);

    if (this.isTouch) {
      const state = { left: false, right: false, jump: false, fire: false };
      const down = this.input.manager.pointers.filter((p) => p.isDown);
      for (const b of this.buttons) {
        // Generous hit area (r + 20) so thumbs don't need to be precise.
        const pressed = down.some((p) => Phaser.Math.Distance.Between(p.x, p.y, b.x, b.y) < b.r + 20);
        state[b.id] = pressed;
        b.c.setFillStyle(0xdff4ff, pressed ? 0.35 : 0.14);
      }
      lvl.touch = state;
    }
  }

  toast(str) {
    if (!this.toastText) return;
    this.tweens.killTweensOf(this.toastText);
    this.toastText.setText(str).setAlpha(1).setY(70);
    this.tweens.add({ targets: this.toastText, alpha: 0, y: 60, delay: 1800, duration: 500 });
  }

  bossIntro(allies) {
    this.bossHp(1);
    const line = allies === 5
      ? 'All five candidates stand with you.'
      : `${allies} of 5 candidates stand with you. Each one blocks a hit.`;
    this.toast(`"Your application has been received."\n${line}`);
  }

  bossHp(frac) {
    const show = frac !== null;
    this.bossBarBg.setVisible(show);
    this.bossBar.setVisible(show);
    this.bossName.setVisible(show);
    if (show) this.bossBar.width = 400 * Math.max(0, frac);
  }

  message(title, body, onContinue) {
    const { width: w, height: h } = this.scale;
    const items = [
      this.add.rectangle(w / 2, h / 2, w, h, 0x071114, 0.82),
      this.add.text(w / 2, h / 2 - 70, title, { fontFamily: FONT, fontSize: '40px', fontStyle: 'bold', color: '#ff6b6b' }).setOrigin(0.5),
      this.add.text(w / 2, h / 2 + 5, body, { fontFamily: FONT, fontSize: '22px', color: '#dff4ff', align: 'center', lineSpacing: 8 }).setOrigin(0.5),
      this.add.text(w / 2, h / 2 + 95, 'TAP OR PRESS ANY KEY TO TRY AGAIN', { fontFamily: FONT, fontSize: '20px', color: '#f1c40f' }).setOrigin(0.5),
    ];
    // Short delay so a held FIRE/JUMP press doesn't dismiss the message instantly.
    this.time.delayedCall(700, () => {
      const done = () => {
        this.input.off('pointerdown', done);
        this.input.keyboard.off('keydown', done);
        items.forEach((i) => i.destroy());
        onContinue();
      };
      this.input.on('pointerdown', done);
      this.input.keyboard.on('keydown', done);
    });
  }
}
