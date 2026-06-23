// ============================================================
// candle.js — Thổi nến bằng Microphone (Web Audio API)
// ============================================================

class CandleBlower {
  constructor({ onAllBlown, onProgress } = {}) {
    this.onAllBlown  = onAllBlown;
    this.onProgress  = onProgress;
    this.audioCtx    = null;
    this.analyser    = null;
    this.stream      = null;
    this.listening   = false;
    this.blowStart   = null;
    this.THRESHOLD   = 0.18;   // Volume level to consider a blow
    this.SUSTAIN_MS  = 350;    // Must blow for this long
    this.raf         = null;
    this.candles     = [];
    this.blown       = 0;
  }

  init() {
    this.candles = Array.from(document.querySelectorAll('.candle-flame'));
    this.blown   = 0;
  }

  async startListening() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.4;
      const src = this.audioCtx.createMediaStreamSource(this.stream);
      src.connect(this.analyser);
      this.listening = true;
      this._detect();
      return true;
    } catch (e) {
      console.warn('Mic error:', e);
      return false;
    }
  }

  _getVolume() {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    // Focus on low-mid frequencies (breath range: ~80–2000 Hz)
    const slice = data.slice(2, 40);
    const rms = Math.sqrt(slice.reduce((s, v) => s + v * v, 0) / slice.length);
    return rms / 128;
  }

  _detect() {
    if (!this.listening) return;
    const vol  = this._getVolume();
    const now  = Date.now();

    if (vol > this.THRESHOLD) {
      if (!this.blowStart) this.blowStart = now;
      else if (now - this.blowStart >= this.SUSTAIN_MS) {
        this.blowStart = null;
        this._extinguishNext();
        return; // wait for animation before detecting again
      }
    } else {
      this.blowStart = null;
    }
    this.raf = requestAnimationFrame(() => this._detect());
  }

  _extinguishNext() {
    const active = this.candles.find(c => !c.classList.contains('out'));
    if (!active) return;

    active.classList.add('extinguishing');
    setTimeout(() => {
      active.classList.remove('extinguishing');
      active.classList.add('out');
      this.blown++;
      if (this.onProgress) this.onProgress(this.blown, this.candles.length);

      if (this.blown >= this.candles.length) {
        this.stop();
        if (this.onAllBlown) this.onAllBlown();
      } else {
        // Resume detection after a short pause
        setTimeout(() => {
          this.raf = requestAnimationFrame(() => this._detect());
        }, 800);
      }
    }, 700);
  }

  stop() {
    this.listening = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.audioCtx) this.audioCtx.close();
  }
}
