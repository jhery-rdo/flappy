// Les personnages. Pour en ajouter un, copier un bloc et changer les valeurs.
//   ears : 'none' | 'cat' | 'bunny' | 'round'
//   horn : true pour une corne
export const CHARACTERS = [
  { id: 'pompon', name: 'Pompon', body: '#ffb703', belly: '#ffe29a', wing: '#fb8500', ears: 'round', horn: false },
  { id: 'mirabelle', name: 'Mirabelle', body: '#b388eb', belly: '#e6d4ff', wing: '#8257d6', ears: 'cat', horn: false },
  { id: 'zigzag', name: 'Zigzag', body: '#2ec4b6', belly: '#c6f5ee', wing: '#14877c', ears: 'bunny', horn: true },
];

// Dessine un personnage centré en (x, y), de rayon r, tourné de `angle` radians.
// `flap` va de -1 à 1 et fait battre l'aile.
export function drawCharacter(ctx, c, x, y, r, angle = 0, flap = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.lineJoin = 'round';

  // oreilles (derrière le corps)
  ctx.fillStyle = c.body;
  if (c.ears === 'cat') {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.75 - r * 0.1, -r * 0.5);
      ctx.lineTo(s * r * 0.55 - r * 0.1, -r * 1.35);
      ctx.lineTo(s * r * 0.1 - r * 0.1, -r * 0.85);
      ctx.fill();
    }
  } else if (c.ears === 'bunny') {
    for (const s of [-0.45, 0.2]) {
      ctx.beginPath();
      ctx.ellipse(s * r - r * 0.1, -r * 1.25, r * 0.2, r * 0.55, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (c.ears === 'round') {
    for (const s of [-0.7, 0.45]) {
      ctx.beginPath();
      ctx.arc(s * r, -r * 0.85, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (c.horn) {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(r * 0.3, -r * 0.85);
    ctx.lineTo(r * 0.75, -r * 1.6);
    ctx.lineTo(r * 0.7, -r * 0.65);
    ctx.fill();
  }

  // corps
  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // ventre
  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(r * 0.15, r * 0.4, r * 0.6, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // aile
  ctx.fillStyle = c.wing;
  ctx.save();
  ctx.translate(-r * 0.45, r * 0.05);
  ctx.rotate(-0.3 + flap * 0.7);
  ctx.beginPath();
  ctx.ellipse(-r * 0.2, 0, r * 0.55, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // oeil
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(r * 0.42, -r * 0.25, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b2140';
  ctx.beginPath();
  ctx.arc(r * 0.52, -r * 0.22, r * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(r * 0.57, -r * 0.28, r * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // joue et museau
  ctx.fillStyle = 'rgba(255, 105, 140, .55)';
  ctx.beginPath();
  ctx.arc(r * 0.25, r * 0.15, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b2140';
  ctx.beginPath();
  ctx.ellipse(r * 0.9, r * 0.02, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
