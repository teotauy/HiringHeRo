import Phaser from 'phaser';
import { PIXEL } from '../fonts.js';
import * as audio from '../audio.js';

const NES = {
  black: '#000000', white: '#fcfcfc', grey: '#7c7c7c', green: '#58d854', yellow: '#f8b800',
  orange: '#f87858', red: '#d82800', blue: '#3cbcfc',
};

// Text helper: Press Start 2P looks right only at multiples of 8px.
const txt = (scene, x, y, s, size, color, extra = {}) => scene.add.text(x, y, s, {
  fontFamily: PIXEL, fontSize: `${size}px`, color, align: 'center', lineSpacing: Math.round(size * 0.6), ...extra,
}).setOrigin(0.5);

export default class Title extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    const { width: w } = this.scale;
    this.mode = 'attract';
    this.cursor = 0;
    this.ignoreTapsUntil = 0;
    this.cameras.main.setBackgroundColor(NES.black);

    this.add.image(0, 0, 'skyline').setOrigin(0).setScale(3);
    this.drawGhostParade();

    this.drawLogo(w);
    txt(this, w / 2, 304, "HUMANITY ISN'T JUST A RESOURCE", 16, NES.green, { stroke: NES.black, strokeThickness: 8 });

    const sams = [this.add.image(70, 452, 'sam_stand'), this.add.image(150, 452, 'samF_stand').setFlipX(true)];
    sams.forEach((s, i) => {
      s.setScale(4).setOrigin(0.5, 1);
      this.tweens.add({ targets: s, y: 446, yoyo: true, repeat: -1, duration: 420, delay: i * 210, ease: 'Stepped', easeParams: [2] });
    });

    this.pushStart = txt(this, w / 2, 380, 'PUSH START', 24, NES.white, { stroke: NES.black, strokeThickness: 8 });
    this.blink = this.time.addEvent({ delay: 450, loop: true, callback: () => this.pushStart.setVisible(!this.pushStart.visible) });

    txt(this, w / 2, 486, '© 1989 OMNICORP HUMAN RESOURCES DIV.', 12, NES.grey, { stroke: NES.black, strokeThickness: 6 });
    txt(this, w / 2, 510, 'ALL CANDIDATES RESERVED.', 12, NES.grey, { stroke: NES.black, strokeThickness: 6 });

    this.buildMenu(w);

    this.input.keyboard.on('keydown', (e) => this.onKey(e));
    this.input.on('pointerdown', () => {
      if (this.time.now < this.ignoreTapsUntil) return;
      if (this.mode === 'attract') this.openMenu();
      else if (this.mode === 'panel') this.closePanel();
    });
  }

  drawLogo(w) {
    // "HR" is the hero: the H and R in both words are bigger, flame-colored, and glow.
    const band = (t, stops) => {
      const g = t.context.createLinearGradient(0, 0, 0, t.height);
      // Hard-edged bands (two stops at the same offset) mimic NES palette shading.
      stops.forEach(([o, c]) => g.addColorStop(o, c));
      t.setFill(g);
    };
    const HOT = [[0, '#fce0a8'], [0.28, '#fce0a8'], [0.28, NES.yellow], [0.55, NES.yellow], [0.55, '#f83800'], [1, '#f83800']];
    const COOL = [[0, NES.white], [0.5, NES.white], [0.5, NES.blue], [1, NES.blue]];
    const parts = [];
    const glows = [];

    const word = (letters, baseY) => {
      const made = letters.map(([ch, size, hot]) => {
        const style = { fontFamily: PIXEL, fontSize: `${size}px`, color: NES.white, stroke: NES.black, strokeThickness: hot ? 14 : 10 };
        const t = this.add.text(0, baseY, ch, style).setOrigin(0, 1);
        band(t, hot ? HOT : COOL);
        return { t, size, hot };
      });
      const gap = 2;
      const total = made.reduce((a, m) => a + m.t.width, 0) + gap * (made.length - 1);
      let x = w / 2 - total / 2;
      for (const m of made) {
        const shadow = this.add.text(x + m.size / 12, baseY + m.size / 12, m.t.text, {
          fontFamily: PIXEL, fontSize: `${m.size}px`, color: NES.red, stroke: NES.red, strokeThickness: m.hot ? 14 : 10,
        }).setOrigin(0, 1);
        if (m.hot) {
          const glow = this.add.text(x, baseY, m.t.text, {
            fontFamily: PIXEL, fontSize: `${m.size}px`, color: NES.yellow, stroke: NES.yellow, strokeThickness: 20,
          }).setOrigin(0, 1).setAlpha(0.45);
          glows.push(glow);
          parts.push(glow);
        }
        parts.push(shadow);
        m.t.setX(x).setDepth(1);
        parts.push(m.t);
        x += m.t.width + gap;
      }
    };
    word([['H', 64, true], ['I', 44], ['R', 64, true], ['I', 44], ['N', 44], ['G', 44]], 100);
    word([['H', 120, true], ['e', 84], ['R', 120, true], ['o', 84]], 270);

    // Drop the logo in from above, NES-boot style, then make the HR throb.
    parts.forEach((o) => {
      const y = o.y;
      o.y -= 300;
      this.tweens.add({ targets: o, y, duration: 700, ease: 'Bounce.out' });
    });
    this.time.delayedCall(800, () => {
      this.tweens.add({ targets: glows, alpha: 0.12, yoyo: true, repeat: -1, duration: 520, ease: 'Stepped', easeParams: [3] });
    });
  }

  drawGhostParade() {
    for (let i = 0; i < 4; i++) {
      const g = this.add.image(-40 - i * 70, 330 + (i % 2) * 22, 'ghost').setScale(3).setAlpha(0.85);
      this.tweens.add({ targets: g, x: 1000, duration: 9000, delay: i * 500, repeat: -1, repeatDelay: 3000 });
      this.tweens.add({ targets: g, y: g.y - 8, yoyo: true, repeat: -1, duration: 500, ease: 'Stepped', easeParams: [2] });
    }
  }

  buildMenu(w) {
    this.items = [
      { label: '1 PLAYER GAME', run: () => this.startGame() },
      { label: 'HOW TO PLAY', run: () => this.openPanel('how') },
      { label: () => `SOUND  ${audio.isMuted() ? 'OFF' : 'ON'}`, run: () => this.toggleSound() },
      { label: 'CREDITS', run: () => this.openPanel('credits') },
    ];
    const x0 = w / 2 - 150;
    this.menuTexts = this.items.map((it, i) => {
      const t = this.add.text(x0, 344 + i * 32, '', { fontFamily: PIXEL, fontSize: '20px', color: NES.white, stroke: NES.black, strokeThickness: 8 })
        .setOrigin(0, 0.5).setVisible(false).setInteractive({ useHandCursor: true });
      t.on('pointerdown', (p, lx, ly, ev) => {
        ev.stopPropagation();
        if (this.mode !== 'menu') return;
        this.cursor = i;
        this.activate();
      });
      return t;
    });
    this.cursorGhost = this.add.image(x0 - 30, 344, 'ghost').setScale(2).setVisible(false);
    this.refreshMenu();
  }

  refreshMenu() {
    this.items.forEach((it, i) => {
      const label = typeof it.label === 'function' ? it.label() : it.label;
      this.menuTexts[i].setText(label).setColor(i === this.cursor ? NES.yellow : NES.white);
    });
    this.cursorGhost.setY(344 + this.cursor * 32);
  }

  openMenu() {
    audio.unlock();
    audio.sfx('select');
    audio.playTitleMusic();
    this.mode = 'menu';
    this.blink.remove();
    this.pushStart.setVisible(false);
    this.menuTexts.forEach((t) => t.setVisible(true));
    this.cursorGhost.setVisible(true);
    this.tweens.add({ targets: this.cursorGhost, x: this.cursorGhost.x + 6, yoyo: true, repeat: -1, duration: 300, ease: 'Stepped', easeParams: [2] });
  }

  onKey(e) {
    if (this.mode === 'attract') { this.openMenu(); return; }
    if (this.mode === 'panel') { this.closePanel(); return; }
    if (this.mode !== 'menu') return;
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') this.moveCursor(-1);
    else if (k === 'arrowdown' || k === 's') this.moveCursor(1);
    else if (['enter', ' ', 'j', 'z', 'x'].includes(k)) this.activate();
  }

  moveCursor(d) {
    this.cursor = (this.cursor + d + this.items.length) % this.items.length;
    audio.sfx('move');
    this.refreshMenu();
  }

  activate() {
    this.items[this.cursor].run();
  }

  toggleSound() {
    audio.setMuted(!audio.isMuted());
    audio.sfx('select');
    this.refreshMenu();
  }

  openPanel(which) {
    audio.sfx('select');
    this.mode = 'panel';
    // The tap that opened the panel must not also close it.
    this.ignoreTapsUntil = this.time.now + 150;
    const { width: w, height: h } = this.scale;
    const body = which === 'how'
      ? [
        'FREE THE 5 GHOSTED CANDIDATES',
        'TRAPPED IN THE ATS VOID.',
        '',
        'SHOOT THEM WITH STATUS UPDATES.',
        'SOME ARE HIDING. SHOOT THE STUFF.',
        '',
        'EVERY CANDIDATE YOU FREE BLOCKS',
        'ONE HIT FROM THE ATS OVERLORD.',
        '',
        'PHONE: TURN SIDEWAYS. THUMB PADS.',
        'KEYS: ARROWS  SPACE=JUMP  J=FIRE',
        'HOLD JUMP TO GLIDE (WITH FEATHER)',
      ]
      : [
        'A GAME BY COLBY',
        '',
        'SAM ........... JR. RECRUITER',
        'OMNICORP ...... ITSELF',
        'THE ATS ....... NO COMMENT',
        '',
        'SPECIAL THANKS TO EVERY',
        'CANDIDATE STILL WAITING',
        'TO HEAR BACK.',
      ];
    const g = this.add.graphics();
    g.fillStyle(0x000000, 1).fillRect(110, 60, w - 220, h - 120);
    g.lineStyle(4, 0xfcfcfc).strokeRect(118, 68, w - 236, h - 136);
    g.lineStyle(2, 0xfcfcfc).strokeRect(126, 76, w - 252, h - 152);
    const title = txt(this, w / 2, 112, which === 'how' ? 'HOW TO PLAY' : 'CREDITS', 24, NES.yellow);
    const text = txt(this, w / 2, 280, body.join('\n'), 14, NES.white, { lineSpacing: 9 });
    const back = txt(this, w / 2, h - 92, 'PUSH ANY BUTTON', 12, NES.grey);
    this.panel = [g, title, text, back];
  }

  closePanel() {
    audio.sfx('move');
    this.panel.forEach((o) => o.destroy());
    this.panel = null;
    this.mode = 'menu';
  }

  startGame() {
    this.mode = 'starting';
    audio.sfx('select');
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Select'));
  }
}
