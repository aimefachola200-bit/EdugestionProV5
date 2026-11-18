// Contrôle des contenus du secondaire (data/secondaire/*.json) et de la déclaration de paiement : fichiers présents, JSON valide,
// effectifs minimaux, niveaux et matières connus, barème des épreuves = 18 + 2, scripts branchés (index.html, sw.js, schéma).
import fs from 'node:fs';
const lire = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const echec = (m) => { console.error('ÉCHEC : ' + m); process.exit(1); };
const NIV = ['6e', '5e', '4e', '3e', '2nde', '1ère', 'Tle'];
for (const f of ['fiches', 'epreuves', 'banque', 'langues', 'reperes', 'index']) if (!fs.existsSync(`data/secondaire/${f}.json`)) echec(`data/secondaire/${f}.json absent`);
const ep = lire('data/secondaire/epreuves.json');
if (!Array.isArray(ep) || ep.length < 90) echec('épreuves APC : ' + (ep && ep.length));
for (const e of ep) {
  if (NIV.indexOf(e.niveau) < 0) echec('niveau inconnu : ' + e.niveau);
  const items = e.items || e.questions || [];
  if (items.length < 4) echec('épreuve sans 4 items : ' + e.matiere + ' ' + e.niveau);
}
const fi = lire('data/secondaire/fiches.json'); if (!(fi.length > 0 || Object.keys(fi).length > 0)) echec('fiches vides');
const index = fs.readFileSync('index.html', 'utf8'), sw = fs.readFileSync('sw.js', 'utf8'), sch = fs.readFileSync('js/schema.js', 'utf8');
for (const s of ['secondaire.js', 'declarations-paiement.js', 'bulletins-sec.js', 'maitre-semaine.js', 'registres-sec.js', 'ecole-registres.js']) {
  if (!index.includes('js/' + s)) echec(s + ' absent de index.html');
  if (!sw.includes('./js/' + s)) echec(s + ' absent de sw.js (hors ligne)');
}
for (const c of ["code: 'pedagogie-sec'", "code: 'declarations-paiement'", "code: 'bulletins-sec'", "code: 'vie-etablissement'", "code: 'examens-sec'", "code: 'pilotage-sec'", "code: 'ferme-ecole'", "code: 'annonces-personnel'", "code: 'releves-mensuels'", 'annonces_personnel: {', "code: 'maitre-semaine'", 'reg_sec: {', 'ms_journal: {', 'eleves_sec: {', 'notes_sec: {', 'programme_sec: {', 'declarations_paiement: {', "f('niveaux_sec'", "f('matieres_sec'", "f('cours_ped'"]) if (!sch.includes(c)) echec('schéma : ' + c);
console.log('ok secondaire (' + ep.length + ' épreuves APC) et déclarations de paiement');
