# Vole, Pompon !

Un jeu pour iPhone / iPad où l'on tape sur l'écran pour faire voler un petit personnage entre des obstacles.
C'est une application web (PWA) : pas besoin de Mac ni de Xcode, elle s'ouvre dans Safari et peut
s'installer sur l'écran d'accueil (bouton Partager → « Sur l'écran d'accueil ») pour jouer en plein écran, même hors ligne.

## Lancer le jeu sur son ordinateur

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000

## Où changer quoi

| Je veux changer…                         | Fichier             |
| ---------------------------------------- | ------------------- |
| les personnages (couleurs, oreilles…)    | `src/characters.js` |
| les niveaux (décor, vitesse, difficulté) | `src/levels.js`     |
| le nom du jeu, la gravité, la taille     | `src/config.js`     |
| le dessin du décor et des obstacles      | `src/render.js`     |
| les sons                                 | `src/audio.js`      |
| les règles du jeu et les menus           | `src/main.js`       |
| l'apparence des menus                    | `style.css`         |

## Version en un seul fichier

```bash
node tools/build-single.mjs
```

Crée `build/jeu.html`, qui contient tout le jeu (pratique pour le partager).
