// ============================================================
// timeline.js — Scroll Animation Timeline
// ⚡ Thay đổi nội dung MILESTONES bên dưới cho phù hợp
// ============================================================

const MILESTONES = [
  {
    date: "Tháng 3, 2022",
    title: "Lần đầu gặp nhau 👀",
    desc:  "Cái nhìn đầu tiên đó mình còn nhớ mãi. Không ngờ từ một cuộc gặp bình thường lại trở thành điều quan trọng nhất cuộc đời.",
    emoji: "🌸",
    color: "#FF6B9D"
  },
  {
    date: "Tháng 5, 2022",
    title: "Buổi hẹn đầu tiên ☕",
    desc:  "Cà phê, trò chuyện không dứt. Anh biết đây là người mình muốn đồng hành lâu dài.",
    emoji: "☕",
    color: "#FF8C42"
  },
  {
    date: "Tháng 7, 2022",
    title: "Chính thức rồi! 💝",
    desc:  "Ngày anh dũng cảm nói ra những điều trong lòng. Em gật đầu và mọi thứ thay đổi mãi mãi.",
    emoji: "💝",
    color: "#C084FC"
  },
  {
    date: "Tháng 12, 2022",
    title: "Chuyến đi đầu tiên ✈️",
    desc:  "Lần đầu cùng nhau khám phá một nơi mới. Mỗi góc đường đều là kỷ niệm.",
    emoji: "✈️",
    color: "#818CF8"
  },
  {
    date: "Năm 2023",
    title: "Vượt qua khó khăn 🌈",
    desc:  "Có những lúc không dễ dàng, nhưng mình đã cùng nhau bước qua. Điều đó làm cho tình cảm của mình thêm vững chắc.",
    emoji: "🌈",
    color: "#34D399"
  },
  {
    date: "Hôm nay 🎂",
    title: "3 năm bên nhau 🎉",
    desc:  "Ba năm với vô vàn kỷ niệm đẹp. Cảm ơn em đã luôn ở đây, luôn là chính mình bên anh. Happy Birthday, yêu em nhiều lắm! 💕",
    emoji: "🎂",
    color: "#FF6B9D"
  }
];

class Timeline {
  constructor() {
    this.section = document.getElementById('timeline-section');
  }

  build() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    MILESTONES.forEach((m, i) => {
      const side  = i % 2 === 0 ? 'left' : 'right';
      const item  = document.createElement('div');
      item.className = `timeline-item ${side}`;
      item.innerHTML = `
        <div class="timeline-node" style="background:${m.color}">
          <span class="timeline-emoji">${m.emoji}</span>
        </div>
        <div class="timeline-card" style="--card-accent:${m.color}">
          <div class="timeline-date">${m.date}</div>
          <h3 class="timeline-title">${m.title}</h3>
          <p class="timeline-desc">${m.desc}</p>
        </div>
      `;
      container.appendChild(item);
    });

    this._observe();
  }

  _observe() {
    const items = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

    items.forEach(item => observer.observe(item));
  }
}
