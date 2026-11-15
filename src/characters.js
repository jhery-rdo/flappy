// Les personnages. Pour en ajouter un, copier un bloc et changer les valeurs.
//   hairStyle : 'long' | 'couettes' | 'chignon' | 'queue'
//   top.style : 'bedaine' (chandail court, on voit le ventre) | 'large' (grand chandail)
//   bottom.style : 'short' | 'jogging' | 'jupe'
//   hairStyle peut aussi être 'court'
//   accessory : 'aucun' | 'lunettes' | 'chapeau' | 'noeud' | 'serre-tete' | 'couronne' (+ accessoryColor)
const BLOND = '#ffd84d';
const SKIN = '#ffdcc2';
const BLUE_EYES = '#3b9cff';
const GREY = '#a9adb8';

export const CHARACTERS = [
  { id: 'alix', name: 'Alix', hair: BLOND, hairStyle: 'long', eyes: BLUE_EYES, skin: SKIN,
    top: { style: 'bedaine', color: '#ff7eb6' }, bottom: { style: 'short', color: '#4f86d9' }, shoes: '#ffffff' },
  { id: 'sophie', name: 'Sophie', hair: BLOND, hairStyle: 'couettes', eyes: BLUE_EYES, skin: SKIN,
    top: { style: 'large', color: '#b79cf2' }, bottom: { style: 'jogging', color: GREY }, shoes: '#ffffff' },
  { id: 'matilda', name: 'Matilda', hair: BLOND, hairStyle: 'chignon', eyes: BLUE_EYES, skin: SKIN,
    top: { style: 'large', color: '#63d6c0' }, bottom: { style: 'jogging', color: GREY }, shoes: '#ffffff' },
  { id: 'alice', name: 'Alice', hair: BLOND, hairStyle: 'queue', eyes: BLUE_EYES, skin: SKIN,
    top: { style: 'large', color: '#ffa55c' }, bottom: { style: 'jogging', color: GREY }, shoes: '#ffffff' },
];

function ellipse(ctx, x, y, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

function box(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.fill();
}

// Dessine un personnage centré en (x, y), de rayon r, tourné de `angle` radians.
// `flap` va de -1 à 1 et fait battre les bras.
export function drawCharacter(ctx, c, x, y, r, angle = 0, flap = 0) {
  const hy = -0.35 * r; // centre de la tête
  const dark = '#2b2140';
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // cheveux derrière la tête
  ctx.fillStyle = c.hair;
  if (c.hairStyle === 'long') {
    box(ctx, -0.8 * r, hy - 0.2 * r, 1.6 * r, 1.25 * r, 0.45 * r);
  } else if (c.hairStyle === 'couettes') {
    ellipse(ctx, -0.85 * r, hy + 0.3 * r, 0.22 * r, 0.5 * r, 0.25);
    ellipse(ctx, 0.85 * r, hy + 0.3 * r, 0.22 * r, 0.5 * r, -0.25);
  } else if (c.hairStyle === 'chignon') {
    ellipse(ctx, 0, hy - 0.8 * r, 0.3 * r, 0.28 * r);
  } else if (c.hairStyle === 'queue') {
    ellipse(ctx, -0.85 * r, hy + 0.1 * r, 0.24 * r, 0.6 * r, 0.5);
  } else if (c.hairStyle === 'court') {
    ellipse(ctx, -0.68 * r, hy + 0.12 * r, 0.16 * r, 0.3 * r, 0.2);
    ellipse(ctx, 0.68 * r, hy + 0.12 * r, 0.16 * r, 0.3 * r, -0.2);
  }

  // jambes
  const jog = c.bottom.style === 'jogging';
  for (const s of [-1, 1]) {
    ctx.fillStyle = jog ? c.bottom.color : c.skin;
    box(ctx, s * 0.18 * r - 0.11 * r, 0.6 * r, 0.22 * r, 0.48 * r, 0.1 * r);
    ctx.fillStyle = c.shoes;
    ellipse(ctx, s * 0.2 * r, 1.1 * r, 0.16 * r, 0.09 * r);
  }

  // ventre (peau), puis bas et haut
  ctx.fillStyle = c.skin;
  box(ctx, -0.3 * r, 0.2 * r, 0.6 * r, 0.5 * r, 0.12 * r);
  ctx.fillStyle = c.bottom.color;
  if (c.bottom.style === 'jupe') {
    ctx.beginPath();
    ctx.moveTo(-0.32 * r, 0.54 * r);
    ctx.lineTo(0.32 * r, 0.54 * r);
    ctx.lineTo(0.48 * r, 0.9 * r);
    ctx.quadraticCurveTo(0, 0.98 * r, -0.48 * r, 0.9 * r);
    ctx.fill();
  } else {
    box(ctx, -0.33 * r, 0.56 * r, 0.66 * r, jog ? 0.2 * r : 0.26 * r, 0.08 * r);
  }
  ctx.fillStyle = c.top.color;
  const large = c.top.style === 'large';
  if (large) box(ctx, -0.46 * r, 0.14 * r, 0.92 * r, 0.56 * r, 0.16 * r);
  else box(ctx, -0.34 * r, 0.18 * r, 0.68 * r, 0.27 * r, 0.1 * r);

  // bras qui battent comme des ailes
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(s * (large ? 0.42 : 0.32) * r, 0.28 * r);
    ctx.rotate(s * (-0.9 - flap * 0.7));
    ctx.lineWidth = (large ? 0.22 : 0.15) * r;
    ctx.strokeStyle = large ? c.top.color : c.skin;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 0.42 * r);
    ctx.stroke();
    ctx.fillStyle = c.skin;
    ellipse(ctx, 0, 0.46 * r, 0.09 * r, 0.09 * r);
    ctx.restore();
  }

  // tête
  ctx.fillStyle = c.skin;
  ellipse(ctx, 0, hy, 0.7 * r, 0.66 * r);

  // frange
  ctx.fillStyle = c.hair;
  ctx.beginPath();
  ctx.arc(0, hy, 0.74 * r, Math.PI * 0.97, Math.PI * 2.03);
  ctx.quadraticCurveTo(0.5 * r, hy - 0.12 * r, 0.3 * r, hy - 0.36 * r);
  ctx.quadraticCurveTo(-0.15 * r, hy - 0.08 * r, -0.74 * r, hy + 0.06 * r);
  ctx.fill();

  // yeux kawaii
  for (const s of [-1, 1]) {
    const ex = s * 0.28 * r;
    const ey = hy + 0.12 * r;
    ctx.fillStyle = dark;
    ellipse(ctx, ex, ey, 0.13 * r, 0.16 * r);
    ctx.fillStyle = c.eyes;
    ellipse(ctx, ex, ey + 0.03 * r, 0.1 * r, 0.12 * r);
    ctx.fillStyle = dark;
    ellipse(ctx, ex, ey + 0.01 * r, 0.055 * r, 0.07 * r);
    ctx.fillStyle = '#fff';
    ellipse(ctx, ex + 0.04 * r, ey - 0.06 * r, 0.04 * r, 0.04 * r);
  }

  // joues roses et sourire
  ctx.fillStyle = 'rgba(255, 110, 150, .5)';
  ellipse(ctx, -0.46 * r, hy + 0.32 * r, 0.11 * r, 0.07 * r);
  ellipse(ctx, 0.46 * r, hy + 0.32 * r, 0.11 * r, 0.07 * r);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 0.04 * r;
  ctx.beginPath();
  ctx.arc(0, hy + 0.28 * r, 0.1 * r, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  drawAccessory(ctx, c, r, hy);
  ctx.restore();
}

function drawAccessory(ctx, c, r, hy) {
  const col = c.accessoryColor || '#ff5d8f';
  const dark = '#2b2140';
  switch (c.accessory) {
    case 'lunettes':
      ctx.strokeStyle = col;
      ctx.lineWidth = 0.06 * r;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(s * 0.28 * r, hy + 0.12 * r, 0.19 * r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-0.09 * r, hy + 0.08 * r);
      ctx.quadraticCurveTo(0, hy + 0.02 * r, 0.09 * r, hy + 0.08 * r);
      ctx.stroke();
      break;
    case 'chapeau':
      ctx.fillStyle = col;
      ellipse(ctx, 0, hy - 0.5 * r, 0.95 * r, 0.17 * r);
      box(ctx, -0.48 * r, hy - 1.05 * r, 0.96 * r, 0.6 * r, 0.25 * r);
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.fillRect(-0.48 * r, hy - 0.68 * r, 0.96 * r, 0.11 * r);
      break;
    case 'noeud':
      ctx.fillStyle = col;
      ctx.save();
      ctx.translate(0.48 * r, hy - 0.58 * r);
      ctx.rotate(0.3);
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s * 0.32 * r, -0.2 * r);
        ctx.lineTo(s * 0.32 * r, 0.2 * r);
        ctx.fill();
      }
      ctx.fillStyle = dark;
      ctx.globalAlpha = 0.25;
      ellipse(ctx, 0, 0, 0.09 * r, 0.09 * r);
      ctx.globalAlpha = 1;
      ctx.restore();
      break;
    case 'serre-tete':
      ctx.strokeStyle = col;
      ctx.lineWidth = 0.1 * r;
      ctx.beginPath();
      ctx.arc(0, hy + 0.05 * r, 0.72 * r, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      break;
    case 'couronne':
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-0.38 * r, hy - 0.6 * r);
      ctx.lineTo(-0.42 * r, hy - 1.0 * r);
      ctx.lineTo(-0.2 * r, hy - 0.8 * r);
      ctx.lineTo(0, hy - 1.08 * r);
      ctx.lineTo(0.2 * r, hy - 0.8 * r);
      ctx.lineTo(0.42 * r, hy - 1.0 * r);
      ctx.lineTo(0.38 * r, hy - 0.6 * r);
      ctx.fill();
      ctx.fillStyle = '#ff5d8f';
      ellipse(ctx, 0, hy - 0.72 * r, 0.06 * r, 0.06 * r);
      break;
  }
}
