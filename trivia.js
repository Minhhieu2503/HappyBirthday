// ============================================================
// trivia.js — Couple Quiz & Love Verification Screen
// ============================================================

const QUESTIONS = [
  {
    q: "💕 Chúng ta gặp nhau lần đầu ở đâu?",
    a: ["trường", "ở trường", "fpt", "Trường FPT"],
    hint: "Nhớ lại ngày đầu tiên đó nhé~"
  },
  {
    q: "🍜 Ngày gặp nhau là ngày nào?",
    a: ["8", "08/10", "08/10/2022", "8/10/2022"],
    hint: "Đó là một buổi chiều thật đặc biệt..."
  },
  {
    q: "Bé có yêu anh không? 🥺",
    isInteractive: true,
    hint: "Chọn thật lòng nha, không chọn 'Không' được đâu à nha~ 💕"
  }
];

class TriviaScreen {
  constructor(onUnlock) {
    this.onUnlock = onUnlock;
    this.current = 0;
    
    // DOM Elements
    this.el = {
      screen: document.getElementById('trivia-screen'),
      lockIcon: document.getElementById('trivia-lock-icon'),
      heading: document.getElementById('trivia-heading-text'),
      subText: document.getElementById('trivia-sub-text'),
      question: document.getElementById('trivia-question'),
      hint: document.getElementById('trivia-hint'),
      input: document.getElementById('trivia-input'),
      submit: document.getElementById('trivia-submit'),
      error: document.getElementById('trivia-error'),
      progress: document.getElementById('trivia-progress-text'),
      dots: [document.getElementById('dot-0'), document.getElementById('dot-1'), document.getElementById('dot-2')],
      
      // Areas
      quizArea: document.getElementById('quiz-input-area'),
      loveArea: document.getElementById('love-buttons-area'),
      yesBtn: document.getElementById('love-yes-btn'),
      noBtn: document.getElementById('love-no-btn')
    };

    this.yesScale = 1;
    this.noEscapeCount = 0;
    
    this._bind();
    this._render();
  }

  _bind() {
    // Normal quiz bindings
    if (this.el.submit) {
      this.el.submit.addEventListener('click', () => this._check());
    }
    if (this.el.input) {
      this.el.input.addEventListener('keydown', e => { if (e.key === 'Enter') this._check(); });
    }

    // Interactive step bindings
    if (this.el.yesBtn) {
      this.el.yesBtn.addEventListener('click', () => this._unlock());
    }
    
    if (this.el.noBtn) {
      const escapeNo = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._moveNoButton();
        this._growYesButton();
      };

      this.el.noBtn.addEventListener('mouseover', escapeNo);
      this.el.noBtn.addEventListener('click', escapeNo);
      this.el.noBtn.addEventListener('touchstart', escapeNo, { passive: false });
    }
  }

  _render() {
    const q = QUESTIONS[this.current];
    if (!q) return;
    
    // Update progress dots
    this.el.dots.forEach((d, i) => {
      if (d) {
        d.classList.toggle('active', i === this.current);
        d.classList.toggle('done', i < this.current);
      }
    });
    if (this.el.progress) {
      this.el.progress.textContent = `${this.current + 1} / ${QUESTIONS.length}`;
    }

    if (q.isInteractive) {
      // Switch mode to Interactive Love buttons
      if (this.el.quizArea) this.el.quizArea.style.display = 'none';
      if (this.el.loveArea) this.el.loveArea.style.display = 'flex';
      
      // Update heading and text
      if (this.el.lockIcon) this.el.lockIcon.textContent = '🥺';
      if (this.el.heading) this.el.heading.textContent = q.q;
      if (this.el.subText) this.el.subText.textContent = q.hint;
      
      // Clear trivia-specific question & hint texts
      if (this.el.question) this.el.question.textContent = '';
      if (this.el.hint) this.el.hint.textContent = '';
      if (this.el.error) this.el.error.textContent = '';

      // Capture initial offset of No button once rendered
      requestAnimationFrame(() => {
        if (this.el.noBtn && !this.noBtnInitialRect) {
          const r = this.el.noBtn.getBoundingClientRect();
          if (r.width > 0) this.noBtnInitialRect = r;
        }
      });
    } else {
      // Normal quiz mode
      if (this.el.quizArea) this.el.quizArea.style.display = 'block';
      if (this.el.loveArea) this.el.loveArea.style.display = 'none';
      
      if (this.el.question) this.el.question.textContent = q.q;
      if (this.el.hint) this.el.hint.textContent = q.hint;
      if (this.el.input) {
        this.el.input.value = '';
        this.el.input.focus();
      }
      if (this.el.error) this.el.error.textContent = '';

      // Reset animation on question change
      if (this.el.question) {
        this.el.question.style.animation = 'none';
        requestAnimationFrame(() => { this.el.question.style.animation = ''; });
      }
    }
  }

  _check() {
    if (!this.el.input) return;
    const val = this.el.input.value.trim().toLowerCase();
    const accepted = QUESTIONS[this.current].a.map(a => a.toLowerCase());
    if (accepted.includes(val)) {
      this._correct();
    } else {
      this._wrong();
    }
  }

  _correct() {
    if (this.el.input) this.el.input.classList.add('correct');
    if (this.el.dots[this.current]) this.el.dots[this.current].classList.add('done');
    setTimeout(() => {
      if (this.el.input) this.el.input.classList.remove('correct');
      this.current++;
      this._render();
    }, 600);
  }

  _wrong() {
    if (this.el.error) this.el.error.textContent = '❌ Sai rồi! Thử lại nhé~ 💭';
    if (this.el.screen) this.el.screen.classList.add('shake');
    if (this.el.input) this.el.input.classList.add('error');
    setTimeout(() => {
      if (this.el.screen) this.el.screen.classList.remove('shake');
      if (this.el.input) {
        this.el.input.classList.remove('error');
        this.el.input.value = '';
        this.el.input.focus();
      }
    }, 600);
  }

  _moveNoButton() {
    if (!this.el.noBtn || !this.el.screen) return;

    // Cache initial rect if not captured yet
    if (!this.noBtnInitialRect) {
      const r = this.el.noBtn.getBoundingClientRect();
      if (r.width > 0) this.noBtnInitialRect = r;
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const btnWidth = this.el.noBtn.offsetWidth || 100;
    const btnHeight = this.el.noBtn.offsetHeight || 45;
    const padding = 30;

    const maxX = Math.max(screenWidth - btnWidth - padding, padding);
    const maxY = Math.max(screenHeight - btnHeight - padding, padding);

    // Target screen coordinates
    const targetX = padding + Math.random() * (maxX - padding);
    const targetY = padding + Math.random() * (maxY - padding);

    let translateX = 0;
    let translateY = 0;

    if (this.noBtnInitialRect) {
      translateX = targetX - this.noBtnInitialRect.left;
      translateY = targetY - this.noBtnInitialRect.top;
    } else {
      // Fallback relative movement if rect is not available
      translateX = (Math.random() - 0.5) * 160;
      translateY = -120 - Math.random() * 120;
    }

    // Apply translation
    this.el.noBtn.style.transform = `translate(${translateX}px, ${translateY}px)`;
    
    this.noEscapeCount++;
    this._updateSubtitle();
  }

  _growYesButton() {
    if (!this.el.yesBtn) return;
    // Increase size of Yes button, cap at scale 2.5
    this.yesScale = Math.min(this.yesScale + 0.22, 2.5);
    this.el.yesBtn.style.transform = `scale(${this.yesScale})`;
    
    // Smooth transition
    this.el.yesBtn.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }

  _updateSubtitle() {
    if (!this.el.subText) return;
    const messages = [
      "Chọn thật lòng nha, không chọn 'Không' được đâu à nha~ 💕",
      "Ủa sao bấm Không hoài vậy ta? 🥺",
      "Anh buồn lắm á nha... 😢",
      "Có nút Có kìa, bấm đi bé ơi! 🥰",
      "Không trốn được đâuuuu! 🌸",
      "Yêu anh đi màaaaa! 💖",
      "Bấm nút Có đi cho nhanh nè! 🎁",
      "Nút Có to như vậy rồi cơ mà... 😂",
      "Thôi đừng bấm Không nữa nha béiu! 💋"
    ];

    const idx = Math.min(this.noEscapeCount, messages.length - 1);
    this.el.subText.textContent = messages[idx];
  }

  _unlock() {
    if (this.el.dots[this.current]) this.el.dots[this.current].classList.add('done');
    if (this.el.screen) this.el.screen.classList.add('unlocking');
    
    // Confetti burst for celebrating
    if (window.confetti) {
      window.confetti.burst(200);
    }
    
    setTimeout(() => {
      if (this.el.screen) this.el.screen.style.display = 'none';
      if (this.onUnlock) this.onUnlock();
    }, 1200);
  }
}
