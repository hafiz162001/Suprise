import confetti from 'canvas-confetti';

// Ambient floating hearts & stars canvas effect
export class AmbientParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.isRunning = false;
    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.particles = [];

    // Create initial batch of floating hearts & glimmers
    const count = Math.min(25, Math.floor(window.innerWidth / 30));
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }

    requestAnimationFrame(this.animate);
  }

  createParticle(randomY = false) {
    const types = ['heart', 'sparkle', 'petal'];
    const colors = [
      '#ffb6c1', // light pink
      '#ffc0cb', // pink
      '#fecdd3', // soft rose
      '#fde047', // warm gold sparkle
      '#e9d5ff', // gentle lavender
      '#fda4af'  // coral rose
    ];

    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : this.canvas.height + 20,
      size: Math.random() * 12 + 8,
      speedY: Math.random() * 0.8 + 0.4,
      speedX: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      opacity: Math.random() * 0.6 + 0.25,
      type: types[Math.floor(Math.random() * types.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }

  drawHeart(ctx, x, y, size, color, opacity, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;

    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    // Left curve
    ctx.bezierCurveTo(-size / 2, -topCurveHeight, -size, size / 3, 0, size);
    // Right curve
    ctx.bezierCurveTo(size, size / 3, size / 2, -topCurveHeight, 0, topCurveHeight);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawSparkle(ctx, x, y, size, color, opacity, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.lineTo(0, -size);
      ctx.lineTo(size * 0.25, -size * 0.25);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y -= p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      if (p.type === 'heart') {
        this.drawHeart(this.ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      } else {
        this.drawSparkle(this.ctx, p.x, p.y, p.size * 0.8, p.color, p.opacity, p.rotation);
      }

      // Recycle when off-screen
      if (p.y < -30 || p.x < -30 || p.x > this.canvas.width + 30) {
        this.particles[i] = this.createParticle(false);
      }
    }

    requestAnimationFrame(this.animate);
  }
}

// Grand celebratory confetti burst
export function triggerCelebrationConfetti() {
  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;

  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 80,
    zIndex: 9999,
    colors: ['#ff9bb2', '#ffc2d1', '#ffe5ec', '#fbcfe8', '#ffd166', '#a7f3d0']
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 45 * (timeLeft / duration);

    // Blast from left and right edges toward center
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.15, y: 0.6 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.85, y: 0.6 }
    });
  }, 250);

  // Big initial firework burst
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#ff6b8b', '#ff8da1', '#ffb6c1', '#ffd166']
  });
}
