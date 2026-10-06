import Phaser from 'phaser';
import * as L from '../level1-data.js';

const { T, ROWS, COLS } = L;
const WORLD_W = COLS * T;
const WORLD_H = ROWS * T;

const RUN_SPEED = 110;
const JUMP_VELOCITY = -340;
const JUMP_CUT = -120; // releasing jump early caps upward speed: short hop vs full jump
const GLIDE_FALL = 30;
const COYOTE_MS = 110;
const JUMP_BUFFER_MS = 130;
const FIRE_COOLDOWN_MS = 220;
const BOSS_HP = 24;

const FONT = 'ui-monospace, Menlo, monospace';

export default class Level1 extends Phaser.Scene {
  constructor() { super('Level1'); }

  create() {
    this.startedAt = this.time.now;
    this.hearts = 3;
    this.facing = 1;
    this.hasFeather = false;
    this.freedCount = 0;
    this.followers = [];
    this.touch = { left: false, right: false, jump: false, fire: false };
    this.prevJump = false;
    this.lastGround = -1e9;
    this.lastJumpPress = -1e9;
    this.nextFire = 0;
    this.invulnUntil = 0;
    this.reverseUntil = 0;
    this.pinnedUntil = 0;
    this.checkpointIndex = 0;
    this.bossActive = false;
    this.bossDone = false;
    this.frozen = false;

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    const cam = this.cameras.main;
    cam.setZoom(2).setBounds(0, 0, WORLD_W, WORLD_H).setBackgroundColor('#0b1a1f');

    this.add.tileSprite(0, 0, WORLD_W, WORLD_H, 'wall').setOrigin(0).setScrollFactor(0.4, 1).setAlpha(0.8);

    this.buildTerrain();
    this.buildSigns();
    this.buildCheckpoints();

    const start = this.checkpointPos(0);
    this.player = this.physics.add.sprite(start.x, start.y, 'sam').setDepth(10);
    this.player.body.setSize(10, 22).setOffset(2, 2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.solids);

    this.bullets = this.physics.add.group({ allowGravity: false });
    this.physics.add.collider(this.bullets, this.solids, (b) => b.destroy());

    this.buildBreakables();
    this.buildGhosts();
    this.buildHazards();

    cam.startFollow(this.player, true, 0.12, 0.12);

    const kb = this.input.keyboard;
    this.keys = kb.addKeys('LEFT,RIGHT,UP,A,D,W,SPACE,J,X,Z');

    this.scene.launch('Hud');
    this.hud = this.scene.get('Hud');
    this.events.once('shutdown', () => this.scene.stop('Hud'));
  }

  // ---------- building ----------

  buildTerrain() {
    this.solids = this.physics.add.staticGroup();
    for (const [a, b, h] of L.ground) {
      const ts = this.add.tileSprite(a * T, (ROWS - h) * T, (b - a) * T, h * T, 'ground').setOrigin(0);
      this.solids.add(ts);
    }
    for (const [col, row, len] of L.platforms) {
      const ts = this.add.tileSprite(col * T, row * T, len * T, 8, 'desk').setOrigin(0);
      this.solids.add(ts);
    }
  }

  buildSigns() {
    for (const [col, text] of L.signs) {
      const y = L.groundTopRow(col) * T - 40;
      this.add.text(col * T, y, text, {
        fontFamily: FONT, fontSize: '8px', color: '#9fd8b8', align: 'center', wordWrap: { width: 150 },
      }).setOrigin(0.5, 1).setResolution(4).setAlpha(0.9);
    }
  }

  buildCheckpoints() {
    this.flags = L.checkpoints.map((col, i) => {
      const f = this.add.image(col * T, L.groundTopRow(col) * T, 'flag').setOrigin(0, 1);
      if (i === 0) f.setVisible(false);
      return f;
    });
  }

  checkpointPos(i) {
    const col = L.checkpoints[i];
    return { x: col * T + 8, y: L.groundTopRow(col) * T - 14 };
  }

  buildBreakables() {
    this.breakables = this.physics.add.staticGroup();
    for (const [col, surfaceRow, kind] of L.breakables) {
      const s = this.breakables.create(col * T + 8, surfaceRow * T - 16, kind);
      s.hp = 3;
      s.setDepth(6);
      // A small wiggle every few seconds hints that something is behind it.
      this.time.addEvent({
        delay: 2800, loop: true,
        callback: () => s.active && this.tweens.add({ targets: s, angle: { from: -4, to: 4 }, yoyo: true, duration: 70, repeat: 2, onComplete: () => s.setAngle(0) }),
      });
    }
    this.physics.add.collider(this.player, this.breakables);
    this.physics.add.overlap(this.bullets, this.breakables, (b, s) => { b.destroy(); this.hitBreakable(s); });
  }

  buildGhosts() {
    this.ghosts = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const def of L.ghosts) {
      const g = this.ghosts.create(def.col * T + 8, def.row * T + 8, 'ghost');
      g.def = def;
      g.freed = false;
      g.hidden = !!def.hidden;
      g.setDepth(def.hidden ? 5 : 8);
      g.aura = this.add.circle(g.x, g.y, 11, 0x39ff88, 0.18).setDepth(4);
      this.tweens.add({ targets: g.aura, scale: 1.3, alpha: 0.05, yoyo: true, repeat: -1, duration: 700 });
      g.floatTween = this.tweens.add({ targets: g, y: g.y - 3, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.inOut' });
      if (g.hidden) { g.setAlpha(0); g.aura.setVisible(false); } else g.setTint(0x6f9a8a);
      if (def.hidden) {
        g.cover = this.breakables.getChildren().find((s) => Math.abs(s.x - g.x) < 4);
        if (g.cover) g.cover.ghost = g;
      }
    }
    this.physics.add.overlap(this.bullets, this.ghosts,
      (b, g) => { b.destroy(); this.freeGhost(g); },
      (b, g) => !g.hidden && !g.freed);
  }

  buildHazards() {
    // Buzzword Flashbangs: touch one and your controls reverse for a few seconds.
    this.orbs = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const [col, row, range] of L.orbs) {
      const o = this.orbs.create(col * T, row * T, 'orb');
      o.hp = 2;
      this.tweens.add({ targets: o, x: o.x + range * T, yoyo: true, repeat: -1, duration: 1400 + range * 200, ease: 'Sine.inOut' });
      o.label = this.add.text(o.x, o.y - 12, 'SYNERGY', { fontFamily: FONT, fontSize: '6px', color: '#d6c2ff' })
        .setOrigin(0.5).setResolution(4);
    }
    this.physics.add.overlap(this.player, this.orbs, () => this.flashbang());
    this.physics.add.overlap(this.bullets, this.orbs, (b, o) => {
      b.destroy();
      o.hp -= 1;
      o.setTintFill(0xffffff);
      this.time.delayedCall(60, () => o.active && o.clearTint());
      if (o.hp <= 0) { this.burst(o.x, o.y, 0xb388ff); this.floatText(o.x, o.y, 'clarity restored', '#d6c2ff'); o.label.destroy(); o.destroy(); }
    });

    // Scope Creep Beam: a timed column of sticky notes. Off, warning flicker, on.
    const bx = L.beamCol * T + 8;
    const groundY = L.groundTopRow(L.beamCol) * T;
    this.add.image(bx, 4, 'emitter').setOrigin(0.5, 0);
    this.beam = this.add.rectangle(bx, 12, 10, groundY - 12, 0xffd84a, 0.9).setOrigin(0.5, 0).setDepth(7).setVisible(false);
    this.beamCycle = 2600;
  }

  // ---------- update ----------

  update(time) {
    if (this.frozen) return;
    const p = this.player;
    const body = p.body;
    const k = this.keys;
    const t = this.touch;

    let left = k.LEFT.isDown || k.A.isDown || t.left;
    let right = k.RIGHT.isDown || k.D.isDown || t.right;
    const jumpHeld = k.UP.isDown || k.W.isDown || k.SPACE.isDown || t.jump;
    const fireHeld = k.J.isDown || k.X.isDown || k.Z.isDown || t.fire;
    if (time < this.reverseUntil) [left, right] = [right, left];

    const onGround = body.blocked.down || body.touching.down;
    if (onGround) this.lastGround = time;
    if (jumpHeld && !this.prevJump) this.lastJumpPress = time;
    this.prevJump = jumpHeld;

    const pinned = time < this.pinnedUntil;
    let vx = 0;
    if (!pinned) { if (left) vx -= RUN_SPEED; if (right) vx += RUN_SPEED; }
    p.setVelocityX(vx);
    if (vx !== 0) { this.facing = Math.sign(vx); p.setFlipX(this.facing < 0); }

    if (!pinned && time - this.lastJumpPress < JUMP_BUFFER_MS && time - this.lastGround < COYOTE_MS) {
      p.setVelocityY(JUMP_VELOCITY);
      this.lastJumpPress = -1e9;
      this.lastGround = -1e9;
    }
    if (!jumpHeld && body.velocity.y < JUMP_CUT) p.setVelocityY(JUMP_CUT);

    this.gliding = this.hasFeather && jumpHeld && !onGround && body.velocity.y > GLIDE_FALL;
    if (this.gliding) p.setVelocityY(GLIDE_FALL);

    if (fireHeld && time > this.nextFire) this.fire(time);

    for (const b of this.bullets.getChildren().slice()) if (time > b.die) b.destroy();
    for (const o of this.orbs.getChildren()) o.label.setPosition(o.x, o.y - 12);
    for (const g of this.ghosts.getChildren()) if (!g.freed) g.aura.setPosition(g.x, g.y);

    this.updateBeam(time);
    this.updateFollowers(time);
    this.updateCheckpoints();

    if (!this.bossActive && !this.bossDone && p.x > L.arenaStart * T + 40) this.startBoss(time);
    if (this.bossActive) this.updateBoss(time);
  }

  fire(time) {
    this.nextFire = time + FIRE_COOLDOWN_MS;
    const e = this.bullets.create(this.player.x + this.facing * 9, this.player.y - 1, 'envelope');
    e.setVelocityX(300 * this.facing).setFlipX(this.facing < 0).setDepth(9);
    e.die = time + 1300;
  }

  updateBeam(time) {
    const phase = time % this.beamCycle;
    const warning = phase > 1300 && phase < 1650;
    const on = phase >= 1650;
    this.beam.setVisible(on || (warning && Math.floor(time / 80) % 2 === 0));
    this.beam.setAlpha(on ? 0.9 : 0.35).setScale(on ? 1 : 0.3, 1);
    if (on && Phaser.Geom.Intersects.RectangleToRectangle(this.beam.getBounds(), this.player.getBounds())) {
      if (this.damage(time)) {
        this.pinnedUntil = time + 900;
        this.floatText(this.player.x, this.player.y - 16, 'SCOPE CREEP! +40 TICKETS', '#ffd84a');
      }
    }
  }

  updateFollowers(time) {
    const p = this.player;
    const active = this.followers.filter((g) => !g.spent);
    active.forEach((g, i) => {
      let tx; let ty;
      if (this.bossActive) {
        const a = time / 650 + i * ((Math.PI * 2) / active.length);
        tx = p.x + Math.cos(a) * 22;
        ty = p.y - 4 + Math.sin(a) * 14;
      } else {
        tx = p.x - this.facing * (16 + i * 12);
        ty = p.y - 12 + Math.sin(time / 300 + i) * 3;
      }
      g.x += (tx - g.x) * 0.12;
      g.y += (ty - g.y) * 0.12;
      g.setFlipX(tx > g.x ? false : this.facing < 0);
    });
  }

  updateCheckpoints() {
    for (let i = this.checkpointIndex + 1; i < L.checkpoints.length; i++) {
      if (this.player.x > L.checkpoints[i] * T) {
        this.checkpointIndex = i;
        this.flags[i].setTint(0x39ff88);
        this.hud.toast('CHECKPOINT');
      }
    }
  }

  // ---------- interactions ----------

  hitBreakable(s) {
    s.hp -= 1;
    s.setTintFill(0xffffff);
    this.time.delayedCall(60, () => s.active && s.clearTint());
    if (s.hp > 0) return;
    this.burst(s.x, s.y, 0xf4f1e8);
    const g = s.ghost;
    s.destroy();
    if (g) {
      g.hidden = false;
      g.setTint(0x6f9a8a).setDepth(8);
      g.aura.setVisible(true);
      this.tweens.add({ targets: g, alpha: 1, duration: 300 });
      this.floatText(g.x, g.y - 14, 'IN REVIEW SINCE 2019', '#9fd8b8');
    }
  }

  freeGhost(g) {
    g.freed = true;
    g.clearTint();
    g.aura.destroy();
    g.floatTween.stop();
    g.body.enable = false;
    g.setDepth(9);
    this.freedCount += 1;
    this.followers.push(g);
    this.burst(g.x, g.y, 0xdff4ff);
    this.speech(g.x, g.y - 12, `${g.def.name}: "${g.def.line}"`);
    this.hud.toast(`CANDIDATE FREED  ${this.freedCount}/5`);
    if (g.def.gives === 'feather') {
      this.hasFeather = true;
      this.time.delayedCall(1200, () => this.hud.toast('COPYWRITER FEATHER: hold JUMP in the air to glide'));
    }
  }

  flashbang() {
    const now = this.time.now;
    if (now < this.reverseUntil) return;
    this.reverseUntil = now + 3000;
    this.cameras.main.shake(200, 0.006);
    this.cameras.main.flash(120, 180, 140, 255);
    this.floatText(this.player.x, this.player.y - 18, 'SYNERGY! PARADIGM SHIFT!', '#d6c2ff');
    this.hud.toast('BUZZWORD FLASHBANG: controls reversed');
  }

  // Returns true if the hit landed.
  damage(time) {
    if (time < this.invulnUntil) return false;
    this.invulnUntil = time + 1200;
    if (this.bossActive) {
      const shield = this.followers.find((g) => !g.spent);
      if (shield) {
        shield.spent = true;
        this.speech(shield.x, shield.y - 10, `${shield.def.name} took that one for you!`);
        this.tweens.add({ targets: shield, y: shield.y - 80, alpha: 0, duration: 900, onComplete: () => shield.setVisible(false) });
        this.blink();
        return true;
      }
    }
    this.hearts -= 1;
    this.blink();
    this.cameras.main.shake(120, 0.004);
    if (this.hearts <= 0) {
      if (this.bossActive) this.loseBoss();
      else this.respawn('HR has reset your morale.');
    }
    return true;
  }

  blink() {
    this.tweens.add({ targets: this.player, alpha: 0.2, yoyo: true, repeat: 5, duration: 90, onComplete: () => this.player.setAlpha(1) });
  }

  respawn(msg) {
    const pos = this.checkpointPos(this.checkpointIndex);
    this.player.setPosition(pos.x, pos.y).setVelocity(0, 0);
    this.hearts = 3;
    this.reverseUntil = 0;
    this.pinnedUntil = 0;
    this.invulnUntil = this.time.now + 1000;
    this.cameras.main.flash(250, 7, 17, 20);
    if (msg) this.hud.toast(msg);
  }

  // ---------- boss ----------

  startBoss(time) {
    this.bossActive = true;
    const x0 = L.arenaStart * T;
    this.cameras.main.setBounds(x0, 0, (L.arenaEnd - L.arenaStart) * T, WORLD_H);
    this.arenaWall = this.add.rectangle(x0 - 4, WORLD_H / 2, 8, WORLD_H, 0x39ff88, 0.25);
    this.physics.add.existing(this.arenaWall, true);
    this.wallCollider = this.physics.add.collider(this.player, this.arenaWall);

    this.hearts = 3;
    this.boss = this.physics.add.image(L.arenaEnd * T - 48, 120, 'boss');
    this.boss.body.setAllowGravity(false).setImmovable(true);
    this.boss.hp = BOSS_HP;
    this.bossPattern = 0;
    this.bossNext = time + 1600;
    this.fireballs = this.physics.add.group({ allowGravity: false });

    this.bossColliders = [
      this.physics.add.overlap(this.player, this.fireballs, (pl, f) => { f.destroy(); this.damage(this.time.now); }),
      this.physics.add.overlap(this.player, this.boss, () => this.damage(this.time.now)),
      this.physics.add.overlap(this.bullets, this.boss, (a, b) => {
        // Phaser passes (body1Object, body2Object) in collider order; the bullet is whichever isn't the boss.
        const bullet = a === this.boss ? b : a;
        bullet.destroy();
        this.hitBoss();
      }),
    ];

    const allies = this.followers.filter((g) => !g.spent).length;
    this.hud.bossIntro(allies);
  }

  updateBoss(time) {
    const boss = this.boss;
    boss.y = 150 + Math.sin(time / 700) * 40;
    if (time > this.bossNext) {
      const pattern = this.bossPattern % 3;
      this.bossPattern += 1;
      if (pattern === 0) this.shootAt(0);
      else if (pattern === 1) [-0.28, 0, 0.28].forEach((a) => this.shootAt(a));
      else this.budgetCut();
      this.bossNext = time + (pattern === 2 ? 1700 : 1250);
    }
    const x0 = L.arenaStart * T - 20;
    for (const f of this.fireballs.getChildren().slice()) {
      if (f.x < x0 || f.y > WORLD_H || f.y < 0 || time > f.die) f.destroy();
    }
  }

  shootAt(spread) {
    const b = this.boss;
    const f = this.fireballs.create(b.x - 26, b.y - 10, 'fireball');
    const ang = Phaser.Math.Angle.Between(f.x, f.y, this.player.x, this.player.y) + spread;
    f.setVelocity(Math.cos(ang) * 140, Math.sin(ang) * 140);
    f.die = this.time.now + 4000;
    this.tweens.add({ targets: f, angle: 360, repeat: -1, duration: 600 });
  }

  budgetCut() {
    const y = L.groundTopRow(L.arenaEnd - 2) * T - 6;
    const f = this.fireballs.create(this.boss.x - 20, y, 'fireball').setScale(1.3);
    f.setVelocityX(-150);
    f.die = this.time.now + 5000;
    this.floatText(this.boss.x - 20, this.boss.y - 50, 'BUDGET CUT!', '#ff6b6b');
  }

  hitBoss() {
    if (!this.bossActive) return;
    this.boss.hp -= 1;
    this.boss.setTintFill(0xffffff);
    this.time.delayedCall(50, () => this.boss && this.boss.active && this.boss.clearTint());
    this.hud.bossHp(this.boss.hp / BOSS_HP);
    if (this.boss.hp <= 0) this.winBoss();
  }

  clearBoss() {
    this.bossColliders.forEach((c) => c.destroy());
    this.fireballs.clear(true, true);
  }

  loseBoss() {
    this.frozen = true;
    this.physics.pause();
    const missing = 5 - this.freedCount;
    const body = missing > 0
      ? `${missing} candidate${missing > 1 ? 's are' : ' is'} still lost in the Void.\nEvery one you free fights beside you.`
      : 'Even the ATS needs a reboot sometimes.\nAll five allies are with you. Try again.';
    this.hud.message('THE ATS WINS THIS ROUND', body, () => this.resetBoss());
  }

  resetBoss() {
    this.clearBoss();
    this.boss.destroy();
    this.boss = null;
    this.wallCollider.destroy();
    this.arenaWall.destroy();
    this.bossActive = false;
    this.hud.bossHp(null);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    for (const g of this.followers) { g.spent = false; g.setVisible(true).setAlpha(1); }
    this.checkpointIndex = L.checkpoints.length - 1;
    this.physics.resume();
    this.frozen = false;
    this.respawn(this.freedCount < 5 ? 'Tip: the missing candidates are back the way you came.' : null);
  }

  winBoss() {
    this.bossActive = false;
    this.bossDone = true;
    this.clearBoss();
    this.hud.bossHp(null);
    const b = this.boss;
    this.cameras.main.shake(600, 0.01);
    this.floatText(b.x, b.y - 50, 'APPLICATION WITHDRAWN', '#39ff88');
    for (let i = 0; i < 6; i++) this.time.delayedCall(i * 100, () => this.burst(b.x + Phaser.Math.Between(-24, 24), b.y + Phaser.Math.Between(-30, 30), 0x39ff88));
    this.tweens.add({ targets: b, alpha: 0, y: b.y + 40, duration: 900, onComplete: () => b.destroy() });

    const cx = ((L.arenaStart + L.arenaEnd) / 2) * T + 60;
    const cy = L.groundTopRow(L.arenaEnd - 2) * T - 11;
    this.capsule = this.physics.add.image(cx, cy, 'capsule');
    this.capsule.body.setAllowGravity(false);
    this.tweens.add({ targets: this.capsule, y: cy - 4, yoyo: true, repeat: -1, duration: 500 });
    this.physics.add.overlap(this.player, this.capsule, () => this.finish());
    this.hud.toast('THE OFFER IS YOURS. GO GET IT.');
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.frozen = true;
    this.physics.pause();
    this.registry.set('result', {
      freed: this.freedCount,
      names: this.followers.map((g) => g.def.name),
      seconds: Math.round((this.time.now - this.startedAt) / 1000),
    });
    this.cameras.main.fadeOut(600, 255, 243, 176);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('End'));
  }

  // ---------- juice ----------

  burst(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const s = this.add.image(x, y, 'spark').setTint(color).setDepth(20);
      const a = Math.random() * Math.PI * 2;
      const d = 10 + Math.random() * 18;
      this.tweens.add({ targets: s, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0, duration: 450, onComplete: () => s.destroy() });
    }
  }

  floatText(x, y, str, color) {
    const t = this.add.text(x, y, str, { fontFamily: FONT, fontSize: '8px', fontStyle: 'bold', color, stroke: '#0b1a1f', strokeThickness: 3 })
      .setOrigin(0.5).setResolution(4).setDepth(30);
    this.tweens.add({ targets: t, y: y - 18, alpha: 0, duration: 1300, onComplete: () => t.destroy() });
  }

  speech(x, y, str) {
    const t = this.add.text(x, y, str, {
      fontFamily: FONT, fontSize: '7px', color: '#0b1a1f', backgroundColor: '#f4f1e8',
      padding: { x: 4, y: 3 }, wordWrap: { width: 140 }, align: 'center',
    }).setOrigin(0.5, 1).setResolution(4).setDepth(40);
    this.tweens.add({ targets: t, y: y - 10, alpha: 0, delay: 2800, duration: 600, onComplete: () => t.destroy() });
  }
}
