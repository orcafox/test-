"""Analisis lagu untuk PMV: tempo, beat, dan energi per detik.
Usage: python3 beats.py song.wav   (butuh: pip install librosa)
Salin daftar beat ke konstanta B di scene.html."""
import sys
import librosa
import numpy as np

y, sr = librosa.load(sys.argv[1], sr=22050)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
bt = librosa.frames_to_time(beats, sr=sr)
print("tempo:", float(np.atleast_1d(tempo)[0]), "BPM | durasi:", round(len(y) / sr, 2), "dtk")
print("const B = [" + ", ".join(f"{b:.2f}" for b in bt) + "];")
rms = librosa.feature.rms(y=y)[0]
t = librosa.frames_to_time(np.arange(len(rms)), sr=sr)
print("energi/dtk:", " ".join(f"{s}:{rms[(t >= s) & (t < s + 1)].mean():.2f}" for s in range(int(t[-1]) + 1)))
