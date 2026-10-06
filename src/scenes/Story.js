import Phaser from 'phaser';
import { PIXEL } from '../fonts.js';
import * as audio from '../audio.js';

// The setup, told in five panels. Any button finishes the line, then advances; SKIP jumps to the level.
export default class Story extends Phaser.Scene {
  constructor() { super('Story'); }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#000000');
    this.skin = this.registry.get('skin') || 'sam';
    this.panels = [
      { draw: () => this.drawTower(), text: "OMNICORP.\nTHE WORLD'S LARGEST EMPLOYER OF NOBODY." },
      { draw: () => this.drawMachine(), text: 'ITS APPLICANT TRACKING SYSTEM SWALLOWS EVERY RESUME. NO ONE EVER HEARS BACK.' },
      { draw: () => this.drawArmy(), text: 'EVERY GHOSTED CANDIDATE BECOMES A GHOST. OMNICORP IS BUILDING AN ARMY.' },
      { draw: () => this.drawTraining(), text: 'ONLY ONE THING STANDS IN THEIR WAY: A JR. RECRUITER WHO STILL BELIEVES EVERY CANDIDATE DESERVES AN ANSWER.' },
      { draw: () => this.drawHero(), text: 'SAM. ARMED WITH STATUS UPDATES.\nTIME TO GIVE THE GHOSTS SOME CLOSURE.' },
    ];
    this.index = -1;
    this.layer = this.add.container(0, 0);

    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x000000).fillRect(40, h - 150, w - 80, 120);
    g.lineStyle(4, 0xfcfcfc).strokeRect(46, h - 144, w - 92, 108);
    this.textObj = this.add.text(76, h - 124, '', {
      fontFamily: PIXEL, fontSize: '16px', color: '#fcfcfc', wordWrap: { width: w - 150 }, lineSpacing: 12,
    }).setDepth(11);
    this.more = this.add.text(w - 84, h - 52, 'v', { fontFamily: PIXEL, fontSize: '16px', color: '#f8b800' }).setDepth(11).setVisible(false);
    this.tweens.add({ targets: this.more, y: h - 46, yoyo: true, repeat: -1, duration: 300 });

    const skip = this.add.text(w - 24, 22, 'SKIP >>', { fontFamily: PIXEL, fontSize: '14px', color: '#7c7c7c', backgroundColor: '#000000', padding: { x: 8, y: 8 } })
      .setOrigin(1, 0).setDepth(12).setInteractive({ useHandCursor: true });
    skip.on('pointerdown', (p, x, y, ev) => { ev.stopPropagation(); this.finish(); });

    this.input.on('pointerdown', () => this.advance());
    this.input.keyboard.on('keydown', (e) => (e.key === 'Escape' ? this.finish() : this.advance()));
    this.next();
  }

  next() {
    this.index += 1;
    if (this.index >= this.panels.length) { this.finish(); return; }
    this.layer.removeAll(true);
    this.tweens.killAll();
    this.tweens.add({ targets: this.more, y: this.scale.height - 46, yoyo: true, repeat: -1, duration: 300 });
    const p = this.panels[this.index];
    p.draw();
    this.full = p.text;
    this.shown = 0;
    this.more.setVisible(false);
    this.typer?.remove();
    this.typer = this.time.addEvent({
      delay: 30, repeat: this.full.length - 1,
      callback: () => {
        this.shown += 1;
        this.textObj.setText(this.full.slice(0, this.shown));
        if (this.shown % 3 === 0) audio.sfx('move');
        if (this.shown >= this.full.length) this.more.setVisible(true);
      },
    });
  }

  advance() {
    if (this.done) return;
    if (this.shown < this.full.length) {
      this.typer.remove();
      this.shown = this.full.length;
      this.textObj.setText(this.full);
      this.more.setVisible(true);
      return;
    }
    audio.sfx('select');
    this.next();
  }

  finish() {
    if (this.done) return;
    this.done = true;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Intro'));
  }

  // ---------- panels (all art drawn above the text box, y < 380) ----------

  drawTower() {
    const sky = this.add.image(0, -120, 'skyline').setOrigin(0).setScale(3);
    const flash = this.add.rectangle(480, 190, 960, 380, 0xfcfcfc, 0);
    this.layer.add([sky, flash]);
    this.tweens.add({ targets: flash, alpha: { from: 0.7, to: 0 }, duration: 250, repeat: -1, repeatDelay: 1800 });
    this.tweens.add({ targets: sky, y: -40, duration: 6000 });
  }

  drawMachine() {
    const boss = this.add.image(620, 200, 'boss').setScale(3);
    const gears = [[540, 120], [700, 110], [560, 300]].map(([x, y], i) => {
      const gr = this.add.image(x, y, 'gear').setScale(2.5);
      this.tweens.add({ targets: gr, angle: i % 2 ? -360 : 360, repeat: -1, duration: 2000 });
      return gr;
    });
    this.layer.add([...gears, boss]);
    for (let i = 0; i < 6; i++) {
      const paper = this.add.image(-20, 120 + (i % 3) * 70, 'stamp').setScale(2.5);
      this.layer.add(paper);
      this.tweens.add({ targets: paper, x: 560, y: 200, scale: 0.4, angle: 540, duration: 1600, delay: i * 400, repeat: -1 });
    }
  }

  drawArmy() {
    const banner = this.add.text(480, 50, 'OMNICORP TALENT RESERVE', { fontFamily: PIXEL, fontSize: '20px', color: '#fcfcfc', backgroundColor: '#d82800', padding: { x: 12, y: 8 } }).setOrigin(0.5);
    this.layer.add(banner);
    const keys = ['ghost', 'ghost_pen', 'ghost_keyboard', 'ghost_chart', 'ghost_quill', 'ghost_mug'];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 10; c++) {
        const gh = this.add.image(120 + c * 80 + (r % 2) * 40, 120 + r * 62, keys[(r * 10 + c) % keys.length]).setScale(3).setTint(0x8aa0b0);
        this.layer.add(gh);
        this.tweens.add({ targets: gh, y: gh.y - 6, yoyo: true, repeat: -1, duration: 260, delay: (c % 2) * 260, ease: 'Stepped', easeParams: [2] });
      }
    }
  }

  drawTraining() {
    // Punch-Out style training run through the city at night.
    const sky = this.add.tileSprite(0, -150, 960, 540, 'skyline').setOrigin(0).setTileScale(3);
    const road = this.add.tileSprite(0, 300, 960, 80, 'ground').setOrigin(0).setTileScale(4);
    const sam = this.add.sprite(420, 300, `${this.skin}_run`).setOrigin(0.5, 1).setScale(5);
    const coach = this.add.image(250, 250, 'ghost_quill').setScale(4);
    this.layer.add([sky, road, sam, coach]);
    this.time.addEvent({
      delay: 120, loop: true,
      callback: () => {
        if (!sam.active) return;
        sky.tilePositionX += 2;
        road.tilePositionX += 6;
        sam.setTexture(sam.texture.key.endsWith('run') ? `${this.skin}_stand` : `${this.skin}_run`);
      },
    });
    this.tweens.add({ targets: coach, y: 236, yoyo: true, repeat: -1, duration: 400, ease: 'Sine.inOut' });
  }

  drawHero() {
    const glow = this.add.circle(480, 200, 150, 0xf8b800, 0.15);
    const sam = this.add.image(480, 372, `${this.skin}_stand`).setOrigin(0.5, 1).setScale(11);
    const name = this.add.text(480, 56, 'SAM', { fontFamily: PIXEL, fontSize: '48px', color: '#f8b800', stroke: '#000000', strokeThickness: 8 }).setOrigin(0.5);
    this.layer.add([glow, sam, name]);
    this.tweens.add({ targets: glow, scale: 1.2, alpha: 0.3, yoyo: true, repeat: -1, duration: 500 });
    this.cameras.main.flash(200, 252, 252, 252);
  }
}
