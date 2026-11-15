// Réglages généraux du jeu. Toutes les distances sont en "unités de jeu" :
// l'écran fait toujours 720 unités de haut, quelle que soit la taille de l'appareil.
export const CONFIG = {
  title: 'Vole, Pompon !',
  viewHeight: 720,
  gravity: 1700,        // force qui tire le personnage vers le bas
  flapVelocity: -520,   // élan vers le haut à chaque tape
  maxFallSpeed: 760,
  groundHeight: 96,
  playerRadius: 26,
  hitboxScale: 0.78,    // < 1 = collisions plus gentilles
  obstacleWidth: 86,
};
