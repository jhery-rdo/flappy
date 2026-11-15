// La maison à New York : on la voit de dehors, puis on entre pour la décorer
// et s'occuper de son animal. La pièce fait toujours 1000 x 720 unités.
import { drawCharacter } from './characters.js';
import { FURNITURE, FURNITURE_BY_ID } from './furniture.js';
import { PETS, drawPet } from './pets.js';
import { writeSave } from './storage.js';
import { SFX } from './audio.js';

const ROOM_W = 1000;
const ROOM_H = 720;
const FLOOR_Y = 500;
const CHAR_R = 80;      // taille du personnage dans la maison (plus grand que dans le vol)
const PET_S = 40;

const WALL_COLORS = ['#ffe3ec', '#e6f0ff', '#e8f7ee', '#fff4d6', '#efe6ff', '#ffffff', '#c0573e'];
// Les meubles où l'on peut s'asseoir : hauteur du siège et places (décalage depuis le milieu).
const SEATS = {
  canape: { top: 60, slots: [-50, 50] },
  fauteuil: { top: 60, slots: [0] },
  lit: { top: 66, slots: [-55, 25] },
};

let hsIdN = 0;
const newItemId = () => `m${Date.now().toString(36)}${(hsIdN++).toString(36)}`;

const FLOOR_COLORS = ['#d9a066', '#b07a4f', '#8a5a36', '#e8d3b0', '#c9c4cf', '#f3b6c8'];

const HOUSE_DEFAULT = {
  wall: '#ffe3ec', wallStyle: 'uni', floor: '#d9a066',
  items: [
    { type: 'tapis', x: 520, y: 690, color: '#b79cf2' },
    { type: 'tableau', x: 790, y: 300, color: '#ffd166' },
    { type: 'canape', x: 300, y: 600, color: '#ff8fb8' },
    { type: 'lampe', x: 120, y: 600, color: '#ffd166' },
    { type: 'plante', x: 880, y: 610, color: '#e07a5f' },
  ],
  char: { x: 600, y: 660 },
};

let hs = null;

function hsEl(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function hsRand(i) {
  const s = Math.sin(i * 91.7 + 3.1) * 43758.5453;
  return s - Math.floor(s);
}

function isNight() {
  const h = new Date().getHours();
  return h >= 20 || h < 7;
}

// ---------- Ouvrir / fermer ----------

export function openHouse(save, getChar, editCharacter, onClose, getFriend = () => null) {
  if (!save.house) save.house = structuredClone(HOUSE_DEFAULT);
  if (!save.house.friendPos) save.house.friendPos = { x: 420, y: 680 };
  for (const it of save.house.items) if (!it.id) it.id = newItemId();
  if (save.pet) decayPet(save.pet);
  const canvas = document.getElementById('house-canvas');
  hs = {
    save, getChar, getFriend, editCharacter, onClose, canvas, say: null, ctx: canvas.getContext('2d'),
    view: 'outside', mode: 'meubles', selected: null, drag: null,
    t: 0, last: 0, raf: 0, scale: 1, offX: 0, offY: 0,
    pet: { x: 760, y: 665, tx: 760, ty: 665, dir: -1, wait: 1, jump: 0, happy: 0, sleep: 0, bed: null },
    bowl: 0, hearts: [],
    adopt: { kind: 'chat', color: PETS[0].colors[0], name: '' },
  };
  document.getElementById('house').hidden = false;
  document.getElementById('house-out').onclick = closeHouse;
  hsResize();
  renderDrawer();
  hs.raf = requestAnimationFrame(hsFrame);
}

export function houseIsOpen() {
  return !!hs;
}

function closeHouse() {
  cancelAnimationFrame(hs.raf);
  writeSave(hs.save);
  document.getElementById('house').hidden = true;
  const done = hs.onClose;
  hs = null;
  done();
}

function hsResize() {
  if (!hs) return;
  const c = hs.canvas;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  c.width = Math.round((c.clientWidth || 1) * dpr);
  c.height = Math.round((c.clientHeight || 1) * dpr);
  hs.scale = Math.min(c.width / ROOM_W, c.height / ROOM_H);
  hs.offX = (c.width - ROOM_W * hs.scale) / 2;
  hs.offY = (c.height - ROOM_H * hs.scale) / 2;
}
// La taille de la pièce change quand le tiroir du bas grandit ou rétrécit.
new ResizeObserver(hsResize).observe(document.getElementById('house-canvas'));

// ---------- Animal ----------

function decayPet(p) {
  const hours = (Date.now() - (p.t || Date.now())) / 3.6e6;
  p.hunger = Math.max(15, p.hunger - hours * 8);
  p.joy = Math.max(15, p.joy - hours * 6);
  p.t = Date.now();
}

function petAction(kind) {
  const p = hs.save.pet;
  wakePet();
  if (kind === 'manger') {
    p.hunger = 100;
    hs.bowl = 4;
    hs.pet.tx = Math.min(900, hs.pet.x + 90);
  } else if (kind === 'caresser') {
    p.joy = Math.min(100, p.joy + 20);
    hs.pet.happy = 2;
  } else if (kind === 'jouer') {
    p.joy = Math.min(100, p.joy + 30);
    p.hunger = Math.max(15, p.hunger - 5);
    hs.pet.jump = 2;
    hs.pet.happy = 2.5;
  }
  p.t = Date.now();
  for (let i = 0; i < 5; i++) {
    hs.hearts.push({ x: hs.pet.x + (Math.random() - 0.5) * 60, y: hs.pet.y - 90, vy: -60 - Math.random() * 40, life: 1.4 });
  }
  SFX.candy();
  writeSave(hs.save);
  renderDrawer();
}

function updatePet(dt) {
  const s = hs.pet;
  s.happy = Math.max(0, s.happy - dt);
  s.jump = Math.max(0, s.jump - dt);
  hs.bowl = Math.max(0, hs.bowl - dt);
  if (hs.drag && hs.drag.target === 'pet') return;
  if (s.sleep > 0) {   // il dort dans son lit
    const bed = petBedById(s.bed);
    if (!bed) { s.sleep = 0; s.bed = null; return; }
    s.x = bed.x;
    s.y = bed.y + 1;
    if ((s.sleep -= dt) <= 0) wakePet();
    return;
  }
  const dx = s.tx - s.x;
  const dy = s.ty - s.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 4) {
    const step = Math.min(dist, 80 * dt);
    s.x += (dx / dist) * step;
    s.y += (dy / dist) * step;
    if (Math.abs(dx) > 2) s.dir = Math.sign(dx);
  } else if (s.bed) {
    s.sleep = 8 + Math.random() * 6;   // arrivé au lit : dodo
  } else if ((s.wait -= dt) <= 0) {
    const beds = hs.save.house.items.filter((i) => i.type === 'panier');
    if (beds.length && Math.random() < 0.3) {   // parfois, il va faire une sieste
      const bed = beds[Math.floor(Math.random() * beds.length)];
      s.bed = bed.id;
      s.tx = bed.x;
      s.ty = bed.y + 1;
    } else {
      s.tx = 120 + Math.random() * 760;
      s.ty = 620 + Math.random() * 70;
    }
    s.wait = 2 + Math.random() * 3;
  }
}

function petBedById(id) {
  return id ? hs.save.house.items.find((i) => i.id === id && i.type === 'panier') : null;
}

function wakePet() {
  const s = hs.pet;
  if (!s.bed) return;
  const bed = petBedById(s.bed);
  s.sleep = 0;
  s.bed = null;
  if (bed) { s.y = Math.min(ROOM_H - 10, bed.y + 25); s.ty = s.y; }
  s.tx = s.x;
  s.wait = 1.5;
}

// Si on pose l'animal sur son lit, il s'endort.
function tryPetBed() {
  const s = hs.pet;
  const bed = [...hs.save.house.items].reverse().find((i) => i.type === 'panier' && Math.abs(s.x - i.x) < 75 && Math.abs(s.y - i.y) < 70);
  if (!bed) return false;
  s.bed = bed.id;
  s.x = s.tx = bed.x;
  s.y = s.ty = bed.y + 1;
  s.sleep = 10 + Math.random() * 6;
  return true;
}

// ---------- Dessin ----------

function hsFrame(time) {
  if (!hs) return;
  const dt = Math.min((time - hs.last) / 1000 || 0, 1 / 30);
  hs.last = time;
  hs.t += dt;
  if (hs.save.pet) updatePet(dt);
  for (const h of hs.hearts) { h.y += h.vy * dt; h.life -= dt; }
  if (hs.say && (hs.say.t -= dt) <= 0) hs.say = null;
  hs.hearts = hs.hearts.filter((h) => h.life > 0);

  const ctx = hs.ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#2b2140';
  ctx.fillRect(0, 0, hs.canvas.width, hs.canvas.height);
  ctx.setTransform(hs.scale, 0, 0, hs.scale, hs.offX, hs.offY);
  if (hs.view === 'inside') {   // prolonge le mur et le sol sur les côtés de l'écran
    const left = -hs.offX / hs.scale;
    const full = hs.canvas.width / hs.scale;
    const top = -hs.offY / hs.scale;
    const tall = hs.canvas.height / hs.scale;
    ctx.fillStyle = hs.save.house.wall;
    ctx.fillRect(left, top, full, FLOOR_Y - top);
    ctx.fillStyle = hs.save.house.floor;
    ctx.fillRect(left, FLOOR_Y, full, tall);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(left, FLOOR_Y - 14, full, 16);
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, ROOM_W, ROOM_H);
  ctx.clip();
  if (hs.view === 'outside') drawOutside(ctx);
  else drawInside(ctx);
  ctx.restore();
  hs.raf = requestAnimationFrame(hsFrame);
}

function drawSkylineBox(ctx, x, y, w, h, night) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, night ? '#141b4d' : '#7ec8f2');
  g.addColorStop(1, night ? '#4a3f8f' : '#e6f4ff');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 14; i++) {
    const bw = w / 9;
    const bx = x + (i - 2) * bw * 0.8;
    const bh = h * (0.25 + hsRand(i) * 0.55);
    ctx.fillStyle = night ? '#232a5e' : '#a9bccf';
    ctx.fillRect(bx, y + h - bh, bw * 0.7, bh);
    ctx.fillStyle = night ? '#ffe066' : 'rgba(255,255,255,.6)';
    for (let wy = y + h - bh + 8; wy < y + h - 6; wy += 14) {
      for (let wx = bx + 5; wx < bx + bw * 0.7 - 6; wx += 10) {
        if (hsRand(i * 17 + wx + wy) > 0.45) ctx.fillRect(wx, wy, 4, 6);
      }
    }
  }
  // l'Empire State Building au loin
  const ex = x + w * 0.62;
  ctx.fillStyle = night ? '#1c2254' : '#8a94a6';
  for (const [bw, top] of [[40, 0.55], [28, 0.75], [14, 0.85], [6, 0.92]]) ctx.fillRect(ex - bw / 2, y + h * (1 - top), bw, h * top);
  ctx.fillRect(ex - 1, y + h * 0.02, 2, h * 0.08);
}

function drawOutside(ctx) {
  const night = isNight();
  drawSkylineBox(ctx, 0, 0, ROOM_W, 640, night);

  // la maison en briques (brownstone)
  const hx = 250, hw = 500, top = 70, base = 600;
  ctx.fillStyle = '#9b4a35';
  ctx.fillRect(hx, top, hw, base - top);
  ctx.fillStyle = 'rgba(0,0,0,.08)';
  for (let y = top + 6; y < base; y += 16) {
    const shift = ((y - top) / 16) % 2 ? 0 : 18;
    for (let x = hx + shift; x < hx + hw; x += 36) ctx.fillRect(x, y, 32, 2);
  }
  ctx.fillStyle = '#6e3326';
  ctx.fillRect(hx - 16, top - 26, hw + 32, 30);   // corniche
  ctx.fillRect(hx - 6, top - 6, hw + 12, 10);
  // fenêtres
  const lit = night ? '#ffe066' : '#bfe6ff';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (row === 2 && col === 2) continue;   // la porte est là
      const wx = hx + 50 + col * 150;
      const wy = top + 40 + row * 150;
      ctx.fillStyle = '#e8d3b0';
      ctx.fillRect(wx - 8, wy - 14, 116, 112);
      ctx.fillStyle = lit;
      ctx.fillRect(wx, wy, 100, 90);
      ctx.fillStyle = '#e8d3b0';
      ctx.fillRect(wx + 47, wy, 6, 90);
      ctx.fillRect(wx, wy + 42, 100, 6);
      ctx.fillStyle = '#ff8fb8';                // bac à fleurs
      ctx.fillRect(wx - 4, wy + 90, 108, 12);
      ctx.fillStyle = '#4caf6a';
      for (let f = 0; f < 6; f++) {
        ctx.beginPath();
        ctx.arc(wx + 6 + f * 18, wy + 88, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // porte et escalier
  const dx = hx + 345, dy = top + 330;
  ctx.fillStyle = '#e8d3b0';
  ctx.fillRect(dx - 16, dy - 40, 142, 210);
  ctx.beginPath();
  ctx.arc(dx + 55, dy - 40, 71, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#4b2a3b';
  ctx.fillRect(dx, dy - 30, 110, 200);
  ctx.beginPath();
  ctx.arc(dx + 55, dy - 30, 55, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(dx + 90, dy + 80, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff8ec';
  ctx.font = '800 26px "Baloo 2", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('9', dx + 55, dy - 48);
  for (let s = 0; s < 4; s++) {
    ctx.fillStyle = s % 2 ? '#7a3a2a' : '#8b4433';
    ctx.fillRect(dx - 40 - s * 22, dy + 170 + s * 18, 190 + s * 44, 18);
  }
  // trottoir et arbre
  ctx.fillStyle = '#9aa3ad';
  ctx.fillRect(0, 640, ROOM_W, 80);
  ctx.fillStyle = '#c9ced4';
  ctx.fillRect(0, 640, ROOM_W, 10);
  ctx.fillStyle = '#6b4a35';
  ctx.fillRect(132, 420, 20, 220);
  ctx.fillStyle = '#4caf6a';
  for (const [x, y, r] of [[142, 380, 70], [100, 430, 50], [186, 430, 50], [142, 330, 50]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // le personnage (et son amie) qui attendent devant
  const f = hs.getFriend();
  if (f) drawCharacter(ctx, f, 780, 690 - 1.2 * CHAR_R, CHAR_R, 0, -1.25 + Math.sin(hs.t * 2 + 1) * 0.05);
  drawCharacter(ctx, hs.getChar(), 880, 690 - 1.2 * CHAR_R, CHAR_R, 0, -1.25 + Math.sin(hs.t * 2) * 0.05);
}

function drawWall(ctx) {
  const h = hs.save.house;
  ctx.fillStyle = h.wall;
  ctx.fillRect(0, 0, ROOM_W, FLOOR_Y);
  if (h.wallStyle === 'briques') {
    ctx.fillStyle = 'rgba(0,0,0,.09)';
    for (let y = 8; y < FLOOR_Y; y += 22) {
      const shift = (y / 22) % 2 < 1 ? 0 : 26;
      for (let x = -26 + shift; x < ROOM_W; x += 52) ctx.fillRect(x, y, 48, 3);
      for (let x = -26 + shift; x < ROOM_W; x += 52) ctx.fillRect(x + 48, y - 19, 3, 19);
    }
  } else {
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    for (let x = 30; x < ROOM_W; x += 60) ctx.fillRect(x, 0, 18, FLOOR_Y);
  }
  // la grande fenêtre sur New York
  const wx = 340, wy = 60, ww = 320, wh = 250;
  drawSkylineBox(ctx, wx, wy, ww, wh, isNight());
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.strokeRect(wx, wy, ww, wh);
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(wx + ww / 2, wy);
  ctx.lineTo(wx + ww / 2, wy + wh);
  ctx.stroke();
  ctx.fillStyle = '#ff8fb8';
  for (const side of [-1, 1]) {
    const cx = side < 0 ? wx - 30 : wx + ww - 10;
    ctx.beginPath();
    ctx.moveTo(cx, wy - 20);
    ctx.lineTo(cx + 40, wy - 20);
    ctx.quadraticCurveTo(cx + 20 + side * 12, wy + wh / 2, cx + 40 - (side < 0 ? 0 : 0), wy + wh + 20);
    ctx.lineTo(cx, wy + wh + 20);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(wx - 40, wy - 26, ww + 80, 10);
}

function drawFloor(ctx) {
  const h = hs.save.house;
  ctx.fillStyle = h.floor;
  ctx.fillRect(0, FLOOR_Y, ROOM_W, ROOM_H - FLOOR_Y);
  ctx.fillStyle = 'rgba(0,0,0,.08)';
  for (let y = FLOOR_Y + 30; y < ROOM_H; y += 34) ctx.fillRect(0, y, ROOM_W, 3);
  for (let y = FLOOR_Y, row = 0; y < ROOM_H; y += 34, row++) {
    for (let x = (row % 2) * 90; x < ROOM_W; x += 180) ctx.fillRect(x, y, 3, 34);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, FLOOR_Y - 14, ROOM_W, 16);  // plinthe
}

function itemBox(it) {
  const f = FURNITURE_BY_ID[it.type];
  return { x: it.x - f.w / 2, y: it.y - f.h, w: f.w, h: f.h };
}

// Où se trouve une personne (soi ou l'amie) : debout, ou assise sur un meuble.
function personPlace(pos) {
  if (pos.sit) {
    const it = hs.save.house.items.find((i) => i.id === pos.sit.id);
    const seat = it && SEATS[it.type];
    if (seat) {
      pos.x = it.x + seat.slots[pos.sit.slot];
      pos.y = it.y + 1;
      const cy = it.y - seat.top - 0.72 * CHAR_R;
      return { x: pos.x, cy, sortY: pos.y, sitting: true, box: { x: pos.x - 64, y: cy - 104, w: 128, h: 190 } };
    }
    pos.sit = null;   // le meuble a été rangé : on se relève
  }
  const cy = pos.y - 1.2 * CHAR_R;
  return { x: pos.x, cy, sortY: pos.y, sitting: false, box: { x: pos.x - 64, y: cy - 104, w: 128, h: 200 } };
}

// Après avoir posé une personne : si elle est sur un canapé, un fauteuil ou un lit, elle s'assoit.
function trySit(pos, other) {
  const items = [...hs.save.house.items].reverse();
  for (const it of items) {
    const seat = SEATS[it.type];
    if (!seat) continue;
    const f = FURNITURE_BY_ID[it.type];
    const body = pos.y - 1.2 * CHAR_R;   // le milieu du corps doit être sur le meuble
    if (Math.abs(pos.x - it.x) > f.w / 2 + 10 || body < it.y - f.h - 60 || body > it.y + 30) continue;
    const free = seat.slots
      .map((dx, slot) => ({ slot, d: Math.abs(it.x + dx - pos.x) }))
      .filter(({ slot }) => !(other && other.sit && other.sit.id === it.id && other.sit.slot === slot))
      .sort((a, b) => a.d - b.d);
    if (free.length) {
      pos.sit = { id: it.id, slot: free[0].slot };
      SFX.flap();
      return;
    }
  }
}

function sceneObjects() {
  const h = hs.save.house;
  const objs = [];
  for (const it of h.items) {
    const f = FURNITURE_BY_ID[it.type];
    if (!f) continue;
    const layer = f.flat ? 0 : f.wall ? 1 : 2;
    objs.push({ kind: 'item', ref: it, layer, y: it.y, box: itemBox(it) });
  }
  const me = personPlace(h.char);
  objs.push({ kind: 'char', layer: 2, y: me.sortY, place: me, box: me.box });
  if (hs.getFriend()) {
    const fr = personPlace(h.friendPos);
    objs.push({ kind: 'friend', layer: 2, y: fr.sortY + 0.5, place: fr, box: fr.box });
  }
  if (hs.save.pet) {
    const s = hs.pet;
    objs.push({ kind: 'pet', layer: 2, y: s.y + (s.sleep > 0 ? 0.5 : 0), box: { x: s.x - 62, y: s.y - 105, w: 124, h: 105 } });
  }
  return objs.sort((a, b) => a.layer - b.layer || a.y - b.y);
}

function drawInside(ctx) {
  drawWall(ctx);
  drawFloor(ctx);
  const h = hs.save.house;
  for (const o of sceneObjects()) {
    if (o.kind === 'item') {
      const f = FURNITURE_BY_ID[o.ref.type];
      f.draw(ctx, o.ref.x, o.ref.y, o.ref.color, hs.t);
    } else if (o.kind === 'char' || o.kind === 'friend') {
      const who = o.kind === 'char' ? hs.getChar() : hs.getFriend();
      const pl = o.place;
      drawCharacter(ctx, who, pl.x, pl.cy, CHAR_R, 0, -1.25 + Math.sin(hs.t * 2 + (o.kind === 'friend' ? 1 : 0)) * 0.05, pl.sitting);
    } else {
      const s = hs.pet;
      const p = hs.save.pet;
      if (hs.bowl > 0) {
        ctx.fillStyle = '#ff5d8f';
        ctx.beginPath();
        ctx.ellipse(s.x + 70 * s.dir, s.y - 8, 26, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a0693d';
        ctx.beginPath();
        ctx.ellipse(s.x + 70 * s.dir, s.y - 16, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      const jy = s.jump > 0 ? -Math.abs(Math.sin(s.jump * 7)) * 50 : 0;
      if (s.sleep > 0) {   // couché dans son lit, les yeux fermés
        ctx.save();
        ctx.translate(s.x, s.y - 30);
        ctx.scale(1, 0.82);
        drawPet(ctx, p.kind, p.color, 0, 0, PET_S, 0, s.dir, true);
        ctx.restore();
        ctx.fillStyle = '#7b6cf6';
        ctx.font = '800 30px "Baloo 2", system-ui, sans-serif';
        ctx.textAlign = 'center';
        const z = (hs.t * 0.8) % 1;
        ctx.globalAlpha = 1 - z;
        ctx.fillText('Z', s.x + 40 + z * 20, s.y - 110 - z * 40);
        ctx.globalAlpha = 1 - ((z + 0.5) % 1);
        ctx.fillText('z', s.x + 50 + ((z + 0.5) % 1) * 20, s.y - 100 - ((z + 0.5) % 1) * 40);
        ctx.globalAlpha = 1;
      } else drawPet(ctx, p.kind, p.color, s.x, s.y + jy, PET_S, hs.t, s.dir, s.happy > 0);
      if (p.hunger < 40 && hs.bowl <= 0 && s.sleep <= 0) {   // petite bulle : il a faim
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x + 30, s.y - 140, 26, 0, Math.PI * 2);
        ctx.arc(s.x + 10, s.y - 108, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff5d8f';
        ctx.beginPath();
        ctx.ellipse(s.x + 30, s.y - 136, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  if (hs.selected) {
    const b = hs.selected.kind === 'item' ? itemBox(hs.selected.ref) : null;
    if (b) {
      ctx.save();
      ctx.setLineDash([10, 8]);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#2ec4b6';
      ctx.strokeRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16);
      ctx.restore();
    }
  }
  if (hs.say) {   // bulle de l'amie
    const fpl = personPlace(h.friendPos);
    const fp = { x: fpl.x, y: fpl.cy + 96 };
    ctx.font = '700 28px "Baloo 2", system-ui, sans-serif';
    ctx.textAlign = 'center';
    const w = ctx.measureText(hs.say.text).width + 36;
    const bx = Math.max(w / 2 + 6, Math.min(ROOM_W - w / 2 - 6, fp.x));
    const by = fp.y - 250;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx - w / 2, by - 28, w, 52, 22); else ctx.rect(bx - w / 2, by - 28, w, 52);
    ctx.moveTo(fp.x - 10, by + 22);
    ctx.lineTo(fp.x, by + 42);
    ctx.lineTo(fp.x + 10, by + 22);
    ctx.fill();
    ctx.fillStyle = '#2b2140';
    ctx.fillText(hs.say.text, bx, by + 8);
  }
  for (const heart of hs.hearts) {
    ctx.globalAlpha = Math.min(1, heart.life);
    ctx.fillStyle = '#ff4d6d';
    ctx.font = '32px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('♥', heart.x, heart.y);
  }
  ctx.globalAlpha = 1;
}

// ---------- Toucher et glisser ----------

function toRoom(e) {
  const r = hs.canvas.getBoundingClientRect();
  const dpr = hs.canvas.width / r.width;
  return {
    x: ((e.clientX - r.left) * dpr - hs.offX) / hs.scale,
    y: ((e.clientY - r.top) * dpr - hs.offY) / hs.scale,
  };
}

function clampItem(it) {
  const f = FURNITURE_BY_ID[it.type];
  it.x = Math.max(f.w / 2, Math.min(ROOM_W - f.w / 2, it.x));
  if (f.wall) it.y = Math.max(f.h + 10, Math.min(FLOOR_Y - 20, it.y));
  else it.y = Math.max(FLOOR_Y + 30, Math.min(ROOM_H - 6, it.y));
}

function hsPointerDown(e) {
  if (!hs) return;
  e.preventDefault();
  const p = toRoom(e);
  if (hs.view === 'outside') {
    if (p.x > 560 && p.x < 760 && p.y > 300 && p.y < 680) enterHouse();
    return;
  }
  const objs = sceneObjects().reverse();
  const hit = objs.find((o) => p.x >= o.box.x && p.x <= o.box.x + o.box.w && p.y >= o.box.y && p.y <= o.box.y + o.box.h);
  if (!hit) {
    if (hs.selected) { hs.selected = null; renderDrawer(); }
    return;
  }
  hs.canvas.setPointerCapture?.(e.pointerId);
  const pos = hit.kind === 'item' ? hit.ref : hit.kind === 'char' ? hs.save.house.char : hit.kind === 'friend' ? hs.save.house.friendPos : hs.pet;
  hs.drag = { target: hit.kind, pos, dx: pos.x - p.x, dy: pos.y - p.y, moved: false, start: p };
  if (hit.kind === 'item') {
    const items = hs.save.house.items;   // mettre devant
    items.push(...items.splice(items.indexOf(hit.ref), 1));
    hs.selected = hit;
    renderDrawer();
  }
}

function hsPointerMove(e) {
  if (!hs || !hs.drag) return;
  const p = toRoom(e);
  const d = hs.drag;
  if (Math.hypot(p.x - d.start.x, p.y - d.start.y) > 6) d.moved = true;
  if (!d.moved) return;
  d.pos.x = p.x + d.dx;
  d.pos.y = p.y + d.dy;
  if (d.target === 'item') clampItem(d.pos);
  else {
    d.pos.sit = null;   // on se relève quand on est déplacée
    d.pos.x = Math.max(70, Math.min(ROOM_W - 70, d.pos.x));
    d.pos.y = Math.max(FLOOR_Y + 40, Math.min(ROOM_H - 10, d.pos.y));
  }
  if (d.target === 'pet') { d.pos.tx = d.pos.x; d.pos.ty = d.pos.y; d.pos.sleep = 0; d.pos.bed = null; }
}

function hsPointerUp() {
  if (!hs || !hs.drag) return;
  const d = hs.drag;
  hs.drag = null;
  if (!d.moved && d.target === 'pet') petAction('caresser');
  if (d.moved && d.target === 'pet' && tryPetBed()) SFX.flap();
  if (!d.moved && d.target === 'friend') friendSays();
  const h = hs.save.house;
  if (d.moved && d.target === 'char') trySit(h.char, hs.getFriend() ? h.friendPos : null);
  if (d.moved && d.target === 'friend') trySit(h.friendPos, h.char);
  writeSave(hs.save);
}

const houseCanvas = document.getElementById('house-canvas');
houseCanvas.addEventListener('pointerdown', hsPointerDown);
houseCanvas.addEventListener('pointermove', hsPointerMove);
houseCanvas.addEventListener('pointerup', hsPointerUp);
houseCanvas.addEventListener('pointercancel', hsPointerUp);

const FRIEND_WORDS = ['Coucou !', 'J’adore ta maison !', 'On joue ensemble ?', 'Tu es ma meilleure amie !', 'Trop jolie ta chambre !'];

function friendSays() {
  const n = (hs.sayN = (hs.sayN || 0) + 1);
  hs.say = { text: FRIEND_WORDS[n % FRIEND_WORDS.length], t: 2.2 };
  const fpl = personPlace(hs.save.house.friendPos);
  const fp = { x: fpl.x, y: fpl.cy + 96 };
  for (let i = 0; i < 4; i++) hs.hearts.push({ x: fp.x + (Math.random() - 0.5) * 110, y: fp.y - 120, vy: -50 - Math.random() * 30, life: 1 });
  SFX.candy();
}

function enterHouse() {
  hs.view = 'inside';
  SFX.score();
  renderDrawer();
}

// ---------- Le tiroir du bas (choix) ----------

function thumb(drawFn, w, h) {
  const cv = document.createElement('canvas');
  cv.width = 128;
  cv.height = 96;
  const ctx = cv.getContext('2d');
  const k = Math.min(110 / w, 80 / h);
  ctx.translate(64, 88);
  ctx.scale(k, k);
  drawFn(ctx);
  return cv;
}

function swatchRow(title, colors, current, onPick, extra) {
  const row = hsEl('div', 'cr-row');
  row.append(hsEl('h3', null, title));
  const list = hsEl('div', 'cr-choices');
  for (const col of colors) {
    const b = hsEl('button', 'swatch-btn');
    b.style.background = col;
    b.setAttribute('aria-label', `${title} ${col}`);
    b.setAttribute('aria-pressed', col === current);
    b.onclick = () => onPick(col);
    list.append(b);
  }
  if (extra) list.append(extra);
  row.append(list);
  return row;
}

function renderDrawer() {
  const drawer = document.getElementById('house-drawer');
  const tabs = document.getElementById('house-tabs');
  drawer.replaceChildren();
  tabs.replaceChildren();
  const h = hs.save.house;

  if (hs.view === 'outside') {
    drawer.append(hsEl('p', 'drawer-hint', 'Voici ta maison à New York !'));
    const b = hsEl('button', 'big', 'Entrer dans la maison');
    b.onclick = enterHouse;
    drawer.append(b);
    return;
  }

  const outside = hsEl('button', 'tab', 'Dehors');
  outside.onclick = () => { hs.view = 'outside'; hs.selected = null; renderDrawer(); };
  tabs.append(outside);
  for (const [id, label] of [['meubles', 'Meubles'], ['murs', 'Murs et sol'], ['animal', 'Mon animal'], ['perso', 'Mon perso']]) {
    const b = hsEl('button', 'tab', label);
    b.setAttribute('aria-pressed', hs.mode === id);
    b.onclick = () => {
      if (id === 'perso') {
        const st = hs;
        st.editCharacter(() => { hs = st; renderDrawer(); });
        return;
      }
      hs.mode = id;
      renderDrawer();
    };
    tabs.append(b);
  }

  if (hs.selected && hs.selected.kind === 'item') {
    const it = hs.selected.ref;
    const f = FURNITURE_BY_ID[it.type];
    const bar = hsEl('div', 'sel-bar');
    bar.append(hsEl('strong', null, f.name));
    const color = hsEl('button', 'pill', 'Changer la couleur');
    color.onclick = () => {
      it.color = f.colors[(f.colors.indexOf(it.color) + 1) % f.colors.length];
      writeSave(hs.save);
    };
    const del = hsEl('button', 'pill', 'Ranger');
    del.onclick = () => {
      h.items.splice(h.items.indexOf(it), 1);
      hs.selected = null;
      writeSave(hs.save);
      renderDrawer();
    };
    bar.append(color, del);
    drawer.append(bar);
  }

  if (hs.mode === 'meubles') {
    drawer.append(hsEl('p', 'drawer-hint', 'Touche un meuble pour l’ajouter, puis fais-le glisser où tu veux. Pose ton personnage sur un canapé, un fauteuil ou un lit pour qu’il s’assoie.'));
    const grid = hsEl('div', 'cr-choices');
    for (const f of FURNITURE) {
      const b = hsEl('button', 'item-btn');
      b.append(thumb((ctx) => f.draw(ctx, 0, 0, f.colors[0], 0), f.w, f.h), hsEl('span', null, f.name));
      b.onclick = () => {
        const n = h.items.length;
        const it = { id: newItemId(), type: f.id, x: 500 + ((n * 67) % 200) - 100, y: f.wall ? 330 : f.flat ? 690 : 640, color: f.colors[0] };
        clampItem(it);
        h.items.push(it);
        hs.selected = { kind: 'item', ref: it };
        writeSave(hs.save);
        renderDrawer();
      };
      grid.append(b);
    }
    drawer.append(grid);
  } else if (hs.mode === 'murs') {
    const brick = hsEl('button', 'chip', h.wallStyle === 'briques' ? 'Briques : oui' : 'Briques : non');
    brick.setAttribute('aria-pressed', h.wallStyle === 'briques');
    brick.onclick = () => { h.wallStyle = h.wallStyle === 'briques' ? 'uni' : 'briques'; writeSave(hs.save); renderDrawer(); };
    drawer.append(swatchRow('Murs', WALL_COLORS, h.wall, (c) => { h.wall = c; writeSave(hs.save); renderDrawer(); }, brick));
    drawer.append(swatchRow('Sol', FLOOR_COLORS, h.floor, (c) => { h.floor = c; writeSave(hs.save); renderDrawer(); }));
  } else if (hs.mode === 'animal') {
    renderPetPanel(drawer);
  }
}

function renderPetPanel(drawer) {
  const pet = hs.save.pet;
  if (!pet) {
    const a = hs.adopt;
    const row = hsEl('div', 'cr-row');
    row.append(hsEl('h3', null, 'Choisis ton animal'));
    const list = hsEl('div', 'cr-choices');
    for (const k of PETS) {
      const b = hsEl('button', 'item-btn');
      b.setAttribute('aria-pressed', a.kind === k.id);
      const col = a.kind === k.id ? a.color : k.colors[0];
      b.append(thumb((ctx) => drawPet(ctx, k.id, col, 0, 0, 40, 0, 1), 110, 110), hsEl('span', null, k.name));
      b.onclick = () => { a.kind = k.id; a.color = k.colors[0]; renderDrawer(); };
      list.append(b);
    }
    row.append(list);
    drawer.append(row);
    const kind = PETS.find((k) => k.id === a.kind);
    drawer.append(swatchRow('Couleur', kind.colors, a.color, (c) => { a.color = c; renderDrawer(); }));
    const nameRow = hsEl('div', 'cr-row');
    nameRow.append(hsEl('h3', null, 'Son nom'));
    const input = hsEl('input', 'name-input');
    input.id = 'pet-name';
    input.maxLength = 14;
    input.placeholder = 'Écris son nom';
    input.value = a.name;
    input.oninput = () => { a.name = input.value; };
    nameRow.append(input);
    drawer.append(nameRow);
    const go = hsEl('button', 'big', 'Adopter !');
    go.onclick = () => {
      hs.save.pet = { kind: a.kind, color: a.color, name: a.name.trim() || kind.name, hunger: 70, joy: 70, t: Date.now() };
      hs.pet.x = hs.pet.tx = 700;
      hs.pet.happy = 2;
      writeSave(hs.save);
      SFX.win();
      renderDrawer();
    };
    drawer.append(go);
    return;
  }

  drawer.append(hsEl('p', 'drawer-hint', `${pet.name} est content quand tu t’occupes de lui. Tu peux aussi le toucher pour le caresser.`));
  for (const [label, value] of [['Ventre plein', pet.hunger], ['Joie', pet.joy]]) {
    const row = hsEl('div', 'meter');
    row.append(hsEl('span', null, label));
    const bar = hsEl('div', 'meter-bar');
    const fill = hsEl('i');
    fill.style.width = `${Math.round(value)}%`;
    bar.append(fill);
    row.append(bar);
    drawer.append(row);
  }
  const actions = hsEl('div', 'row');
  for (const [act, label] of [['manger', 'Donner à manger'], ['caresser', 'Caresser'], ['jouer', 'Jouer']]) {
    const b = hsEl('button', 'pill', label);
    b.onclick = () => petAction(act);
    actions.append(b);
  }
  const change = hsEl('button', 'pill', 'Changer d’animal');
  change.onclick = () => {
    hs.adopt = { kind: pet.kind, color: pet.color, name: pet.name };
    hs.save.pet = null;
    writeSave(hs.save);
    renderDrawer();
  };
  actions.append(change);
  drawer.append(actions);
}

// Outil de test (console du navigateur) : __house() donne l'état de la maison.
window.__house = () => hs;
