// Web Audio API Sound Synthesizer & Music Player
// Generates cute music box melodies, candle puff sounds, and celebration chimes

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isPlayingMusic = false;
    this.isMuted = false;
    this.customAudio = null;
    this.musicTimer = null;
    this.melodyIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a soft cute sparkle / bell chime
  playChime(frequency = 880, duration = 0.4, type = 'sine') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      // Slight pitch glide up for sweet shimmer
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.05, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play chime error:', e);
    }
  }

  // Candle puff / blow sound
  playPuff() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // Noise buffer for soft airy blow
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 0.25);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();

      // Pair with a cute harmonic bell note
      this.playChime(659.25, 0.35); // E5
    } catch (e) {
      console.warn('Audio play puff error:', e);
    }
  }

  // Grand celebration fan-fare (Happy Birthday phrase)
  playCelebrationFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Happy Birthday notes: C4, C4, D4, C4, F4, E4
    const notes = [
      { f: 523.25, d: 0.2 },
      { f: 523.25, d: 0.2 },
      { f: 587.33, d: 0.35 },
      { f: 523.25, d: 0.35 },
      { f: 698.46, d: 0.4 },
      { f: 659.25, d: 0.6 }
    ];

    let timeOffset = 0;
    notes.forEach((note) => {
      setTimeout(() => {
        this.playMusicBoxNote(note.f, note.d * 1.5);
      }, timeOffset * 1000);
      timeOffset += note.d;
    });
  }

  // Music box bell note synthesizer (sweet blend of sine and subtle harmonic)
  playMusicBoxNote(freq, duration = 0.8) {
    if (this.isMuted || !this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Subtle sweet harmonic overtone
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + duration);
    osc2.stop(this.ctx.currentTime + duration);
  }

  // Background romantic melody loop
  startBackgroundMelody(customUrl = null) {
    this.init();

    if (customUrl) {
      if (!this.customAudio) {
        this.customAudio = new Audio(customUrl);
        this.customAudio.loop = true;
      }
      this.customAudio.play().catch(() => {});
      this.isPlayingMusic = true;
      return;
    }

    if (this.isPlayingMusic) return;
    this.isPlayingMusic = true;

    // Sweet, romantic music-box melody progression in C Major / G
    const melody = [
      { f: 523.25, d: 0.45 }, // C5
      { f: 659.25, d: 0.45 }, // E5
      { f: 783.99, d: 0.45 }, // G5
      { f: 1046.50, d: 0.6 }, // C6
      { f: 880.00, d: 0.45 }, // A5
      { f: 783.99, d: 0.6 },  // G5
      { f: 659.25, d: 0.45 }, // E5
      { f: 587.33, d: 0.6 },  // D5
      { f: 523.25, d: 0.45 }, // C5
      { f: 587.33, d: 0.45 }, // D5
      { f: 659.25, d: 0.6 },  // E5
      { f: 783.99, d: 0.8 },  // G5
      { f: 698.46, d: 0.45 }, // F5
      { f: 659.25, d: 0.45 }, // E5
      { f: 587.33, d: 0.45 }, // D5
      { f: 523.25, d: 0.9 }   // C5
    ];

    const step = () => {
      if (!this.isPlayingMusic) return;
      if (!this.isMuted) {
        const item = melody[this.melodyIndex];
        this.playMusicBoxNote(item.f, item.d * 1.8);
      }
      this.melodyIndex = (this.melodyIndex + 1) % melody.length;
      this.musicTimer = setTimeout(step, 550);
    };

    step();
  }

  stopBackgroundMelody() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  toggleMusic() {
    if (this.isMuted) {
      this.isMuted = false;
      if (this.customAudio) {
        this.customAudio.play().catch(() => {});
      }
      return true; // now active
    } else {
      this.isMuted = true;
      if (this.customAudio) {
        this.customAudio.pause();
      }
      return false; // now muted
    }
  }
}

export const soundManager = new SoundManager();
