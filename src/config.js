// Réglages généraux du jeu. Toutes les distances sont en "unités de jeu" :
// l'écran fait toujours 720 unités de haut, quelle que soit la taille de l'appareil.
export const CONFIG = {
  title: 'Le plus beau des vols',
  viewHeight: 720,
  gravity: 1400,        // force qui tire le personnage vers le bas
  flapVelocity: -470,   // élan vers le haut à chaque tape
  maxFallSpeed: 650,
  groundHeight: 96,
  playerRadius: 30,
  hitboxScale: 0.65,    // < 1 = collisions plus gentilles
  obstacleWidth: 62,
  unlockAll: true,      // true = tous les niveaux sont ouverts (pour tester) ; false = il faut les gagner dans l'ordre
  hearts: 5,
  friendGift: 10,       // avec une amie : tous les 10 bonbons, elle te redonne un coeur            // nombre de coeurs au début d'un niveau
  invincibleTime: 2,  // secondes de protection après avoir perdu un coeur
  bearRadius: 30,
  candyRadius: 16,
};
