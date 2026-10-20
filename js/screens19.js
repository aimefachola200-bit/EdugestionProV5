/* ÉduGestion Pro — cachets de toute l'application.

   Un seul modèle de cachet pour tous les échelons : trois mentions (arc supérieur,
   centre, arc inférieur, séparés par une étoile) et une encre, bleue ou rouge.
   Chaque école compose le sien ; chaque circonscription scolaire et chaque direction
   départementale aussi. Le cachet de l'émetteur se retrouve ensuite au pied de tous
   ses documents (fiches, certificats, répertoire, calendrier, cartes d'identité…).

   Adresses : cachet (le sien), cachet/ecole/<id>, cachet/territoire/<id>. */
(function (global) {
  'use strict';
  const EG = global.EG, DB = EG.DB, U = EG.UI;
  const el = U.el, Routeur = U.Routeur, E = EG.Ecrans;
  const tri = (a, b) => String(a.nom || '').localeCompare(String(b.nom || ''), 'fr', { numeric: true });
  const ROLES_ECRITURE = ['ADMIN_MEMP', 'ADMIN_TECHNIQUE', 'DDEMP', 'CS', 'DIRECTEUR'];
  const peutEditer = () => ROLES_ECRITURE.indexOf(EG.session.user.role) >= 0 && EG.peutEcrire();

  Routeur.definir('cachet', function (racine, args) {
    if (!EG.peutVoirModule('cachets')) { racine.appendChild(U.vide('Ce module n’est pas disponible pour votre compte.')); return; }
    const user = EG.session.user;
    racine.appendChild(E.entete('Cachets',
      'Trois mentions : l’arc supérieur, le centre et l’arc inférieur, séparés par une étoile. Le même modèle sert à l’école, à la circonscription et à la direction départementale.'));

    /* Un compte d'école n'a que le cachet de son école ; les autres alternent entre territoire et école. */
    const ecoleFixe = EG.session.ecole_id || null;
    let actif = args && args[0] === 'ecole' ? 'ecole' : args && args[0] === 'territoire' ? 'territoire'
      : (ecoleFixe || user.role === 'DIRECTEUR' ? 'ecole' : 'territoire');
    const choix = { ecole_id: (args && args[0] === 'ecole' && args[1]) || '', cs: '', territoire_id: (args && args[0] === 'territoire' && args[1]) || '' };

    const zoneOnglets = el('div'), zoneChoix = el('div'), zone = el('div');
    racine.appendChild(zoneOnglets); racine.appendChild(zoneChoix); racine.appendChild(zone);

    function onglets() {
      zoneOnglets.textContent = '';
      if (ecoleFixe) return;
      zoneOnglets.appendChild(E.barreOnglets([['territoire', '🏢 Circonscription ou direction'], ['ecole', '🏫 École']], actif, code => {
        actif = code; onglets(); montrer();
      }));
    }

    function montrer() {
      zoneChoix.textContent = ''; zone.textContent = '';
      if (actif === 'ecole') montrerEcole(); else montrerTerritoire();
    }

    /* ---------- école ---------- */

    function montrerEcole() {
      const etat = { ecole_id: choix.ecole_id, cs: choix.cs };
      E.selecteurEcole.preparerEcoles(etat).then(() => {
        const redessiner = rebarre => {
          if (rebarre) E.selecteurEcole.barreEcole(zoneChoix, etat, redessiner, false);
          choix.ecole_id = etat.ecole_id; choix.cs = etat.cs;
          etat.ecole = etat.liste.filter(e => e.id === etat.ecole_id)[0] || null;
          zone.textContent = '';
          if (!etat.liste.length) { zone.appendChild(U.vide('Aucune école dans votre périmètre.')); return; }
          if (!etat.ecole) { zone.appendChild(U.vide('Choisissez une école pour composer son cachet.')); return; }
          editeur(etat.ecole, {
            table: 'ecoles', action: 'CACHET_ECOLE',
            defauts: e => ({ haut: e.cachet_haut || 'RÉPUBLIQUE DU BÉNIN', centre: e.cachet_centre || 'LE DIRECTEUR', bas: e.cachet_bas || e.nom }),
            dessiner: (e, v, taille) => EG.Docs.cachet(Object.assign({}, e, { cachet_haut: v.haut, cachet_centre: v.centre, cachet_bas: v.bas, cachet_couleur: v.couleur }), { taille }),
            aide: ['Il s’inscrit en haut du cercle, en majuscules.', 'C’est la mention qui apparaît au milieu du cachet.', 'Il suit la courbe du bas ; au-delà de 34 caractères il est abrégé.'],
            suite: [el('button', { class: 'btn btn-fantome', text: 'Certificats du personnel', onclick: () => Routeur.aller('certificats') }),
              el('button', { class: 'btn btn-fantome', text: 'Carte d’identité de l’école', onclick: () => Routeur.aller('carte-ecole/' + etat.ecole.id) })],
            apres: () => Routeur.aller('cachet/ecole/' + etat.ecole.id)
          });
        };
        E.selecteurEcole.barreEcole(zoneChoix, etat, redessiner, false);
        redessiner(false);
      });
    }

    /* ---------- circonscription ou département ---------- */

    function montrerTerritoire() {
      E.contexteCS().then(ctx => {
        let sujets = ctx.csList.slice();
        if (user.role === 'DDEMP' || user.role === 'ADMIN_MEMP' || user.role === 'ADMIN_TECHNIQUE') {
          const deps = ctx.terr.filter(t => t.type === 'DEPARTEMENT' && (ctx.complet || t.id === ctx.p.dep));
          sujets = deps.sort(tri).concat(sujets);
        }
        if (!sujets.length) { zone.appendChild(U.vide('Aucune circonscription dans votre périmètre.')); return; }
        if (!choix.territoire_id || !sujets.some(t => t.id === choix.territoire_id)) choix.territoire_id = sujets[0].id;
        const dessinerSujet = () => {
          zone.textContent = '';
          const t = ctx.index[choix.territoire_id];
          editeur(t, {
            table: 'territoires', action: 'CACHET_TERRITOIRE',
            defauts: x => { const m = EG.Docs.mentionsTerritoire(x); return { haut: x.cachet_haut || m.haut, centre: x.cachet_centre || m.centre, bas: x.cachet_bas || m.bas }; },
            dessiner: (x, v, taille) => EG.Docs.cachetTerritoire(Object.assign({}, x, { cachet_haut: v.haut, cachet_centre: v.centre, cachet_bas: v.bas, cachet_couleur: v.couleur }), { taille }),
            aide: ['Il s’inscrit en haut du cercle, en majuscules.', 'Par exemple : LE CHEF DE CIRCONSCRIPTION.', 'Il suit la courbe du bas ; au-delà de 34 caractères il est abrégé.'],
            suite: [el('button', { class: 'btn btn-fantome', text: 'Espace de la circonscription', onclick: () => Routeur.aller('espace-cs/' + (t.type === 'CIRCONSCRIPTION' ? t.id : '')) })],
            apres: () => Routeur.aller('cachet/territoire/' + t.id)
          });
        };
        if (sujets.length > 1) {
          zoneChoix.appendChild(el('div', { class: 'barre-filtres' }, U.selecteur('Circonscription ou département',
            sujets.map(t => ({ value: t.id, label: (t.type === 'DEPARTEMENT' ? 'Département — ' : '') + t.nom })), choix.territoire_id,
            v => { choix.territoire_id = v; dessinerSujet(); }, { vide: false })));
        } else zoneChoix.appendChild(el('div', { class: 'barre-filtres' }, el('span', { class: 'badge info', text: sujets[0].nom })));
        dessinerSujet();
      });
    }

    /* ---------- éditeur commun ---------- */

    function editeur(rec, cfg) {
      const d = cfg.defauts(rec);
      const champ = (etiquette, valeur, aide) => {
        const c = el('input', { type: 'text', value: valeur || '' });
        return { noeud: el('div', { class: 'champ' }, [el('label', { text: etiquette }), c, aide ? el('span', { class: 'muet petit', text: aide }) : null]), controle: c };
      };
      const haut = champ('Texte de l’arc supérieur', d.haut, cfg.aide[0]);
      const centre = champ('Texte central', d.centre, cfg.aide[1]);
      const bas = champ('Texte de l’arc inférieur', d.bas, cfg.aide[2]);
      let couleur = rec.cachet_couleur || 'BLEU';
      const apercu = el('div', { class: 'apercu-cachet' });
      const valeurs = () => ({ haut: haut.controle.value, centre: centre.controle.value, bas: bas.controle.value, couleur });
      const dessinerApercu = () => { apercu.innerHTML = cfg.dessiner(rec, valeurs(), 190); };
      [haut, centre, bas].forEach(c => c.controle.addEventListener('input', dessinerApercu));

      const boutons = el('div', { class: 'choix-couleur' }, [['BLEU', 'Bleu'], ['ROUGE', 'Rouge']].map(([code, libelle]) => {
        const b = el('button', { class: 'pastille-couleur ' + code.toLowerCase() + (couleur === code ? ' actif' : ''), text: libelle, 'aria-pressed': couleur === code ? 'true' : 'false' });
        b.addEventListener('click', () => {
          couleur = code;
          Array.prototype.forEach.call(boutons.children, (x, i) => {
            const c = ['BLEU', 'ROUGE'][i];
            x.className = 'pastille-couleur ' + c.toLowerCase() + (couleur === c ? ' actif' : '');
            x.setAttribute('aria-pressed', couleur === c ? 'true' : 'false');
          });
          dessinerApercu();
        });
        return b;
      }));

      zone.appendChild(U.carte('Composer le cachet — ' + rec.nom, el('div', { class: 'editeur-cachet' }, [
        el('div', { class: 'formulaire' }, [haut.noeud, centre.noeud, bas.noeud, el('div', { class: 'champ' }, [el('label', { text: 'Couleur de l’encre' }), boutons])]),
        el('div', {}, [apercu, el('p', { class: 'muet petit', text: 'Aperçu à l’échelle d’impression.' })])
      ])));
      dessinerApercu();

      const actions = [];
      if (peutEditer()) actions.push(el('button', {
        class: 'btn btn-primaire', text: 'Enregistrer le cachet', onclick: () => {
          const v = valeurs();
          DB.put(cfg.table, Object.assign({}, rec, { cachet_haut: v.haut, cachet_centre: v.centre, cachet_bas: v.bas, cachet_couleur: v.couleur }))
            .then(() => DB.audit(cfg.action, cfg.table, rec.id, { couleur: v.couleur }))
            .then(() => { U.toast('Cachet enregistré'); EG.majSynchro(); cfg.apres(); });
        }
      }));
      cfg.suite.forEach(b => actions.push(b));
      zone.appendChild(el('div', { class: 'barre-actions' }, actions));
      zone.appendChild(el('p', { class: 'muet petit',
        text: 'Ce cachet est apposé, avec la signature du responsable, au pied des documents édités : fiches, certificats, cartes d’identité, répertoire, calendrier et exports imprimés.' }));
    }

    onglets();
    montrer();
  });
})(window);
