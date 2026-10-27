/* ÉduGestion Pro Master — Bureaux UASCEP (module commun js/uascep.js, le même que CS Pobè, Mon école, MEMP-CP et DOSP).

   uascep   membres et responsables des bureaux de l'UASCEP par école, unité pédagogique, zone pédagogique,
            circonscription et direction départementale : ajouter, modifier, supprimer, réinitialiser (l'ancien
            bureau gardé dans « Anciens bureaux »), renouvellement, synthèse, impression / PDF, Excel (export et
            import, mêmes colonnes dans toutes les applications).

   Périmètre : directeur = le bureau de son école (son UP et sa zone en consultation) ; conseiller pédagogique =
   sa zone ; circonscription = ses écoles, UP, zones et la circonscription ; DDEMP = son département ;
   administration = tout. Données : méta « uascep » (sauvegardée et restaurée avec le reste de la base). */
(function (global) {
  'use strict';
  const EG = global.EG, DB = EG.DB, U = EG.UI;
  const el = U.el, Routeur = U.Routeur, E = EG.Ecrans;
  const sa = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function contexte() {
    return Promise.all([DB.all('territoires'), DB.all('ecoles')]).then(([terr, ecoles]) => {
      const index = E.indexer(terr), user = EG.session.user, P = EG.Perimetre, role = user.role;
      const directeur = !!EG.session.ecole_id;
      let p, ecolesP;
      if (directeur) {
        const ec = ecoles.find(e => e.id === EG.session.ecole_id);
        ecolesP = ec ? [ec] : [];
        p = { zone: ec && ec.zone_id, cs: ec && ec.territoire_id, dep: ec ? P.departementDe(ec, index) : null, bloque: !ec };
      } else { p = P.portee(user, index); ecolesP = p.bloque ? [] : ecoles.filter(e => P.dansPortee(e, p, index)); }
      const anc = (t, type) => P.ancetre(index, t.id, type);
      const dansP = (t) => {
        if (p.bloque) return false;
        if (directeur) return t.type === 'ZONE_PEDAGOGIQUE' ? t.id === p.zone : t.type === 'UNITE_PEDAGOGIQUE' ? ecolesP.some(e => e.up_id === t.id) : false;
        if (p.zone) return t.id === p.zone || (anc(t, 'ZONE_PEDAGOGIQUE') || {}).id === p.zone;
        if (p.cs) return t.id === p.cs || (anc(t, 'CIRCONSCRIPTION') || {}).id === p.cs;
        if (p.dep) return t.id === p.dep || (anc(t, 'DEPARTEMENT') || {}).id === p.dep;
        return true;
      };
      const tri = (a, b) => String(a.lib).localeCompare(String(b.lib), 'fr', { numeric: true });
      const zones = terr.filter(t => t.type === 'ZONE_PEDAGOGIQUE' && dansP(t)).map(t => ({ cle: t.id, lib: t.nom, zone: t.id, alias: [t.code].filter(Boolean) })).sort(tri);
      const multiZ = zones.length > 1;
      const ups = terr.filter(t => t.type === 'UNITE_PEDAGOGIQUE' && dansP(t)).map(t => {
        const z = anc(t, 'ZONE_PEDAGOGIQUE');
        return { cle: t.id, lib: t.nom + (multiZ && z ? ' — ' + z.nom : ''), nomUp: t.nom, up: t.nom, zone: z ? z.id : '', rup: t.responsable || '', alias: [t.nom, t.code].filter(Boolean) };
      }).sort(tri);
      const ecolesE = ecolesP.map(e => {
        const up = e.up_id ? index[e.up_id] : null;
        return { cle: e.id, lib: e.nom, ecole: e.nom, zone: e.zone_id || '', up: up ? up.nom : '', rup: up ? up.responsable || '' : '', alias: [e.code, e.code_educmaster].filter(Boolean) };
      }).sort(tri);
      const css = directeur ? [] : terr.filter(t => t.type === 'CIRCONSCRIPTION' && dansP(t)).map(t => ({ cle: t.id, lib: /circonscription/i.test(t.nom) ? t.nom : 'Circonscription scolaire de ' + t.nom, alias: [t.nom, t.code].filter(Boolean) })).sort(tri);
      const deps = directeur ? [] : terr.filter(t => t.type === 'DEPARTEMENT' && (!p.dep ? !p.cs && !p.zone : t.id === p.dep)).map(t => ({ cle: t.id, lib: 'DDEMP ' + t.nom, alias: [t.nom, 'DDEMP du ' + t.nom, t.code].filter(Boolean) })).sort(tri);
      const NIV = { DIRECTEUR: ['ECOLE', 'UP', 'ZONE'], CONSEILLER_PEDAGOGIQUE: ['ECOLE', 'UP', 'ZONE'], CS: ['ECOLE', 'UP', 'ZONE', 'CS'], DDEMP: ['ECOLE', 'UP', 'ZONE', 'CS', 'DDEMP'] };
      const niveaux = directeur ? ['ECOLE', 'UP', 'ZONE'] : (NIV[role] || ['ECOLE', 'UP', 'ZONE', 'CS', 'DDEMP']);
      const peutEcrire = EG.peutEcrire();
      const ecrire = (niv) => peutEcrire && (directeur ? niv === 'ECOLE' : niveaux.indexOf(niv) >= 0);
      const lieuT = directeur ? (p.cs && index[p.cs]) : (p.cs ? index[p.cs] : p.dep ? index[p.dep] : null);
      return { niveaux, lieu: lieuT ? String(lieuT.nom).replace(/^(circonscription( scolaire)?|cs)\s+(de\s+)?/i, '') : '', fixe: { zone: directeur || !!p.zone },
        entites: { ECOLE: ecolesE, UP: ups, ZONE: zones, CS: css, DDEMP: deps }, droits: { ecrire } };
    });
  }

  Routeur.definir('uascep', function (racine) {
    if (!EG.peutVoirModule('uascep')) { racine.appendChild(U.vide('Ce module n’est pas ouvert à votre compte.')); return; }
    racine.appendChild(E.entete('Bureaux UASCEP', 'Membres et responsables des bureaux de l’UASCEP par école, unité pédagogique, zone pédagogique, circonscription et département.'));
    const zone = el('div'); racine.appendChild(zone);
    if (!global.UASCEP) { zone.appendChild(U.vide('Module indisponible : rechargez l’application.')); return; }
    global.UASCEP.monter(zone, {
      app: 'ÉduGestion Pro Master', sansTitre: true,
      charger: () => DB.meta('uascep'),
      enregistrer: (etat) => DB.setMeta('uascep', etat).then(() => { if (EG.majSynchro) EG.majSynchro(); }),
      contexte,
      toast: (m) => U.toast(m),
      memo: { get: (k) => { try { return localStorage.getItem('eg.uascep.' + k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem('eg.uascep.' + k, v); } catch (e) { /* indisponible */ } } },
      imprimer: (titre, corps) => EG.Sortie.imprimer(titre, corps, { paysage: true }),
      xlsxEcrire: (feuilles) => Promise.resolve(global.XlsxEcrire.classeur(feuilles)),
      xlsxLire: (f) => EG.Tableur.lireClasseur(f).then(fs => fs.map(x => ({ nom: x.nom || x.name, lignes: x.lignes || x.rows || [] }))),
      telecharger: (nom, blob) => EG.Sortie.enregistrer(nom, blob)
    }).catch(e => { console.error(e); zone.appendChild(U.vide('Le module n’a pas pu s’ouvrir.')); });
  });

  EG.Uascep = { contexte };
})(window);
