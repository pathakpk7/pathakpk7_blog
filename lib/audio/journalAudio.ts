// Realistic physical & magical sound synthesis via Web Audio API
// No external assets required — zero network dependencies, 100% reliable.

class JournalAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("thepathak_journal_sound");
      this.isEnabled = saved === "true";
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("thepathak_journal_sound", enabled ? "true" : "false");
      if (enabled) {
        this.initContext();
        this.playPaperTurn();
      }
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.isEnabled);
    return this.isEnabled;
  }

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Soft feather quill scratching on paper
  public playQuillScratch(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const duration = 0.08 + Math.random() * 0.05;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Filtered noise with scratchy amplitude modulations
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const mod = Math.sin((i / bufferSize) * Math.PI * (12 + Math.random() * 8));
        data[i] = white * 0.5 * (mod > 0 ? mod : 0.2);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2400 + Math.random() * 800;
      filter.Q.value = 3.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // Ignore audio synthesis errors on older devices
    }
  }

  // 2. Quill dipping into inkpot
  public playInkDip(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Soft water droplet / bubble resonance
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  // 3. Realistic paper unfolding / page turn
  public playPaperTurn(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const duration = 0.45;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Low textured friction noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.2);
      filter.frequency.linearRampToValueAtTime(400, ctx.currentTime + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {}
  }

  // 4. Subtle magical transition when unsealing the journal
  public playMagicalUnseal(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Harmonic pentatonic bells: E5, G#5, B5, E6
      const freqs = [659.25, 830.61, 987.77, 1318.51];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.045, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.2);
      });
    } catch {}
  }

  // 5. Delicate quill lift
  public playQuillLift(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.12);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }
}

export const journalAudio = new JournalAudioSynthesizer();
