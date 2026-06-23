// ============================================================
// starfield.js — Bầu Trời Sao + Night Mode
// ============================================================

class Starfield {
  constructor(canvasId) {
    this.canvas  = document.getElementById(canvasId);
    this.ctx     = this.canvas.getContext('2d');
    this.stars   = [];
    this.active  = false;
    this.raf     = null;
    this.msgShown = false;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.active) this._generateStars();
  }

  _generateStars() {
    this.stars = Array.from({ length: 220 }, () => ({
      x:       Math.random() * this.canvas.width,
      y:       Math.random() * this.canvas.height,
      r:       Math.random() * 1.8 + 0.3,
      alpha:   Math.random(),
      dAlpha:  (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
      color:   Math.random() > 0.85 ? '#C084FC' : '#ffffff',
    }));
    this._generateConstellation();
  }

  // Heart constellation connecting two sets of stars
  _generateConstellation() {
    const cx = this.canvas.width  * 0.5;
    const cy = this.canvas.height * 0.28;
    const scale = Math.min(this.canvas.width, this.canvas.height) * 0.10;
    this.constellationPoints = [];
    // Heart shape parametric
    for (let t = 0; t <= Math.PI * 2; t += Math.PI / 8) {
      const x = cx + scale * 16 * Math.pow(Math.sin(t), 3) / 16;
      const y = cy - scale * (13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t)) / 16;
      this.constellationPoints.push({ x, y });
    }
    // Add constellation star positions into main stars array as bright ones
    this.constellationPoints.forEach(p => {
      this.stars.push({ x: p.x, y: p.y, r: 2.5, alpha: 1, dAlpha: 0.005, color: '#FFD93D', isCon: true });
    });
  }

  _draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stars
    this.stars.forEach(s => {
      s.alpha += s.dAlpha;
      if (s.alpha >= 1 || s.alpha <= 0) s.dAlpha *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
      ctx.fill();
    });

    // Constellation lines
    if (this.constellationPoints && this.constellationPoints.length) {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      this.constellationPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();
    }

    // Secret glowing message (appears after 2 s)
    if (this.msgShown) {
      const now = Date.now();
      const elapsed = now - this.msgStart;
      const fadeIn = Math.min(1, elapsed / 2000);
      ctx.globalAlpha = fadeIn * (0.7 + 0.3 * Math.sin(now / 1200));
      ctx.fillStyle = '#F0ABFC';
      ctx.font = `bold ${Math.round(canvas.width * 0.028)}px Quicksand, sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#C084FC';
      ctx.shadowBlur  = 20;
      ctx.fillText('✨ Em là ngôi sao sáng nhất trong vũ trụ của anh ✨', canvas.width / 2, canvas.height * 0.52);
      ctx.shadowBlur  = 0;
    }

    ctx.globalAlpha = 1;
    if (this.active) this.raf = requestAnimationFrame(() => this._draw());
  }

  enable() {
    this.active = true;
    this.msgShown = false;
    this.canvas.style.opacity = '1';
    this._generateStars();
    this._draw();
    setTimeout(() => {
      this.msgShown = true;
      this.msgStart = Date.now();
    }, 2000);
  }

  disable() {
    this.active = false;
    this.canvas.style.opacity = '0';
    if (this.raf) cancelAnimationFrame(this.raf);
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
