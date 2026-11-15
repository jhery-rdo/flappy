// Sauvegarde (personnage choisi, niveaux débloqués, meilleurs scores).
const KEY = 'flappy-save-v1';
const DEFAULTS = { char: 0, level: 0, unlocked: 0, best: {}, candies: 0, sound: true,
  custom: null,   // le personnage qu'on a fabriqué soi-même
  house: null,    // la maison à New York (murs, sol, meubles)
  pet: null,      // l'animal de compagnie
};

export function loadSave() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch { /* le jeu marche aussi sans sauvegarde */ }
}
