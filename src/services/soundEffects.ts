/**
 * Procedural Web Audio API Sound Effects Engine
 * 100% offline, privacy-safe, zero external network/file dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientSource: OscillatorNode | AudioBufferSourceNode | null = null;
  private isUnderwater: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.value = muted ? 0 : 0.08;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Soft chime when a hidden I Spy object is found
  public playObjectFoundChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }

  // Warm orchestral-style swell when a lesson day badge is lit
  public playBadgeLitSwell() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chord = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5

    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.7);
    });
  }

  // Soft paper page turn sound
  public playPageTurn() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);
    filter.Q.value = 2.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  // Water transition splash/dive
  public playWaterTransition(toUnderwater: boolean) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    if (toUnderwater) {
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);
    } else {
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.35);
    }

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Correct answer sound for question & review quiz
  public playCorrectSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25]; // A major triad

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.12, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.45);
    });
  }

  // Single musical note for melody player
  public playMusicalNote(freq: number, durationSec: number = 0.45) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec + 0.05);
  }

  // -----------------------------------------------------------------
  // RELAXING AMBIENT BACKING MUSIC (Acoustic Harp & Warm Synth Pad)
  // Procedural Web Audio API - Zero external assets or network calls
  // -----------------------------------------------------------------
  private bgmGain: GainNode | null = null;
  private bgmFilter: BiquadFilterNode | null = null;
  private bgmIntervalId: any = null;
  private bgmPadOscs: OscillatorNode[] = [];
  private isBgmActive: boolean = false;
  private lastFootstepTime: number = 0;
  private pushRumbleGain: GainNode | null = null;
  private pushRumbleSource: AudioBufferSourceNode | null = null;

  public startAmbientBGM() {
    if (this.isBgmActive) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isBgmActive = true;

    // Master BGM Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.09, ctx.currentTime);
    this.bgmGain = masterGain;

    // Warm Low-pass Filter for peaceful acoustic warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(540, ctx.currentTime);
    filter.Q.value = 1.0;
    this.bgmFilter = filter;

    masterGain.connect(ctx.destination);

    // Warm ambient pad chord progression (D - G - Bm - A pentatonic foundation)
    const chordProgressions = [
      [146.83, 220.0, 293.66, 369.99], // D major (D3, A3, D4, F#4)
      [196.0, 246.94, 293.66, 392.0],  // G major (G3, B3, D4, G4)
      [123.47, 185.0, 246.94, 369.99], // B minor (B2, F#3, B3, F#4)
      [110.0, 164.81, 220.0, 329.63],  // A major (A2, E3, A3, E4)
    ];

    let chordIndex = 0;

    const playNextPadChord = () => {
      if (!this.isBgmActive) return;
      const curCtx = this.getContext();
      if (!curCtx) return;

      const chord = chordProgressions[chordIndex % chordProgressions.length];
      chordIndex++;

      const chordGain = curCtx.createGain();
      chordGain.gain.setValueAtTime(0.001, curCtx.currentTime);
      chordGain.gain.linearRampToValueAtTime(0.05, curCtx.currentTime + 2.5);
      chordGain.gain.setValueAtTime(0.05, curCtx.currentTime + 5.0);
      chordGain.gain.exponentialRampToValueAtTime(0.001, curCtx.currentTime + 8.2);

      chordGain.connect(this.bgmFilter!);
      this.bgmFilter!.connect(this.bgmGain!);

      chord.forEach((freq) => {
        const osc = curCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, curCtx.currentTime);

        // Soft detuning for rich warm pad chorus
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, curCtx.currentTime);

        osc.connect(chordGain);
        osc.start(curCtx.currentTime);
        osc.stop(curCtx.currentTime + 8.5);
      });
    };

    // Pentatonic Acoustic Harp Arpeggios (D, E, F#, A, B, D, F#)
    const harpNotes = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 739.99, 880.0];

    const playHarpPluck = (freq: number, delaySec: number = 0) => {
      if (!this.isBgmActive) return;
      const curCtx = this.getContext();
      if (!curCtx) return;

      const startTime = curCtx.currentTime + delaySec;
      const osc = curCtx.createOscillator();
      const osc2 = curCtx.createOscillator();
      const noteGain = curCtx.createGain();

      osc.type = "triangle";
      osc2.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      osc2.frequency.setValueAtTime(freq * 2, startTime); // harmonic sparkle

      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.07, startTime + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.8);

      osc.connect(noteGain);
      osc2.connect(noteGain);
      noteGain.connect(this.bgmGain!);

      osc.start(startTime);
      osc2.start(startTime);
      osc.stop(startTime + 1.85);
      osc2.stop(startTime + 1.85);
    };

    // Initial pad chord
    playNextPadChord();

    // Recurring musical cycle
    let stepCount = 0;
    this.bgmIntervalId = setInterval(() => {
      if (!this.isBgmActive) return;
      stepCount++;

      // Change pad chord every ~7 seconds
      if (stepCount % 7 === 0) {
        playNextPadChord();
      }

      // Gentle harp arpeggio cascade
      if (stepCount % 2 === 0) {
        const noteIdx = Math.floor(Math.random() * harpNotes.length);
        playHarpPluck(harpNotes[noteIdx], 0);
        if (Math.random() > 0.4) {
          const secondNote = harpNotes[(noteIdx + 2) % harpNotes.length];
          playHarpPluck(secondNote, 0.22);
        }
      }
    }, 1000);
  }

  public stopAmbientBGM() {
    this.isBgmActive = false;
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.bgmGain) {
      this.bgmGain.gain.linearRampToValueAtTime(0.001, (this.ctx?.currentTime || 0) + 0.5);
      setTimeout(() => {
        this.bgmGain = null;
      }, 600);
    }
  }

  public isBgmRunning(): boolean {
    return this.isBgmActive;
  }

  // -----------------------------------------------------------------
  // CHARACTER MOVEMENT AUDIO (Footsteps, Jump, Stone Push)
  // -----------------------------------------------------------------
  public playFootstep(surface: "earth" | "stone" | "cloud" = "earth") {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Debounce footsteps to prevent overlapping spam
    if (now - this.lastFootstepTime < 0.26) return;
    this.lastFootstepTime = now;

    // Low resonant footstep thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = surface === "stone" ? 140 : surface === "cloud" ? 220 : 90;
    osc.type = surface === "cloud" ? "sine" : "triangle";
    osc.frequency.setValueAtTime(baseFreq + Math.random() * 20, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);

    // Subtle rustle/scuff noise
    const bufferSize = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(surface === "stone" ? 1800 : 800, now);
    filter.Q.value = 1.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
  }

  // Jump Hop Sound (Resonant upward pitch bend)
  public playJumpSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.14);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Push-Block Grinding Rumble Loop
  public startBlockPushRumble() {
    if (this.isMuted || this.pushRumbleGain) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.8;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(120, ctx.currentTime);
    filter.Q.value = 3.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    this.pushRumbleSource = noise;
    this.pushRumbleGain = gain;
  }

  public stopBlockPushRumble() {
    if (!this.pushRumbleGain || !this.ctx) return;
    try {
      this.pushRumbleGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      setTimeout(() => {
        if (this.pushRumbleSource) {
          try {
            this.pushRumbleSource.stop();
          } catch {}
          this.pushRumbleSource = null;
        }
        this.pushRumbleGain = null;
      }, 160);
    } catch {
      this.pushRumbleGain = null;
      this.pushRumbleSource = null;
    }
  }

  // Item Collect Fanfare (Key, Pickaxe, Flask, Seal)
  public playItemCollectFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.16, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.55);
    });
  }

  // Ancient Bronze Tumbler Unlock Clack & Slide
  public playGateUnlock() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Heavy latch clack
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);

    // Stone slide swell
    setTimeout(() => {
      this.playBadgeLitSwell();
    }, 180);
  }

  // Pickaxe Strike Ping & Shatter
  public playPickaxeStrike() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // High metallic ping
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1760, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);

    // Crumble noise burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.22);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(450, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
  }

  // Continuous ambient generator for gentle waves and shore breeze
  public startAmbientLoop(isUnderwater: boolean = false) {
    this.isUnderwater = isUnderwater;
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.ambientGain) return; // already running

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, ctx.currentTime);
    this.ambientGain = gain;

    // Pinkish filtered noise for gentle shore wash
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.2;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(isUnderwater ? 240 : 600, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start();
    this.ambientSource = noiseSource;
  }

  public updateAmbientCamera(isUnderwater: boolean) {
    this.isUnderwater = isUnderwater;
  }

  // Scripture & interaction chime
  public playChime() {
    this.playObjectFoundChime();
  }

  // Flash of light creation swell
  public playLightFlashSwell() {
    this.playBadgeLitSwell();
  }

  // Water parting & splashing whoosh
  public playWaterWhoosh() {
    this.playWaterTransition(true);
  }
}

export const soundEngine = new SoundEngine();

