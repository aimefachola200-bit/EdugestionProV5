/* ÉduGestion Pro — socle des pièces officielles.
   Cachet, codes QR, signatures et en-têtes : les briques communes à
   toutes les pièces éditées. Ce fichier ne connaît aucun modèle particulier. */
(function (global) {
  'use strict';
  const EG = global.EG, DB = EG.DB, U = EG.UI;
  EG.Docs = EG.Docs || {};

  const el = U.el;

  const echapper = v => String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /** Chemin absolu d'une ressource, utilisable depuis une fenêtre d'impression. */
  function ressource(nom) {
    return (global.location && location.href)
      ? new URL('assets/' + nom, location.href).href : 'assets/' + nom;
  }

  /* =======================================================================
     Cachet de l'établissement
     ======================================================================= */

  /**
   * Cachet circulaire dessiné à la volée à partir des données de l'école.
   * Il n'a pas valeur de sceau humide : il identifie l'émetteur et se vérifie
   * par le numéro et l'empreinte portés en pied de document.
   */
  const COULEURS_CACHET = { BLEU: '#1B4D8F', ROUGE: '#B3121D' };

  /**
   * Cachet de l'établissement, entièrement paramétrable : texte de l'arc
   * supérieur, texte central, texte de l'arc inférieur, les deux arcs étant
   * séparés par une petite étoile. Chaque directeur saisit ses propres mentions
   * et choisit l'encre, bleue ou rouge.
   */
  function cachet(ecole, options) {
    options = options || {};
    ecole = ecole || {};
    const encre = COULEURS_CACHET[options.couleur || ecole.cachet_couleur || 'BLEU'] || COULEURS_CACHET.BLEU;
    const haut = (options.haut || ecole.cachet_haut || 'RÉPUBLIQUE DU BÉNIN').toUpperCase();
    const centre = options.centre || ecole.cachet_centre || 'LE DIRECTEUR';
    const brut = options.bas || ecole.cachet_bas || ecole.nom || 'ÉCOLE';
    const bas = brut.length > 34 ? brut.slice(0, 33) + '…' : brut;
    const taille = options.taille || 118;
    const id = 'c' + Math.random().toString(36).slice(2, 8);

    /* Les deux étoiles marquent la césure entre l'arc du haut et celui du bas. */
    const etoile = (x, y, r) => '<path transform="translate(' + x + ' ' + y + ') scale(' + (r / 10) + ')"'
      + ' d="M0 -10 L2.9 -3.1 10.4 -3.1 4.3 1.5 6.7 8.8 0 4.4 -6.7 8.8 -4.3 1.5 -10.4 -3.1 -2.9 -3.1 Z"'
      + ' fill="' + encre + '"/>';

    /* Les deux arcs de texte courent tous les deux sur le même anneau, entre
       le cercle extérieur (r 94) et le cercle intérieur (r 80) — exactement
       comme sur les cachets de l'application de gestion des CS — avec une
       courte coupure de part et d'autre de chaque étoile pour que le texte
       ne les chevauche pas. */
    return '<svg class="cachet" width="' + taille + '" height="' + taille + '" viewBox="0 0 200 200"'
      + ' xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cachet — ' + echapper(centre) + '">'
      + '<defs>'
      + '<path id="h' + id + '" d="M 16.9,77.7 A 86,86 0 0 1 183.1,77.7"/>'
      + '<path id="b' + id + '" d="M 16.9,122.3 A 86,86 0 0 0 183.1,122.3"/>'
      + '</defs>'
      + '<circle cx="100" cy="100" r="94" fill="none" stroke="' + encre + '" stroke-width="4"/>'
      + '<circle cx="100" cy="100" r="80" fill="none" stroke="' + encre + '" stroke-width="1.5"/>'
      + '<text font-size="' + (haut.length > 26 ? 8.5 : 10) + '" font-weight="700" fill="' + encre + '"'
      + ' text-anchor="middle" font-family="Helvetica, Arial, sans-serif" letter-spacing="0.3">'
      + '<textPath href="#h' + id + '" startOffset="50%">' + echapper(haut) + '</textPath></text>'
      + '<text font-size="' + (bas.length > 26 ? 7.5 : 9) + '" font-weight="600" fill="' + encre + '"'
      + ' text-anchor="middle" font-family="Helvetica, Arial, sans-serif" letter-spacing="0.3">'
      + '<textPath href="#b' + id + '" startOffset="50%">' + echapper(bas) + '</textPath></text>'
      + etoile(14, 100, 7) + etoile(186, 100, 7)
      + '<text x="100" y="' + (centre.length > 18 ? 96 : 100) + '" font-size="'
      + (centre.length > 24 ? 11 : (centre.length > 14 ? 13.5 : 17)) + '" font-weight="700" fill="' + encre + '"'
      + ' text-anchor="middle" font-family="Helvetica, Arial, sans-serif" letter-spacing="0.5">'
      + echapper(centre.length > 30 ? centre.slice(0, 29) + '…' : centre) + '</text>'
      + (ecole.code_ecole ? '<text x="100" y="' + (centre.length > 18 ? 118 : 120) + '" font-size="10"'
        + ' font-weight="600" fill="' + encre + '" text-anchor="middle"'
        + ' font-family="Helvetica, Arial, sans-serif">' + echapper(ecole.code_ecole) + '</text>' : '')
      + '</svg>';
  }

  /* =======================================================================
     Code QR de vérification
     ======================================================================= */

  /** Adresse de vérification portée par chaque pièce éditée. */
  function adresseVerification(numero, empreinte) {
    /* Chemin explicite plutôt qu'une réécriture d'URL : la page fonctionne ainsi
       sur n'importe quel hébergement statique, y compris GitHub Pages. */
    const base = (global.location && location.origin && location.origin !== 'null')
      ? location.origin + location.pathname.replace(/[^/]*$/, '')
      : 'https://edugestion.bj/';
    return base + 'verification.html?n=' + encodeURIComponent(numero)
      + (empreinte ? '#' + empreinte : '');
  }

  /** QR code d'un document : il mène à l'adresse de vérification. */
  function qrDocument(numero, empreinte, taille) {
    try {
      return '<div class="bloc-qr">' + EG.QR.svg(adresseVerification(numero, empreinte),
        { taille: taille || 82, niveau: 'M', description: 'Vérification du document ' + numero })
        + '<span>Vérifier</span></div>';
    } catch (e) { return ''; }
  }

  /** QR code d'un élève : identité minimale, lisible par un lecteur ordinaire. */
  function qrEleve(eleve, ins, ecole, annee, taille) {
    const charge = [
      'EGP-ELEVE',
      (eleve.educmaster_matricule || eleve.id || '').slice(0, 36),
      ((eleve.nom || '') + ' ' + (eleve.prenoms || '')).trim(),
      eleve.sexe || '',
      eleve.date_naissance || '',
      ins ? ins.niveau : '',
      ecole ? (ecole.code_ecole || ecole.nom) : '',
      annee || ''
    ].join('|');
    try {
      return EG.QR.svg(charge, { taille: taille || 76, niveau: 'M', description: 'Identité de l’élève' });
    } catch (e) { return ''; }
  }

  /* =======================================================================
     Signature numérique
     ======================================================================= */

  /** Une case de signature : mention, tracé s'il existe, nom en dessous. */
  function caseSignature(personne, mention) {
    const image = personne && personne.signature_image
      ? '<img class="signature-trace" src="' + personne.signature_image + '" alt="Signature">'
      : '<div class="signature-vide">Signature manuscrite</div>';
    return '<div class="signature-case">'
      + '<div class="signature-mention">' + echapper(mention || '') + '</div>'
      + image
      + '<div class="signature-nom">'
      + echapper((((personne && personne.prenoms) || '') + ' ' + ((personne && personne.nom) || '')).trim())
      + '</div></div>';
  }

  /**
   * Pied de signature. Le titulaire de la classe y figure à gauche pour toute
   * pièce rattachée à son cours : c'est lui qui répond de ce qui y est écrit.
   */
  function blocSignature(user, ecole, mention, titulaire) {
    return '<div class="bloc-signature">'
      + (titulaire ? caseSignature(titulaire, 'Le titulaire de la classe') : '')
      + caseSignature(user, mention === '' ? '' : (mention || 'Le directeur'))
      + '<div class="cachet-case">' + cachet(ecole) + '</div>'
      + '</div>';
  }

  /* -----------------------------------------------------------------------
     Cachet et visa des circonscriptions et des directions départementales.
     Même modèle que le cachet d'école : arc supérieur, centre, arc inférieur,
     encre bleue ou rouge ; seules les mentions par défaut changent.
     ----------------------------------------------------------------------- */

  /** Mentions par défaut d'un territoire : circonscription scolaire ou direction départementale. */
  function mentionsTerritoire(t) {
    t = t || {};
    const nu = String(t.nom || '').replace(/^(CS|DDEMP)\s+/i, '').toUpperCase();
    /* Le centre du cachet reste court (14 caractères au plus) pour tenir dans le cercle intérieur. */
    if (t.type === 'DEPARTEMENT') {
      const dir = 'DIRECTION DÉPARTEMENTALE ' + nu;
      return { haut: 'RÉPUBLIQUE DU BÉNIN', centre: 'LE DDEMP', bas: dir.length > 34 ? 'DDEMP ' + nu : dir };
    }
    const long = 'CIRCONSCRIPTION SCOLAIRE DE ' + nu;
    return { haut: 'RÉPUBLIQUE DU BÉNIN', centre: 'LE CHEF DE CS', bas: long.length > 34 ? 'CS DE ' + nu : long };
  }

  /** Cachet d'une circonscription (type CIRCONSCRIPTION) ou d'un département (DDEMP). */
  function cachetTerritoire(t, options) {
    t = t || {};
    const m = mentionsTerritoire(t);
    return cachet({
      cachet_haut: t.cachet_haut || m.haut, cachet_centre: t.cachet_centre || m.centre,
      cachet_bas: t.cachet_bas || m.bas, cachet_couleur: t.cachet_couleur || 'BLEU', nom: m.bas
    }, options);
  }

  /** Bloc « Fait à …, le … » puis signature et cachet de l'école, prêt à clore un document. */
  function visaEcole(ecole, mention) {
    ecole = ecole || {};
    return '<p class="fait-a">Fait à ' + echapper(ecole.commune || ecole.ville || '……………………') + ', le ' + '……………………' + '</p>'
      + blocSignature({ nom: ecole.directeur_nom || '' }, ecole, mention || 'Le directeur');
  }

  /** Même chose pour une circonscription ou une direction départementale. */
  function visaTerritoire(t, mention) {
    t = t || {};
    return '<p class="fait-a">Fait à ' + echapper(t.ville || '……………………') + ', le ' + '……………………' + '</p>'
      + '<div class="bloc-signature">'
      + caseSignature({ nom: t.responsable || '' }, mention || (t.type === 'DEPARTEMENT' ? 'Le Directeur départemental' : 'Le Chef de la circonscription scolaire'))
      + '<div class="cachet-case">' + cachetTerritoire(t) + '</div></div>';
  }

  /**
   * Capture d'une signature au doigt ou à la souris. Sert au responsable qui
   * édite, mais aussi à l'apprenant et à l'enseignant, dont la signature est
   * ensuite apposée sur les pièces qui les concernent.
   * options : { table, titre, mention }
   */
  function capturerSignature(enregistrement, apres, options) {
    options = options || {};
    const table = options.table || 'users';
    const user = enregistrement;
    const largeur = 520, hauteur = 200;
    const toile = U.el('canvas', { width: largeur, height: hauteur, class: 'toile-signature',
      'aria-label': 'Zone de signature' });
    const ctx = toile.getContext('2d');
    ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#17201B';
    let trace = false, vide = true;

    if (user && user.signature_image) {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, largeur, hauteur); vide = false; };
      img.src = user.signature_image;
    }

    function point(e) {
      const r = toile.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      return { x: (src.clientX - r.left) * (largeur / r.width), y: (src.clientY - r.top) * (hauteur / r.height) };
    }
    function debut(e) { e.preventDefault(); trace = true; vide = false; const p = point(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
    function bouge(e) { if (!trace) return; e.preventDefault(); const p = point(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }
    function fin() { trace = false; }
    ['mousedown', 'touchstart'].forEach(t => toile.addEventListener(t, debut, { passive: false }));
    ['mousemove', 'touchmove'].forEach(t => toile.addEventListener(t, bouge, { passive: false }));
    ['mouseup', 'mouseleave', 'touchend'].forEach(t => toile.addEventListener(t, fin));

    U.modal(options.titre || 'Ma signature', U.el('div', {}, [
      U.el('p', { class: 'muet', text: options.mention
        || 'Signez avec le doigt ou la souris. La signature est conservée sur cet appareil et apposée sur les documents que vous éditez.' }),
      toile,
      U.el('p', { class: 'muet petit', text: 'Elle vaut identification de l’émetteur, pas signature électronique qualifiée : chaque document reste vérifiable par son numéro et son empreinte.' })
    ]), fermer => [
      U.el('button', { class: 'btn btn-fantome', text: 'Annuler', onclick: fermer }),
      U.el('button', {
        class: 'btn btn-fantome', text: 'Effacer', onclick: () => {
          ctx.clearRect(0, 0, largeur, hauteur); vide = true;
        }
      }),
      U.el('button', {
        class: 'btn btn-primaire', text: 'Enregistrer', onclick: () => {
          if (vide) { U.toast('La zone de signature est vide', 'attention'); return; }
          const image = toile.toDataURL('image/png');
          DB.put(table, Object.assign({}, user, { signature_image: image }))
            .then(enregistre => {
              if (table === 'users' && EG.session.user.id === enregistre.id) EG.session.user = enregistre;
              return DB.audit('SIGNATURE_ENREGISTREE', table, enregistre.id);
            })
            .then(() => { fermer(); U.toast('Signature enregistrée'); EG.majSynchro(); if (apres) apres(); });
        }
      })
    ]);
  }

  /* =======================================================================
     En-tête officiel
     ======================================================================= */

  /** Bandeau du ministère, repris du modèle transmis par la DDEMP. */
  function enteteMEMP(departement, service) {
    const logo = (global.location && location.href)
      ? new URL('assets/entete-memp.jpg', location.href).href : 'assets/entete-memp.jpg';
    return '<div class="entete-memp">'
      + '<img src="' + logo + '" alt="Ministère des Enseignements Maternel et Primaire — République du Bénin">'
      + '<div class="entete-coordonnees">'
      + '01 BP 10 Porto-Novo<br>Tél. : +229 20 21 52 22 • Fax : +229 20 21 52 22<br>'
      + 'E-mail : mempmatprim@gmail.com</div>'
      + '</div>'
      + '<div class="entete-direction">Direction Départementale des Enseignements Maternel et Primaire : '
      + '<strong>' + echapper(departement || '—') + '</strong><br>'
      + echapper(service || 'Service des Examens et Concours') + '</div>';
  }

  /**
   * En-tête administratif court, apposé sur toutes les pièces éditées qui n'ont
   * pas déjà leur propre en-tête officiel.
   */
  function enteteAdministratif(ecole, contexte) {
    contexte = contexte || {};
    return '<div class="entete-admin">'
      + '<img class="entete-armoiries" src="' + ressource('armoiries-benin.png')
      + '" alt="Armoiries de la République du Bénin">'
      + '<div class="entete-admin-centre">'
      + '<strong>RÉPUBLIQUE DU BÉNIN</strong>'
      + '<span>Ministère des Enseignements Maternel et Primaire</span>'
      + (contexte.departement ? '<span>Direction Départementale de ' + echapper(contexte.departement) + '</span>' : '')
      + (contexte.circonscription ? '<span>Circonscription scolaire de '
        + echapper(String(contexte.circonscription).replace(/^CS\s+/i, '')) + '</span>' : '')
      + '<span class="entete-ecole">' + echapper(ecole ? ecole.nom : '') + '</span>'
      + '</div>'
      + '<img class="entete-logo" src="' + ressource('entete-memp.jpg')
      + '" alt="Ministère des Enseignements Maternel et Primaire">'
      + '</div>';
  }

  Object.assign(EG.Docs, {
    echapper, ressource, cachet, COULEURS_CACHET, cachetTerritoire, mentionsTerritoire, visaEcole, visaTerritoire,
    adresseVerification, qrDocument, qrEleve,
    caseSignature, blocSignature, capturerSignature,
    enteteMEMP, enteteAdministratif
  });
})(window);
