import '@fontsource/press-start-2p/latin-400.css';

export const PIXEL = '"Press Start 2P", ui-monospace, monospace';

// Phaser draws text to canvas, so the webfont must be loaded before any Text is created.
export function loadPixelFont() {
  const wait = document.fonts ? document.fonts.load('16px "Press Start 2P"') : Promise.resolve();
  return Promise.race([wait, new Promise((r) => setTimeout(r, 2500))]);
}
