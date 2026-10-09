// Render scene.html frame-by-frame with headless Chromium, then mux with the song via ffmpeg.
// Usage: node render.mjs <song audio file> [out.mp4] [--preview t1,t2,...]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const [audio, out = path.join(dir, 'podcast-intro-remastered.mp4')] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const previewArg = process.argv.find(a => a.startsWith('--preview='));
const FPS = 60;

const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('file://' + path.join(dir, 'scene_v2.html'));
await page.evaluate(() => window.ready);
const duration = await page.evaluate(() => window.DURATION);

const grab = async t => {
  const url = await page.evaluate(t => { window.render(t); return document.getElementById('c').toDataURL('image/png'); }, t);
  return Buffer.from(url.split(',')[1], 'base64');
};

if (previewArg) {
  const pdir = path.join(dir, 'preview_v2');
  mkdirSync(pdir, { recursive: true });
  for (const t of previewArg.split('=')[1].split(',').map(Number)) writeFileSync(path.join(pdir, `t_${t.toFixed(2)}.png`), await grab(t));
  await browser.close();
  process.exit(0);
}

const fdir = path.join(dir, 'frames_v2');
rmSync(fdir, { recursive: true, force: true });
mkdirSync(fdir, { recursive: true });
const total = Math.round(duration * FPS);
for (let i = 0; i < total; i++) {
  writeFileSync(path.join(fdir, `f_${String(i).padStart(4, '0')}.png`), await grab(i / FPS));
  if (i % 60 === 0) console.log(`frame ${i}/${total}`);
}
await browser.close();

// Audio fades out over the last 2 seconds so the song dissolves with the picture.
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(fdir, 'f_%04d.png'),
  '-i', audio, '-af', `afade=t=out:st=${duration - 2}:d=2`, '-t', String(duration),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', out], { stdio: 'inherit' });
rmSync(fdir, { recursive: true, force: true });
console.log('wrote', out);
