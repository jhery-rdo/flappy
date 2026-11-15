// Les niveaux. Pour en ajouter un, copier un bloc et changer les valeurs.
//   sky      : couleurs du ciel (haut, bas)
//   decor    : 'clouds' | 'sun' | 'stars'
//   world    : nom du monde (sert à regrouper les niveaux dans le menu)
//   paris    : couleurs de la tour Eiffel et des immeubles parisiens
//   newyork  : couleurs des gratte-ciel, de l'Empire State Building et de la statue de la Liberté
//   obstacle : kind 'baguette' ou 'hotdog', et ses couleurs
//   speed    : vitesse de défilement
//   gap      : hauteur du passage entre les baguettes (plus grand = plus facile)
//   spacing  : distance entre deux obstacles
//   bearChance : chance (de 0 à 1) qu'un ours apparaisse entre deux baguettes
//   goal     : nombre d'obstacles à passer pour gagner le niveau
const BAGUETTE = { kind: 'baguette', color: '#e3a857', edge: '#b9772f', cut: '#f8dfae' };
const HOTDOG = { kind: 'hotdog', color: '#f0b766', edge: '#c98a3e', sausage: '#d9544d', sauce: '#ffd23f' };

export const LEVELS = [
  {
    world: 'Paris', id: 'paris-matin', name: 'Paris le matin',
    sky: ['#8fd3f4', '#fdeecb'], decor: 'clouds',
    paris: { tower: '#7d6b63', wall: '#f3e6d0', roof: '#6f7f95', window: '#b9a98f', sparkle: false },
    ground: '#9aa3ad', groundTop: '#7bd389',
    obstacle: BAGUETTE,
    speed: 170, gap: 240, spacing: 330, bearChance: 0.3, goal: 10,
  },
  {
    world: 'Paris', id: 'paris-soir', name: 'Paris au coucher du soleil',
    sky: ['#ff9e7a', '#ffe0a3'], decor: 'sun',
    paris: { tower: '#5a3d4f', wall: '#e9b79a', roof: '#6b4a6e', window: '#ffe9a8', sparkle: false },
    ground: '#7a6a80', groundTop: '#c77dba',
    obstacle: BAGUETTE,
    speed: 200, gap: 215, spacing: 310, bearChance: 0.5, goal: 15,
  },
  {
    world: 'Paris', id: 'paris-nuit', name: 'Paris la nuit',
    sky: ['#141b4d', '#4a3f8f'], decor: 'stars',
    paris: { tower: '#d9a441', wall: '#2c336b', roof: '#1b2050', window: '#ffe066', sparkle: true },
    ground: '#1f2a5c', groundTop: '#4f6bd6',
    obstacle: BAGUETTE,
    speed: 230, gap: 195, spacing: 300, bearChance: 0.7, goal: 20,
  },
  {
    world: 'New York', id: 'ny-matin', name: 'New York le matin',
    sky: ['#7ec8f2', '#e6f4ff'], decor: 'clouds',
    newyork: { far: '#a9bccf', near: '#7f93ab', window: '#dbe8f5', landmark: '#8a94a6', liberty: '#6fb8a3', lit: false },
    ground: '#5b6270', groundTop: '#9aa3ad',
    obstacle: HOTDOG,
    speed: 210, gap: 215, spacing: 310, bearChance: 0.5, goal: 15,
  },
  {
    world: 'New York', id: 'ny-soir', name: 'New York au coucher du soleil',
    sky: ['#f77f6e', '#ffd39b'], decor: 'sun',
    newyork: { far: '#c98a95', near: '#8b5d7a', window: '#ffe0a3', landmark: '#6e4762', liberty: '#5aa293', lit: false },
    ground: '#4a3d55', groundTop: '#8b6d9c',
    obstacle: HOTDOG,
    speed: 235, gap: 200, spacing: 300, bearChance: 0.65, goal: 20,
  },
  {
    world: 'New York', id: 'ny-nuit', name: 'New York la nuit',
    sky: ['#0d1238', '#3b2f7a'], decor: 'stars',
    newyork: { far: '#232a5e', near: '#161b45', window: '#ffe066', landmark: '#1c2254', liberty: '#3f8f80', lit: true },
    ground: '#14183a', groundTop: '#f2c94c',
    obstacle: HOTDOG,
    speed: 255, gap: 190, spacing: 290, bearChance: 0.8, goal: 25,
  },
];
