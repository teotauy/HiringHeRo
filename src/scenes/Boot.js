import Phaser from 'phaser';

// Greybox art: every texture is drawn in code so the game runs with zero asset files.
// The art pass replaces these keys with real sprites one by one.
function tex(scene, key, w, h, draw) {
  const g = scene.add.graphics();
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

export default class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    tex(this, 'sam', 14, 24, (g) => {
      g.fillStyle(0x7a4a22).fillRect(3, 0, 9, 4);
      g.fillStyle(0xf0c8a0).fillRect(3, 3, 8, 6);
      g.fillStyle(0x7a4a22).fillRect(3, 3, 2, 3);
      g.fillStyle(0x1b1b1b).fillRect(9, 5, 1, 1);
      g.fillStyle(0xdfe9f0).fillRect(2, 9, 10, 8);
      g.fillStyle(0xc0392b).fillRect(6, 9, 2, 7);
      g.fillStyle(0x2c3e50).fillRect(3, 17, 8, 5);
      g.fillStyle(0x1b1b1b).fillRect(2, 22, 4, 2).fillRect(8, 22, 5, 2);
    });
    tex(this, 'ground', 16, 16, (g) => {
      g.fillStyle(0x16242a).fillRect(0, 0, 16, 16);
      g.fillStyle(0x3c5a5f).fillRect(0, 0, 16, 3);
      g.fillStyle(0x223840).fillRect(2, 7, 3, 2).fillRect(10, 11, 3, 2);
    });
    tex(this, 'desk', 16, 8, (g) => {
      g.fillStyle(0x8a5a35).fillRect(0, 0, 16, 3);
      g.fillStyle(0x5c3a22).fillRect(0, 3, 16, 5);
      g.fillStyle(0x3d2616).fillRect(0, 7, 16, 1);
    });
    tex(this, 'stack', 16, 32, (g) => {
      for (let y = 0; y < 32; y += 4) {
        g.fillStyle(y % 8 ? 0xf4f1e8 : 0xe2ddcf).fillRect(y % 8 ? 0 : 1, y, 15, 4);
        g.fillStyle(0xb9b3a3).fillRect(2, y + 2, 9, 1);
      }
    });
    tex(this, 'cabinet', 16, 32, (g) => {
      g.fillStyle(0x7f8c8d).fillRect(0, 0, 16, 32);
      g.fillStyle(0x95a5a6).fillRect(1, 1, 14, 9).fillRect(1, 11, 14, 9).fillRect(1, 21, 14, 10);
      g.fillStyle(0x2c3e50).fillRect(6, 4, 4, 2).fillRect(6, 14, 4, 2).fillRect(6, 24, 4, 2);
    });
    tex(this, 'ghost', 14, 16, (g) => {
      g.fillStyle(0xdff4ff).fillCircle(7, 6, 6).fillRect(1, 6, 12, 7);
      g.fillTriangle(1, 13, 4, 13, 2, 16).fillTriangle(5, 13, 9, 13, 7, 16).fillTriangle(10, 13, 13, 13, 12, 16);
      g.fillStyle(0x1b2b34).fillRect(4, 5, 2, 2).fillRect(9, 5, 2, 2);
      g.fillStyle(0x9fc6dd).fillRect(5, 9, 4, 1);
    });
    tex(this, 'envelope', 9, 6, (g) => {
      g.fillStyle(0xffffff).fillRect(0, 0, 9, 6);
      g.lineStyle(1, 0xc0392b).lineBetween(0, 0, 4.5, 3).lineBetween(9, 0, 4.5, 3);
    });
    tex(this, 'orb', 16, 16, (g) => {
      g.fillStyle(0x6c2bd9).fillCircle(8, 8, 8);
      g.fillStyle(0xb388ff).fillCircle(8, 8, 5);
      g.fillStyle(0xffffff).fillCircle(6, 6, 2);
    });
    tex(this, 'emitter', 14, 8, (g) => {
      g.fillStyle(0x34495e).fillRect(0, 0, 14, 8);
      g.fillStyle(0xffd84a).fillRect(4, 5, 6, 3);
    });
    tex(this, 'boss', 64, 80, (g) => {
      g.fillStyle(0x5d6d6e).fillRect(4, 30, 56, 50);
      g.fillStyle(0x7f8c8d).fillRect(8, 34, 22, 20).fillRect(34, 34, 22, 20).fillRect(8, 57, 48, 20);
      g.fillStyle(0x2c3e50).fillRect(16, 42, 6, 3).fillRect(42, 42, 6, 3).fillRect(29, 65, 6, 3);
      g.fillStyle(0x3b4a3f).fillRect(0, 0, 30, 28).fillRect(34, 4, 30, 24);
      g.fillStyle(0x0f2a12).fillRect(3, 3, 24, 22).fillRect(37, 7, 24, 18);
      g.fillStyle(0x39ff88).fillRect(11, 8, 8, 12).fillRect(45, 10, 8, 12);
      g.fillStyle(0x0f2a12).fillRect(13, 10, 4, 8).fillRect(47, 12, 4, 8);
    });
    tex(this, 'fireball', 12, 12, (g) => {
      g.fillStyle(0x6c2bd9).fillCircle(6, 6, 6);
      g.fillStyle(0x39ff88).fillCircle(6, 6, 4);
      g.fillStyle(0xd9ffe8).fillCircle(5, 5, 2);
    });
    tex(this, 'heart', 9, 8, (g) => {
      g.fillStyle(0xe74c3c).fillCircle(2.5, 2.5, 2.5).fillCircle(6.5, 2.5, 2.5).fillTriangle(0, 3, 9, 3, 4.5, 8);
    });
    tex(this, 'heartEmpty', 9, 8, (g) => {
      g.fillStyle(0x3a3a3a).fillCircle(2.5, 2.5, 2.5).fillCircle(6.5, 2.5, 2.5).fillTriangle(0, 3, 9, 3, 4.5, 8);
    });
    tex(this, 'capsule', 16, 22, (g) => {
      g.fillStyle(0xf1c40f).fillRoundedRect(0, 0, 16, 22, 5);
      g.fillStyle(0xfff3b0).fillRoundedRect(3, 3, 6, 10, 3);
    });
    tex(this, 'flag', 10, 24, (g) => {
      g.fillStyle(0xbdc3c7).fillRect(0, 0, 2, 24);
      g.fillStyle(0xffffff).fillTriangle(2, 1, 10, 4, 2, 8);
    });
    tex(this, 'feather', 10, 12, (g) => {
      g.fillStyle(0xf4f1e8).fillEllipse(6, 5, 6, 10);
      g.lineStyle(1, 0x2c3e50).lineBetween(2, 11, 8, 1);
    });
    tex(this, 'wall', 64, 64, (g) => {
      g.fillStyle(0x0b1a1f).fillRect(0, 0, 64, 64);
      g.fillStyle(0x102a2a).fillRect(4, 6, 24, 16).fillRect(36, 30, 24, 16);
      g.fillStyle(0x1f5a3a).fillRect(7, 9, 18, 10).fillRect(39, 33, 18, 10);
      g.fillStyle(0x39ff88).fillRect(9, 11, 8, 1).fillRect(9, 14, 12, 1).fillRect(41, 35, 10, 1).fillRect(41, 38, 6, 1);
      g.fillStyle(0x0e2226).fillRect(0, 50, 64, 2);
    });
    tex(this, 'spark', 3, 3, (g) => { g.fillStyle(0xffffff).fillRect(0, 0, 3, 3); });

    this.scene.start('Title');
  }
}
