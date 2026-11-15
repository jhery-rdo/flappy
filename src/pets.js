// Les animaux de compagnie. Pour en ajouter un : un bloc dans PETS, puis ses oreilles dans drawPet.
export const PETS = [
  { id: 'chat', name: 'Chat', colors: ['#ffa94d', '#9aa0ad', '#3d3846', '#ffffff'] },
  { id: 'chien', name: 'Chien', colors: ['#a0693d', '#e8c79a', '#ffffff', '#3d3846'] },
  { id: 'lapin', name: 'Lapin', colors: ['#ffffff', '#c9c4cf', '#e8c79a', '#ffc2d6'] },
];

function petOval(ctx, x, y, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

// Dessine l'animal posé par les pattes en (x, y). s = taille, dir = 1 (regarde à droite) ou -1.
export function drawPet(ctx, kind, color, x, y, s, t = 0, dir = 1, happy = false) {
  const dark = '#2b2140';
  const inner = '#ffb3c7';
  const outline = color === '#ffffff' ? 'rgba(43,33,64,.18)' : null;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);

  // queue
  ctx.fillStyle = color;
  if (kind === 'lapin') {
    petOval(ctx, -0.95 * s, -0.75 * s, 0.25 * s, 0.25 * s);
  } else {
    ctx.save();
    ctx.translate(-0.85 * s, -0.75 * s);
    ctx.rotate(-0.8 + Math.sin(t * (happy ? 14 : 4)) * 0.35);
    petOval(ctx, 0, -0.4 * s, 0.12 * s, 0.45 * s);
    ctx.restore();
  }

  // pattes et corps
  for (const px of [-0.55, -0.25, 0.25, 0.55]) petOval(ctx, px * s, -0.15 * s, 0.13 * s, 0.17 * s);
  petOval(ctx, 0, -0.55 * s, 0.9 * s, 0.5 * s);
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -0.55 * s, 0.9 * s, 0.5 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // oreilles
  const hx = 0.7 * s;
  const hy = -1.15 * s;
  ctx.fillStyle = color;
  if (kind === 'chat') {
    for (const ex of [-0.35, 0.3]) {
      ctx.beginPath();
      ctx.moveTo(hx + (ex - 0.18) * s, hy - 0.3 * s);
      ctx.lineTo(hx + ex * s, hy - 0.85 * s);
      ctx.lineTo(hx + (ex + 0.22) * s, hy - 0.35 * s);
      ctx.fill();
    }
  } else if (kind === 'lapin') {
    for (const [ex, rot] of [[-0.2, -0.2], [0.2, 0.25]]) {
      ctx.fillStyle = color;
      petOval(ctx, hx + ex * s, hy - 0.9 * s, 0.15 * s, 0.48 * s, rot);
      ctx.fillStyle = inner;
      petOval(ctx, hx + ex * s, hy - 0.88 * s, 0.07 * s, 0.34 * s, rot);
    }
  }

  // tête
  ctx.fillStyle = color;
  petOval(ctx, hx, hy, 0.58 * s, 0.52 * s);
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.beginPath();
    ctx.ellipse(hx, hy, 0.58 * s, 0.52 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (kind === 'chien') {
    ctx.fillStyle = color === '#ffffff' ? '#e8c79a' : '#6b4226';
    petOval(ctx, hx - 0.5 * s, hy - 0.05 * s, 0.17 * s, 0.38 * s, 0.35);
    petOval(ctx, hx + 0.52 * s, hy - 0.05 * s, 0.17 * s, 0.38 * s, -0.35);
  }

  // yeux (fermés en arc quand il est content)
  ctx.fillStyle = dark;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 0.07 * s;
  ctx.lineCap = 'round';
  for (const ex of [-0.2, 0.22]) {
    if (happy) {
      ctx.beginPath();
      ctx.arc(hx + ex * s, hy, 0.09 * s, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      petOval(ctx, hx + ex * s, hy - 0.02 * s, 0.08 * s, 0.1 * s);
      ctx.fillStyle = '#fff';
      petOval(ctx, hx + ex * s + 0.03 * s, hy - 0.06 * s, 0.03 * s, 0.03 * s);
      ctx.fillStyle = dark;
    }
  }
  ctx.fillStyle = kind === 'chien' ? dark : '#ff7aa2';
  petOval(ctx, hx + 0.01 * s, hy + 0.16 * s, 0.07 * s, 0.05 * s);
  ctx.fillStyle = 'rgba(255, 110, 150, .45)';
  petOval(ctx, hx - 0.36 * s, hy + 0.18 * s, 0.09 * s, 0.06 * s);
  petOval(ctx, hx + 0.38 * s, hy + 0.18 * s, 0.09 * s, 0.06 * s);
  ctx.restore();
}
