// Les niveaux. Pour en ajouter un, copier un bloc et changer les valeurs.
//   sky      : couleurs du ciel (haut, bas)
//   decor    : 'clouds' | 'sun' | 'stars'
//   paris    : couleurs de la tour Eiffel et des immeubles (enlever pour un monde sans Paris)
//   obstacle : couleurs de la baguette (croûte, bord, entailles)
//   speed    : vitesse de défilement
//   gap      : hauteur du passage entre les baguettes (plus grand = plus facile)
//   spacing  : distance entre deux obstacles
//   bearChance : chance (de 0 à 1) qu'un ours apparaisse entre deux baguettes
//   goal     : nombre d'obstacles à passer pour gagner le niveau
const BAGUETTE = { color: '#e3a857', edge: '#b9772f', cut: '#f8dfae' };

export const LEVELS = [
  {
    id: 'paris-matin', name: 'Paris le matin',
    sky: ['#8fd3f4', '#fdeecb'], decor: 'clouds',
    paris: { tower: '#7d6b63', wall: '#f3e6d0', roof: '#6f7f95', window: '#b9a98f', sparkle: false },
    ground: '#9aa3ad', groundTop: '#7bd389',
    obstacle: BAGUETTE,
    speed: 170, gap: 240, spacing: 330, bearChance: 0.3, goal: 10,
  },
  {
    id: 'paris-soir', name: 'Paris au coucher du soleil',
    sky: ['#ff9e7a', '#ffe0a3'], decor: 'sun',
    paris: { tower: '#5a3d4f', wall: '#e9b79a', roof: '#6b4a6e', window: '#ffe9a8', sparkle: false },
    ground: '#7a6a80', groundTop: '#c77dba',
    obstacle: BAGUETTE,
    speed: 200, gap: 215, spacing: 310, bearChance: 0.5, goal: 15,
  },
  {
    id: 'paris-nuit', name: 'Paris la nuit',
    sky: ['#141b4d', '#4a3f8f'], decor: 'stars',
    paris: { tower: '#d9a441', wall: '#2c336b', roof: '#1b2050', window: '#ffe066', sparkle: true },
    ground: '#1f2a5c', groundTop: '#4f6bd6',
    obstacle: BAGUETTE,
    speed: 230, gap: 195, spacing: 300, bearChance: 0.7, goal: 20,
  },
];
