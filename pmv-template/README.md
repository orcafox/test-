# PMV Template — gaya Khori

Template motion graphics untuk PMV/lyric edit. Dibangun dari edit "Tarot" (v4) yang sudah di-approve.
Kalau mulai sesi baru, bilang: **"pakai template PMV di repo"**, lalu kirim lagu + video referensi + foto.

## Gaya yang wajib dipertahankan

- **Keyframe ease ala Alight Motion** di setiap adegan (`cam()` di `scene.html`):
  - *Ease out* di awal adegan: kamera masuk zoom 1.28x → 1x (expo out) + rotasi kecil yang memantul (back out).
  - *Ease in* di akhir adegan: zoom makin cepat 1x → 1.32x (quint in) → efek zoom-through ke adegan berikutnya.
  - Di tengah: drift/float pelan terus-menerus. **Tidak ada** punch/shake yang terkunci ke beat.
- **Tipografi lirik** mengikuti vokal (timing dari video referensi), huruf muncul satu-satu:
  - Teks besar (font kondensed Six Caps / League Gothic) masuk dengan **overshoot** (back easing).
  - Teks kecil (Inter Bold) masuk dengan ease out halus.
- **Transisi** 0.7 dtk, berpusat di pergantian adegan: zoom-dissolve, fade, slide, circle.
- **60 fps + motion blur** (3 sub-frame per frame, shutter 1/75).
- **Foto tidak dihapus background-nya** — cukup diberi border (putih polos atau bergerigi), hitam-putih kontras / duotone sesuai palet.
- Grain halus + vignette.
- **Tanpa watermark** kecuali diminta.
- Output 1440×1080 (atau ikut rasio referensi), dikompres < 30 MB untuk dikirim.

## Cara pakai

1. Taruh foto di `ph/` (`p13.jpg`, `p14.jpg`, … — sesuaikan nama di `scene.html`: `ks`, `FOCUS`, `processImg`).
   Folder `ph/` tidak di-commit (foto pribadi).
2. Analisis lagu: `python3 beats.py song.wav` → salin `const B = [...]` ke `scene.html`.
3. Atur adegan di daftar `S.push([waktuMulai, t => { ... }])` sesuai lirik.
4. Preview frame: `node render.mjs song.wav --preview=1.5,4.0,8.2` → hasil di `preview/`.
5. Render penuh: `node render.mjs song.wav` → `pmv.mp4`, lalu kompres:
   `ffmpeg -i pmv.mp4 -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -c:a copy pmv_final.mp4`

Butuh: Node + Playwright (Chromium), ffmpeg, Python + librosa.
Lagu dan lirik tidak di-commit; lirik ditulis user sendiri.
