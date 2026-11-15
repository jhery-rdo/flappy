// Tout le dessin du décor : ciel, obstacles, sol, confettis.
import { CONFIG } from './config.js';

const FONT = '"Baloo 2", "Arial Rounded MT Bold", system-ui, sans-serif';

// Nombre pseudo-aléatoire stable entre 0 et 1 (toujours le même pour un même i).
function rnd(i) {
  const s = Math.sin(i * 127.1 + 11.7) * 43758.5453;
  return s - Math.floor(s);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function cloud(ctx, x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 26 * s, y - 12 * s, 28 * s, 0, Math.PI * 2);
  ctx.arc(x + 58 * s, y, 22 * s, 0, Math.PI * 2);
  ctx.rect(x, y - 2 * s, 58 * s, 24 * s);
  ctx.fill();
}

export function drawBackground(ctx, level, W, H, dist, time) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, level.sky[0]);
  g.addColorStop(1, level.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (level.decor === 'stars') {
    for (let i = 0; i < 60; i++) {
      const tw = 0.5 + 0.5 * Math.sin(time * 2 + i);
      ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.6 * tw})`;
      const x = ((rnd(i) * (W + 40) - dist * 0.03) % (W + 40) + W + 40) % (W + 40) - 20;
      ctx.beginPath();
      ctx.arc(x, rnd(i + 100) * H * 0.7, 1 + rnd(i + 200) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff6c9';
    ctx.beginPath();
    ctx.arc(W * 0.78, 120, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = level.sky[0];
    ctx.beginPath();
    ctx.arc(W * 0.78 + 20, 108, 40, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (level.decor === 'sun') {
    ctx.fillStyle = 'rgba(255, 244, 200, .9)';
    ctx.beginPath();
    ctx.arc(W * 0.7, H * 0.62, 90, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,.75)';
  const span = W + 240;
  for (let i = 0; i < 6; i++) {
    const depth = 0.15 + rnd(i + 7) * 0.25;
    const x = ((rnd(i) * span - dist * depth) % span + span) % span - 120;
    cloud(ctx, x, 60 + rnd(i + 30) * H * 0.45, 0.7 + rnd(i + 50) * 0.8);
  }
}

export function drawObstacle(ctx, level, o, groundY) {
  const w = CONFIG.obstacleWidth;
  const c = level.obstacle;
  const top = o.gapY - level.gap / 2;
  const bottom = o.gapY + level.gap / 2;
  const parts = [[-30, top + 30], [bottom, groundY - bottom + 30]];
  for (const [y, h] of parts) {
    ctx.fillStyle = c.color;
    roundRect(ctx, o.x, y, w, h, 18);
    ctx.fill();
    // rayures façon sucre d'orge
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = c.stripe;
    ctx.lineWidth = 12;
    for (let s = y - w; s < y + h + w; s += 46) {
      ctx.beginPath();
      ctx.moveTo(o.x - 6, s + w);
      ctx.lineTo(o.x + w + 6, s);
      ctx.stroke();
    }
    ctx.restore();
  }
  // embouts
  ctx.fillStyle = c.cap;
  roundRect(ctx, o.x - 7, top - 26, w + 14, 26, 10);
  ctx.fill();
  roundRect(ctx, o.x - 7, bottom, w + 14, 26, 10);
  ctx.fill();
}

export function drawGround(ctx, level, W, H, groundY, dist) {
  ctx.fillStyle = level.ground;
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = level.groundTop;
  ctx.fillRect(0, groundY, W, 22);
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  const step = 48;
  for (let x = -((dist % step) + step) % step; x < W; x += step) {
    ctx.beginPath();
    ctx.arc(x + 12, groundY + 11, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawText(ctx, text, x, y, size, color = '#fff') {
  ctx.font = `800 ${size}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.18;
  ctx.strokeStyle = 'rgba(43, 33, 64, .85)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

const CONFETTI = ['#ff6f91', '#ffd166', '#2ec4b6', '#b388eb', '#ffffff'];

export function makeConfetti(W) {
  return Array.from({ length: 70 }, (_, i) => ({
    x: Math.random() * W, y: -20 - Math.random() * 300,
    vx: (Math.random() - 0.5) * 80, vy: 140 + Math.random() * 160,
    rot: Math.random() * 6, color: CONFETTI[i % CONFETTI.length],
  }));
}

export function drawConfetti(ctx, list, dt) {
  for (const p of list) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += dt * 5;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-6, -3, 12, 6);
    ctx.restore();
  }
}
