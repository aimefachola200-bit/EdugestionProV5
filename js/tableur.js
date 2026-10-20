/* ÉduGestion Pro — classeurs Excel (.xlsx), lus et écrits sur l'appareil.
   Aucune bibliothèque : un fichier .xlsx est une archive ZIP contenant du XML.
   L'écriture se fait sans compression, la lecture accepte les deux méthodes. */
(function (global) {
  'use strict';
  const EG = global.EG;

  /* ---------------- CRC32 et archive ZIP ---------------- */
  const TABLE_CRC = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(u8) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < u8.length; i++) c = TABLE_CRC[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  const encodeur = new TextEncoder();
  const decodeur = new TextDecoder();

  function motsDate(d) {
    const heure = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31);
    const date = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
    return { heure, date };
  }

  /** Assemble une archive ZIP « stockée » (sans compression) à partir d'entrées texte. */
  function zipper(entrees) {
    const { heure, date } = motsDate(new Date());
    const morceaux = [];
    const central = [];
    let decalage = 0;

    entrees.forEach(e => {
      const nom = encodeur.encode(e.nom);
      const contenu = encodeur.encode(e.contenu);
      const somme = crc32(contenu);

      const entete = new DataView(new ArrayBuffer(30));
      entete.setUint32(0, 0x04034b50, true);
      entete.setUint16(4, 20, true);
      entete.setUint16(6, 0x0800, true); // noms de fichiers en UTF-8
      entete.setUint16(8, 0, true);      // méthode : stockage
      entete.setUint16(10, heure, true);
      entete.setUint16(12, date, true);
      entete.setUint32(14, somme, true);
      entete.setUint32(18, contenu.length, true);
      entete.setUint32(22, contenu.length, true);
      entete.setUint16(26, nom.length, true);
      entete.setUint16(28, 0, true);
      morceaux.push(new Uint8Array(entete.buffer), nom, contenu);

      const cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true);
      cd.setUint16(4, 20, true);
      cd.setUint16(6, 20, true);
      cd.setUint16(8, 0x0800, true);
      cd.setUint16(10, 0, true);
      cd.setUint16(12, heure, true);
      cd.setUint16(14, date, true);
      cd.setUint32(16, somme, true);
      cd.setUint32(20, contenu.length, true);
      cd.setUint32(24, contenu.length, true);
      cd.setUint16(28, nom.length, true);
      cd.setUint32(42, decalage, true);
      central.push(new Uint8Array(cd.buffer), nom);

      decalage += 30 + nom.length + contenu.length;
    });

    const tailleCentral = central.reduce((s, m) => s + m.length, 0);
    const fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true);
    fin.setUint16(8, entrees.length, true);
    fin.setUint16(10, entrees.length, true);
    fin.setUint32(12, tailleCentral, true);
    fin.setUint32(16, decalage, true);

    return new Blob(morceaux.concat(central, [new Uint8Array(fin.buffer)]),
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /** Ouvre une archive ZIP et rend le contenu texte de chaque entrée. */
  function dezipper(tampon) {
    const vue = new DataView(tampon);
    const octets = new Uint8Array(tampon);
    let finCentral = -1;
    for (let i = octets.length - 22; i >= 0 && i > octets.length - 66000; i--) {
      if (vue.getUint32(i, true) === 0x06054b50) { finCentral = i; break; }
    }
    if (finCentral < 0) return Promise.reject(new Error('Archive illisible'));

    const nombre = vue.getUint16(finCentral + 10, true);
    let position = vue.getUint32(finCentral + 16, true);
    const entrees = [];
    for (let i = 0; i < nombre; i++) {
      if (vue.getUint32(position, true) !== 0x02014b50) break;
      const methode = vue.getUint16(position + 10, true);
      const tailleComp = vue.getUint32(position + 20, true);
      const longueurNom = vue.getUint16(position + 28, true);
      const longueurExtra = vue.getUint16(position + 30, true);
      const longueurCom = vue.getUint16(position + 32, true);
      const debutLocal = vue.getUint32(position + 42, true);
      const nom = decodeur.decode(octets.subarray(position + 46, position + 46 + longueurNom));

      const nomLocal = vue.getUint16(debutLocal + 26, true);
      const extraLocal = vue.getUint16(debutLocal + 28, true);
      const debutDonnees = debutLocal + 30 + nomLocal + extraLocal;
      entrees.push({ nom, methode, donnees: octets.subarray(debutDonnees, debutDonnees + tailleComp) });
      position += 46 + longueurNom + longueurExtra + longueurCom;
    }

    return Promise.all(entrees.map(e => {
      if (e.methode === 0) return Promise.resolve({ nom: e.nom, texte: decodeur.decode(e.donnees) });
      if (typeof DecompressionStream === 'undefined') {
        return Promise.reject(new Error('Ce navigateur ne sait pas décompresser le fichier. Enregistrez-le au format CSV depuis Excel.'));
      }
      const flux = new Blob([e.donnees]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return new Response(flux).text().then(texte => ({ nom: e.nom, texte }));
    })).then(liste => {
      const parNom = {};
      liste.forEach(x => { parNom[x.nom] = x.texte; });
      return parNom;
    });
  }

  /* ---------------- Construction du classeur ---------------- */
  const echapper = v => String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/\x00-\x08\x0b\x0c\x0e-\x1f/g, '');

  function colonne(n) {
    let s = '';
    n += 1;
    while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }

  function feuilleXML(lignes) {
    const corps = lignes.map((ligne, i) => {
      const cellules = ligne.map((valeur, j) => {
        const ref = colonne(j) + (i + 1);
        if (valeur === null || valeur === undefined || valeur === '') return '';
        if (typeof valeur === 'number' && isFinite(valeur)) {
          return '<c r="' + ref + '"><v>' + valeur + '</v></c>';
        }
        return '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">'
          + echapper(valeur) + '</t></is></c>';
      }).join('');
      return '<row r="' + (i + 1) + '">' + cellules + '</row>';
    }).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
      + '<sheetData>' + corps + '</sheetData></worksheet>';
  }

  /** feuilles = [{ nom, lignes: [[cellule, …], …] }] */
  function construire(feuilles) {
    const noms = feuilles.map((f, i) => (f.nom || ('Feuille' + (i + 1))).slice(0, 28).replace(/[\\\/\?\*\[\]:]/g, ' '));

    const entrees = [
      {
        nom: '[Content_Types].xml',
        contenu: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
          + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
          + '<Default Extension="xml" ContentType="application/xml"/>'
          + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
          + feuilles.map((f, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1)
            + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')
          + '</Types>'
      },
      {
        nom: '_rels/.rels',
        contenu: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
          + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
          + '</Relationships>'
      },
      {
        nom: 'xl/workbook.xml',
        contenu: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'
          + ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
          + noms.map((n, i) => '<sheet name="' + echapper(n) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join('')
          + '</sheets></workbook>'
      },
      {
        nom: 'xl/_rels/workbook.xml.rels',
        contenu: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
          + feuilles.map((f, i) => '<Relationship Id="rId' + (i + 1)
            + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'
            + (i + 1) + '.xml"/>').join('')
          + '</Relationships>'
      }
    ];
    feuilles.forEach((f, i) => entrees.push({
      nom: 'xl/worksheets/sheet' + (i + 1) + '.xml', contenu: feuilleXML(f.lignes || [])
    }));
    return zipper(entrees);
  }

  /* ---------------- Lecture ---------------- */
  function analyserFeuille(xml, chaines) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const lignes = [];
    Array.prototype.forEach.call(doc.getElementsByTagName('row'), tr => {
      const numero = parseInt(tr.getAttribute('r'), 10) || (lignes.length + 1);
      const ligne = [];
      Array.prototype.forEach.call(tr.getElementsByTagName('c'), c => {
        const ref = c.getAttribute('r') || '';
        const lettres = ref.replace(/[0-9]/g, '');
        let index = 0;
        for (let i = 0; i < lettres.length; i++) index = index * 26 + (lettres.charCodeAt(i) - 64);
        index = Math.max(0, index - 1);
        const type = c.getAttribute('t');
        let valeur = '';
        if (type === 'inlineStr') {
          const t = c.getElementsByTagName('t')[0];
          valeur = t ? t.textContent : '';
        } else {
          const v = c.getElementsByTagName('v')[0];
          valeur = v ? v.textContent : '';
          if (type === 's') valeur = chaines[parseInt(valeur, 10)] || '';
        }
        ligne[index] = valeur;
      });
      lignes[numero - 1] = ligne;
    });
    for (let i = 0; i < lignes.length; i++) if (!lignes[i]) lignes[i] = [];
    return lignes;
  }

  function analyserChaines(xml) {
    if (!xml) return [];
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    return Array.prototype.map.call(doc.getElementsByTagName('si'), si =>
      Array.prototype.map.call(si.getElementsByTagName('t'), t => t.textContent).join(''));
  }

  /** Découpe un CSV en tenant compte des guillemets et du séparateur employé. */
  function analyserCSV(texte) {
    const sansBOM = texte.replace(/^\uFEFF/, '');
    const premiere = sansBOM.split(/\r?\n/)[0] || '';
    const sep = (premiere.split(';').length > premiere.split(',').length) ? ';' : ',';
    const lignes = [];
    let ligne = [], champ = '', entreGuillemets = false;
    for (let i = 0; i < sansBOM.length; i++) {
      const c = sansBOM[i];
      if (entreGuillemets) {
        if (c === '"' && sansBOM[i + 1] === '"') { champ += '"'; i++; }
        else if (c === '"') entreGuillemets = false;
        else champ += c;
      } else if (c === '"') entreGuillemets = true;
      else if (c === sep) { ligne.push(champ); champ = ''; }
      else if (c === '\n') { ligne.push(champ); lignes.push(ligne); ligne = []; champ = ''; }
      else if (c !== '\r') champ += c;
    }
    if (champ !== '' || ligne.length) { ligne.push(champ); lignes.push(ligne); }
    return lignes;
  }

  /** Lit un fichier .xlsx ou .csv et rend un tableau de lignes. */
  function lire(fichier) {
    const nom = (fichier.name || '').toLowerCase();
    if (nom.endsWith('.csv') || nom.endsWith('.txt')) {
      return fichier.text().then(analyserCSV);
    }
    return fichier.arrayBuffer()
      .then(dezipper)
      .then(parties => {
        const chaines = analyserChaines(parties['xl/sharedStrings.xml']);
        const nomFeuille = Object.keys(parties).filter(n => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort()[0];
        if (!nomFeuille) throw new Error('Aucune feuille de calcul dans ce fichier.');
        return analyserFeuille(parties[nomFeuille], chaines);
      });
  }

  EG.Tableur = { construire, lire, zipper, dezipper, analyserCSV };
})(window);
