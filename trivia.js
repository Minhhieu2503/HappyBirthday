// ============================================================
// trivia.js — Couple Quiz / Unlock Screen
// ⚡ Thay đổi câu hỏi & câu trả lời trong mảng QUESTIONS bên dưới
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
    q: "⭐ Ai là người nói lời tỏ tình trước?",
    a: ["anh", "em"],
    hint: "Người đó rất dũng cảm đấy~"
  }
];

class TriviaScreen {
  constructor(onUnlock) {
    this.onUnlock = onUnlock;
    this.current = 0;
    this.el = {
      screen: document.getElementById('trivia-screen'),
      question: document.getElementById('trivia-question'),
      input: document.getElementById('trivia-input'),
      submit: document.getElementById('trivia-submit'),
      hint: document.getElementById('trivia-hint'),
      error: document.getElementById('trivia-error'),
      dots: [document.getElementById('dot-0'), document.getElementById('dot-1'), document.getElementById('dot-2')],
      progress: document.getElementById('trivia-progress-text'),
    };
    this._bind();
    this._render();
  }

  _bind() {
    this.el.submit.addEventListener('click', () => this._check());
    this.el.input.addEventListener('keydown', e => { if (e.key === 'Enter') this._check(); });
  }

  _render() {
    const q = QUESTIONS[this.current];
    this.el.question.textContent = q.q;
    this.el.hint.textContent = q.hint;
    this.el.input.value = '';
    this.el.error.textContent = '';
    this.el.input.focus();
    if (this.el.progress) {
      this.el.progress.textContent = `${this.current + 1} / ${QUESTIONS.length}`;
    }
    this.el.dots.forEach((d, i) => {
      d.classList.toggle('active', i === this.current);
      d.classList.toggle('done', i < this.current);
    });
    // Reset animation
    this.el.question.style.animation = 'none';
    requestAnimationFrame(() => { this.el.question.style.animation = ''; });
  }

  _check() {
    const val = this.el.input.value.trim().toLowerCase();
    const accepted = QUESTIONS[this.current].a.map(a => a.toLowerCase());
    if (accepted.includes(val)) {
      this._correct();
    } else {
      this._wrong();
    }
  }

  _correct() {
    this.el.input.classList.add('correct');
    this.el.dots[this.current].classList.add('done');
    setTimeout(() => {
      this.el.input.classList.remove('correct');
      this.current++;
      if (this.current >= QUESTIONS.length) {
        this._unlock();
      } else {
        this._render();
      }
    }, 600);
  }

  _wrong() {
    this.el.error.textContent = '❌ Sai rồi! Thử lại nhé~ 💭';
    this.el.screen.classList.add('shake');
    this.el.input.classList.add('error');
    setTimeout(() => {
      this.el.screen.classList.remove('shake');
      this.el.input.classList.remove('error');
      this.el.input.value = '';
      this.el.input.focus();
    }, 600);
  }

  _unlock() {
    const screen = this.el.screen;
    screen.classList.add('unlocking');
    // Curtain slide up animation then hide
    setTimeout(() => {
      screen.style.display = 'none';
      if (this.onUnlock) this.onUnlock();
    }, 1200);
  }
}
