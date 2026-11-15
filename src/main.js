// Le coeur du jeu : états, physique, collisions, menus.
import { CONFIG } from './config.js';
import { CHARACTERS, drawCharacter } from './characters.js';
import { LEVELS } from './levels.js';
import { loadSave, writeSave } from './storage.js';
import { SFX, setSound } from './audio.js';
import { drawBackground, drawObstacle, drawGround, drawText, makeConfetti, drawConfetti } from './render.js';

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');
const H = CONFIG.viewHeight;
let W = 400;          // largeur en unités de jeu (dépend de l'écran)
let scale = 1;

const save = loadSave();
save.char = Math.min(save.char, CHARACTERS.length - 1);
save.level = Math.min(save.level, LEVELS.length - 1);
setSound(save.sound);

// état : 'menu' | 'ready' | 'playing' | 'dead' | 'won'
const game = {
  state: 'menu', time: 0, dist: 0, score: 0,
  player: { x: 0, y: H / 2, vy: 0 },
  obstacles: [], confetti: [], endTimer: 0,
};

const level = () => LEVELS[save.level];
const character = () => CHARACTERS[save.char];
const groundY = () => H - CONFIG.groundHeight;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const cw = canvas.clientWidth || 1;
  const ch = canvas.clientHeight || 1;
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  scale = canvas.height / H;
  W = canvas.width / scale;
  game.player.x = Math.min(W * 0.3, 240);
}

// ---------- Partie ----------

function newGapY(prev) {
  const margin = 70 + level().gap / 2;
  const min = margin;
  const max = groundY() - margin;
  let y = min + Math.random() * (max - min);
  if (prev != null) y = Math.max(prev - 230, Math.min(prev + 230, y)); // pas de saut impossible
  return y;
}

function startLevel() {
  game.state = 'ready';
  game.score = 0;
  game.obstacles = [];
  game.confetti = [];
  game.player.y = H * 0.45;
  game.player.vy = 0;
  $('menu').hidden = true;
  $('end').hidden = true;
  $('btn-home').hidden = false;
}

function flap() {
  if (game.state === 'ready') {
    game.state = 'playing';
    game.obstacles.push({ x: W + 120, gapY: newGapY(), passed: false });
  }
  if (game.state === 'playing') {
    game.player.vy = CONFIG.flapVelocity;
    SFX.flap();
  }
}

function hitsObstacle(o) {
  const p = game.player;
  const r = CONFIG.playerRadius * CONFIG.hitboxScale;
  const nearestX = Math.max(o.x, Math.min(p.x, o.x + CONFIG.obstacleWidth));
  const dx = p.x - nearestX;
  if (Math.abs(dx) > r) return false;
  const reach = Math.sqrt(r * r - dx * dx);
  return p.y - reach < o.gapY - level().gap / 2 || p.y + reach > o.gapY + level().gap / 2;
}

function finish(won) {
  game.state = won ? 'won' : 'dead';
  game.endTimer = won ? 0.9 : 0.7;
  const id = level().id;
  save.best[id] = Math.max(save.best[id] || 0, game.score);
  if (won) {
    save.unlocked = Math.max(save.unlocked, Math.min(save.level + 1, LEVELS.length - 1));
    game.confetti = makeConfetti(W);
    SFX.win();
  } else {
    SFX.hit();
  }
  writeSave(save);
}

function update(dt) {
  game.time += dt;
  const p = game.player;
  const lv = level();

  if (game.state === 'menu' || game.state === 'ready') {
    game.dist += lv.speed * 0.4 * dt;
    p.y = H * 0.45 + Math.sin(game.time * 3) * 10; // petit flottement
    return;
  }

  if (game.state === 'playing') {
    game.dist += lv.speed * dt;
    p.vy = Math.min(p.vy + CONFIG.gravity * dt, CONFIG.maxFallSpeed);
    p.y += p.vy * dt;
    if (p.y < CONFIG.playerRadius) { p.y = CONFIG.playerRadius; p.vy = 0; }

    for (const o of game.obstacles) o.x -= lv.speed * dt;
    const last = game.obstacles[game.obstacles.length - 1];
    if (last.x < W + 120 - lv.spacing) {
      game.obstacles.push({ x: last.x + lv.spacing, gapY: newGapY(last.gapY), passed: false });
    }
    if (game.obstacles[0].x < -CONFIG.obstacleWidth - 20) game.obstacles.shift();

    for (const o of game.obstacles) {
      if (!o.passed && o.x + CONFIG.obstacleWidth < p.x) {
        o.passed = true;
        game.score++;
        SFX.score();
        if (game.score >= lv.goal) return finish(true);
      }
      if (hitsObstacle(o)) return finish(false);
    }
    if (p.y + CONFIG.playerRadius * CONFIG.hitboxScale >= groundY()) finish(false);
    return;
  }

  // 'dead' ou 'won' : petite animation puis écran de fin
  if (game.state === 'dead') {
    p.vy = Math.min(p.vy + CONFIG.gravity * dt, CONFIG.maxFallSpeed);
    p.y = Math.min(p.y + p.vy * dt, groundY() - CONFIG.playerRadius * 0.8);
  } else {
    game.dist += lv.speed * dt;
    p.y += (H * 0.4 - p.y) * Math.min(1, dt * 3);
  }
  if (game.endTimer > 0) {
    game.endTimer -= dt;
    if (game.endTimer <= 0) showEnd();
  }
}

function render(dt) {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const lv = level();
  const p = game.player;
  drawBackground(ctx, lv, W, H, game.dist, game.time);
  for (const o of game.obstacles) drawObstacle(ctx, lv, o, groundY());
  drawGround(ctx, lv, W, H, groundY(), game.dist);

  if (game.state !== 'menu') {
    const flying = game.state === 'playing' || game.state === 'dead';
    const angle = flying ? Math.max(-0.45, Math.min(1.2, p.vy / 600)) : 0;
    drawCharacter(ctx, character(), p.x, p.y, CONFIG.playerRadius, angle, Math.sin(game.time * 18));
    drawText(ctx, `${game.score} / ${lv.goal}`, W / 2, 70, 44);
  }
  if (game.state === 'ready') {
    drawText(ctx, lv.name, W / 2, H * 0.24, 34, '#ffe066');
    drawText(ctx, 'Touche l’écran pour voler', W / 2, H * 0.64, 26);
  }
  if (game.confetti.length) drawConfetti(ctx, game.confetti, dt);
}

let lastT = 0;
function frame(t) {
  const dt = Math.min((t - lastT) / 1000 || 0, 1 / 30);
  lastT = t;
  update(dt);
  render(dt);
  requestAnimationFrame(frame);
}

// ---------- Menus ----------

function buildMenu() {
  $('title').textContent = CONFIG.title;
  const chars = $('char-list');
  chars.replaceChildren();
  CHARACTERS.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'pick';
    b.setAttribute('aria-pressed', i === save.char);
    const cv = document.createElement('canvas');
    cv.width = cv.height = 144;
    const cx = cv.getContext('2d');
    drawCharacter(cx, c, 68, 86, 40, 0, -0.3);
    const name = document.createElement('span');
    name.textContent = c.name;
    b.append(cv, name);
    b.onclick = () => { save.char = i; writeSave(save); buildMenu(); };
    chars.append(b);
  });

  const levels = $('level-list');
  levels.replaceChildren();
  LEVELS.forEach((l, i) => {
    const locked = i > save.unlocked;
    const b = document.createElement('button');
    b.className = 'pick';
    b.disabled = locked;
    b.setAttribute('aria-pressed', i === save.level);
    const sw = document.createElement('i');
    sw.className = 'swatch';
    sw.style.background = `linear-gradient(${l.sky[0]}, ${l.sky[1]})`;
    sw.style.borderBottomColor = l.groundTop;
    const name = document.createElement('span');
    name.textContent = l.name;
    const info = document.createElement('small');
    info.textContent = locked ? 'Verrouillé' : `Record : ${save.best[l.id] || 0} / ${l.goal}`;
    b.append(sw, name, info);
    b.onclick = () => { save.level = i; writeSave(save); buildMenu(); };
    levels.append(b);
  });
  $('btn-sound').textContent = save.sound ? 'Son : oui' : 'Son : non';
}

function showMenu() {
  game.state = 'menu';
  game.obstacles = [];
  game.confetti = [];
  buildMenu();
  $('end').hidden = true;
  $('menu').hidden = false;
  $('btn-home').hidden = true;
}

function showEnd() {
  const won = game.state === 'won';
  const lv = level();
  const hasNext = won && save.level < LEVELS.length - 1;
  $('end-title').textContent = won ? 'Bravo, niveau réussi !' : 'Oups !';
  $('end-score').textContent = `Score : ${game.score} / ${lv.goal}`;
  $('end-best').textContent = `Record : ${save.best[lv.id] || 0}`;
  $('btn-next').hidden = !hasNext;
  $('end').hidden = false;
  (hasNext ? $('btn-next') : $('btn-retry')).focus();
}

// ---------- Commandes ----------

canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); flap(); });
window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
  if (game.state === 'ready' || game.state === 'playing') { e.preventDefault(); flap(); }
});
$('btn-play').onclick = startLevel;
$('btn-retry').onclick = startLevel;
$('btn-next').onclick = () => { save.level++; writeSave(save); startLevel(); };
$('btn-menu').onclick = showMenu;
$('btn-home').onclick = showMenu;
$('btn-sound').onclick = () => {
  save.sound = !save.sound;
  setSound(save.sound);
  writeSave(save);
  buildMenu();
};

window.addEventListener('resize', resize);
new ResizeObserver(resize).observe(canvas);
resize();
showMenu();
requestAnimationFrame(frame);

// Outil de test (console du navigateur) : __game.state, __game.score...
window.__game = game;
