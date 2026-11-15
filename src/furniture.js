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
    id: 'panier', name: 'Lit d’animal', w: 130, h: 60, pet: true,
    colors: ['#ff8fb8', '#7fb2ff', '#7ad3c4', '#ffd166', '#b79cf2'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = '#c98a3e';                          // le panier
      fnOval(ctx, x, y - 22, 65, 22);
      ctx.fillRect(x - 65, y - 44, 130, 22);
      fnOval(ctx, x, y - 44, 65, 16);
      ctx.fillStyle = c;                                  // le coussin
      fnOval(ctx, x, y - 44, 54, 12);
      ctx.strokeStyle = 'rgba(0,0,0,.12)';                // l'osier
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = -50; i <= 50; i += 14) {
        ctx.moveTo(x + i, y - 34);
        ctx.lineTo(x + i, y - 6);
      }
      ctx.stroke();
      ctx.fillStyle = '#ffffff';                          // un petit os brodé
      fnOval(ctx, x - 10, y - 22, 5, 5);
      fnOval(ctx, x + 10, y - 22, 5, 5);
      ctx.fillRect(x - 10, y - 25, 20, 6);
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


// ---------- Encore plus de meubles ----------
const WHITE = '#ffffff';

FURNITURE.push(
  // Cuisine
  {
    id: 'frigo', name: 'Frigo', w: 100, h: 200, cat: 'cuisine',
    colors: [WHITE, '#ff8fb8', '#7ad3c4', '#7fb2ff', '#ffd166'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      fnBox(ctx, x - 50, y - 200, 100, 200, 14);
      ctx.fillStyle = c;
      fnBox(ctx, x - 47, y - 197, 94, 194, 12);
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      ctx.fillRect(x - 47, y - 132, 94, 4);
      ctx.fillStyle = '#9aa0ad';
      fnBox(ctx, x + 28, y - 180, 7, 34, 3);
      fnBox(ctx, x + 28, y - 116, 7, 50, 3);
      ctx.fillStyle = '#ff5d8f'; fnOval(ctx, x - 22, y - 168, 8, 8);   // aimants
      ctx.fillStyle = '#ffd166'; fnOval(ctx, x - 4, y - 160, 7, 7);
      ctx.fillStyle = '#2ec4b6'; fnBox(ctx, x - 30, y - 100, 26, 20, 3);
    },
  },
  {
    id: 'four', name: 'Cuisinière', w: 110, h: 110, cat: 'cuisine',
    colors: [WHITE, '#ff8fb8', '#7ad3c4', '#ffd166', '#5b5368'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = c;
      fnBox(ctx, x - 55, y - 105, 110, 105, 8);
      ctx.fillStyle = '#5b5368';
      for (const dx of [-28, 28]) fnOval(ctx, x + dx, y - 104, 18, 4);
      ctx.fillStyle = '#2b2140';
      fnBox(ctx, x - 40, y - 72, 80, 52, 6);                // porte du four
      ctx.fillStyle = 'rgba(255, 180, 90, .55)';
      fnBox(ctx, x - 34, y - 66, 68, 40, 4);
      ctx.fillStyle = '#9aa0ad';
      for (let i = 0; i < 4; i++) fnOval(ctx, x - 33 + i * 22, y - 88, 5, 5);
    },
  },
  {
    id: 'evier', name: 'Évier', w: 160, h: 100, cat: 'cuisine',
    colors: ['#7ad3c4', WHITE, '#ff8fb8', '#ffd166', WOOD],
    draw(ctx, x, y, c) {
      ctx.fillStyle = c;
      fnBox(ctx, x - 78, y - 86, 156, 86, 6);
      ctx.fillStyle = 'rgba(0,0,0,.12)';
      ctx.fillRect(x - 1, y - 76, 2, 70);
      ctx.fillStyle = '#c9ced4';                            // plan de travail
      ctx.fillRect(x - 82, y - 96, 164, 12);
      ctx.fillStyle = '#9aa0ad';                            // robinet
      ctx.fillRect(x - 4, y - 128, 8, 32);
      ctx.fillRect(x - 4, y - 128, 26, 7);
      ctx.fillStyle = '#7ec8f2';
      fnOval(ctx, x + 18, y - 112, 3, 5);
    },
  },
  {
    id: 'chaise', name: 'Chaise', w: 70, h: 120, cat: 'cuisine',
    colors: [WOOD, WHITE, '#ff8fb8', '#7ad3c4', '#ffd166'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = c;
      fnBox(ctx, x - 30, y - 120, 60, 58, 10);              // dossier
      ctx.fillRect(x - 32, y - 52, 6, 52);                  // pieds
      ctx.fillRect(x + 26, y - 52, 6, 52);
      fnBox(ctx, x - 35, y - 58, 70, 12, 5);                // assise
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      fnBox(ctx, x - 20, y - 108, 40, 30, 8);
    },
  },
  // Salle de bain
  {
    id: 'baignoire', name: 'Baignoire', w: 220, h: 110, cat: 'bain',
    colors: [WHITE, '#ff8fb8', '#7fb2ff', '#ffd166', '#b79cf2'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = '#9aa0ad';
      for (const dx of [-80, 80]) fnOval(ctx, x + dx, y - 8, 10, 8);     // pieds
      ctx.fillStyle = WHITE;                                             // mousse
      for (let i = 0; i < 7; i++) fnOval(ctx, x - 75 + i * 25, y - 72 - (i % 2) * 8, 18, 14);
      ctx.fillStyle = 'rgba(43,33,64,.15)';
      fnBox(ctx, x - 110, y - 75, 220, 66, 30);
      ctx.fillStyle = c;
      fnBox(ctx, x - 107, y - 72, 214, 60, 28);
      ctx.fillStyle = '#9aa0ad';                                         // robinet
      ctx.fillRect(x - 100, y - 110, 8, 38);
      ctx.fillRect(x - 100, y - 110, 26, 7);
      ctx.fillStyle = '#ffd166';                                         // petit canard
      fnOval(ctx, x + 50, y - 86, 14, 11);
      fnOval(ctx, x + 60, y - 98, 8, 8);
      ctx.fillStyle = '#ff9f1c';
      fnOval(ctx, x + 69, y - 97, 4, 2.5);
    },
  },
  {
    id: 'lavabo', name: 'Lavabo', w: 90, h: 130, cat: 'bain',
    colors: [WHITE, '#ff8fb8', '#7fb2ff', '#7ad3c4', '#ffd166'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = 'rgba(43,33,64,.15)';
      fnBox(ctx, x - 16, y - 92, 32, 92, 10);
      ctx.fillStyle = c;
      fnBox(ctx, x - 13, y - 90, 26, 90, 9);                // pied
      ctx.fillStyle = 'rgba(43,33,64,.15)';
      fnOval(ctx, x, y - 96, 46, 18);
      ctx.fillStyle = c;
      fnOval(ctx, x, y - 97, 43, 16);
      ctx.fillStyle = '#9aa0ad';
      ctx.fillRect(x - 3, y - 128, 6, 22);
      ctx.fillRect(x - 3, y - 128, 18, 5);
    },
  },
  {
    id: 'miroir', name: 'Miroir', w: 90, h: 120, wall: true, cat: 'bain',
    colors: ['#ffd166', WHITE, '#ff8fb8', '#7ad3c4', WOOD],
    draw(ctx, x, y, c) {
      ctx.fillStyle = c;
      fnOval(ctx, x, y - 60, 45, 60);
      ctx.fillStyle = '#d6efff';
      fnOval(ctx, x, y - 60, 36, 50);
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.save();
      ctx.translate(x - 12, y - 78);
      ctx.rotate(0.6);
      fnOval(ctx, 0, 0, 5, 18);
      ctx.restore();
    },
  },
  // Chambre
  {
    id: 'armoire', name: 'Armoire', w: 140, h: 210, cat: 'chambre',
    colors: [WHITE, '#ff8fb8', '#b79cf2', '#7ad3c4', WOOD],
    draw(ctx, x, y, c) {
      ctx.fillStyle = 'rgba(43,33,64,.18)';
      fnBox(ctx, x - 70, y - 210, 140, 210, 10);
      ctx.fillStyle = c;
      fnBox(ctx, x - 67, y - 200, 64, 196, 8);
      fnBox(ctx, x + 3, y - 200, 64, 196, 8);
      ctx.fillStyle = '#ffd166';
      fnOval(ctx, x - 12, y - 105, 5, 5);
      fnOval(ctx, x + 12, y - 105, 5, 5);
      ctx.fillStyle = 'rgba(255,255,255,.5)';                // coeurs décorés
      for (const dx of [-35, 35]) {
        fnOval(ctx, x + dx - 5, y - 165, 7, 7);
        fnOval(ctx, x + dx + 5, y - 165, 7, 7);
        ctx.beginPath();
        ctx.moveTo(x + dx - 11, y - 162);
        ctx.lineTo(x + dx, y - 150);
        ctx.lineTo(x + dx + 11, y - 162);
        ctx.fill();
      }
    },
  },
  {
    id: 'bureau', name: 'Bureau', w: 160, h: 130, cat: 'chambre',
    colors: [WHITE, WOOD, '#ff8fb8', '#7ad3c4', '#b79cf2'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = c;
      fnBox(ctx, x - 80, y - 90, 160, 14, 5);
      ctx.fillRect(x - 74, y - 78, 10, 78);
      fnBox(ctx, x + 18, y - 78, 56, 78, 5);                 // tiroirs
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      ctx.fillRect(x + 22, y - 52, 48, 3);
      ctx.fillRect(x + 22, y - 26, 48, 3);
      ctx.fillStyle = '#5b5368';                             // ordinateur portable
      fnBox(ctx, x - 50, y - 132, 62, 42, 5);
      ctx.fillStyle = '#7ec8f2';
      fnBox(ctx, x - 45, y - 127, 52, 32, 3);
      ctx.fillStyle = '#ff5d8f';                             // pot à crayons
      fnBox(ctx, x + 40, y - 112, 18, 22, 4);
      ctx.fillStyle = '#ffd166'; ctx.fillRect(x + 43, y - 126, 4, 16);
      ctx.fillStyle = '#2ec4b6'; ctx.fillRect(x + 50, y - 122, 4, 12);
    },
  },
  {
    id: 'coffre', name: 'Coffre à jouets', w: 110, h: 80, cat: 'chambre',
    colors: ['#ff8fb8', '#7fb2ff', '#ffd166', '#7ad3c4', '#b79cf2'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = '#ff5d8f';                             // un ballon qui dépasse
      fnOval(ctx, x - 20, y - 74, 16, 16);
      ctx.fillStyle = c;
      fnBox(ctx, x - 55, y - 66, 110, 66, 10);
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      ctx.fillRect(x - 55, y - 50, 110, 4);
      ctx.fillStyle = WHITE;                                 // étoile
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 ? 7 : 16;
        ctx.lineTo(x + Math.cos(a) * r, y - 24 + Math.sin(a) * r);
      }
      ctx.fill();
    },
  },
  {
    id: 'nounours', name: 'Nounours', w: 70, h: 80, cat: 'chambre',
    colors: ['#c98a3e', '#ffb3c7', WHITE, '#9fd0ff', '#d6c1ff'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = c;
      fnOval(ctx, x, y - 22, 26, 22);                        // corps
      fnOval(ctx, x - 22, y - 8, 10, 8);                     // pattes
      fnOval(ctx, x + 22, y - 8, 10, 8);
      fnOval(ctx, x - 16, y - 76, 9, 9);                     // oreilles
      fnOval(ctx, x + 16, y - 76, 9, 9);
      fnOval(ctx, x, y - 56, 22, 20);                        // tête
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      fnOval(ctx, x, y - 50, 9, 7);
      fnOval(ctx, x, y - 20, 13, 11);
      ctx.fillStyle = '#2b2140';
      fnOval(ctx, x - 8, y - 60, 3, 3.5);
      fnOval(ctx, x + 8, y - 60, 3, 3.5);
      fnOval(ctx, x, y - 52, 3.5, 2.5);
      ctx.fillStyle = '#ff5d8f';                             // noeud
      fnOval(ctx, x - 7, y - 38, 6, 4);
      fnOval(ctx, x + 7, y - 38, 6, 4);
    },
  },
  // Salon
  {
    id: 'piano', name: 'Piano', w: 170, h: 150, cat: 'salon',
    colors: ['#2b2140', WHITE, '#ff8fb8', WOOD, '#b79cf2'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = c;
      fnBox(ctx, x - 85, y - 150, 170, 150, 8);
      ctx.fillStyle = 'rgba(255,255,255,.15)';
      fnBox(ctx, x - 70, y - 138, 140, 50, 6);
      ctx.fillStyle = WHITE;                                 // touches
      ctx.fillRect(x - 80, y - 84, 160, 22);
      ctx.fillStyle = '#2b2140';
      for (let i = 0; i < 10; i++) if (i % 7 !== 2 && i % 7 !== 6) ctx.fillRect(x - 72 + i * 16, y - 84, 8, 13);
      ctx.fillStyle = '#ffd166';                             // partition
      ctx.fillRect(x - 24, y - 132, 48, 36);
      ctx.fillStyle = '#2b2140';
      for (let i = 0; i < 3; i++) fnOval(ctx, x - 12 + i * 12, y - 112 + (i % 2) * 6, 3, 2.5);
    },
  },
  {
    id: 'aquarium', name: 'Aquarium', w: 140, h: 150, cat: 'salon',
    colors: [WOOD, WHITE, '#ff8fb8', '#5b5368', '#7ad3c4'],
    draw(ctx, x, y, c, t = 0) {
      ctx.fillStyle = c;
      fnBox(ctx, x - 70, y - 60, 140, 60, 6);                // meuble
      ctx.fillStyle = 'rgba(126, 200, 242, .75)';
      fnBox(ctx, x - 64, y - 150, 128, 90, 8);
      ctx.fillStyle = '#e8d3b0';
      ctx.fillRect(x - 64, y - 72, 128, 12);
      ctx.fillStyle = '#4caf6a';
      fnOval(ctx, x - 40, y - 86, 6, 18);
      fnOval(ctx, x + 44, y - 90, 6, 22);
      const fish = [['#ff9f1c', 0], ['#ff5d8f', 2]];
      for (const [col, ph] of fish) {
        const fx = x + Math.sin(t * 0.8 + ph) * 38;
        const fy = y - 115 + ph * 8;
        const dir = Math.cos(t * 0.8 + ph) > 0 ? 1 : -1;
        ctx.fillStyle = col;
        fnOval(ctx, fx, fy, 11, 7);
        ctx.beginPath();
        ctx.moveTo(fx - dir * 9, fy);
        ctx.lineTo(fx - dir * 19, fy - 7);
        ctx.lineTo(fx - dir * 19, fy + 7);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      fnOval(ctx, x + 10, y - 135 + ((t * 20) % 40), 3, 3);
    },
  },
  {
    id: 'horloge', name: 'Horloge', w: 80, h: 80, wall: true, cat: 'deco',
    colors: ['#ff8fb8', '#ffd166', '#7ad3c4', WHITE, '#5b5368'],
    draw(ctx, x, y, c) {
      const cx = x, cy = y - 40;
      ctx.fillStyle = c;
      fnOval(ctx, cx, cy, 40, 40);
      ctx.fillStyle = WHITE;
      fnOval(ctx, cx, cy, 32, 32);
      const now = new Date();                                // la vraie heure !
      const hAng = ((now.getHours() % 12) + now.getMinutes() / 60) * (Math.PI / 6) - Math.PI / 2;
      const mAng = now.getMinutes() * (Math.PI / 30) - Math.PI / 2;
      ctx.strokeStyle = '#2b2140';
      ctx.lineCap = 'round';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(hAng) * 16, cy + Math.sin(hAng) * 16);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(mAng) * 25, cy + Math.sin(mAng) * 25);
      ctx.stroke();
      ctx.fillStyle = '#2b2140';
      for (let i = 0; i < 12; i++) fnOval(ctx, cx + Math.cos(i * Math.PI / 6) * 27, cy + Math.sin(i * Math.PI / 6) * 27, 2, 2);
    },
  },
  {
    id: 'pouf', name: 'Pouf', w: 80, h: 50, cat: 'salon',
    colors: ['#ffd166', '#ff8fb8', '#7ad3c4', '#b79cf2', '#7fb2ff'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = 'rgba(0,0,0,.12)';
      fnOval(ctx, x, y - 22, 40, 24);
      ctx.fillStyle = c;
      fnOval(ctx, x, y - 24, 38, 22);
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      fnOval(ctx, x, y - 34, 26, 9);
    },
  },
  // Dehors (la terrasse)
  {
    id: 'chaiselongue', name: 'Chaise longue', w: 200, h: 80, cat: 'dehors',
    colors: ['#7fb2ff', '#ff8fb8', '#ffd166', '#7ad3c4', '#ffb35c'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = WHITE;
      ctx.fillRect(x - 80, y - 30, 6, 30);
      ctx.fillRect(x + 70, y - 30, 6, 30);
      ctx.fillStyle = c;
      fnBox(ctx, x - 60, y - 44, 160, 18, 8);
      ctx.save();
      ctx.translate(x - 60, y - 36);
      ctx.rotate(-0.55);
      fnBox(ctx, -60, -9, 66, 18, 8);
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      for (let i = 0; i < 4; i++) ctx.fillRect(x - 40 + i * 36, y - 44, 12, 18);
    },
  },
  {
    id: 'parasol', name: 'Parasol', w: 180, h: 220, cat: 'dehors',
    colors: ['#ff8fb8', '#7fb2ff', '#ffd166', '#7ad3c4', '#ffb35c'],
    draw(ctx, x, y, c) {
      ctx.fillStyle = '#5b5368';
      ctx.fillRect(x - 3, y - 190, 6, 190);
      fnOval(ctx, x, y - 4, 22, 6);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i % 2 ? WHITE : c;
        ctx.beginPath();
        ctx.moveTo(x, y - 220);
        ctx.lineTo(x - 90 + i * 30, y - 170);
        ctx.lineTo(x - 60 + i * 30, y - 170);
        ctx.fill();
      }
    },
  },
  {
    id: 'piscine', name: 'Piscine', w: 240, h: 70, cat: 'dehors',
    colors: ['#ff8fb8', '#ffd166', '#7ad3c4', '#b79cf2', '#7fb2ff'],
    draw(ctx, x, y, c, t = 0) {
      ctx.fillStyle = c;
      fnOval(ctx, x, y - 32, 120, 34);
      ctx.fillStyle = '#7ec8f2';
      fnOval(ctx, x, y - 38, 100, 22);
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      fnOval(ctx, x - 30 + Math.sin(t * 2) * 10, y - 40, 22, 4);
      fnOval(ctx, x + 40 + Math.cos(t * 2) * 8, y - 34, 16, 3);
      ctx.fillStyle = '#ffd166';                             // bouée canard
      fnOval(ctx, x + 50, y - 44, 12, 9);
      fnOval(ctx, x + 57, y - 54, 6, 6);
    },
  },
  {
    id: 'fleurs', name: 'Jardinière', w: 130, h: 90, cat: 'dehors',
    colors: [WOOD, WHITE, '#ff8fb8', '#7fb2ff', '#5b5368'],
    draw(ctx, x, y, c) {
      const petals = ['#ff5d8f', '#ffd166', '#b79cf2', '#ff9f1c', '#ff8fb8'];
      for (let i = 0; i < 5; i++) {
        const fx = x - 48 + i * 24;
        const fy = y - 60 - (i % 2) * 14;
        ctx.fillStyle = '#4caf6a';
        ctx.fillRect(fx - 2, fy, 4, 30);
        ctx.fillStyle = petals[i];
        for (let k = 0; k < 5; k++) fnOval(ctx, fx + Math.cos(k * 1.26) * 8, fy + Math.sin(k * 1.26) * 8, 6, 6);
        ctx.fillStyle = '#fff1b8';
        fnOval(ctx, fx, fy, 4, 4);
      }
      ctx.fillStyle = c;
      fnBox(ctx, x - 65, y - 34, 130, 34, 6);
    },
  },
);

// Dans quelle pièce on range chaque meuble dans le catalogue.
const CATEGORY_OF = {
  lit: 'chambre', canape: 'salon', fauteuil: 'salon', table: 'cuisine', lampe: 'salon',
  plante: 'deco', panier: 'animal', tapis: 'deco', etagere: 'salon', tele: 'salon',
  tableau: 'deco', guirlande: 'deco',
};
for (const f of FURNITURE) f.cat ||= CATEGORY_OF[f.id] || 'deco';

export const CATEGORIES = [
  ['salon', 'Salon'], ['chambre', 'Chambre'], ['cuisine', 'Cuisine'], ['bain', 'Salle de bain'],
  ['dehors', 'Dehors'], ['animal', 'Animal'], ['deco', 'Déco'],
];

export const FURNITURE_BY_ID = Object.fromEntries(FURNITURE.map((f) => [f.id, f]));
