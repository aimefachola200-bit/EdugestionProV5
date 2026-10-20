/* ÉduGestion Pro — modèles de pièces officielles.
   Carte scolaire, certificat de scolarité, fiche d'inscription au CEP et
   fiche d'évaluation de l'agent. Chaque modèle s'appuie sur le socle. */
(function (global) {
  'use strict';
  const EG = global.EG, DB = EG.DB, U = EG.UI;
  EG.Docs = EG.Docs || {};

  const el = U.el;
  const D = EG.Docs;
  const echapper = D.echapper, ressource = D.ressource, cachet = D.cachet,
    qrEleve = D.qrEleve, caseSignature = D.caseSignature, enteteMEMP = D.enteteMEMP;

  /* =======================================================================
     Carte d'identité scolaire
     ======================================================================= */

  /**
   * Verso de la carte : la photo de l'école, sa localisation dans le territoire
   * et la consigne à suivre en cas de perte. Il se remplit tout seul à partir
   * de la fiche de l'établissement.
   */
  function carteScolaireVerso(eleve, ins, ecole, annee, numero, contexte) {
    contexte = contexte || {};
    ecole = ecole || {};
    const sceau = ressource('armoiries-benin.png');
    const nom = ecole.nom || '—';

    const localisation = [
      ['DDEMP', contexte.departement],
      ['Circonscription scolaire', contexte.circonscription],
      ['Commune', ecole.commune],
      ['Arrondissement', ecole.arrondissement],
      ['Village / quartier', ecole.village_quartier]
    ].filter(([, v]) => v).map(([k, v]) =>
      '<tr><td>' + echapper(k) + '</td><th>' + echapper(v) + '</th></tr>').join('');

    const contact = [ecole.telephone, ecole.directeur_telephone, ecole.email]
      .filter(Boolean).join(' · ');

    const visuel = ecole.photo
      ? '<img class="verso-photo" src="' + ecole.photo + '" alt="' + echapper(nom) + '">'
      : '<div class="verso-photo verso-photo-absente">'
        + '<svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
        + '<rect x="6" y="30" width="108" height="34" fill="#E6F5EE" stroke="#008751" stroke-width="1.6"/>'
        + '<path d="M2 32 L60 8 L118 32 Z" fill="#008751"/>'
        + '<rect x="18" y="42" width="14" height="22" fill="#fff" stroke="#008751" stroke-width="1"/>'
        + '<rect x="44" y="42" width="14" height="14" fill="#fff" stroke="#008751" stroke-width="1"/>'
        + '<rect x="70" y="42" width="14" height="14" fill="#fff" stroke="#008751" stroke-width="1"/>'
        + '<rect x="94" y="42" width="12" height="22" fill="#fff" stroke="#008751" stroke-width="1"/>'
        + '<path d="M56 14 L60 4 L64 14 Z" fill="#FCD116"/>'
        + '</svg><small>Photo de l’école à ajouter dans sa fiche</small></div>';

    return '<div class="carte-scolaire carte-verso">'
      + '<div class="carte-interieur">'
      + '<img class="carte-filigrane" src="' + sceau + '" alt="">'
      + '<div class="verso-titre">' + echapper(nom) + '</div>'
      + visuel
      + '<table class="verso-localisation"><tbody>' + localisation + '</tbody></table>'
      + '<div class="verso-mention">'
      + '<strong>Cette carte est la propriété de ' + echapper(nom) + '.</strong>'
      + '<span>En cas de perte, prière de la déposer à l’école ou au poste de police le plus proche.'
      + (contact ? ' Contact : ' + echapper(contact) + '.' : '')
      + '</span></div>'
      + '<div class="carte-pied"><span>N° ' + echapper(numero) + '</span>'
      + '<span>Année scolaire ' + echapper(annee) + '</span></div>'
      + '</div></div>';
  }

  /**
   * Carte d'identité scolaire, du CI au CM2 comme en maternelle.
   * Pourtour aux couleurs nationales, armoiries et drapeau en tête, sceau en
   * filigrane, et deux emplacements de signature : l'élève et le directeur.
   */
  function carteScolaire(eleve, ins, ecole, annee, numero, signataire) {
    const initiales = (((eleve.prenoms || ' ')[0] || '') + ((eleve.nom || ' ')[0] || '')).toUpperCase();
    const sceau = ressource('armoiries-benin.png');

    const signature = (personne, mention) => '<div class="carte-signature">'
      + (personne && personne.signature_image
        ? '<img src="' + personne.signature_image + '" alt="Signature">'
        : '<span class="carte-signature-vide"></span>')
      + '<small>' + echapper(mention) + '</small></div>';

    return '<div class="carte-scolaire">'
      + '<div class="carte-interieur">'
      + '<img class="carte-filigrane" src="' + sceau + '" alt="">'

      + '<div class="carte-bandeau">'
      + '<img class="carte-sceau" src="' + sceau + '" alt="Armoiries de la République du Bénin">'
      + '<div class="carte-bandeau-texte">'
      + '<strong>RÉPUBLIQUE DU BÉNIN</strong>'
      + '<span>Ministère des Enseignements Maternel et Primaire</span>'
      + '</div>'
      + '<span class="carte-drapeau" aria-label="Drapeau du Bénin"></span>'
      + '</div>'

      + '<div class="carte-titre">CARTE D’IDENTITÉ SCOLAIRE · ' + echapper(annee) + '</div>'

      + '<div class="carte-corps">'
      + '<div class="carte-photo"><span>' + echapper(initiales) + '</span><small>Photo</small></div>'
      + '<table class="carte-champs"><tbody>'
      + '<tr><td>Nom</td><th>' + echapper((eleve.nom || '').toUpperCase()) + '</th></tr>'
      + '<tr><td>Prénoms</td><th>' + echapper(eleve.prenoms) + '</th></tr>'
      + '<tr><td>Né(e) le</td><th>' + (eleve.date_naissance ? echapper(U.dateCourte(eleve.date_naissance)) + ' à ' + echapper(eleve.lieu_naissance || '—') : '&nbsp;')
      + '</th></tr>'
      + '<tr><td>Sexe</td><th>' + (eleve.sexe === 'F' ? 'Féminin' : eleve.sexe === 'M' ? 'Masculin' : (eleve.nom ? 'Masculin' : '☐ M &nbsp; ☐ F')) + '</th></tr>'
      + '<tr><td>Classe</td><th>' + echapper(ins.niveau) + '</th></tr>'
      + '<tr><td>École</td><th>' + echapper(ecole ? ecole.nom : '—') + '</th></tr>'
      + '<tr><td>Matricule</td><th>' + echapper(eleve.educmaster_matricule || eleve.npi || 'en cours') + '</th></tr>'
      + '</tbody></table>'
      + '<div class="carte-qr">' + qrEleve(eleve, ins, ecole, annee, 68) + '</div>'
      + '</div>'

      + '<div class="carte-signatures">'
      + signature(eleve, 'L’élève')
      + '<div class="carte-cachet">' + cachet(ecole, { taille: 54 }) + '</div>'
      + signature(signataire, 'Le Directeur')
      + '</div>'

      + '<div class="carte-pied"><span>N° ' + echapper(numero) + '</span>'
      + '<span>Valable pour l’année scolaire ' + echapper(annee) + '</span></div>'
      + '</div></div>';
  }

  /* =======================================================================
     Certificat de scolarité — un exemplaire par feuille A4
     ======================================================================= */

  /**
   * Certificat de scolarité, un exemplaire par feuille A4.
   * Il porte les insignes du ministère, le NIP et le matricule EDUCMaster,
   * puis la signature du directeur et le cachet de l'établissement.
   */
  function certificatScolarite(eleve, ins, ecole, annee, numero, contexte, appreciations, signataire) {
    appreciations = appreciations || {};
    const p = v => '<span class="pointilles">' + echapper(v || '') + '</span>';

    return '<div class="certificat">'
      + '<div class="cert-entete">'
      + '<div class="cert-armoiries"><img src="' + ressource('entete-memp.jpg')
      + '" alt="Ministère des Enseignements Maternel et Primaire — République du Bénin"></div>'
      + '<div class="cert-colonnes">'
      + '<div class="cert-gauche">DIRECTION DÉPARTEMENTALE DES<br>ENSEIGNEMENTS MATERNEL ET PRIMAIRE<br>DE '
      + p(contexte.departement) + '</div>'
      + '<div class="cert-droite">CIRCONSCRIPTION SCOLAIRE<br>DE : ' + p(contexte.circonscription)
      + '<div class="cert-etoiles">*-*-*-*-*-*-*-*</div>'
      + 'EM/EPP DE : ' + p(ecole ? ecole.nom : '') + '</div>'
      + '</div></div>'

      + '<h2 class="cert-titre">CERTIFICAT DE SCOLARITÉ</h2>'
      + '<p class="cert-numero">N° ' + p(numero) + '</p>'

      + '<div class="cert-corps">'
      + '<p>L… Direct……. de l’EM/EPP de : ' + p(ecole ? ecole.nom : '') + '</p>'
      + '<p>Certifie que l’élève : ' + p(((eleve.nom || '').toUpperCase() + ' ' + (eleve.prenoms || '')).trim()) + '</p>'
      + '<p>Né(e) le ' + p(U.dateCourte(eleve.date_naissance)) + ' à ' + p(eleve.lieu_naissance) + '</p>'
      + '<p>Commune de : ' + p(eleve.commune_naissance || contexte.commune)
      + ' fils(fille) de ' + p(eleve.nom_pere) + '</p>'
      + '<p>et de ' + p(eleve.nom_mere) + '</p>'
      + '<p>Est effectivement inscrit(e) dans ladite école sous le numéro matricule '
      + p(eleve.matricule_ecole || eleve.npi) + '</p>'
      + '<p>depuis le ' + p(U.dateCourte(ins.date_inscription))
      + ' et y poursuit actuellement ses études en Classe de ' + p(ins.niveau) + '</p>'
      + '<p class="cert-appreciations">Avec les appréciations suivantes :<br>'
      + '— ASSIDUITÉ ' + p(appreciations.assiduite) + '<br>'
      + '— CONDUITE ' + p(appreciations.conduite) + '<br>'
      + '— TRAVAIL ' + p(appreciations.travail) + '</p>'
      + '<table class="cert-identite"><tbody>'
      + '<tr><td>NIP</td><th>' + echapper(eleve.npi || '—') + '</th>'
      + '<td rowspan="2" class="cert-qr">' + qrEleve(eleve, ins, ecole, annee, 70) + '</td></tr>'
      + '<tr><td>MATRICULE EDUCMASTER</td><th>' + echapper(eleve.educmaster_matricule || '—') + '</th></tr>'
      + '</tbody></table>'
      + '<p class="cert-sous-titre">Observations particulières</p>'
      + '<p>' + p(appreciations.observations) + '</p>'
      + '<p>' + p('') + '</p>'
      + '<p class="cert-lieu">' + echapper(contexte.commune || '') + ', le '
      + echapper(U.dateCourte(new Date().toISOString())) + '</p>'
      + '</div>'
      + '<div class="bloc-signature cert-signature">'
      + caseSignature(signataire, 'Le Directeur')
      + '<div class="cachet-case">' + cachet(ecole) + '</div>'
      + '</div>'
      + '</div>';
  }

  /* =======================================================================
     Fiche d'évaluation de l'agent — modèle de la Direction de
     l'Administration et des Finances
     ======================================================================= */

  /* Les onze critères notés, avec leur barème et leur regroupement. */
  const CRITERES_EVALUATION = [
    { groupe: 'Compétence professionnelle', total: 8, criteres: [
      { code: 'realisation', nom: 'Taux de réalisation des attentes assignées à l’agent', bareme: 8 }
    ] },
    { groupe: 'Conscience professionnelle', total: 7, criteres: [
      { code: 'ponctualite', nom: 'Ponctualité', bareme: 2 },
      { code: 'assiduite', nom: 'Assiduité', bareme: 2 },
      { code: 'ethique', nom: 'Éthique professionnelle', bareme: 1.5 },
      { code: 'valeurs', nom: 'Sens des valeurs', bareme: 1.5 }
    ] },
    { groupe: 'Le sens du service public', total: 5, criteres: [
      { code: 'sacrifice', nom: 'Esprit de sacrifice', bareme: 1 },
      { code: 'bien_public', nom: 'Respect du bien public', bareme: 2 },
      { code: 'hierarchie', nom: 'Respect de la hiérarchie', bareme: 2 }
    ] }
  ];

  /** Classe de performance officielle, à partir de la note sur 20. */
  function classePerformance(note) {
    if (note === null || note === undefined) return '—';
    if (note >= 18) return 'Très performant';
    if (note >= 16) return 'Performant';
    if (note >= 14) return 'Assez performant';
    if (note >= 10) return 'Peu performant';
    return 'Non performant';
  }

  function tableauCriteres(notes) {
    notes = notes || {};
    let corps = '';
    CRITERES_EVALUATION.forEach((g, ig) => {
      g.criteres.forEach((c, i) => {
        corps += '<tr>'
          + (i === 0 ? '<td rowspan="' + g.criteres.length + '">' + g.groupe + ' (' + g.total + ')</td>' : '')
          + '<td>' + c.nom + '</td>'
          + '<td class="note-critere">' + (notes[c.code] === undefined || notes[c.code] === null
            ? '……..…' : notes[c.code]) + ' / ' + String(c.bareme).replace('.', ',') + '</td>'
          + (i === 0 ? '<td rowspan="' + g.criteres.length + '" class="note-critere">'
            + (notes['_' + g.groupe] === undefined ? '' : notes['_' + g.groupe]) + ' / ' + g.total + '</td>' : '')
          + (ig === 0 && i === 0 ? '<td rowspan="8" class="note-critere">'
            + echapper(notes._classe || '') + '</td>' : '')
          + '</tr>';
      });
    });
    return '<table class="tableau-criteres"><thead><tr><th></th><th>Critères de performance</th>'
      + '<th>Note par critère</th><th>Total</th><th>Classe de performance</th></tr></thead>'
      + '<tbody>' + corps + '</tbody></table>';
  }

  function ficheEvaluationAgent(agent, evaluation, ecole, contexte) {
    evaluation = evaluation || {};
    const p = v => '<span class="pointilles">' + echapper(v || '') + '</span>';

    return '<div class="fiche-agent">'
      + enteteMEMP(contexte.departement, 'Direction de l’Administration et des Finances')
      + '<h2>FICHE D’ÉVALUATION DE L’AGENT</h2>'
      + '<p class="option"><em>(Agent contractuel de l’État n’ayant pas la qualité '
      + 'de supérieur hiérarchique immédiat)</em></p>'

      + '<h3 class="rubrique">1 — Identification de l’agent</h3>'
      + '<div class="identite-agent">'
      + '<p>Nom et prénom(s) : ' + p(((agent.nom || '').toUpperCase() + ' ' + (agent.prenoms || '')).trim()) + '</p>'
      + '<p>Lieu et date de naissance : ' + p((agent.lieu_naissance || '') + ' , le ' + U.dateCourte(agent.date_naissance)) + '</p>'
      + '<p>Tél : ' + p(agent.telephone) + ' &nbsp; E-mail : ' + p(agent.email) + '</p>'
      + '<p>Situation familiale : ' + p(U.libelle(agent.situation_familiale)) + '</p>'
      + '<p>Situation militaire : ' + p(agent.situation_militaire) + '</p>'
      + '<p>Diplôme de recrutement : ' + p(agent.diplome_recrutement) + '</p>'
      + '<p><strong>NIP : ' + p(agent.nip) + '</strong></p>'
      + '<p>Matricule : ' + p(agent.matricule) + '</p>'
      + '<p>Adresse : ' + p(agent.adresse) + '</p>'
      + '</div>'

      + '<h3 class="rubrique">2 — Situation administrative de l’agent</h3>'
      + '<p>Date de première prise de service : ' + p(U.dateCourte(agent.date_premiere_prise_service)) + '</p>'
      + '<p>Grade actuel : ' + p(agent.grade) + ' Catégorie : ' + p(agent.categorie)
      + ' Échelle : ' + p(agent.echelle) + ' Échelon : ' + p(agent.echelon) + '</p>'
      + '<p>Emploi : ' + p(agent.emploi || U.libelle(agent.fonction)) + '</p>'
      + '<p><em>Référence des actes de carrière :</em></p>'
      + '<p>Contrat initial : ' + p(agent.contrat_initial) + '</p>'
      + '<p>Contrat de travail renouvelé : ' + p(agent.contrat_renouvele) + '</p>'
      + '<p>Contrat à durée indéterminée : ' + p(agent.contrat_indetermine) + '</p>'
      + '<p>Avenant : ' + p(agent.avenant) + '</p>'
      + '<p class="lieu-date">Fait à ' + echapper(contexte.commune || '') + ' , le '
      + echapper(U.dateCourte(new Date().toISOString())) + '</p>'
      + '<div class="bloc-signature fiche-signature">'
      + caseSignature(agent, 'L’agent')
      + '<div class="cachet-case">' + cachet(ecole) + '</div>'
      + '</div>'

      + '<div class="saut-page"></div>'
      + '<h3 class="rubrique">3 — Évaluation</h3>'
      + '<p>Période de référence : ' + p(U.dateCourte(evaluation.periode_debut))
      + ' à ' + p(U.dateCourte(evaluation.periode_fin)) + '</p>'
      + '<p><strong>3.1 — Rappel des objectifs sur la période</strong></p>'
      + '<div class="zone-libre">' + echapper(evaluation.objectifs || '') + '</div>'
      + '<p><strong>3.2 — Résultats de la période</strong></p>'
      + '<div class="zone-libre">' + echapper(evaluation.resultats || '') + '</div>'
      + '<p><strong>3.3 — Contraintes et difficultés</strong></p>'
      + '<div class="zone-libre">' + echapper(evaluation.contraintes || '') + '</div>'
      + '<p><strong>3.4 — Note et appréciation du supérieur hiérarchique</strong></p>'
      + tableauCriteres(evaluation.notes_hierarchique)
      + '<p><strong>3.5 — Note et appréciation du comité de direction</strong></p>'
      + tableauCriteres(evaluation.notes_comite)
      + '<table class="signatures-fiche"><tr>'
      + '<td>Préciser le titre du supérieur hiérarchique<div class="espace-signature"></div>'
      + 'Prénoms et Nom du supérieur hiérarchique</td>'
      + '<td>Préciser le titre du responsable de la structure<div class="espace-signature"></div>'
      + 'Prénoms et Nom du responsable de la structure</td>'
      + '</tr></table>'
      + '</div>';
  }

  /* =======================================================================
     Fiche d'inscription au CEP — modèle officiel de la DDEMP
     ======================================================================= */

  const case_ = coche => '<span class="case-a-cocher">' + (coche ? '×' : '') + '</span>';
  const ligne_ = valeur => '<span class="pointilles' + (valeur ? '' : ' vide') + '">'
    + echapper(valeur || '') + '</span>';

  /**
   * Reprend la mise en page de la fiche transmise par la Direction
   * Départementale : mêmes rubriques, mêmes mentions, même ordre.
   */
  function ficheCEP(eleve, ins, ecole, annee, fiche, cep, contexte, signataire) {
    contexte = contexte || {};
    fiche = fiche || {};
    const session = fiche.session || ('JUIN ' + (new Date().getFullYear() + 1));
    const publique = !ecole || ecole.statut !== 'PRIVEE';

    return '<div class="fiche-cep">'
      + enteteMEMP(contexte.departement)
      + '<h2>FICHE D’INSCRIPTION À L’EXAMEN DU<br>CERTIFICAT D’ÉTUDES PRIMAIRES (CEP)</h2>'
      + '<p class="option">OPTION : CEP + entrée en 6ᵉ '
      + case_(fiche.option_6e !== false) + ' &nbsp;&nbsp; CEP seul ' + case_(fiche.option_6e === false)
      + ' <em>(rayer la mention inutile)</em></p>'
      + '<table class="bandeau-session"><tr>'
      + '<td>SESSION DE : <strong>' + echapper(session) + '</strong></td>'
      + '<td>CENTRE DE : <strong>' + echapper(fiche.centre || '—') + '</strong></td>'
      + '</tr></table>'

      + '<h3 class="rubrique">ÉCOLE DE PROVENANCE</h3>'
      + '<table class="fiche-champs">'
      + '<tr><td>COMMUNE DE</td><th>' + ligne_(contexte.commune) + '</th></tr>'
      + '<tr><td>CIRCONSCRIPTION SCOLAIRE DE</td><th>' + ligne_(contexte.circonscription) + '</th></tr>'
      + '<tr><td>NOM DE L’ÉCOLE</td><th>' + ligne_(ecole ? ecole.nom : '') + '</th></tr>'
      + '<tr><td>STATUT DE L’ÉCOLE</td><th>'
      + case_(publique) + ' Publique &nbsp;&nbsp;&nbsp;' + case_(!publique) + ' Privée</th></tr>'
      + '<tr><td>NOM ET PRÉNOM DU DIRECTEUR OU DE LA DIRECTRICE</td><th>'
      + ligne_(contexte.directeur) + '</th></tr>'
      + '<tr><td>CONTACT TÉLÉPHONIQUE DU DIRECTEUR OU DE LA DIRECTRICE</td><th>'
      + ligne_(contexte.directeurContact) + '</th></tr>'
      + '</table>'

      + '<h3 class="rubrique">CANDIDAT (E)</h3>'
      + '<div class="candidat">'
      + '<table class="fiche-champs">'
      + '<tr><td>NOM <em>(à écrire en lettres capitales)</em></td><th>'
      + ligne_((eleve.nom || '').toUpperCase()) + '</th></tr>'
      + '<tr><td>PRÉNOMS <em>(tous les prénoms sans abréviation, suivant l’ordre et l’orthographe '
      + 'de la pièce d’état civil)</em></td><th>' + ligne_(eleve.prenoms) + '</th></tr>'
      + '<tr><td>SEXE</td><th>' + ligne_(eleve.sexe === 'F' ? 'Féminin' : (eleve.sexe === 'M' ? 'Masculin' : '')) + '</th></tr>'
      + '<tr><td>DATE ET LIEU DE NAISSANCE</td><th>'
      + ligne_((eleve.date_naissance ? U.dateCourte(eleve.date_naissance) : '') + ' à ' + (eleve.lieu_naissance || '')) + '</th></tr>'
      + '<tr><td>NUMÉRO EDUCMASTER</td><th>' + ligne_(eleve.educmaster_matricule) + '</th></tr>'
      + '</table>'
      + '<div class="candidat-visuels">'
      + '<div class="photo-candidat"><small>Photo du candidat</small></div>'
      + qrEleve(eleve, ins, ecole, annee, 78)
      + '</div>'
      + '</div>'

      + '<table class="fiche-champs">'
      + '<tr><td>ÉTABLISSEMENTS CHOISIS <em>(trois établissements par ordre de préférence, '
      + 'sans abréviation)</em></td><th>'
      + '1 - ' + ligne_(fiche.etablissement_1) + '<br>'
      + '2 - ' + ligne_(fiche.etablissement_2) + '<br>'
      + '3 - ' + ligne_(fiche.etablissement_3) + '</th></tr>'
      + '<tr><td>RÉSIDENCE DES PARENTS</td><th>' + ligne_(fiche.residence_parents) + '</th></tr>'
      + '<tr><td>DISPENSE D’ÂGE</td><th>'
      + case_(fiche.dispense_age) + ' Oui &nbsp;&nbsp;&nbsp;' + case_(!fiche.dispense_age) + ' Non</th></tr>'
      + '<tr><td>DISPENSE DE SPORT</td><th>'
      + case_(fiche.dispense_sport) + ' Oui &nbsp;&nbsp;&nbsp;' + case_(!fiche.dispense_sport) + ' Non</th></tr>'
      + (cep && cep.numero_table ? '<tr><td>NUMÉRO DE TABLE</td><th>' + ligne_(cep.numero_table) + '</th></tr>' : '')
      + '</table>'

      + '<p class="certification">Je certifie exacts les renseignements ci-dessus.</p>'
      + '<p class="lieu-date">Fait à ' + echapper(contexte.commune || '') + ' , le '
      + echapper(U.dateCourte(new Date().toISOString())) + '</p>'
      + '<table class="signatures-fiche"><tr>'
      + '<td>NOM, PRÉNOM ET SIGNATURE DU PARENT :<br>' + ligne_(fiche.parent_nom)
      + '<div class="espace-signature"></div></td>'
      + '<td>CONTACT TÉLÉPHONIQUE DU PARENT :<br>' + ligne_(fiche.parent_contact)
      + '<br><em>(degré de parenté : ' + echapper(fiche.degre_parente || '—') + ')</em></td>'
      + '<td>SIGNATURE DU (DE LA) CANDIDAT (E) :'
      + (eleve.signature_image
        ? '<img class="signature-trace" src="' + eleve.signature_image + '" alt="Signature du candidat">'
        : '<div class="espace-signature"></div>') + '</td>'
      + '</tr></table>'

      + '<table class="cadre-ddemp"><tr><th colspan="3">AGENT DE LA DDEMP</th></tr><tr>'
      + '<td>DOSSIER ÉTUDIÉ PAR : ' + ligne_(fiche.dossier_etudie_par) + '</td>'
      + '<td>CODE : ' + ligne_(fiche.code_ddemp) + '</td>'
      + '<td>COLLATIONNÉ PAR : ' + ligne_(fiche.collationne_par) + '</td>'
      + '</tr></table>'

      + '<div class="tres-important"><strong>TRÈS IMPORTANT :</strong>'
      + '<ul>'
      + '<li>Les Directeurs d’écoles doivent remplir les fiches d’inscription conformément aux '
      + 'informations telles qu’inscrites sur les actes de naissance. Ils doivent collationner les '
      + 'différentes listes envoyées par la DDEMP afin que la liste d’inscription porte la bonne '
      + 'graphie des noms et prénoms, date et lieu de naissance, sexe et école de provenance des candidats.</li>'
      + '<li>Les Directeurs doivent s’assurer que sur les listes d’inscription, le nom de leur école '
      + 'est exclusivement porté devant chacun de leurs candidats afin de garantir la fiabilité des '
      + 'statistiques des résultats par école.</li>'
      + '<li>Les Directeurs doivent associer les parents d’élèves aux choix des établissements '
      + 'd’accueil de l’enseignement secondaire en cas de succès.</li>'
      + '</ul></div>'

      + '<p class="lieu-date">Certifié à ' + echapper(contexte.commune || '') + ' , le '
      + echapper(U.dateCourte(new Date().toISOString())) + '</p>'
      + '<div class="bloc-signature fiche-signature">'
      + caseSignature(signataire, 'Le Directeur')
      + '<div class="cachet-case">' + cachet(ecole) + '</div>'
      + '</div>'
      + '</div>';
  }

  /* Feuille de style embarquée dans la fenêtre d'impression. */

  Object.assign(EG.Docs, {
    carteScolaire, carteScolaireVerso, certificatScolarite, ficheCEP, ficheEvaluationAgent,
    CRITERES_EVALUATION, classePerformance
  });
})(window);
