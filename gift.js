/* ============================================================
   gift.js — Special Gift Screen (HTML5 Canvas Beating Heart + 3D Carousel)
   ============================================================ */

var settings = {
  particles: {
    length:   2000, // maximum amount of particles (increased from 500)
    duration:   2, // particle duration in sec
    velocity: 100, // particle velocity in pixels/sec
    effect: -0.75, // play with this for different effects
    size:      26, // particle size in pixels
  },
};

/*
 * RequestAnimationFrame polyfill
 */
(function() {
  var b = 0;
  var c = ["ms", "moz", "webkit", "o"];
  for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
    window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
    window.cancelAnimationFrame = window[c[a] + "CancelAnimationFrame"] || window[c[a] + "CancelRequestAnimationFrame"];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(h, e) {
      var d = new Date().getTime();
      var f = Math.max(0, 16 - (d - b));
      var g = window.setTimeout(function() { h(d + f); }, f);
      b = d + f;
      return g;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(a) { clearTimeout(a); };
  }
})();

/*
 * Point class
 */
var Point = (function() {
  function Point(x, y) {
    this.x = (typeof x !== 'undefined') ? x : 0;
    this.y = (typeof y !== 'undefined') ? y : 0;
  }
  Point.prototype.clone = function() {
    return new Point(this.x, this.y);
  };
  Point.prototype.length = function(length) {
    if (typeof length == 'undefined')
      return Math.sqrt(this.x * this.x + this.y * this.y);
    this.normalize();
    this.x *= length;
    this.y *= length;
    return this;
  };
  Point.prototype.normalize = function() {
    var length = this.length();
    this.x /= length;
    this.y /= length;
    return this;
  };
  return Point;
})();

/*
 * Particle class
 */
var Particle = (function() {
  function Particle() {
    this.position = new Point();
    this.velocity = new Point();
    this.acceleration = new Point();
    this.age = 0;
  }
  Particle.prototype.initialize = function(x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * settings.particles.effect;
    this.acceleration.y = dy * settings.particles.effect;
    this.age = 0;
  };
  Particle.prototype.update = function(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  };
  Particle.prototype.draw = function(context, image) {
    function ease(t) {
      return (--t) * t * t + 1;
    }
    var size = image.width * ease(this.age / settings.particles.duration);
    context.globalAlpha = 1 - this.age / settings.particles.duration;
    context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
  };
  return Particle;
})();

/*
 * ParticlePool class
 */
var ParticlePool = (function() {
  var particles,
      firstActive = 0,
      firstFree   = 0,
      duration    = settings.particles.duration;

  function ParticlePool(length) {
    particles = new Array(length);
    for (var i = 0; i < particles.length; i++)
      particles[i] = new Particle();
  }
  ParticlePool.prototype.add = function(x, y, dx, dy) {
    particles[firstFree].initialize(x, y, dx, dy);
    
    firstFree++;
    if (firstFree == particles.length) firstFree = 0;
    if (firstActive == firstFree) {
      firstActive++;
      if (firstActive == particles.length) firstActive = 0;
    }
  };
  ParticlePool.prototype.update = function(deltaTime) {
    var i;
    
    if (firstActive < firstFree) {
      for (i = firstActive; i < firstFree; i++)
        particles[i].update(deltaTime);
    }
    if (firstFree < firstActive) {
      for (i = firstActive; i < particles.length; i++)
        particles[i].update(deltaTime);
      for (i = 0; i < firstFree; i++)
        particles[i].update(deltaTime);
    }
    
    while (particles[firstActive].age >= duration && firstActive != firstFree) {
      firstActive++;
      if (firstActive == particles.length) firstActive = 0;
    }
  };
  ParticlePool.prototype.draw = function(context, image) {
    var i;
    if (firstActive < firstFree) {
      for (i = firstActive; i < firstFree; i++)
        particles[i].draw(context, image);
    }
    if (firstFree < firstActive) {
      for (i = firstActive; i < particles.length; i++)
        particles[i].draw(context, image);
      for (i = 0; i < firstFree; i++)
        particles[i].draw(context, image);
    }
  };
  return ParticlePool;
})();

/*
 * Beating Heart configuration
 */
var heartAnimationId = null;
var canvas = null;
var context = null;
var particles = null;
var particleImage = null;

function pointOnHeart(t) {
  return new Point(
    160 * Math.pow(Math.sin(t), 3),
    130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
  );
}

function initHeartAnimation() {
  canvas = document.getElementById('pinkboard');
  if (!canvas) return;
  context = canvas.getContext('2d');
  particles = new ParticlePool(settings.particles.length);
  
  // Custom particle draw: beautiful glowing little heart
  particleImage = (function() {
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    c.width = settings.particles.size;
    c.height = settings.particles.size;
    
    ctx.shadowColor = 'rgba(255, 105, 180, 0.85)';
    ctx.shadowBlur = 5;
    
    var gradient = ctx.createLinearGradient(0, 0, c.width, c.height);
    gradient.addColorStop(0, '#ff69b4');
    gradient.addColorStop(1, '#ff1493');
    ctx.fillStyle = gradient;
    
    var w = c.width - 6;
    var h = c.height - 6;
    var x = 3;
    var y = 3;
    
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + h * 0.25);
    ctx.bezierCurveTo(x + w * 0.2, y, x, y + h * 0.25, x, y + h * 0.5);
    ctx.bezierCurveTo(x, y + h * 0.75, x + w * 0.3, y + h * 0.9, x + w / 2, y + h);
    ctx.bezierCurveTo(x + w * 0.7, y + h * 0.9, x + w, y + h * 0.75, x + w, y + h * 0.5);
    ctx.bezierCurveTo(x + w, y + h * 0.25, x + w * 0.8, y, x + w / 2, y + h * 0.25);
    ctx.closePath();
    ctx.fill();
    
    return c;
  })();

  function onResize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  window.addEventListener('resize', onResize);
  onResize();
}

/*
 * 3D Carousel Interaction Variables
 */
var carouselContainer = null;
var isDragging = false;
var dragStartX = 0;
var dragStartY = 0;
var targetRotateY = 0;
var targetRotateX = 0;
var currentRotateY = 0;
var currentRotateX = 0;
var dragRotateY = 0;
var dragRotateX = 0;
var resumeAutoSpin = true;
var resumeAutoSpinTimeout = null;

function init3DCarousel() {
  carouselContainer = document.querySelector('.gift-carousel-container');
  const stage = document.querySelector('.gift-carousel-stage');
  if (!carouselContainer || !stage) return;

  function onStart(e) {
    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartX = clientX;
    dragStartY = clientY;
    dragRotateY = targetRotateY;
    dragRotateX = targetRotateX;
    
    if (resumeAutoSpinTimeout) {
      clearTimeout(resumeAutoSpinTimeout);
      resumeAutoSpinTimeout = null;
    }
  }

  function onMove(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStartX;
    const deltaY = clientY - dragStartY;
    
    targetRotateY = dragRotateY + deltaX * 0.35;
    targetRotateX = Math.max(-15, Math.min(15, dragRotateX - deltaY * 0.25));
  }

  function onEnd() {
    isDragging = false;
    resumeAutoSpinTimeout = setTimeout(() => {
      resumeAutoSpin = true;
    }, 2000);
  }

  stage.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
  
  stage.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onEnd);
}

/*
 * Love Rain (Anh Yeu Em) Particle Canvas Setup
 */
var rainCanvas = null;
var rainCtx = null;
var rainParticles = [];
var rainBursts = [];
var mouse = { x: -1000, y: -1000 };

const RAIN_TEXTS = ["Anh yêu em", "Yêu em nhiều", "Bé iu", "❤️", "💕", "💋", "💖", "💝", "moa 💋"];

function initRain() {
  rainCanvas = document.getElementById('love-rain-canvas');
  if (!rainCanvas) return;
  rainCtx = rainCanvas.getContext('2d');
  
  function resizeRain() {
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeRain);
  resizeRain();
  
  const giftScreen = document.getElementById('gift-screen');
  
  giftScreen.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  giftScreen.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });
  
  giftScreen.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });
  
  giftScreen.addEventListener('touchend', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  giftScreen.addEventListener('click', (e) => {
    if (e.target.closest('#gift-close')) return;
    spawnClickBurst(e.clientX, e.clientY);
  });
}

function spawnRainParticle() {
  const isText = Math.random() < 0.6;
  const text = isText 
    ? RAIN_TEXTS[Math.floor(Math.random() * RAIN_TEXTS.length)]
    : (Math.random() < 0.5 ? "❤️" : "💕");
    
  const size = isText ? (Math.random() * 6 + 14) : (Math.random() * 8 + 12);
  const colors = ["#ff6b9d", "#ff8c42", "#c084fc", "#ff4a7e", "#f472b6", "#fda4af"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  rainParticles.push({
    x: Math.random() * rainCanvas.width,
    y: -30,
    vx: (Math.random() - 0.5) * 1.5,
    vy: Math.random() * 2 + 1.5,
    wobbleSpeed: Math.random() * 0.02 + 0.01,
    wobbleAmount: Math.random() * 1.5 + 0.5,
    wobblePhase: Math.random() * Math.PI * 2,
    text: text,
    size: size,
    color: color,
    opacity: Math.random() * 0.4 + 0.6
  });
}

function drawTinyHeart(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.25);
  ctx.bezierCurveTo(x - size * 0.5, y - size * 0.25, x - size, y + size * 0.25, x, y + size);
  ctx.bezierCurveTo(x + size, y + size * 0.25, x + size * 0.5, y - size * 0.25, x, y + size * 0.25);
  ctx.fill();
}

function spawnBurst(x, y, color) {
  const count = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    rainBursts.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 5,
      vy: -Math.random() * 3 - 1.5,
      size: Math.random() * 3 + 2.5,
      alpha: 1,
      color: color,
      decay: Math.random() * 0.04 + 0.03,
      isHeart: Math.random() < 0.6
    });
  }
}

function spawnClickBurst(x, y) {
  const count = 25;
  const colors = ["#ff6b9d", "#ff8c42", "#c084fc", "#ff4a7e", "#f472b6", "#fda4af", "#ffffff"];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    rainBursts.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      size: Math.random() * 4 + 3.5,
      alpha: 1,
      color: color,
      decay: Math.random() * 0.02 + 0.015,
      isHeart: true
    });
  }
}

function updateAndDrawRain() {
  if (!rainCtx || !rainCanvas) return;
  
  rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
  
  if (rainParticles.length < 80 && Math.random() < 0.15) {
    spawnRainParticle();
  }
  
  // Get active photo cards boundings on screen for physics deflection/bouncing
  const cards = document.querySelectorAll('.gift-carousel-item');
  const cardRects = Array.from(cards).map(card => {
    const r = card.getBoundingClientRect();
    return {
      left: r.left,
      right: r.right,
      top: r.top,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
      midX: r.left + r.width / 2,
      midY: r.top + r.height / 2
    };
  });
  
  rainParticles = rainParticles.filter(p => {
    p.y += p.vy;
    p.wobblePhase += p.wobbleSpeed;
    p.x += p.vx + Math.sin(p.wobblePhase) * p.wobbleAmount * 0.3;
    
    // Repel by cursor
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 130) {
      const force = (130 - dist) / 130;
      const angle = Math.atan2(dy, dx);
      p.vx += Math.cos(angle) * force * 1.8;
      p.vy += Math.sin(angle) * force * 1.0;
    } else {
      p.vx *= 0.95;
    }
    
    // Bouncing on photo cards
    for (let r of cardRects) {
      if (r.width > 0 &&
          p.x > r.left && p.x < r.right &&
          p.y > r.top && p.y < r.bottom) {
        
        p.y = r.top - 5;
        p.vy = -Math.abs(p.vy) * 0.5 - (Math.random() * 1.5 + 0.5);
        
        const pushDir = p.x > r.midX ? 1 : -1;
        p.vx = pushDir * (Math.random() * 2 + 1.5);
        
        spawnBurst(p.x, p.y, p.color);
        break;
      }
    }
    
    // Draw Text/Emoji rain particle
    rainCtx.save();
    rainCtx.font = `bold ${p.size}px 'Quicksand', sans-serif`;
    rainCtx.fillStyle = p.color;
    rainCtx.globalAlpha = p.opacity;
    rainCtx.shadowColor = p.color;
    rainCtx.shadowBlur = 8;
    
    rainCtx.fillText(p.text, p.x, p.y);
    rainCtx.restore();
    
    return p.y < rainCanvas.height + 40 && p.x > -50 && p.x < rainCanvas.width + 50;
  });
  
  // Draw Collision & Click explosions
  rainBursts = rainBursts.filter(b => {
    b.x += b.vx;
    b.y += b.vy;
    b.vy += 0.12; // light gravity
    b.alpha -= b.decay;
    
    if (b.alpha <= 0) return false;
    
    rainCtx.save();
    rainCtx.globalAlpha = b.alpha;
    rainCtx.fillStyle = b.color;
    rainCtx.shadowColor = b.color;
    rainCtx.shadowBlur = 4;
    
    if (b.isHeart) {
      drawTinyHeart(rainCtx, b.x, b.y, b.size);
    } else {
      rainCtx.beginPath();
      rainCtx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      rainCtx.fill();
    }
    rainCtx.restore();
    
    return true;
  });
}

/*
 * Start animators
 */
function startHeartAnimation() {
  if (heartAnimationId) cancelAnimationFrame(heartAnimationId);
  
  if (!canvas) initHeartAnimation();
  if (!carouselContainer) init3DCarousel();
  if (!rainCanvas) initRain();
  
  var time = new Date().getTime() / 1000;
  resumeAutoSpin = true;
  
  function render() {
    heartAnimationId = requestAnimationFrame(render);
    
    var newTime = new Date().getTime() / 1000;
    var deltaTime = newTime - time;
    time = newTime;
    
    // Beating Heart: clear background with trail effect
    context.fillStyle = 'rgba(0, 0, 0, 0.12)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Beating Heart: create new particles (amount increased from 8 to 18)
    var amount = 18;
    for (var i = 0; i < amount; i++) {
      var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
      var dir = pos.clone().normalize();
      var speed = 40 + Math.random() * 80;
      
      var scale = Math.min(canvas.width, canvas.height) / 480;
      if (scale < 0.6) scale = 0.65; 
      
      var screenX = canvas.width / 2 + pos.x * scale;
      var screenY = canvas.height / 2 - pos.y * scale - 20;
      
      particles.add(
        screenX,
        screenY,
        dir.x * speed * scale,
        -dir.y * speed * scale
      );
    }
    
    // Beating Heart: update & draw
    particles.update(deltaTime);
    particles.draw(context, particleImage);
    
    // 3D Carousel: rotate update
    if (resumeAutoSpin && !isDragging) {
      targetRotateY += 0.15; // slow spin
      targetRotateX += (0 - targetRotateX) * 0.05; // ease X tilt back to center
    } else if (isDragging) {
      resumeAutoSpin = false;
    }
    
    currentRotateY += (targetRotateY - currentRotateY) * 0.08;
    currentRotateX += (targetRotateX - currentRotateX) * 0.08;
    
    if (carouselContainer) {
      carouselContainer.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
    }
    
    // Rain Canvas: update and draw particles & interactions
    updateAndDrawRain();
  }
  
  render();
}

function stopHeartAnimation() {
  if (heartAnimationId) {
    cancelAnimationFrame(heartAnimationId);
    heartAnimationId = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const giftScreen = document.getElementById('gift-screen');
  const closeBtn = document.getElementById('gift-close');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      giftScreen.classList.remove('visible');
      stopHeartAnimation();
      if (window.loveCard) {
        window.loveCard.show();
        window.loveCard._goTo(4);
      } else {
        document.body.style.overflow = '';
      }
    });
  }
});
