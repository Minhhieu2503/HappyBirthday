// ============================================================
// app.js — Main Coordinator: Confetti + Birthday Music
// ============================================================

// ── Confetti ─────────────────────────────────────────────────
class Confetti {
  constructor() {
    this.canvas  = document.getElementById('confetti-canvas');
    this.ctx     = this.canvas.getContext('2d');
    this.pieces  = [];
    this.raf     = null;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _spawn(n) {
    const colors = ['#FF6B9D','#FFD93D','#FF8C42','#C084FC','#818CF8','#34D399','#F0ABFC','#FDE68A'];
    for (let i = 0; i < n; i++) {
      this.pieces.push({
        x:     Math.random() * this.canvas.width,
        y:     -20,
        w:     Math.random() * 10 + 5,
        h:     Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx:    (Math.random() - 0.5) * 4,
        vy:    Math.random() * 3 + 2,
        angle: Math.random() * 360,
        vAngle: (Math.random() - 0.5) * 6,
        life:  1,
      });
    }
  }

  _draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.pieces = this.pieces.filter(p => p.y < canvas.height + 20 && p.life > 0);
    this.pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.vAngle;
      p.vy += 0.08; // gravity
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (this.pieces.length > 0) {
      this.raf = requestAnimationFrame(() => this._draw());
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  burst(n = 200) {
    if (this.raf) cancelAnimationFrame(this.raf);
    this._spawn(n);
    // keep spawning for 3 seconds
    let spawned = 0;
    const interval = setInterval(() => {
      this._spawn(40);
      spawned++;
      if (spawned >= 6) clearInterval(interval);
    }, 500);
    this._draw();
  }
}

// ── Birthday Music (YouTube IFrame API) ──────────────────────────
// Video ID từ link: https://www.youtube.com/watch?v=geKxhmZL8ao
const YT_VIDEO_ID = 'geKxhmZL8ao';

class YouTubeMusic {
  constructor() {
    this.player   = null;
    this.ready    = false;
    this.pending  = false; // play() called before player ready
    this._loadAPI();
  }

  _loadAPI() {
    // Avoid loading twice
    if (window.YT) { this._createPlayer(); return; }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    // YouTube calls this global when ready
    window.onYouTubeIframeAPIReady = () => this._createPlayer();
  }

  _createPlayer() {
    this.player = new YT.Player('yt-player-frame', {
      videoId: YT_VIDEO_ID,
      playerVars: {
        autoplay: 0, controls: 0, disablekb: 1,
        fs: 0, rel: 0, modestbranding: 1,
        start: 0,
      },
      events: {
        onReady: () => {
          this.ready = true;
          if (this.pending) { this.play(); this.pending = false; }
        },
        onStateChange: (e) => {
          const btn = document.getElementById('yt-play-pause');
          if (!btn) return;
          btn.textContent = (e.data === YT.PlayerState.PLAYING) ? '⏸' : '▶';
        }
      }
    });
  }

  play() {
    if (!this.ready) { this.pending = true; return; }
    this.player.playVideo();
    this._showPlayer();
  }

  togglePause() {
    if (!this.ready) return;
    const state = this.player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) this.player.pauseVideo();
    else this.player.playVideo();
  }

  setVolume(v) { if (this.ready) this.player.setVolume(v); }

  _showPlayer() {
    const panel = document.getElementById('music-player');
    if (panel) panel.classList.add('show');
  }
}

// ── App Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const confetti = new Confetti();
  const music    = new YouTubeMusic(); // loads YT API in background
  const loveCard = new LoveCard();
  let starfield  = null;
  const timeline = new Timeline();
  const wishes   = new WishesBoard();

  // ── Trivia Screen ──────────────────────────────────────────
  const trivia = new TriviaScreen(() => {
    const main = document.getElementById('main-screen');
    main.style.display = 'block';
    requestAnimationFrame(() => {
      main.classList.add('visible');
      starfield = new Starfield('starfield-canvas');
      timeline.build();
      wishes.render();
    });
  });

  // ── Theme Toggle ───────────────────────────────────────────
  const themeBtn = document.getElementById('theme-toggle-btn');
  let isNight = false;
  themeBtn?.addEventListener('click', () => {
    isNight = !isNight;
    document.documentElement.setAttribute('data-mode', isNight ? 'night' : 'day');
    themeBtn.textContent = isNight ? '☀️' : '🌙';
    if (isNight) starfield.enable();
    else         starfield.disable();
  });

  // ── Candle (tạm tắt mic — nhấn nút để thổi) ──────────────
  const micBtn     = document.getElementById('mic-btn');
  const blowStatus = document.getElementById('blow-status');

  function onAllCandlesOut() {
    blowStatus.textContent = '🎉 Tuyệt vời! Chúc mừng sinh nhật!';
    micBtn.style.display   = 'none';
    confetti.burst(250);
    music.play();
    const msg = document.getElementById('birthday-msg');
    if (msg) setTimeout(() => msg.classList.add('show'), 400);
    // Hiển thị thiệp tình yêu sau 1.8 giây
    setTimeout(() => loveCard.show(), 1800);
  }

  micBtn?.addEventListener('click', () => {
    micBtn.disabled = true;
    micBtn.textContent = '💨 Đang thổi...';
    blowStatus.textContent = '🕯️ Thổi nến...';

    const flames = Array.from(document.querySelectorAll('.candle-flame:not(.out)'));
    let i = 0;
    function blowNext() {
      if (i >= flames.length) { onAllCandlesOut(); return; }
      const flame = flames[i++];
      flame.classList.add('extinguishing');
      setTimeout(() => {
        flame.classList.remove('extinguishing');
        flame.classList.add('out');
        const remaining = flames.length - i;
        blowStatus.textContent = remaining > 0
          ? `🕯️ Còn ${remaining} ngọn nến...`
          : '';
        setTimeout(blowNext, 600);
      }, 700);
    }
    blowNext();
  });

  // ── Music Player Controls ──────────────────────────────
  document.getElementById('yt-play-pause')?.addEventListener('click', () => {
    music.togglePause();
  });
  const volSlider = document.getElementById('yt-volume');
  volSlider?.addEventListener('input', () => {
    music.setVolume(Number(volSlider.value));
    volSlider.style.setProperty('--vol', volSlider.value + '%');
  });
  setTimeout(() => music.setVolume(80), 3000);

  // ── Parallax on hero ──────────────────────────────────────
  window.addEventListener('scroll', () => {
    const hero = document.getElementById('hero-section');
    if (!hero) return;
    const scrolled = window.pageYOffset;
    hero.style.backgroundPositionY = `${scrolled * 0.4}px`;
  });
});
