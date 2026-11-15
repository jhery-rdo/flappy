// L'atelier pour fabriquer son propre personnage.
import { drawCharacter } from './characters.js';
import { writeSave } from './storage.js';

export const CUSTOM_DEFAULT = {
  id: 'custom', name: 'Mon perso',
  hair: '#ffd84d', hairStyle: 'long', eyes: '#3b9cff', skin: '#ffdcc2',
  top: { style: 'bedaine', color: '#ff7eb6' }, bottom: { style: 'short', color: '#4f86d9' },
  shoes: '#ffffff', accessory: 'aucun', accessoryColor: '#ff5d8f',
};

// Les choix possibles, rangés par onglet. `key` dit quelle partie du personnage change.
const CR_TABS = [
  { label: 'Cheveux', rows: [
    { label: 'Couleur', key: 'hair', colors: ['#ffd84d', '#f5e6a8', '#a0693d', '#4a2f22', '#1f1a24', '#e8743b', '#ff8fc7', '#8fb8ff'] },
    { label: 'Coiffure', key: 'hairStyle', choices: [['long', 'Longs'], ['couettes', 'Couettes'], ['chignon', 'Chignon'], ['queue', 'Queue de cheval'], ['court', 'Courts']] },
  ] },
  { label: 'Yeux et peau', rows: [
    { label: 'Yeux', key: 'eyes', colors: ['#3b9cff', '#2ec27e', '#8b5a2b', '#9b6bff', '#5b5368'] },
    { label: 'Peau', key: 'skin', colors: ['#ffe6d5', '#ffdcc2', '#f1c09b', '#d9a066', '#a8714a', '#7a4b2e'] },
  ] },
  { label: 'Vêtements', rows: [
    { label: 'Haut', key: 'top.style', choices: [['bedaine', 'Chandail bedaine'], ['large', 'Grand chandail']] },
    { label: 'Couleur du haut', key: 'top.color', colors: ['#ff7eb6', '#b79cf2', '#63d6c0', '#ffa55c', '#ffd84d', '#7fb2ff', '#ffffff', '#3d3846'] },
    { label: 'Bas', key: 'bottom.style', choices: [['short', 'Short'], ['jogging', 'Jogging'], ['jupe', 'Jupe']] },
    { label: 'Couleur du bas', key: 'bottom.color', colors: ['#4f86d9', '#a9adb8', '#ff7eb6', '#3d3846', '#b79cf2', '#63d6c0', '#ffffff'] },
    { label: 'Chaussures', key: 'shoes', colors: ['#ffffff', '#ff5d8f', '#3d3846', '#ffd84d', '#7fb2ff'] },
  ] },
  { label: 'Accessoires', rows: [
    { label: 'Accessoire', key: 'accessory', choices: [['aucun', 'Rien'], ['lunettes', 'Lunettes'], ['chapeau', 'Chapeau'], ['noeud', 'Nœud'], ['serre-tete', 'Serre-tête'], ['couronne', 'Couronne']] },
    { label: 'Couleur', key: 'accessoryColor', colors: ['#ff5d8f', '#ffd166', '#7b6cf6', '#2ec4b6', '#3d3846', '#ffffff'] },
  ] },
];

const crGet = (obj, key) => key.split('.').reduce((o, k) => o[k], obj);
function crSet(obj, key, value) {
  const parts = key.split('.');
  const last = parts.pop();
  parts.reduce((o, k) => o[k], obj)[last] = value;
}

function crEl(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

let crTab = 0;

export function openCreator(save, onClose) {
  const screen = document.getElementById('creator');
  const preview = document.getElementById('cr-preview');
  const nameInput = document.getElementById('cr-name');
  const tabs = document.getElementById('cr-tabs');
  const options = document.getElementById('cr-options');
  if (!save.custom) save.custom = structuredClone(CUSTOM_DEFAULT);
  const c = save.custom;

  function drawPreview() {
    const size = preview.clientWidth || 240;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    preview.width = preview.height = Math.round(size * dpr);
    const ctx = preview.getContext('2d');
    ctx.scale(preview.width / 300, preview.height / 300);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath();
    ctx.ellipse(150, 268, 80, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    drawCharacter(ctx, c, 150, 160, 92, 0, -1.2);
  }

  function changed() {
    writeSave(save);
    drawPreview();
    renderOptions();
  }

  function renderTabs() {
    tabs.replaceChildren();
    CR_TABS.forEach((t, i) => {
      const b = crEl('button', 'tab', t.label);
      b.setAttribute('aria-pressed', i === crTab);
      b.onclick = () => { crTab = i; renderTabs(); renderOptions(); };
      tabs.append(b);
    });
  }

  function renderOptions() {
    options.replaceChildren();
    for (const row of CR_TABS[crTab].rows) {
      const wrap = crEl('div', 'cr-row');
      wrap.append(crEl('h3', null, row.label));
      const list = crEl('div', 'cr-choices');
      const current = crGet(c, row.key);
      if (row.colors) {
        for (const col of row.colors) {
          const b = crEl('button', 'swatch-btn');
          b.style.background = col;
          b.setAttribute('aria-label', `${row.label} ${col}`);
          b.setAttribute('aria-pressed', col === current);
          b.onclick = () => { crSet(c, row.key, col); changed(); };
          list.append(b);
        }
      } else {
        for (const [value, label] of row.choices) {
          const b = crEl('button', 'chip', label);
          b.setAttribute('aria-pressed', value === current);
          b.onclick = () => { crSet(c, row.key, value); changed(); };
          list.append(b);
        }
      }
      wrap.append(list);
      options.append(wrap);
    }
  }

  nameInput.value = c.name;
  nameInput.oninput = () => { c.name = nameInput.value.trim() || 'Mon perso'; writeSave(save); };
  const close = () => { screen.hidden = true; window.removeEventListener('resize', drawPreview); onClose(); };
  document.getElementById('cr-done').onclick = close;
  document.getElementById('cr-back').onclick = close;
  window.addEventListener('resize', drawPreview);

  screen.hidden = false;
  renderTabs();
  renderOptions();
  drawPreview();
}
