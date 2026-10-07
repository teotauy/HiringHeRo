import Phaser from 'phaser';

import { PIXEL as FONT } from '../fonts.js';
import * as audio from '../audio.js';

// Runs on top of Level1 at 1x zoom: hearts, counters, toasts, boss bar, touch controls.
export default class Hud extends Phaser.Scene {
  constructor() { super('Hud'); }

  create() {
    this.level = this.scene.get('Level1');
    const { width: w, height: h } = this.scale;

    this.heartIcons = [0, 1, 2].map((i) => this.add.image(24 + i * 30, 26, 'heart').setScale(3));
    this.freedText = this.add.text(w - 20, 14, '', { fontFamily: FONT, fontSize: '16px', color: '#dff4ff', stroke: '#071114', strokeThickness: 6 }).setOrigin(1, 0);
    this.featherIcon = this.add.image(120, 26, 'feather').setScale(2.4).setVisible(false);

    this.dialogQueue = [];
    this.dialogBusy = false;
    this.toastText = this.add.text(w / 2, 250, '', {
      fontFamily: FONT, fontSize: '16px', color: '#f8b800', stroke: '#000000', strokeThickness: 6, align: 'center', lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0);

    this.bossBarBg = this.add.rectangle(w / 2, 110, 404, 18, 0x071114).setStrokeStyle(2, 0x39ff88).setVisible(false);
    this.bossBar = this.add.rectangle(w / 2 - 200, 110, 400, 14, 0x39ff88).setOrigin(0, 0.5).setVisible(false);
    this.bossName = this.add.text(w / 2, 88, 'THE ATS OVERLORD', { fontFamily: FONT, fontSize: '16px', color: '#58d854' }).setOrigin(0.5).setVisible(false);

    this.isTouch = this.sys.game.device.input.touch || new URLSearchParams(location.search).has('touch');
    this.buttons = [];
    if (this.isTouch) this.buildTouch(w, h);

    // Pause: P or Esc, or the button by the hearts.
    const pb = this.add.rectangle(176, 26, 40, 34, 0x000000, 0.5).setStrokeStyle(2, 0xfcfcfc, 0.7).setInteractive({ useHandCursor: true });
    this.add.rectangle(169, 26, 5, 16, 0xfcfcfc);
    this.add.rectangle(183, 26, 5, 16, 0xfcfcfc);
    pb.on('pointerdown', () => this.togglePause());
    this.input.keyboard.on('keydown', (e) => this.onKey(e));
  }

  onKey(e) {
    const k = e.key.toLowerCase();
    if (k === 'p' || k === 'escape') { this.togglePause(); return; }
    if (!this.pauseMenu) return;
    if (k === 'arrowup' || k === 'w') this.movePause(-1);
    else if (k === 'arrowdown' || k === 's') this.movePause(1);
    else if (['enter', ' ', 'j', 'z', 'x'].includes(k)) this.pauseItems[this.pauseCursor].run();
  }

  togglePause() {
    if (this.pauseMenu) { this.resume(); return; }
    const lvl = this.level;
    if (!lvl.sys.isActive() || lvl.frozen) return;
    this.scene.pause('Level1');
    lvl.touch = { left: false, right: false, jump: false, fire: false };
    audio.sfx('select');
    const { width: w, height: h } = this.scale;
    this.pauseItems = [
      { label: 'RESUME', run: () => this.resume() },
      { label: 'RESTART LEVEL', run: () => { this.closePause(); this.level.scene.restart(); } },
      { label: 'QUIT TO TITLE', run: () => { this.closePause(); this.scene.stop('Level1'); this.scene.start('Title'); } },
    ];
    this.pauseCursor = 0;
    const objs = [
      this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.75),
      this.add.text(w / 2, 150, 'PAUSE', { fontFamily: FONT, fontSize: '40px', color: '#fcfcfc' }).setOrigin(0.5),
    ];
    this.pauseTexts = this.pauseItems.map((it, i) => {
      const t = this.add.text(w / 2 - 130, 250 + i * 50, it.label, { fontFamily: FONT, fontSize: '20px', color: '#fcfcfc' })
        .setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => { this.pauseCursor = i; it.run(); });
      return t;
    });
    this.pauseGhost = this.add.image(w / 2 - 160, 250, 'ghost').setScale(2);
    this.pauseMenu = [...objs, ...this.pauseTexts, this.pauseGhost];
    this.movePause(0);
  }

  movePause(d) {
    this.pauseCursor = (this.pauseCursor + d + this.pauseItems.length) % this.pauseItems.length;
    if (d) audio.sfx('move');
    this.pauseTexts.forEach((t, i) => t.setColor(i === this.pauseCursor ? '#f8b800' : '#fcfcfc'));
    this.pauseGhost.setY(250 + this.pauseCursor * 50);
  }

  closePause() {
    this.pauseMenu.forEach((o) => o.destroy());
    this.pauseMenu = null;
  }

  resume() {
    this.closePause();
    audio.sfx('move');
    this.scene.resume('Level1');
  }

  buildTouch(w, h) {
    const mk = (id, x, y, r, label) => {
      const c = this.add.circle(x, y, r, 0xdff4ff, 0.14).setStrokeStyle(3, 0xdff4ff, 0.5);
      if (label === '<' || label === '>') {
        const pts = label === '<' ? [22, 0, 22, 32, 0, 16] : [0, 0, 0, 32, 22, 16];
        this.add.triangle(x, y, ...pts, 0xdff4ff, 0.8);
      } else {
        this.add.text(x, y, label, { fontFamily: FONT, fontSize: '16px', color: '#dff4ff' }).setOrigin(0.5).setAlpha(0.8);
      }
      this.buttons.push({ id, x, y, r, c });
    };
    mk('left', 86, h - 86, 54, '<');
    mk('right', 210, h - 86, 54, '>');
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
    this.toastText.setText(str).setAlpha(1).setY(250);
    this.tweens.add({ targets: this.toastText, alpha: 0, y: 240, delay: 1800, duration: 500 });
  }

  // NES-style dialogue box with a portrait and typewriter text. Lines queue and play in order;
  // gameplay keeps running underneath.
  dialog(portraitKey, name, text) {
    this.dialogQueue.push({ portraitKey, name, text });
    if (!this.dialogBusy) this.nextDialog();
  }

  nextDialog() {
    const item = this.dialogQueue.shift();
    if (!item) { this.dialogBusy = false; return; }
    this.dialogBusy = true;
    const { width: w } = this.scale;
    const x0 = 150; const y0 = 58; const bw = w - 300;
    const body = this.add.text(x0 + 90, y0 + 40, item.text, {
      fontFamily: FONT, fontSize: '14px', color: '#fcfcfc', wordWrap: { width: bw - 120 }, lineSpacing: 8,
    }).setDepth(1);
    // Size the box to the wrapped text so long lines never spill out.
    const bh = Math.max(92, 40 + body.height + 20);
    body.setText('');
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.92).fillRect(x0, y0, bw, bh);
    g.lineStyle(4, 0xfcfcfc).strokeRect(x0 + 4, y0 + 4, bw - 8, bh - 8);
    const portrait = this.add.image(x0 + 46, y0 + bh / 2, item.portraitKey).setScale(3);
    const name = this.add.text(x0 + 90, y0 + 18, item.name, { fontFamily: FONT, fontSize: '12px', color: '#f8b800' });
    let n = 0;
    const typer = this.time.addEvent({ delay: 22, repeat: item.text.length - 1, callback: () => body.setText(item.text.slice(0, ++n)) });
    // Typing time plus a comfortable read once the line is complete.
    const hold = item.text.length * 22 + Math.max(2500, item.text.length * 55);
    this.time.delayedCall(hold, () => {
      typer.remove();
      [g, portrait, name, body].forEach((o) => o.destroy());
      this.nextDialog();
    });
  }

  scrambled(ms) {
    const { width: w, height: h } = this.scale;
    this.scrambleObjs?.forEach((o) => o.destroy());
    const tint = this.add.rectangle(w / 2, h / 2, w, h, 0x8c00a8, 0.16);
    const banner = this.add.text(w / 2, 230, 'BUZZWORD HIT!\nCONTROLS SCRAMBLED', {
      fontFamily: FONT, fontSize: '20px', color: '#fcfcfc', backgroundColor: '#8c00a8', align: 'center', padding: { x: 12, y: 10 }, lineSpacing: 10,
    }).setOrigin(0.5);
    const bar = this.add.rectangle(w / 2 - 150, 282, 300, 8, 0xe0a0ff).setOrigin(0, 0.5);
    this.scrambleObjs = [tint, banner, bar];
    this.tweens.add({ targets: banner, alpha: 0.4, yoyo: true, repeat: -1, duration: 160 });
    this.tweens.add({ targets: bar, width: 0, duration: ms });
    this.time.delayedCall(ms, () => { if (this.scrambleObjs?.[0] === tint) { this.scrambleObjs.forEach((o) => o.destroy()); this.scrambleObjs = null; } });
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
      this.add.text(w / 2, h / 2 - 70, title, { fontFamily: FONT, fontSize: '32px', color: '#f87858' }).setOrigin(0.5),
      this.add.text(w / 2, h / 2 + 5, body, { fontFamily: FONT, fontSize: '16px', color: '#fcfcfc', align: 'center', lineSpacing: 14 }).setOrigin(0.5),
      this.add.text(w / 2, h / 2 + 95, 'TAP OR PRESS ANY KEY TO TRY AGAIN', { fontFamily: FONT, fontSize: '16px', color: '#f8b800' }).setOrigin(0.5),
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
