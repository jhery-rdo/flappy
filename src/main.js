// Le coeur du jeu : états, physique, collisions, menus.
import { CONFIG } from './config.js';
import { CHARACTERS, drawCharacter } from './characters.js';
import { LEVELS } from './levels.js';
import { loadSave, writeSave } from './storage.js';
import { SFX, setSound } from './audio.js';
import { openCreator } from './creator.js';
import { openHouse, houseIsOpen } from './house.js';
import { drawBackground, drawObstacle, drawGround, drawText, makeConfetti, drawConfetti, drawCandy, drawBear, drawHeart } from './render.js';

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');
const H = CONFIG.viewHeight;
let W = 400;          // largeur en unités de jeu (dépend de l'écran)
let scale = 1;

const save = loadSave();
// La liste des personnages : ceux du jeu + celui qu'on a fabriqué.
const allChars = () => (save.custom ? [...CHARACTERS, save.custom] : CHARACTERS);
save.char = Math.min(save.char, allChars().length - 1);
save.level = Math.min(save.level, LEVELS.length - 1);
setSound(save.sound);

// état : 'menu' | 'ready' | 'playing' | 'dead' | 'won'
const game = {
  state: 'menu', time: 0, dist: 0, score: 0,
  player: { x: 0, y: H / 2, vy: 0 },
  buddy: { x: 0, y: H / 2, vy: 0 },   // l'amie qui vole avec nous
  toast: null,
  obstacles: [], candies: [], bears: [], confetti: [], endTimer: 0,
  hearts: CONFIG.hearts, invincible: 0, candyCount: 0, spawned: 0,
};

const level = () => LEVELS[save.level];
const character = () => allChars()[save.char] || CHARACTERS[0];
const groundY = () => H - CONFIG.groundHeight;
// L'amie choisie (jamais le même personnage que soi).
const friend = () => {
  if (!save.friend || save.friend === character().id) return null;
  return allChars().find((c) => c.id === save.friend) || null;
};

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const cw = canvas.clientWidth || 1;
  const ch = canvas.clientHeight || 1;
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  scale = canvas.height / H;
  W = canvas.width / scale;
  game.player.x = Math.min(W * 0.3, 240);
  game.buddy.x = Math.max(36, game.player.x - 78);
}

// ---------- Partie ----------

function newGapY(prev) {
  const margin = 70 + level().gap / 2;
  const min = margin;
  const max = groundY() - margin;
  let y = min + Math.random() * (max - min);
  if (prev != null) y = Math.max(prev - 170, Math.min(prev + 170, y)); // pas de saut impossible
  return y;
}

// Ajoute une paire de baguettes, un bonbon dans le passage,
// puis un ours ou un autre bonbon avant la paire suivante.
function spawnObstacle(x, prevGapY) {
  const lv = level();
  const o = { x, gapY: newGapY(prevGapY), passed: false };
  game.obstacles.push(o);
  const n = game.spawned++;
  game.candies.push({ x: x + CONFIG.obstacleWidth / 2, y: o.gapY, i: n * 2 });
  const midX = x + CONFIG.obstacleWidth / 2 + lv.spacing / 2;
  const midY = 110 + Math.random() * (groundY() - 220);
  if (Math.random() < lv.bearChance) game.bears.push({ x: midX, baseY: midY, y: midY, phase: Math.random() * 6 });
  else game.candies.push({ x: midX, y: midY, i: n * 2 + 1 });
}

// Perdre un coeur (sauf pendant la protection). À zéro coeur, la partie est finie.
function hurt() {
  if (game.invincible > 0) return;
  game.hearts--;
  game.invincible = CONFIG.invincibleTime;
  SFX.hit();
  if (game.hearts <= 0) finish(false);
}

// Un bonbon ramassé (par soi ou par l'amie). Avec une amie, certains bonbons redonnent un coeur.
function gotCandy() {
  game.candyCount++;
  SFX.candy();
  const f = friend();
  if (f && game.candyCount % CONFIG.friendGift === 0 && game.hearts < CONFIG.hearts) {
    game.hearts++;
    game.toast = { text: `${f.name} te donne un cœur !`, t: 1.8 };
    SFX.win();
  }
}

// L'amie vole toute seule : elle vise le milieu du prochain passage.
function updateBuddy(dt, lv) {
  const b = game.buddy;
  const r = CONFIG.playerRadius;
  b.vy = Math.min(b.vy + CONFIG.gravity * dt, CONFIG.maxFallSpeed);
  b.y += b.vy * dt;
  const next = game.obstacles.find((o) => o.x + CONFIG.obstacleWidth > b.x - 30);
  const target = next ? next.gapY + 25 : H * 0.42;
  if (b.y > target && b.vy > -80) b.vy = CONFIG.flapVelocity;
  if (b.y < r) { b.y = r; b.vy = 0; }
  if (b.y > groundY() - r) { b.y = groundY() - r; b.vy = CONFIG.flapVelocity; }
  const reach = r * CONFIG.hitboxScale + CONFIG.candyRadius + 6;
  game.candies = game.candies.filter((c) => {
    if (near(b, c, reach)) { gotCandy(); return false; }
    return true;
  });
}

function near(a, b, dist) {
  return Math.hypot(a.x - b.x, a.y - b.y) < dist;
}

function startLevel() {
  game.state = 'ready';
  game.score = 0;
  game.hearts = CONFIG.hearts;
  game.invincible = 0;
  game.candyCount = 0;
  game.spawned = 0;
  game.candies = [];
  game.bears = [];
  game.obstacles = [];
  game.confetti = [];
  game.player.y = H * 0.45;
  game.player.vy = 0;
  game.buddy.y = H * 0.38;
  game.buddy.vy = 0;
  game.toast = null;
  $('menu').hidden = true;
  $('end').hidden = true;
  $('btn-home').hidden = false;
}

function flap() {
  if (game.state === 'ready') {
    game.state = 'playing';
    spawnObstacle(W + 120);
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
  save.candies += game.candyCount;
  if (won) {
    save.unlocked = Math.max(save.unlocked, Math.min(save.level + 1, LEVELS.length - 1));
    game.confetti = makeConfetti(W);
    SFX.win();
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
    game.buddy.y = H * 0.38 + Math.sin(game.time * 3 + 1.5) * 10;
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
      spawnObstacle(last.x + lv.spacing, last.gapY);
    }
    if (game.obstacles[0].x < -CONFIG.obstacleWidth - 20) game.obstacles.shift();

    for (const o of game.obstacles) {
      if (!o.passed && o.x + CONFIG.obstacleWidth < p.x) {
        o.passed = true;
        game.score++;
        SFX.score();
        if (game.score >= lv.goal) return finish(true);
      }
      if (hitsObstacle(o)) hurt();
    }

    const pr = CONFIG.playerRadius * CONFIG.hitboxScale;
    game.invincible = Math.max(0, game.invincible - dt);
    for (const c of game.candies) c.x -= lv.speed * dt;
    for (const b of game.bears) {
      b.x -= lv.speed * dt;
      b.y = b.baseY + Math.sin(game.time * 2 + b.phase) * 45;
      if (near(p, b, pr + CONFIG.bearRadius * 0.7)) hurt();
    }
    game.candies = game.candies.filter((c) => {
      if (near(p, c, pr + CONFIG.candyRadius + 6)) { gotCandy(); return false; }
      return c.x > -40;
    });
    game.bears = game.bears.filter((b) => b.x > -80);
    if (friend()) updateBuddy(dt, lv);
    if (game.toast && (game.toast.t -= dt) <= 0) game.toast = null;

    // toucher le sol : on perd un coeur et on rebondit
    if (p.y + pr >= groundY()) {
      p.y = groundY() - pr;
      p.vy = CONFIG.flapVelocity * 0.85;
      hurt();
    }
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
  game.buddy.y += (H * 0.34 - game.buddy.y) * Math.min(1, dt * 3);
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
  for (const c of game.candies) drawCandy(ctx, c.x, c.y, CONFIG.candyRadius, game.time, c.i);
  for (const b of game.bears) drawBear(ctx, b.x, b.y, CONFIG.bearRadius);
  drawGround(ctx, lv, W, H, groundY(), game.dist);

  if (game.state !== 'menu') {
    const flying = game.state === 'playing' || game.state === 'dead';
    const angle = flying ? Math.max(-0.45, Math.min(1.2, p.vy / 600)) : 0;
    const blink = game.state === 'playing' && game.invincible > 0 && Math.floor(game.invincible * 10) % 2 === 0;
    const f = friend();
    if (f) {
      const b = game.buddy;
      const bAngle = game.state === 'playing' ? Math.max(-0.45, Math.min(1.2, b.vy / 600)) : 0;
      drawCharacter(ctx, f, b.x, b.y, CONFIG.playerRadius, bAngle, Math.sin(game.time * 18 + 1));
    }
    if (!blink) drawCharacter(ctx, character(), p.x, p.y, CONFIG.playerRadius, angle, Math.sin(game.time * 18));
    if (game.toast) drawText(ctx, game.toast.text, W / 2, 166, 26, '#ffe066');
    drawText(ctx, `${game.score} / ${lv.goal}`, W / 2, 64, 44);
    for (let i = 0; i < CONFIG.hearts; i++) {
      drawHeart(ctx, W / 2 + (i - (CONFIG.hearts - 1) / 2) * 34, 116, 13, i < game.hearts);
    }
    drawCandy(ctx, W - 84, 40, 12, 0, 0);
    drawText(ctx, `${game.candyCount}`, W - 40, 42, 30);
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
  if (!houseIsOpen()) {
    update(dt);
    render(dt);
  }
  requestAnimationFrame(frame);
}

// ---------- Menus ----------

// « Avec qui tu joues ? » : toute seule, ou avec une amie qui vole à côté de toi.
function buildFriends() {
  const list = $('friend-list');
  list.replaceChildren();
  const me = character().id;
  const options = [null, ...allChars().filter((c) => c.id !== me)];
  for (const c of options) {
    const b = document.createElement('button');
    b.className = 'pick small';
    b.setAttribute('aria-pressed', (c ? c.id : null) === (friend() ? save.friend : null));
    if (c) {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 144;
      drawCharacter(cv.getContext('2d'), c, 72, 74, 50, 0, -0.3);
      b.append(cv);
    } else {
      const solo = document.createElement('b');
      solo.textContent = '1';
      b.append(solo);
    }
    const name = document.createElement('span');
    name.textContent = c ? c.name : 'Toute seule';
    b.append(name);
    b.onclick = () => { save.friend = c ? c.id : null; writeSave(save); buildMenu(); };
    list.append(b);
  }
}

function buildMenu() {
  $('title').textContent = CONFIG.title;
  const chars = $('char-list');
  chars.replaceChildren();
  allChars().forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'pick';
    b.setAttribute('aria-pressed', i === save.char);
    const cv = document.createElement('canvas');
    cv.width = cv.height = 144;
    const cx = cv.getContext('2d');
    drawCharacter(cx, c, 72, 74, 50, 0, -0.3);
    const name = document.createElement('span');
    name.textContent = c.name;
    b.append(cv, name);
    b.onclick = () => { save.char = i; writeSave(save); buildMenu(); };
    chars.append(b);
  });
  buildFriends();
  const make = document.createElement('button');
  make.className = 'pick make';
  make.innerHTML = '<b aria-hidden="true">+</b>';
  const label = document.createElement('span');
  label.textContent = save.custom ? 'Modifier mon perso' : 'Crée ton perso';
  make.append(label);
  make.onclick = () => { $('menu').hidden = true; editCharacter(() => { $('menu').hidden = false; }); };
  chars.append(make);

  const levels = $('level-list');
  levels.replaceChildren();
  LEVELS.forEach((l, i) => {
    if (l.world && l.world !== LEVELS[i - 1]?.world) {
      const label = document.createElement('p');
      label.className = 'world';
      label.textContent = l.world;
      levels.append(label);
    }
    const locked = !CONFIG.unlockAll && i > save.unlocked;
    const b = document.createElement('button');
    b.className = 'pick';
    b.disabled = locked;
    b.setAttribute('aria-pressed', i === save.level);
    const sw = document.createElement('i');
    sw.className = 'swatch';
    sw.style.background = `linear-gradient(${l.sky[0]}, ${l.sky[1]})`;
    sw.style.borderBottomColor = l.groundTop;
    const name = document.createElement('span');
    const short = l.world ? l.name.replace(l.world, '').trim() : l.name;
    name.textContent = short.charAt(0).toUpperCase() + short.slice(1);
    const info = document.createElement('small');
    info.textContent = locked ? 'Verrouillé' : `Record : ${save.best[l.id] || 0} / ${l.goal}`;
    b.append(sw, name, info);
    b.onclick = () => { save.level = i; writeSave(save); buildMenu(); };
    levels.append(b);
  });
  $('candy-total').textContent = `Bonbons ramassés : ${save.candies}`;
  $('btn-sound').textContent = save.sound ? 'Son : oui' : 'Son : non';
}

function showMenu() {
  game.state = 'menu';
  game.obstacles = [];
  game.candies = [];
  game.bears = [];
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
  $('end-title').textContent = won ? 'Bravo, niveau réussi !' : 'Plus de cœurs !';
  $('end-candies').textContent = `Bonbons : ${game.candyCount}`;
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

// Ouvre l'atelier du personnage ; en sortant, c'est lui qui est choisi.
function editCharacter(then) {
  openCreator(save, () => {
    save.char = CHARACTERS.length;
    writeSave(save);
    buildMenu();
    then?.();
  });
}

$('btn-house').onclick = () => {
  $('menu').hidden = true;
  openHouse(save, character, editCharacter, () => showMenu(), friend);
};
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
