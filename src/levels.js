// Les niveaux. Pour en ajouter un, copier un bloc et changer les valeurs.
//   sky      : couleurs du ciel (haut, bas)
//   decor    : 'clouds' | 'sun' | 'stars'
//   speed    : vitesse de défilement
//   gap      : hauteur du passage entre les obstacles (plus grand = plus facile)
//   spacing  : distance entre deux obstacles
//   goal     : nombre d'obstacles à passer pour gagner le niveau
export const LEVELS = [
  {
    id: 'bonbons', name: 'Vallée des bonbons',
    sky: ['#9be7e0', '#fdf3c4'], decor: 'clouds',
    ground: '#f4a261', groundTop: '#7bd389',
    obstacle: { color: '#ff6f91', stripe: '#ffc2d1', cap: '#d94672' },
    speed: 170, gap: 240, spacing: 330, goal: 10,
  },
  {
    id: 'soir', name: 'Coucher de soleil',
    sky: ['#ff9e7a', '#ffe0a3'], decor: 'sun',
    ground: '#8d5a97', groundTop: '#c77dba',
    obstacle: { color: '#5b3f8c', stripe: '#8a6bc0', cap: '#3d2866' },
    speed: 200, gap: 215, spacing: 310, goal: 15,
  },
  {
    id: 'nuit', name: 'Nuit étoilée',
    sky: ['#141b4d', '#4a3f8f'], decor: 'stars',
    ground: '#1f2a5c', groundTop: '#4f6bd6',
    obstacle: { color: '#3ddbd9', stripe: '#b5fffb', cap: '#17a2a0' },
    speed: 230, gap: 195, spacing: 300, goal: 20,
  },
];
