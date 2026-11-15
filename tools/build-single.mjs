// Fabrique une version "un seul fichier" du jeu (pratique pour le partager ou le prévisualiser).
// Usage : node tools/build-single.mjs [fichier-de-sortie]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.argv[2] || `${root}/build/jeu.html`);
const read = (p) => readFileSync(`${root}/${p}`, 'utf8');

// Ordre = dépendances d'abord.
const modules = ['config', 'characters', 'levels', 'storage', 'audio', 'render', 'furniture', 'pets', 'creator', 'house', 'main'];
const js = modules
  .map((m) => read(`src/${m}.js`).replace(/^import .*$/gm, '').replace(/^export /gm, ''))
  .join('\n');

const html = read('index.html');
const body = html.split('<!-- BODY:START -->')[1].split('<!-- BODY:END -->')[0];
const title = html.match(/<title>.*<\/title>/)[0];

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${title}
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap">
<style>
${read('style.css')}
</style>
${body}
<script>
(() => {
${js}
})();
</script>
`);
console.log('OK ->', out);
