// Les meubles de la maison. Chaque meuble est posé par le bas, au milieu, en (x, y).
// Pour en ajouter un : copier un bloc, choisir sa taille (w, h), ses couleurs et le dessiner.
//   wall: true  -> se pose sur le mur (tableau, guirlande…)
//   flat: true  -> se pose à plat sous les autres (tapis)

function fnBox(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.fill();
}

function fnOval(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

const WOOD = '#b07a4f';
const WOOD_DARK = '#8a5a36';

export const FURNITURE = [
  {
    id: 'lit', name: 'Lit', w: 230, h: 120,
    colors: ['#ff8fb8', '#b79cf2', '#7ad3c4', '#ffd166', '#7fb2ff'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = WOOD;
      fnBox(ctx, x - 115, y - 120, 22, 120, 8);           // tête de lit
      fnBox(ctx, x - 115, y - 40, 230, 30, 6);
      fnBox(ctx, x + 98, y - 70, 17, 70, 6);
      ctx.fillStyle = '#ffffff';
      fnBox(ctx, x - 95, y - 66, 196, 30, 12);            // matelas
      ctx.fillStyle = c;
      fnBox(ctx, x - 40, y - 72, 142, 40, 14);            // couverture
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      for (let i = 0; i < 4; i++) fnOval(ctx, x - 14 + i * 34, y - 52, 6, 6);
      ctx.fillStyle = '#ffffff';
      fnBox(ctx, x - 92, y - 84, 50, 26, 12);             // oreiller
    },
  },
  {
    id: 'canape', name: 'Canapé', w: 200, h: 110,
    colors: ['#ff8fb8', '#7fb2ff', '#7ad3c4', '#ffb35c', '#b79cf2'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = WOOD_DARK;
      ctx.fillRect(x - 86, y - 12, 10, 12);
      ctx.fillRect(x + 76, y - 12, 10, 12);
      ctx.fillStyle = c;
      fnBox(ctx, x - 90, y - 110, 180, 70, 24);           // dossier
      fnBox(ctx, x - 100, y - 60, 200, 50, 18);           // assise
      fnBox(ctx, x - 100, y - 80, 34, 70, 16);            // accoudoirs
      fnBox(ctx, x + 66, y - 80, 34, 70, 16);
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      fnBox(ctx, x - 60, y - 98, 54, 40, 14);             // coussins
      fnBox(ctx, x + 6, y - 98, 54, 40, 14);
    },
  },
  {
    id: 'fauteuil', name: 'Fauteuil', w: 110, h: 110,
    colors: ['#ffb35c', '#7ad3c4', '#ff8fb8', '#7fb2ff', '#b79cf2'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = WOOD_DARK;
      ctx.fillRect(x - 44, y - 12, 8, 12);
      ctx.fillRect(x + 36, y - 12, 8, 12);
      ctx.fillStyle = c;
      fnBox(ctx, x - 44, y - 110, 88, 70, 26);
      fnBox(ctx, x - 55, y - 60, 110, 50, 18);
      fnBox(ctx, x - 55, y - 78, 26, 68, 13);
      fnBox(ctx, x + 29, y - 78, 26, 68, 13);
    },
  },
  {
    id: 'table', name: 'Table', w: 150, h: 90,
    colors: ['#ffffff', '#ffd1e0', '#d6f5ef', '#fff1b8', '#e0d6ff'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = WOOD;
      ctx.fillRect(x - 62, y - 80, 12, 80);
      ctx.fillRect(x + 50, y - 80, 12, 80);
      ctx.fillStyle = c;                                  // nappe
      fnBox(ctx, x - 75, y - 90, 150, 34, 8);
      ctx.fillStyle = '#ff5d8f';                          // un petit vase
      fnBox(ctx, x - 10, y - 118, 20, 28, 8);
      ctx.fillStyle = '#ffd166';
      fnOval(ctx, x, y - 124, 10, 10);
    },
  },
  {
    id: 'lampe', name: 'Lampe', w: 60, h: 170,
    colors: ['#ffd166', '#ff8fb8', '#7ad3c4', '#b79cf2', '#ffffff'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = '#5b5368';
      fnOval(ctx, x, y - 6, 26, 7);
      ctx.fillRect(x - 3, y - 130, 6, 124);
      ctx.fillStyle = 'rgba(255, 240, 180, .35)';
      fnOval(ctx, x, y - 120, 46, 36);                    // lumière
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(x - 18, y - 170);
      ctx.lineTo(x + 18, y - 170);
      ctx.lineTo(x + 30, y - 124);
      ctx.lineTo(x - 30, y - 124);
      ctx.fill();
    },
  },
  {
    id: 'plante', name: 'Plante', w: 80, h: 130,
    colors: ['#e07a5f', '#7fb2ff', '#ffffff', '#ff8fb8', '#ffd166'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = '#4caf6a';
      for (const [dx, dy, rot] of [[-22, -80, -0.5], [22, -84, 0.5], [0, -108, 0], [-30, -56, -0.9], [30, -60, 0.9]]) {
        ctx.save();
        ctx.translate(x + dx, y + dy);
        ctx.rotate(rot);
        fnOval(ctx, 0, 0, 13, 30);
        ctx.restore();
      }
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(x - 30, y - 48);
      ctx.lineTo(x + 30, y - 48);
      ctx.lineTo(x + 22, y);
      ctx.lineTo(x - 22, y);
      ctx.fill();
    },
  },
  {
    id: 'tapis', name: 'Tapis', w: 250, h: 50, flat: true,
    colors: ['#ff8fb8', '#b79cf2', '#7ad3c4', '#ffd166', '#7fb2ff'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = c;
      fnOval(ctx, x, y - 25, 125, 25);
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      fnOval(ctx, x, y - 25, 85, 15);
      ctx.fillStyle = c;
      fnOval(ctx, x, y - 25, 50, 8);
    },
  },
  {
    id: 'etagere', name: 'Étagère', w: 120, h: 170,
    colors: [WOOD, '#ffffff', '#ff8fb8', '#7ad3c4', '#5b5368'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = c;
      ctx.fillRect(x - 60, y - 170, 10, 170);
      ctx.fillRect(x + 50, y - 170, 10, 170);
      const books = ['#ff5d8f', '#7b6cf6', '#2ec4b6', '#ff9f1c', '#ffd166', '#7fb2ff'];
      for (let s = 0; s < 3; s++) {
        const sy = y - 10 - s * 55;
        ctx.fillStyle = c;
        ctx.fillRect(x - 60, sy, 120, 10);
        for (let b = 0; b < 5; b++) {
          ctx.fillStyle = books[(b + s * 2) % books.length];
          const bh = 30 + ((b * 7 + s * 3) % 12);
          ctx.fillRect(x - 46 + b * 19, sy - bh, 15, bh);
        }
      }
    },
  },
  {
    id: 'tele', name: 'Télé', w: 150, h: 140,
    colors: ['#5b5368', '#ffffff', '#ff8fb8', '#7ad3c4', WOOD],
    draw(ctx, x, y, c) {
      ctx.fillStyle = c;                                  // meuble
      fnBox(ctx, x - 75, y - 50, 150, 50, 8);
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      ctx.fillRect(x - 2, y - 44, 4, 38);
      ctx.fillStyle = '#2b2140';                          // écran
      fnBox(ctx, x - 62, y - 140, 124, 82, 10);
      ctx.fillStyle = '#7ec8f2';
      fnBox(ctx, x - 55, y - 133, 110, 68, 6);
      ctx.fillStyle = '#ffd84d';                          // un petit dessin animé
      fnOval(ctx, x, y - 100, 16, 16);
      ctx.fillStyle = '#2b2140';
      fnOval(ctx, x - 5, y - 102, 2.5, 3);
      fnOval(ctx, x + 5, y - 102, 2.5, 3);
    },
  },
  {
    id: 'tableau', name: 'Tableau', w: 110, h: 90, wall: true,
    colors: ['#ffd166', '#ffffff', '#ff8fb8', '#5b5368', WOOD],
    draw(ctx, x, y, c) {
      ctx.fillStyle = c;
      fnBox(ctx, x - 55, y - 90, 110, 90, 6);
      ctx.fillStyle = '#bfe6ff';
      ctx.fillRect(x - 45, y - 80, 90, 70);
      ctx.fillStyle = '#7d6b63';                          // une mini tour Eiffel
      ctx.beginPath();
      ctx.moveTo(x - 18, y - 10);
      ctx.lineTo(x - 2, y - 68);
      ctx.lineTo(x + 2, y - 68);
      ctx.lineTo(x + 18, y - 10);
      ctx.lineTo(x + 9, y - 10);
      ctx.quadraticCurveTo(x, y - 30, x - 9, y - 10);
      ctx.fill();
    },
  },
  {
    id: 'guirlande', name: 'Guirlande', w: 220, h: 50, wall: true,
    colors: ['#ffd166', '#ff8fb8', '#7ad3c4', '#b79cf2', '#ffffff'],
    draw(ctx, x, y, c, t = 0) {
      ctx.strokeStyle = '#5b5368';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 110, y - 46);
      ctx.quadraticCurveTo(x, y + 10, x + 110, y - 46);
      ctx.stroke();
      for (let i = 0; i < 9; i++) {
        const u = i / 8;
        const px = x - 110 + u * 220;
        const py = (1 - u) * (1 - u) * (y - 46) + 2 * (1 - u) * u * (y + 10) + u * u * (y - 46);
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 4 + i);
        ctx.fillStyle = c;
        fnOval(ctx, px, py + 7, 6, 8);
        ctx.globalAlpha = 1;
      }
    },
  },
];

export const FURNITURE_BY_ID = Object.fromEntries(FURNITURE.map((f) => [f.id, f]));
