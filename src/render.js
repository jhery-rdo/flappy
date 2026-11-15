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
  if (level.newyork) {
    const gy = H - CONFIG.groundHeight;
    const p = level.newyork;
    drawSkyline(ctx, p.far, p.window, W, gy, dist * 0.12, 150, 210, 64, 0.35);
    if (W > 620) drawLiberty(ctx, p, W * 0.16, gy, 330, time);
    drawEmpireState(ctx, p, W * 0.7, gy, 470);
    drawSkyline(ctx, p.near, p.window, W, gy, dist * 0.3, 80, 120, 70, 0.8);
  }
}

// Une rangée de gratte-ciel qui défile. `shift` = décalage, hauteurs entre minH et minH+varH.
function drawSkyline(ctx, color, win, W, baseY, shift, minH, varH, bw, winAlpha) {
  const first = Math.floor(shift / bw);
  for (let i = first; i < first + W / bw + 2; i++) {
    const x = i * bw - shift;
    const k = ((i % 40) + 40) % 40;
    const h = minH + rnd(k + 70) * varH;
    const w = bw - 6 - rnd(k + 90) * 12;
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - h, w, h);
    if (rnd(k + 110) > 0.6) { // réservoir d'eau sur le toit
      ctx.fillRect(x + w * 0.3, baseY - h - 18, 16, 14);
      ctx.fillRect(x + w * 0.3 + 2, baseY - h - 4, 2, 4);
      ctx.fillRect(x + w * 0.3 + 12, baseY - h - 4, 2, 4);
    }
    ctx.globalAlpha = winAlpha;
    ctx.fillStyle = win;
    for (let wy = baseY - h + 12; wy < baseY - 14; wy += 18) {
      for (let wx = x + 8; wx < x + w - 10; wx += 14) {
        if (rnd(k * 31 + wx * 0.7 + wy) > 0.35) ctx.fillRect(wx, wy, 7, 9);
      }
    }
    ctx.globalAlpha = 1;
  }
}

// L'Empire State Building : une tour en escalier avec une flèche.
function drawEmpireState(ctx, p, x, baseY, h) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.fillStyle = p.landmark;
  const steps = [[120, 0.42], [92, 0.62], [70, 0.8], [44, 0.88], [26, 0.94], [12, 1]];
  for (const [w, top] of steps) ctx.fillRect(-w / 2, -h * top, w, h * top);
  ctx.fillRect(-2, -h - 60, 4, 62);
  ctx.fillStyle = p.window;
  ctx.globalAlpha = p.lit ? 0.9 : 0.45;
  for (let y = -h * 0.8 + 10; y < -12; y += 16) {
    const w = y < -h * 0.62 ? 70 : y < -h * 0.42 ? 92 : 120;
    for (let wx = -w / 2 + 8; wx < w / 2 - 8; wx += 12) ctx.fillRect(wx, y, 5, 8);
  }
  ctx.globalAlpha = 1;
  if (p.lit) { // le haut s'allume la nuit
    ctx.fillStyle = '#ff5d8f';
    ctx.fillRect(-13, -h * 0.94 - 2, 26, 6);
    ctx.fillStyle = '#7bdff2';
    ctx.fillRect(-6, -h, 12, 6);
  }
  ctx.restore();
}

// La statue de la Liberté sur son socle, avec sa torche.
function drawLiberty(ctx, p, x, baseY, h, time) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.fillStyle = p.landmark;
  ctx.fillRect(-46, -h * 0.38, 92, h * 0.38);           // socle
  ctx.fillRect(-56, -h * 0.4, 112, 10);
  ctx.fillStyle = p.liberty;
  ctx.beginPath();                                      // robe
  ctx.moveTo(-30, -h * 0.4);
  ctx.lineTo(-18, -h * 0.82);
  ctx.lineTo(18, -h * 0.82);
  ctx.lineTo(32, -h * 0.4);
  ctx.fill();
  ctx.beginPath();                                      // tête
  ctx.arc(0, -h * 0.87, 13, 0, Math.PI * 2);
  ctx.fill();
  for (let i = -2; i <= 2; i++) {                       // couronne
    ctx.save();
    ctx.translate(0, -h * 0.87);
    ctx.rotate(i * 0.38);
    ctx.fillRect(-2, -26, 4, 14);
    ctx.restore();
  }
  ctx.save();                                           // bras levé
  ctx.translate(14, -h * 0.8);
  ctx.rotate(0.18);
  ctx.fillRect(-5, -h * 0.2, 11, h * 0.2);
  ctx.fillRect(-9, -h * 0.2 - 10, 19, 10);              // torche
  const f = 1 + Math.sin(time * 8) * 0.12;
  ctx.fillStyle = '#ffc93c';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.2 - 22, 8 * f, 13 * f, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = p.liberty;                            // tablette
  ctx.fillRect(-28, -h * 0.68, 12, 22);
  ctx.restore();
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

// Un obstacle = deux morceaux (baguettes ou hot-dogs), un qui descend et un qui monte.
export function drawObstacle(ctx, level, o, groundY) {
  const w = CONFIG.obstacleWidth;
  const c = level.obstacle;
  const top = o.gapY - level.gap / 2;
  const bottom = o.gapY + level.gap / 2;
  const parts = [[-60, top + 60], [bottom, groundY - bottom + 60]];
  if (c.kind === 'hotdog') return drawHotdogs(ctx, c, o.x, w, parts);
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

// Des hot-dogs debout : le pain, la saucisse qui dépasse et la moutarde en zigzag.
function drawHotdogs(ctx, c, x, w, parts) {
  for (const [y, h] of parts) {
    ctx.fillStyle = c.sausage;
    roundRect(ctx, x + w * 0.22, y - 10, w * 0.56, h + 20, w * 0.28);
    ctx.fill();
    for (const side of [0, 1]) {
      ctx.fillStyle = c.edge;
      roundRect(ctx, x + side * w * 0.6, y + 6, w * 0.4, h - 12, w * 0.2);
      ctx.fill();
      ctx.fillStyle = c.color;
      roundRect(ctx, x + side * w * 0.6 + 4, y + 10, w * 0.4 - 10, h - 20, w * 0.16);
      ctx.fill();
    }
    ctx.strokeStyle = c.sauce;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let s = y + 10, i = 0; s < y + h - 10; s += 16, i++) {
      const sx = x + w / 2 + (i % 2 ? 9 : -9);
      if (i === 0) ctx.moveTo(sx, s); else ctx.lineTo(sx, s);
    }
    ctx.stroke();
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

const CANDY_COLORS = ['#ff5d8f', '#7b6cf6', '#2ec4b6', '#ff9f1c'];

// Un petit bonbon emballé. `i` choisit sa couleur.
export function drawCandy(ctx, x, y, r, time, i) {
  const col = CANDY_COLORS[i % CANDY_COLORS.length];
  ctx.save();
  ctx.translate(x, y + Math.sin(time * 4 + i) * 4);
  ctx.rotate(-0.4);
  ctx.fillStyle = col;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * r * 0.7, 0);
    ctx.lineTo(s * r * 1.6, -r * 0.6);
    ctx.lineTo(s * r * 1.6, r * 0.6);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.85)';
  ctx.lineWidth = r * 0.22;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45, 0.3, 3.6);
  ctx.stroke();
  ctx.restore();
}

// Un méchant ours kawaii brun, accroché à un ballon.
export function drawBear(ctx, x, y, r) {
  const dark = '#2b2140';
  ctx.save();
  ctx.translate(x, y);
  // ballon
  ctx.strokeStyle = 'rgba(43,33,64,.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.9);
  ctx.lineTo(0, -r * 1.7);
  ctx.stroke();
  ctx.fillStyle = '#ef476f';
  ctx.beginPath();
  ctx.ellipse(0, -r * 2.3, r * 0.55, r * 0.68, 0, 0, Math.PI * 2);
  ctx.fill();
  // corps et pattes
  ctx.fillStyle = '#8b5a2b';
  ctx.beginPath();
  ctx.ellipse(0, r * 1.05, r * 0.6, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(s * r * 0.62, r * 0.8, r * 0.2, 0, Math.PI * 2);
    ctx.arc(s * r * 0.35, r * 1.5, r * 0.22, 0, Math.PI * 2);
    ctx.arc(s * r * 0.68, -r * 0.7, r * 0.32, 0, Math.PI * 2); // oreilles
    ctx.fill();
  }
  ctx.fillStyle = '#d9a066';
  ctx.beginPath();
  ctx.ellipse(0, r * 1.1, r * 0.34, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(s * r * 0.68, -r * 0.7, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  // tête
  ctx.fillStyle = '#8b5a2b';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d9a066';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.35, r * 0.45, r * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 110, 150, .5)';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * r * 0.65, r * 0.25, r * 0.15, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // yeux, sourcils fâchés, truffe et bouche boudeuse
  ctx.fillStyle = dark;
  ctx.strokeStyle = dark;
  ctx.lineCap = 'round';
  ctx.lineWidth = r * 0.11;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * r * 0.4, -r * 0.08, r * 0.11, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * r * 0.62, -r * 0.48);
    ctx.lineTo(s * r * 0.2, -r * 0.26);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(0, r * 0.22, r * 0.13, r * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = r * 0.07;
  ctx.beginPath();
  ctx.arc(0, r * 0.62, r * 0.13, 1.15 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

// Un coeur (plein ou vide) centré en (x, y).
export function drawHeart(ctx, x, y, s, full) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.9);
  ctx.bezierCurveTo(-s * 1.6, -s * 0.2, -s * 0.7, -s * 1.3, 0, -s * 0.45);
  ctx.bezierCurveTo(s * 0.7, -s * 1.3, s * 1.6, -s * 0.2, 0, s * 0.9);
  ctx.lineJoin = 'round';
  ctx.lineWidth = s * 0.4;
  ctx.strokeStyle = 'rgba(43, 33, 64, .85)';
  ctx.stroke();
  ctx.fillStyle = full ? '#ff4d6d' : 'rgba(255,255,255,.45)';
  ctx.fill();
  ctx.restore();
}
