import Phaser from 'phaser';

export default class Title extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    const { width: w, height: h } = this.scale;
    this.add.tileSprite(0, 0, w, h, 'wall').setOrigin(0).setTileScale(2).setAlpha(0.6);
    this.add.text(w / 2, 150, 'HIRING HeRo', {
      fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '84px', fontStyle: 'bold',
      color: '#dff4ff', stroke: '#0b1a1f', strokeThickness: 10,
    }).setOrigin(0.5);
    this.add.text(w / 2, 225, "HUMANITY ISN'T JUST A RESOURCE", {
      fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '26px', color: '#39ff88',
    }).setOrigin(0.5);
    this.add.text(w / 2, 300,
      'Five candidates are lost in the Applicant Tracking Void.\nYou are Sam, a Jr. Recruiter with a Dispatch Pistol\nand an unreasonable belief in closure.', {
        fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '20px', color: '#b8c7cc', align: 'center', lineSpacing: 6,
      }).setOrigin(0.5);
    const start = this.add.text(w / 2, 430, 'TAP OR PRESS ANY KEY', {
      fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '28px', color: '#f1c40f',
    }).setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.25, yoyo: true, repeat: -1, duration: 650 });
    this.add.image(w / 2 - 260, 150, 'sam').setScale(5);
    this.add.image(w / 2 + 260, 150, 'ghost').setScale(5);

    const go = () => this.scene.start('Level1');
    this.input.once('pointerdown', go);
    this.input.keyboard.once('keydown', go);
  }
}
