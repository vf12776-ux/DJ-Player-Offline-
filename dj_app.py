import sounddevice as sd
import pydub
import tkinter as tk
from tkinter import filedialog
import numpy as np

class Track:
    def __init__(self):
        self.audio = None
        self.pan = 0.0
        self.gain = 1.0
        self.loop = True
        self.position = 0
        self.raw_samples = None
        self.duration = 0

    def load_file(self, file_path):
        try:
            self.audio = pydub.AudioSegment.from_file(file_path)
            self.audio = self.audio.set_channels(2).set_frame_rate(44100)
            self.raw_samples = np.array(self.audio.get_array_of_samples(), dtype=np.float32).reshape(-1, 2) / 32768.0
            self.position = 0
            self.duration = len(self.audio) / 1000.0  # seconds
            print(f"Loaded {file_path}: {len(self.audio)} ms, {self.audio.frame_rate} Hz, {self.audio.channels} channels")
        except Exception as e:
            print(f"Error loading {file_path}: {e}")

class DJApp:
    def __init__(self, root):
        print("Initializing DJ App...")
        self.root = root
        self.root.title("DJ App")
        self.root.geometry("900x600")
        self.root.configure(bg="#1e1e1e")
        self.tracks = [Track() for _ in range(4)]
        self.stream = None
        self.playing = False
        self.loop_vars = [tk.IntVar(value=1) for _ in range(4)]
        self.pan_vars = [0.0 for _ in range(4)]
        self.gain_vars = [1.0 for _ in range(4)]
        self.progress_vars = [tk.DoubleVar(value=0.0) for _ in range(4)]

        self.play_btn = tk.Button(root, text="Play All", command=self.play_all, bg="#ff4d4d", fg="#ffffff", font=("Helvetica", 14, "bold"), relief="flat", padx=10, pady=5)
        self.play_btn.pack(pady=10)

        self.track_frames = []
        self.progress_bars = []
        colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ce82"]
        for i in range(4):
            frame = tk.Frame(root, bg="#1e1e1e")
            tk.Button(frame, text=f"Track {i+1}", command=lambda x=i: self.load_track(x), bg=colors[i], fg="#ffffff", font=("Helvetica", 10), relief="flat").pack(side=tk.LEFT, padx=5)
            tk.Scale(frame, from_=-1, to=1, resolution=0.1, orient=tk.HORIZONTAL, length=100, label="Pan", bg="#1e1e1e", fg="#ffffff", troughcolor=colors[i], highlightthickness=0, command=lambda x, idx=i: self.update_pan(idx, x)).pack(side=tk.LEFT, padx=5)
            tk.Scale(frame, from_=0, to=2, resolution=0.1, orient=tk.HORIZONTAL, length=100, label="Gain", bg="#1e1e1e", fg="#ffffff", troughcolor=colors[i], highlightthickness=0, command=lambda x, idx=i: self.update_gain(idx, x)).pack(side=tk.LEFT, padx=5)
            tk.Checkbutton(frame, text="Loop", variable=self.loop_vars[i], bg="#1e1e1e", fg="#ffffff", selectcolor=colors[i]).pack(side=tk.LEFT, padx=5)
            frame.pack(pady=5)
            progress = tk.Frame(root, bg="#1e1e1e")
            tk.Label(progress, text=f"Track {i+1} Progress", bg="#1e1e1e", fg="#ffffff", font=("Helvetica", 10)).pack(side=tk.LEFT, padx=5)
            progress_bar = tk.Scale(progress, from_=0, to=100, orient=tk.HORIZONTAL, length=400, bg="#1e1e1e", fg="#ffffff", troughcolor=colors[i], highlightthickness=0, variable=self.progress_vars[i], state='disabled')
            progress_bar.pack(side=tk.LEFT, padx=5)
            progress.pack(pady=5)
            self.track_frames.append(frame)
            self.progress_bars.append(progress_bar)

    def update_pan(self, index, value):
        self.pan_vars[index] = float(value)
        print(f"Track {index+1} pan set to {value}")

    def update_gain(self, index, value):
        self.gain_vars[index] = float(value)
        print(f"Track {index+1} gain set to {value}")

    def load_track(self, track_index):
        file_path = filedialog.askopenfilename(filetypes=[("Audio", "*.mp3 *.wav")])
        if file_path:
            self.tracks[track_index].load_file(file_path)

    def play_all(self):
        print("Play All clicked")
        if self.playing:
            self.playing = False
            if self.stream:
                self.stream.stop()
            self.play_btn.config(text="Play All")
            print("Stopped playback")
            return
        self.playing = True
        self.play_btn.config(text="Stop")
        try:
            devices = sd.query_devices()
            output_device = None
            for i, dev in enumerate(devices):
                if dev['max_output_channels'] > 0:
                    output_device = i
                    break
            if output_device is None:
                raise Exception("No output device found")
            sd.default.device = output_device
            print(f"Starting stream with device: {devices[output_device]['name']} (ID: {output_device})")
            self.stream = sd.OutputStream(samplerate=44100, channels=2, callback=self.callback, blocksize=1024, dtype='float32')
            self.stream.start()
            self.update_progress()
            print("Started playback")
        except Exception as e:
            print(f"Error starting stream: {e}")
            self.playing = False
            self.play_btn.config(text="Play All")

    def update_progress(self):
        if not self.playing:
            return
        for i, track in enumerate(self.tracks):
            if track.audio and track.duration > 0:
                progress = (track.position / len(track.raw_samples)) * 100
                self.progress_vars[i].set(progress)
        self.root.after(100, self.update_progress)

    def callback(self, outdata, frames, time, status):
        if status:
            print(f"Stream status: {status}")
        mixed = np.zeros((frames, 2), dtype=np.float32)
        any_audio = False
        for i, track in enumerate(self.tracks):
            if not track.audio or track.raw_samples is None:
                continue
            any_audio = True
            pan = self.pan_vars[i]
            gain = self.gain_vars[i]
            loop = self.loop_vars[i].get()
            samples = track.raw_samples
            if track.position >= len(samples):
                if loop:
                    track.position = 0
                    print(f"Track {i+1} looped")
                else:
                    continue
            end_idx = min(track.position + frames, len(samples))
            chunk = samples[track.position:end_idx]
            if len(chunk) < frames:
                chunk = np.pad(chunk, ((0, frames - len(chunk)), (0, 0)), mode='constant')
            track.position += len(chunk)
            chunk = chunk * gain
            if pan != 0:
                chunk[:, 0] *= (1 - pan)
                chunk[:, 1] *= (1 + pan)
            mixed += chunk
        if any_audio:
            mixed = np.clip(mixed, -1.0, 1.0)
            outdata[:] = mixed
            print(f"Playing: {frames} frames mixed, max amplitude: {np.max(np.abs(mixed)):.3f}")
        else:
            outdata[:] = np.zeros((frames, 2), dtype=np.float32)
            self.playing = False
            self.root.after(0, lambda: self.play_btn.config(text="Play All"))
            print("No audio to play")

    def __del__(self):
        if self.stream:
            self.stream.stop()

if __name__ == "__main__":
    print("Starting DJ App...")
    root = tk.Tk()
    app = DJApp(root)
    root.mainloop()