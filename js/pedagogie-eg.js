/* ÉduGestion Pro Master — module « Pédagogie » (moteur commun js/pedagogie.js, le même que CS Pobè, Mon école, MEMP-CP et DOSP) :
   programmes, guides, progressions annuelles, fiches de préparation, résumés, épreuves avec corrigés et planification
   jour / semaine / mois du CI au CM2. Contenus de SCOLARIS livrés avec l'espace CP (memp-cp/data/pedagogie/), chargés à la
   demande et gardés hors ligne. Lecture pour tous les comptes de l'école et de l'encadrement ; le directeur, le conseiller
   pédagogique, la circonscription, la DDEMP et l'administration ajoutent des notes (méta « pedagogieNotes »).
   L'enseignant arrive directement sur le cours de sa classe.
   Conception : Maître Aimé FACHE */
(function (global) {
  'use strict';
  const EG = global.EG, DB = EG.DB, U = EG.UI, E = EG.Ecrans;
  const ANNOTENT = ['ADMIN_MEMP', 'ADMIN_TECHNIQUE', 'DDEMP', 'CS', 'CONSEILLER_PEDAGOGIQUE', 'DIRECTEUR'];
  const COURS = ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];
  const sansAccent = (t) => String(t || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

  /** Cours de la classe de l'enseignant (titulaire dont le nom est celui du compte), sinon rien */
  function coursDuCompte() {
    const u = EG.session.user || {};
    if (u.role !== 'ENSEIGNANT') return Promise.resolve(null);
    return Promise.all([DB.all('personnels').catch(() => []), DB.all('classes').catch(() => [])]).then(([pers, cls]) => {
      const moi = pers.filter(p => (!EG.session.ecole_id || p.ecole_id === EG.session.ecole_id) && sansAccent(p.nom) === sansAccent(u.nom) && (!u.prenoms || sansAccent(p.prenoms) === sansAccent(u.prenoms))).map(p => p.id);
      const c = cls.find(x => moi.indexOf(x.titulaire_id) >= 0 && (!EG.session.annee_id || x.annee_scolaire_id === EG.session.annee_id) && COURS.indexOf(x.niveau) >= 0);
      return c ? c.niveau : null;
    });
  }
  function adaptateur(cours) {
    const u = EG.session.user || {};
    const liens = [{ l: 'Évaluations', route: 'evaluations', icone: 'fiche' }, { l: 'CEP et examens blancs', route: 'cep', icone: 'stade' }];
    if (EG.peutVoirModule('visites')) liens.unshift({ l: 'Visites et recommandations', route: 'visites', icone: 'inspection' });
    if (EG.peutVoirModule('pvs-examens')) liens.push({ l: 'Examens et concours', route: 'pvs-examens', icone: 'examen' });
    if (EG.peutVoirModule('documents-officiels')) liens.push({ l: 'Documents officiels', route: 'documents-officiels', icone: 'document' });
    return {
      app: 'ÉduGestion Pro Master', base: 'memp-cp/data/pedagogie/', coursParDefaut: cours || undefined,
      peutAnnoter: ANNOTENT.indexOf(u.role) >= 0, auteur: ((u.prenoms || '') + ' ' + (u.nom || '')).trim(),
      notes: { charger: () => DB.meta('pedagogieNotes').then(v => v || {}), enregistrer: (o) => DB.setMeta('pedagogieNotes', o).then(() => { if (EG.majSynchro) EG.majSynchro(); }) },
      imprimer: (titre, html, o) => EG.Sortie.imprimer(titre, html, { paysage: false, enTete: o && o.epreuve ? false : undefined }),
      memo: { get: (k) => { try { return localStorage.getItem('eg.ped.' + k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem('eg.ped.' + k, v); } catch (e) { /* indisponible */ } } },
      liens, ouvrir: (route) => { location.hash = '#/' + route; },
      examenBlanc: EG.peutEcrire() && u.role !== 'ENSEIGNANT' ? { lire: () => DB.meta('examenBlancSujets'), retenir: (s) => DB.setMeta('examenBlancSujets', s) } : undefined
    };
  }

  U.Routeur.definir('pedagogie', function (racine) {
    if (!EG.peutVoirModule('pedagogie')) { racine.appendChild(U.vide('Ce module n’est pas ouvert à votre compte.')); return; }
    racine.appendChild(E.entete('Pédagogie', 'Programmes, guides, progressions annuelles, fiches de préparation, résumés, épreuves avec corrigés et planification du CI au CM2.'));
    const zone = U.el('div'); racine.appendChild(zone);
    if (!global.Pedagogie) { zone.appendChild(U.vide('Module indisponible : rechargez l’application.')); return; }
    coursDuCompte().catch(() => null).then(c => global.Pedagogie.monter(zone, adaptateur(c), { cours: c || undefined }))
      .catch(e => { console.error(e); zone.appendChild(U.vide('Le module n’a pas pu s’ouvrir.')); });
  });
  EG.Pedagogie = { adaptateur };
})(window);
