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
    ctx.arc(W * 0.22, 120, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = level.sky[0];
    ctx.beginPath();
    ctx.arc(W * 0.22 + 20, 108, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  if (level.decor === 'sun') {
    ctx.fillStyle = 'rgba(255, 244, 200, .9)';
    ctx.beginPath();
    ctx.arc(W * 0.3, H * 0.62, 90, 0, Math.PI * 2);
    ctx.fill();
  }

  if (level.decor !== 'stars') {
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    const span = W + 240;
    for (let i = 0; i < 6; i++) {
      const depth = 0.15 + rnd(i + 7) * 0.25;
      const x = ((rnd(i) * span - dist * depth) % span + span) % span - 120;
      cloud(ctx, x, 60 + rnd(i + 30) * H * 0.45, 0.7 + rnd(i + 50) * 0.8);
    }
  }

  if (level.paris) {
    const gy = H - CONFIG.groundHeight;
    drawEiffel(ctx, level.paris, W * 0.68, gy, 430, time);
    drawRooftops(ctx, level.paris, W, gy, dist);
  }
}

// La tour Eiffel, posée sur le sol en (x, baseY), de hauteur h.
function drawEiffel(ctx, p, x, baseY, h, time) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.fillStyle = p.tower;
  ctx.beginPath();
  ctx.moveTo(-100, 0);
  ctx.quadraticCurveTo(-30, -h * 0.38, -6, -h);
  ctx.lineTo(6, -h);
  ctx.quadraticCurveTo(30, -h * 0.38, 100, 0);
  ctx.lineTo(58, 0);
  ctx.quadraticCurveTo(0, -150, -58, 0);
  ctx.closePath();
  ctx.fill();
  // les étages et l'antenne
  ctx.fillRect(-58, -h * 0.3, 116, 14);
  ctx.fillRect(-30, -h * 0.56, 60, 11);
  ctx.fillRect(-10, -h * 0.9, 20, 8);
  ctx.fillRect(-2, -h - 34, 4, 36);
  // croisillons
  ctx.strokeStyle = 'rgba(255,255,255,.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const [y1, y2, w1, w2] of [[-h * 0.3, -h * 0.56, 40, 22], [-h * 0.56, -h * 0.9, 20, 8]]) {
    ctx.moveTo(-w1, y1); ctx.lineTo(w2, y2);
    ctx.moveTo(w1, y1); ctx.lineTo(-w2, y2);
  }
  ctx.stroke();
  if (p.sparkle) {
    for (let i = 0; i < 26; i++) {
      const t = rnd(i + 300);
      const half = 6 + (1 - t) * (1 - t) * 80;
      const a = 0.5 + 0.5 * Math.sin(time * 6 + i * 2.3);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc((rnd(i + 400) * 2 - 1) * half, -t * h, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Les immeubles parisiens au loin, qui défilent lentement.
function drawRooftops(ctx, p, W, baseY, dist) {
  const bw = 78;
  const shift = dist * 0.25;
  const first = Math.floor(shift / bw);
  for (let i = first; i < first + W / bw + 2; i++) {
    const x = i * bw - shift;
    const k = ((i % 40) + 40) % 40;
    const h = 62 + rnd(k) * 58;
    ctx.fillStyle = p.wall;
    ctx.fillRect(x, baseY - h, bw - 3, h);
    ctx.fillStyle = p.roof;
    ctx.beginPath();
    ctx.moveTo(x - 2, baseY - h);
    ctx.lineTo(x + 8, baseY - h - 20);
    ctx.lineTo(x + bw - 11, baseY - h - 20);
    ctx.lineTo(x + bw - 1, baseY - h);
    ctx.fill();
    ctx.fillRect(x + 14 + rnd(k + 9) * 30, baseY - h - 32, 9, 14); // cheminée
    ctx.fillStyle = p.window;
    for (let wy = baseY - h + 12; wy < baseY - 20; wy += 26) {
      for (let wx = x + 11; wx < x + bw - 20; wx += 21) ctx.fillRect(wx, wy, 10, 14);
    }
  }
}

// Un obstacle = deux baguettes de pain, une qui descend et une qui monte.
export function drawObstacle(ctx, level, o, groundY) {
  const w = CONFIG.obstacleWidth;
  const c = level.obstacle;
  const top = o.gapY - level.gap / 2;
  const bottom = o.gapY + level.gap / 2;
  const parts = [[-60, top + 60], [bottom, groundY - bottom + 60]];
  for (const [y, h] of parts) {
    ctx.fillStyle = c.edge;
    roundRect(ctx, o.x, y, w, h, w / 2);
    ctx.fill();
    ctx.fillStyle = c.color;
    roundRect(ctx, o.x + 5, y + 5, w - 14, h - 10, w / 2);
    ctx.fill();
    // les entailles du boulanger
    ctx.save();
    roundRect(ctx, o.x, y, w, h, w / 2);
    ctx.clip();
    ctx.fillStyle = c.cut;
    for (let s = o.gapY % 74 - 74; s < groundY + 60; s += 74) {
      if (s < y + 14 || s > y + h - 14) continue;
      ctx.beginPath();
      ctx.ellipse(o.x + w / 2 - 2, s, w * 0.36, 9, -0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
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
