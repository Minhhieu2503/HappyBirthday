// ============================================================
// card.js — Love Card Slideshow
// Left panel = lời nhắn | Right panel = ảnh dọc portrait
// ============================================================

// ── Nội dung thiệp ──────────────────────────────────────────
// Thay src: '' bằng đường dẫn ảnh thật, VD: src: 'photos/anh1.jpg'
const CARD_SLIDES = [
  {
    src: 'asset/anh1.jpg', gradient: 'linear-gradient(160deg,#FFB3CC,#FF6B9D)',
    emoji: '💕',
    msg: '"Em là điều tuyệt vời nhất xảy đến trong cuộc đời anh."',
    sub: 'Từ ngày đầu gặp nhau đến mãi mãi về sau~',
  },
  {
    src: 'asset/anh2.jpg', gradient: 'linear-gradient(160deg,#FFD93D,#FF8C42)',
    emoji: '🌸',
    msg: '"Mỗi ngày bên em là một ngày anh muốn giữ mãi."',
    sub: 'Cảm ơn em đã luôn ở đây bên anh 🥰',
  },
  {
    src: 'asset/anh3.jpg', gradient: 'linear-gradient(160deg,#C084FC,#818CF8)',
    emoji: '⭐',
    msg: '"Em không chỉ là người yêu — em là người bạn đồng hành tuyệt vời nhất."',
    sub: '3 năm và vẫn còn nhiều hơn thế nữa 💜',
  },
  {
    src: 'asset/anh4.jpg', gradient: 'linear-gradient(160deg,#34D399,#06B6D4)',
    emoji: '🌈',
    msg: '"Anh yêu cái cách em cười, cái cách em nhăn mũi khi không đồng ý."',
    sub: 'Mọi khoảnh khắc cùng em đều là kỷ niệm ✨',
  },
  {
    src: 'asset/anh5.jpg', gradient: 'linear-gradient(160deg,#FF6B9D,#C084FC,#818CF8)',
    emoji: '🎂',
    msg: '"Chúc mừng sinh nhật em yêu! Anh mong mình sẽ mãi bên nhau."',
    sub: 'Happy Birthday 🎉 Anh yêu em nhiều lắm! 💕',
  },
];

// ────────────────────────────────────────────────────────────
class LoveCard {
  constructor() {
    this.overlay = document.getElementById('love-card-overlay');
    this.frame   = document.getElementById('love-card-frame');
    this.current = 0;
    this.total   = CARD_SLIDES.length; // Revert to 5 slides
    this._build();
    this._bindKeys();
    window.loveCard = this; // Expose globally for gift page navigation
  }

  // ── Build DOM ──────────────────────────────────────────────
  _build() {
    if (!this.frame) return;

    // ── LEFT PANEL ──────────────────────────────────
    const left = document.createElement('div');
    left.className = 'card-left-panel';
    this.leftPanel = left;

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'card-header';
    hdr.innerHTML = `<div class="card-hearts">💕 💝 💕</div>
                     <h2 class="card-title">Gửi Đến Em Yêu 💌</h2>`;
    left.appendChild(hdr);

    // Slides wrapper
    const slidesWrap = document.createElement('div');
    slidesWrap.id = 'card-slides';
    left.appendChild(slidesWrap);

    // Bottom: dots + counter
    const bottom = document.createElement('div');
    bottom.className = 'card-left-bottom';
    bottom.innerHTML = `
      <div id="card-dots" class="card-dots-wrap"></div>
      <span id="card-counter" class="card-counter">1 / 5</span>
    `;
    left.appendChild(bottom); // Appending dots to left panel

    // White cat container (holds Mochi cat GIF)
    const catContainer = document.createElement('div');
    catContainer.className = 'card-cat-container';
    left.appendChild(catContainer);

    // Interactive tap-to-heart listener on the left panel
    left.addEventListener('click', e => {
      if (e.target.closest('.card-dot') || e.target.closest('#card-close') || e.target.closest('.card-arrow')) return;
      
      const rect = left.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      this._spawnHeart(clickX, clickY, true);
    });

    this.frame.appendChild(left);

    // ── RIGHT PANEL ─────────────────────────────────
    const right = document.createElement('div');
    right.className = 'card-right-panel';

    // Arrow prev
    const prev = document.createElement('button');
    prev.className = 'card-arrow card-prev';
    prev.innerHTML = '&#8249;';
    prev.addEventListener('click', e => { e.stopPropagation(); this._prev(); });
    right.appendChild(prev);

    // Arrow next
    const next = document.createElement('button');
    next.className = 'card-arrow card-next';
    next.innerHTML = '&#8250;';
    next.addEventListener('click', e => { e.stopPropagation(); this._next(); });
    right.appendChild(next);

    // Click anywhere on right = next
    right.addEventListener('click', () => this._next());

    // Tap hint label
    const hint = document.createElement('div');
    hint.className = 'card-tap-hint';
    hint.textContent = '👆 Nhấn để xem tiếp';
    right.appendChild(hint);

    this.frame.appendChild(right);

    // ── Populate message slides + photo divs ────────
    CARD_SLIDES.forEach((s, i) => {
      // Message slide (left)
      const msgEl = document.createElement('div');
      msgEl.className = 'card-slide' + (i === 0 ? ' active' : '');
      msgEl.innerHTML = `
        <span class="card-quote">\u201C</span>
        <p class="card-msg">${s.msg}</p>
        <p class="card-sub">${s.sub}</p>
      `;
      slidesWrap.appendChild(msgEl);

      // Photo (right)
      const photoEl = document.createElement('div');
      photoEl.className = 'card-photo' + (i === 0 ? ' active' : '');
      if (s.src) {
        photoEl.innerHTML = `<img src="${s.src}" alt="Ảnh ${i+1}" class="card-photo-img"/>`;
      } else {
        photoEl.style.background = s.gradient;
        photoEl.innerHTML = `<span class="card-emoji">${s.emoji}</span>`;
      }
      right.appendChild(photoEl);

      // Dot
      const dot = document.createElement('span');
      dot.className = 'card-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', e => { e.stopPropagation(); this._goTo(i); });
      bottom.querySelector('#card-dots')?.appendChild(dot);
    });

    // ── Close button ────────────────────────────────
    document.getElementById('card-close')?.addEventListener('click', e => {
      e.stopPropagation(); this.hide();
    });
    this.overlay?.addEventListener('click', e => {
      if (e.target === this.overlay) this.hide();
    });
  }

  // ── Keyboard ───────────────────────────────────────────────
  _bindKeys() {
    document.addEventListener('keydown', e => {
      if (!this.overlay?.classList.contains('open')) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); this._next(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); this._prev(); }
      if (e.key === 'Escape') this.hide();
    });
  }

  // ── Navigation ─────────────────────────────────────────────
  _goTo(idx) {
    const slides = document.querySelectorAll('.card-slide');
    const photos = document.querySelectorAll('.card-photo');
    const dots   = document.querySelectorAll('.card-dot');
    
    // Normal slideshow slide out
    if (this.current < this.total && idx < this.total) {
      const dir    = idx > this.current ? 'left' : 'right';
      const prev   = this.current;

      slides[prev]?.classList.remove('active');
      photos[prev]?.classList.remove('active');
      slides[prev]?.classList.add('exit-' + dir);
      photos[prev]?.classList.add('exit-' + dir);
      setTimeout(() => {
        slides[prev]?.classList.remove('exit-left', 'exit-right');
        photos[prev]?.classList.remove('exit-left', 'exit-right');
      }, 450);
    }

    this.current = ((idx % this.total) + this.total) % this.total;

    slides[this.current]?.classList.add('active');
    photos[this.current]?.classList.add('active');
    dots.forEach((d, i) => d.classList.toggle('active', i === this.current));

    const ctr = document.getElementById('card-counter');
    if (ctr) ctr.textContent = `${this.current + 1} / ${this.total}`;

    const hint = this.frame?.querySelector('.card-tap-hint');
    if (hint) {
      if (this.current === 4) {
        hint.textContent = '🎁 Nhấn để xem bất ngờ';
      } else {
        hint.textContent = '👆 Nhấn để xem tiếp';
      }
    }

    this._startFloating();
  }

  _next() {
    if (this.current === 4) {
      // Transition to gift screen!
      this.hide();
      const giftScreen = document.getElementById('gift-screen');
      if (giftScreen) {
        giftScreen.classList.add('visible');
        document.body.style.overflow = 'hidden';
        if (typeof startHeartAnimation === 'function') {
          startHeartAnimation();
        }
      }
    } else {
      this._goTo(this.current + 1);
    }
  }

  _prev() { this._goTo(this.current - 1); }

  // ── Show / Hide ────────────────────────────────────────────
  show() {
    this._goTo(0);
    this.overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    this._startFloating();
  }
  hide() {
    this.overlay?.classList.remove('open');
    document.body.style.overflow = '';
    this._stopFloating();
    this._stopFinalPanelFloating();
  }

  // ── Floating Hearts Generator ──────────────────────────────
  _startFloating() {
    this._stopFloating(); // ensure no duplicates
    
    // Spawn automatic hearts from the white cat's mouth/side
    this.floatInterval = setInterval(() => {
      this._spawnHeart(0, 0, false);
    }, 600);
  }

  _spawnHeart(x, y, isInteractive = false) {
    if (!this.leftPanel) return;
    const el = document.createElement('div');
    el.className = 'card-floating-heart';

    // Random choice of warm heart gradient colors
    const grads = [
      ['#FF85A2', '#FF1E56'], // pink to red
      ['#FF6B9D', '#FF8E53'], // pink to orange
      ['#C084FC', '#FF6B9D'], // purple to pink
      ['#FF7B90', '#FFD26F']  // coral to gold
    ];
    const pair = grads[Math.floor(Math.random() * grads.length)];
    const gradId = 'hgrad-' + Math.floor(Math.random() * 1000000);

    // Vector heart markup
    el.innerHTML = `
      <svg viewBox="0 0 32 29.6">
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${pair[0]}" />
            <stop offset="100%" stop-color="${pair[1]}" />
          </linearGradient>
        </defs>
        <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
        c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z" fill="url(#${gradId})" />
      </svg>
    `;

    // Path physics simulation properties (wobbling)
    const xStartVal = Math.floor(Math.random() * 40) - 20; 
    const xEndVal = Math.floor(Math.random() * 100) - 50;  
    const rotVal = Math.floor(Math.random() * 80) - 40;   

    el.style.setProperty('--x-start', `${xStartVal}px`);
    el.style.setProperty('--x-end', `${xEndVal}px`);
    el.style.setProperty('--rot', `${rotVal}deg`);

    if (isInteractive) {
      el.style.left = `${x - 11}px`; // Center 22px heart on tap
      el.style.top = `${y - 11}px`;
      el.style.bottom = 'auto';
      // Set animated initial state
      el.style.transform = 'scale(0.3)';
    } else {
      // Automatic spawn next to the cat sticker
      el.style.left = `${45 + Math.random() * 20}px`;
      el.style.bottom = '-30px';
    }

    const container = (this.current === 5) ? document.getElementById('card-final-panel') : this.leftPanel;
    if (container) {
      container.appendChild(el);
    }

    // Remove element after CSS float animation completes
    setTimeout(() => el.remove(), 3200);
  }

  _stopFloating() {
    if (this.floatInterval) {
      clearInterval(this.floatInterval);
      this.floatInterval = null;
    }
    // Clear existing hearts
    const particles = this.leftPanel?.querySelectorAll('.card-floating-heart');
    particles?.forEach(p => p.remove());
  }

  // ── Final Screen Hearts Generator ───────────────────────────
  _startFinalPanelFloating() {
    this._stopFinalPanelFloating();
    
    this.finalFloatInterval = setInterval(() => {
      const finalPanel = document.getElementById('card-final-panel');
      if (!finalPanel) return;

      const heartEl = finalPanel.querySelector('.final-giant-heart');
      if (!heartEl) return;
      const rect = heartEl.getBoundingClientRect();
      const panelRect = finalPanel.getBoundingClientRect();

      const x = rect.left + rect.width / 2 - panelRect.left;
      const y = rect.top + rect.height / 2 - panelRect.top;

      // Spawn heart from giant heart position
      this._spawnHeart(x + (Math.random() * 60 - 30), y + (Math.random() * 40 - 20), true);
    }, 450);
  }

  _stopFinalPanelFloating() {
    if (this.finalFloatInterval) {
      clearInterval(this.finalFloatInterval);
      this.finalFloatInterval = null;
    }
  }
}
