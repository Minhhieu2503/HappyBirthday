// ============================================================
// wishes.js — Bảng Lời Chúc Bồng Bềnh
// ============================================================

const DEFAULT_WISHES = [
  { author: "Anh 💕",       text: "Em là điều tuyệt vời nhất xảy ra trong cuộc đời anh. Chúc mừng sinh nhật em yêu! Mãi yêu em! 🥰",       color: "#FF6B9D" },
  { author: "Mẹ 🌸",        text: "Con gái yêu của mẹ ngày càng trưởng thành và xinh đẹp hơn. Chúc mừng sinh nhật con nhé! 💐",               color: "#FF8C42" },
  { author: "Bạn thân 🌟",  text: "Sinh nhật vui vẻ! Ước gì năm nay mọi điều ước của cậu đều thành sự thật. Luôn bên cậu nha~ 🌈",           color: "#C084FC" },
  { author: "Chị 🦋",       text: "Em gái của chị ngày càng lớn rồi! Chúc em luôn hạnh phúc và thành công nhé! Yêu em! ✨",                  color: "#818CF8" },
  { author: "Nhóm bạn 🎉",  text: "Happy Birthday! Tụi mình sẽ tổ chức tiệc thật hoành tráng cho cậu. Yêu cậu nhiều lắm! 🎂",               color: "#34D399" },
  { author: "Bạn học 📚",   text: "Một năm nữa lại trôi qua. Chúc cậu năm mới nhiều sức khoẻ, thành công và luôn tươi cười nhé! 😊",         color: "#F59E0B" },
];

class WishesBoard {
  constructor() {
    this.container = document.getElementById('wishes-container');
    this.modal     = document.getElementById('wish-modal');
    this.addBtn    = document.getElementById('add-wish-btn');
    this.modalClose= document.getElementById('modal-close');
    this.wishForm  = document.getElementById('wish-form');
    this.wishes    = this._loadWishes();
  }

  _loadWishes() {
    try {
      const saved = JSON.parse(localStorage.getItem('hbd_wishes') || '[]');
      return [...DEFAULT_WISHES, ...saved];
    } catch { return [...DEFAULT_WISHES]; }
  }

  _saveWish(wish) {
    try {
      const saved = JSON.parse(localStorage.getItem('hbd_wishes') || '[]');
      saved.push(wish);
      localStorage.setItem('hbd_wishes', JSON.stringify(saved));
    } catch {}
  }

  _createCard(wish, index) {
    const el = document.createElement('div');
    el.className = 'wish-card';
    // Stagger animation delay
    const delay  = (index * 0.4) % 3;
    const dur    = 4 + (index % 3);
    const rotate = (Math.random() * 8 - 4).toFixed(1);
    el.style.cssText = `
      --wish-color: ${wish.color};
      --float-delay: ${delay}s;
      --float-dur: ${dur}s;
      --rotate: ${rotate}deg;
      animation-delay: ${delay}s;
    `;
    el.innerHTML = `
      <div class="wish-envelope">
        <div class="wish-envelope-top"></div>
        <div class="wish-content">
          <p class="wish-text">"${wish.text}"</p>
          <span class="wish-author">— ${wish.author}</span>
        </div>
      </div>
    `;
    el.addEventListener('click', () => el.classList.toggle('open'));
    return el;
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.wishes.forEach((w, i) => {
      this.container.appendChild(this._createCard(w, i));
    });
    this._bindModal();
  }

  _bindModal() {
    if (this.addBtn) {
      this.addBtn.addEventListener('click', () => {
        this.modal.classList.add('open');
      });
    }
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this.modal.classList.remove('open'));
    }
    this.modal?.addEventListener('click', e => {
      if (e.target === this.modal) this.modal.classList.remove('open');
    });
    if (this.wishForm) {
      this.wishForm.addEventListener('submit', e => {
        e.preventDefault();
        const author = document.getElementById('wish-author-input').value.trim() || 'Bạn';
        const text   = document.getElementById('wish-text-input').value.trim();
        const colors = ['#FF6B9D','#FF8C42','#C084FC','#818CF8','#34D399','#F59E0B'];
        const color  = colors[Math.floor(Math.random() * colors.length)];
        if (!text) return;
        const wish = { author, text, color };
        this._saveWish(wish);
        this.wishes.push(wish);
        const card = this._createCard(wish, this.wishes.length - 1);
        this.container.appendChild(card);
        setTimeout(() => card.classList.add('new'), 50);
        this.modal.classList.remove('open');
        this.wishForm.reset();
      });
    }
  }
}
