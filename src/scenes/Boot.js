import Phaser from 'phaser';
import { loadPixelFont } from '../fonts.js';
import { drawSam, drawGhosts } from '../art.js';

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
    drawSam(this);
    drawGhosts(this);
    tex(this, 'ground', 16, 16, (g) => {
      // Grey office counter slab with pipes underneath, like the key art.
      g.fillStyle(0x1a242c).fillRect(0, 0, 16, 16);
      g.fillStyle(0x9aa8b4).fillRect(0, 0, 16, 2);
      g.fillStyle(0x6c7c88).fillRect(0, 2, 16, 3);
      g.fillStyle(0x3c4a54).fillRect(0, 5, 16, 1);
      g.fillStyle(0x2c3a44).fillRect(3, 8, 3, 8).fillRect(11, 6, 2, 10);
      g.fillStyle(0x3c5a4a).fillRect(3, 12, 3, 1);
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
    tex(this, 'boss', 72, 88, (g) => {
      // The ATS Overlord: a heap of filing cabinets and CRTs reading 0 (interviews granted).
      g.lineStyle(2, 0xd82800).lineBetween(10, 40, 2, 86).lineBetween(60, 44, 70, 84);
      g.lineStyle(2, 0x3cbcfc).lineBetween(20, 44, 14, 86).lineBetween(52, 46, 58, 86);
      g.fillStyle(0x4c5c5c).fillRect(8, 36, 56, 48);
      g.fillStyle(0x7c8c8c).fillRect(11, 39, 24, 20).fillRect(37, 39, 24, 20).fillRect(11, 61, 50, 20);
      g.fillStyle(0x9cacac).fillRect(11, 39, 24, 2).fillRect(37, 39, 24, 2).fillRect(11, 61, 50, 2);
      g.fillStyle(0x2c3a3c).fillRect(19, 48, 8, 3).fillRect(45, 48, 8, 3).fillRect(32, 70, 8, 3);
      const crt = (x, y, w, h) => {
        g.fillStyle(0x5c6a4c).fillRect(x, y, w, h);
        g.fillStyle(0x0c2a12).fillRect(x + 3, y + 3, w - 6, h - 6);
        g.fillStyle(0x58d854).fillRect(x + w / 2 - 4, y + 7, 8, h - 14);
        g.fillStyle(0x0c2a12).fillRect(x + w / 2 - 2, y + 9, 4, h - 18);
      };
      crt(2, 6, 30, 26); crt(38, 0, 32, 30); crt(22, 20, 26, 20);
      g.fillStyle(0xd82800).fillRect(30, 28, 3, 3).fillRect(39, 28, 3, 3);
    });
    tex(this, 'gear', 32, 32, (g) => {
      g.fillStyle(0x8c5c2c);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.fillRect(16 + Math.cos(a) * 12 - 3, 16 + Math.sin(a) * 12 - 3, 6, 6);
      }
      g.fillCircle(16, 16, 12);
      g.fillStyle(0xb87c3c).fillCircle(16, 16, 9);
      g.fillStyle(0x3c2a14).fillCircle(16, 16, 4);
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
    tex(this, 'wall', 96, 96, (g) => {
      // Server-room wall of green CRT monitors in racks.
      g.fillStyle(0x0a1c20).fillRect(0, 0, 96, 96);
      g.fillStyle(0x10282c).fillRect(0, 0, 4, 96).fillRect(46, 0, 4, 96);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          const x = 7 + c * 46 + (r % 2) * 4;
          const y = 4 + r * 23;
          g.fillStyle(0x16343a).fillRect(x, y, 34, 19);
          g.fillStyle(0x0c3a1c).fillRect(x + 2, y + 2, 30, 15);
          g.fillStyle(0x2c8a44);
          for (let l = 0; l < 4; l++) g.fillRect(x + 4, y + 4 + l * 3, 6 + ((r * 7 + c * 5 + l * 11) % 20), 1);
          if ((r + c) % 3 === 0) g.fillStyle(0x58d854).fillRect(x + 22, y + 6, 6, 7);
        }
      }
    });
    tex(this, 'fire1', 12, 14, (g) => {
      g.fillStyle(0xd82800).fillTriangle(0, 14, 12, 14, 6, 0);
      g.fillStyle(0xf87858).fillTriangle(2, 14, 10, 14, 5, 4);
      g.fillStyle(0xf8b800).fillTriangle(4, 14, 9, 14, 6, 8);
    });
    tex(this, 'fire2', 12, 14, (g) => {
      g.fillStyle(0xd82800).fillTriangle(0, 14, 12, 14, 7, 1);
      g.fillStyle(0xf87858).fillTriangle(2, 14, 10, 14, 7, 5);
      g.fillStyle(0xf8b800).fillTriangle(3, 14, 8, 14, 5, 9);
    });
    tex(this, 'officedesk', 32, 22, (g) => {
      g.fillStyle(0x6c4a2c).fillRect(0, 10, 32, 4);
      g.fillStyle(0x4c3420).fillRect(1, 14, 10, 8).fillRect(26, 14, 5, 8);
      g.fillStyle(0x2c3a3c).fillRect(15, 0, 12, 9);
      g.fillStyle(0x0c3a1c).fillRect(16, 1, 10, 7);
      g.fillStyle(0x58d854).fillRect(17, 3, 6, 1).fillRect(17, 5, 4, 1);
      g.fillStyle(0xf0f0f0).fillRect(3, 6, 8, 4);
      g.fillStyle(0xbcbcbc).fillRect(4, 4, 7, 2);
    });
    tex(this, 'paperpile', 14, 18, (g) => {
      for (let y = 0; y < 18; y += 3) {
        g.fillStyle(y % 6 ? 0xf4f1e8 : 0xd8d2c4).fillRect((y * 7) % 3, y, 13, 3);
      }
    });
    tex(this, 'stamp', 22, 14, (g) => {
      g.fillStyle(0xf4f1e8).fillRect(0, 0, 22, 14);
      g.lineStyle(1, 0xd82800).strokeRect(3, 4, 16, 6);
      g.fillStyle(0xd82800).fillRect(5, 6, 12, 2);
    });
    tex(this, 'spark', 3, 3, (g) => { g.fillStyle(0xffffff).fillRect(0, 0, 3, 3); });

    // Title-screen night skyline, drawn at 320x180 and shown at 3x for chunky NES pixels.
    tex(this, 'skyline', 320, 180, (g) => {
      g.fillStyle(0x000000).fillRect(0, 0, 320, 180);
      g.fillStyle(0xfcfcfc);
      for (let i = 0; i < 70; i++) g.fillRect(Phaser.Math.Between(0, 319), Phaser.Math.Between(0, 110), 1, 1);
      g.fillStyle(0x0c1638);
      [[0, 128, 34], [30, 116, 26], [52, 124, 30], [212, 112, 30], [238, 126, 40], [274, 118, 46]].forEach(([x, y, bw]) => g.fillRect(x, y, bw, 180 - y));
      g.fillStyle(0x182850).fillRect(116, 44, 88, 136);
      g.fillStyle(0x24386c).fillRect(124, 36, 72, 10).fillRect(156, 18, 8, 18);
      g.fillStyle(0xd82800).fillRect(159, 14, 2, 3);
      for (let y = 52; y < 176; y += 7) {
        for (let x = 122; x < 200; x += 8) {
          g.fillStyle(Math.random() < 0.35 ? 0x58d854 : 0x0c3a20).fillRect(x, y, 4, 4);
        }
      }
      g.fillStyle(0x0c1638);
      for (let y = 132; y < 176; y += 8) for (let x = 4; x < 320; x += 12) if (x < 112 || x > 208) g.fillRect(x, y, 3, 3);
      g.fillStyle(0x3c3c3c).fillRect(0, 151, 72, 29);
      g.fillStyle(0x7c7c7c).fillRect(0, 151, 72, 2);
    });

    loadPixelFont().then(() => this.scene.start('Winners'));
  }
}
