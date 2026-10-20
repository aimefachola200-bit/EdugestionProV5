/* ÉduGestion Pro — feuille de style des pièces imprimées.
   Elle est injectée dans la fenêtre d'impression. Toute retouche de mise en
   page se fait ici, sans toucher au contenu des documents. */
(function (global) {
  'use strict';
  const EG = global.EG;
  EG.Docs = EG.Docs || {};

  EG.Docs.stylesImpression = `
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: Georgia, "Times New Roman", serif; margin: 0; color: #17201B; }
    h1 { color: #006B3F; font-size: 20px; margin: 0 0 4px; }
    h2 { color: #006B3F; font-size: 17px; }
    h3 { font-size: 15px; margin-top: 18px; }
    table { border-collapse: collapse; width: 100%; margin: 14px 0; }
    th, td { border: 1px solid #D8E0DB; padding: 6px 9px; text-align: left; font-size: 13px; }
    .pied { margin-top: 10px; border-top: 1px solid #D8E0DB; padding-top: 5px; font-size: 9px; color: #647067; }
    .bloc-signature { display: flex; justify-content: space-between; align-items: flex-end;
      gap: 24px; margin-top: 10px; }
    .signature-case { text-align: center; min-width: 180px; }
    .signature-mention { font-size: 10px; color: #647067; margin-bottom: 2px; }
    .signature-trace { display: block; height: 34px; margin: 0 auto; }
    .signature-vide { height: 62px; border-bottom: 1px solid #647067; }
    .signature-nom { font-size: 10.5px; margin-top: 2px; font-weight: 700; }
    .cachet-case { flex: none; }
    .fait-a { margin: 18px 0 0; font-size: 12px; }
    .cachet { transform: rotate(-8deg); opacity: .92; }
    .fiche-signature .cachet, .cert-signature .cachet { width: 72px; height: 72px; }
    .carte-scolaire {
      width: 92mm; padding: 3.6mm; border-radius: 4mm; page-break-inside: avoid;
      font-family: system-ui, "Segoe UI", Roboto, Arial, sans-serif;
      /* Le pourtour reprend le drapeau national : bande verte à gauche,
         jaune en haut à droite, rouge en bas à droite. */
      background:
        linear-gradient(to bottom, #FCD116 0 50%, #E8112D 50% 100%) right / 64% 100% no-repeat,
        #008751;
      box-shadow: 0 1px 3px rgba(0,0,0,.18);
    }
    .carte-interieur { position: relative; overflow: hidden; background: #fff;
      border-radius: 2.6mm; padding: 3mm 3.4mm 2.4mm; }
    .carte-filigrane { position: absolute; left: 50%; top: 58%; width: 40mm;
      transform: translate(-50%, -50%); opacity: .045; pointer-events: none; }
    .carte-bandeau { display: flex; align-items: center; gap: 2mm; }
    .carte-sceau { height: 11mm; flex: none; }
    .carte-bandeau-texte { flex: 1; text-align: center; line-height: 1.25; }
    .carte-bandeau-texte strong { display: block; font-size: 8.5px; letter-spacing: .04em; color: #006B3F; }
    .carte-bandeau-texte span { display: block; font-size: 6.6px; color: #3B453E; }
    .carte-drapeau { width: 12mm; height: 8mm; border-radius: 1px; flex: none;
      border: .3mm solid #D8E0DB;
      background: linear-gradient(to bottom, #FCD116 0 50%, #E8112D 50% 100%) right / 60% 100% no-repeat, #008751; }
    .carte-titre { background: #008751; color: #fff; font-size: 8px; font-weight: 700;
      text-align: center; padding: 1.1mm; border-radius: 1mm; margin: 1.8mm 0 1.6mm;
      letter-spacing: .06em; position: relative; }
    .carte-corps { display: flex; gap: 2.2mm; position: relative; align-items: flex-start; }
    .carte-photo { width: 17mm; height: 22mm; border: .3mm solid #B9C6BE; border-radius: 1mm;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: rgba(245,247,246,.8); flex: none; }
    .carte-photo span { font-size: 15px; font-weight: 700; color: #008751; }
    .carte-photo small { font-size: 5.4px; color: #647067; }
    .carte-champs { margin: 0; flex: 1; }
    .carte-champs td, .carte-champs th { border: 0; border-bottom: .2mm dotted #C9D4CD;
      padding: .5mm 1mm; font-size: 7.4px; text-align: left; }
    .carte-champs td { color: #647067; width: 15mm; }
    .carte-champs th { font-weight: 700; }
    .carte-qr { flex: none; align-self: center; }
    .carte-signatures { display: flex; align-items: flex-end; justify-content: space-between;
      gap: 2mm; margin-top: 1.6mm; position: relative; }
    .carte-signature { flex: 1; text-align: center; }
    .carte-signature img { display: block; height: 8mm; margin: 0 auto; }
    .carte-signature-vide { display: block; height: 8mm; }
    .carte-signature small { display: block; font-size: 5.8px; color: #647067;
      border-top: .2mm solid #647067; padding-top: .4mm; }
    .carte-cachet { flex: none; opacity: .78; }
    .carte-verso .carte-interieur { display: flex; flex-direction: column; }
    .verso-titre { text-align: center; font-size: 9px; font-weight: 700; color: #006B3F;
      letter-spacing: .04em; border-bottom: .3mm solid #008751; padding-bottom: 1.2mm;
      margin-bottom: 1.8mm; position: relative; }
    .verso-photo { display: block; width: 100%; height: 26mm; object-fit: cover;
      border-radius: 1.4mm; border: .3mm solid #D8E0DB; position: relative; }
    .verso-photo-absente { display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 1mm; background: rgba(245,247,246,.85); }
    .verso-photo-absente svg { width: 34mm; height: auto; }
    .verso-photo-absente small { font-size: 5.4px; color: #647067; }
    .verso-localisation { margin: 1.8mm 0 0; position: relative; }
    .verso-localisation td, .verso-localisation th { border: 0;
      border-bottom: .2mm dotted #C9D4CD; padding: .4mm 1mm; font-size: 6.6px; text-align: left; }
    .verso-localisation td { color: #647067; width: 34%; }
    .verso-localisation th { font-weight: 700; }
    .verso-mention { margin-top: auto; padding-top: 1.6mm; position: relative; }
    .verso-mention strong { display: block; font-size: 6.6px; color: #B3121D; }
    .verso-mention span { display: block; font-size: 6px; color: #3B453E; line-height: 1.35; }
    .carte-pied { display: flex; justify-content: space-between; font-size: 5.8px;
      color: #647067; margin-top: 1.2mm; border-top: .2mm solid #D8E0DB; padding-top: .8mm;
      position: relative; }
    .entete-admin { display: flex; align-items: center; gap: 12px;
      border-bottom: 2px solid #008751; padding-bottom: 8px; margin-bottom: 12px; }
    .entete-armoiries { height: 46px; flex: none; }
    .entete-logo { height: 40px; flex: none; }
    .entete-admin-centre { flex: 1; text-align: center; line-height: 1.35; }
    .entete-admin-centre strong { display: block; font-size: 11px; letter-spacing: .05em; color: #006B3F; }
    .entete-admin-centre span { display: block; font-size: 9.5px; color: #3B453E; }
    .entete-admin-centre .entete-ecole { font-weight: 700; color: #17201B; margin-top: 2px; }
    .entete-memp { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
    .entete-memp img { height: 46px; }
    .entete-coordonnees { font-size: 8.5px; text-align: right; color: #3B453E; line-height: 1.4; }
    .entete-direction { font-size: 10px; margin-top: 4px; padding-bottom: 4px;
      border-bottom: 2px solid #008751; }
    .fiche-cep { font-size: 9.3px; line-height: 1.3; max-width: 190mm; margin: 0 auto; }
    .fiche-cep h2 { text-align: center; font-size: 12px; letter-spacing: .02em; margin: 6px 0 3px; }
    .fiche-cep table { margin: 3px 0; }
    .fiche-cep th, .fiche-cep td { padding: 1.5px 5px; }
    .fiche-cep .option { text-align: center; font-size: 9.5px; margin: 0 0 4px; }
    .fiche-cep .rubrique { background: #E6F5EE; color: #006B3F; font-size: 9.5px;
      padding: 2px 7px; margin: 5px 0 3px; letter-spacing: .04em; }
    .bandeau-session td { text-align: center; font-size: 11px; }
    .fiche-champs { margin: 6px 0; }
    .fiche-champs td { width: 40%; font-size: 9px; color: #3B453E; vertical-align: top; }
    .fiche-champs th { font-size: 9.5px; font-weight: 400; }
    .fiche-champs em { color: #647067; font-size: 8px; }
    .pointilles { display: inline-block; min-width: 55%; border-bottom: 1px dotted #647067;
      font-weight: 700; padding: 0 2px; }
    .pointilles.vide { min-width: 140px; }
    .signature-mention:empty { display: none; }
    .case-a-cocher { display: inline-block; width: 13px; height: 13px; border: 1px solid #17201B;
      text-align: center; line-height: 12px; font-weight: 700; vertical-align: -2px; }
    .candidat { display: flex; gap: 12px; align-items: flex-start; }
    .candidat .fiche-champs { flex: 1; }
    .candidat-visuels { flex: none; display: flex; flex-direction: column; gap: 6px; align-items: center; }
    .photo-candidat { width: 56px; height: 70px; border: 1px solid #647067;
      display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; }
    .photo-candidat small { font-size: 8px; color: #647067; }
    .certification { margin-top: 5px; font-size: 9.5px; }
    .lieu-date { font-size: 9.5px; margin: 3px 0; }
    .signatures-fiche td { font-size: 8.5px; vertical-align: top; width: 33%; }
    .espace-signature { height: 20px; }
    .cadre-ddemp { margin-top: 6px; }
    .cadre-ddemp th { background: #F5F7F6; text-align: center; font-size: 9px; letter-spacing: .05em; }
    .cadre-ddemp td { font-size: 8.5px; }
    .tres-important { margin-top: 4px; font-size: 7.2px; line-height: 1.28; }
    .tres-important ul { margin: 3px 0 0; padding-left: 14px; column-count: 2; column-gap: 14px; }
    .tres-important li { margin-bottom: 2px; text-align: justify; }
    .mention-directeur { text-align: right; font-size: 12px; margin-top: 10px; }
    .pied-qr { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
    .certificat-agent { max-width: 190mm; margin: 0 auto; font-size: 12px; line-height: 1.9; }
    .certificat-agent .reference-so { font-size: 10px; margin: 6px 0 0; }
    .certificat-agent h2 { text-align: center; font-size: 17px; letter-spacing: .04em;
      margin: 14px 0 4px; text-decoration: underline; }
    .sous-titre-certificat { text-align: center; font-size: 11px; margin: 0 0 10px; }
    .corps-certificat p { margin: 0 0 3px; }
    .corps-certificat .pointilles { min-width: 30%; }
    .qualites { margin-top: 8px; }
    .qualites .qualite { display: inline-block; margin-right: 14px; font-size: 11px; }
    .formule { margin-top: 12px; font-style: italic; font-size: 11.5px; }
    .visas { margin-top: 12px; }
    .visas h3 { text-align: center; font-size: 12px; text-decoration: underline; margin: 6px 0; }
    .visas td { width: 50%; font-size: 10.5px; vertical-align: top; text-align: center; }
    .certificat { max-width: 190mm; margin: 0 auto; font-size: 11.5px; line-height: 1.7; }
    .cert-entete { border-bottom: 2px solid #008751; padding-bottom: 8px; }
    .cert-armoiries { text-align: center; }
    .cert-armoiries img { height: 52px; }
    .cert-colonnes { display: flex; justify-content: space-between; gap: 20px;
      font-size: 9.5px; line-height: 1.45; margin-top: 6px; }
    .cert-gauche { flex: 1; }
    .cert-droite { flex: 1; text-align: center; }
    .cert-etoiles { letter-spacing: 1px; margin: 3px 0; }
    .cert-titre { text-align: center; font-size: 16px; letter-spacing: .05em; margin: 10px 0 0; }
    .cert-numero { text-align: right; font-size: 11px; margin-bottom: 6px; }
    .cert-corps p { margin: 0 0 4px; display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 6px; }
    .certificat .cert-corps p.cert-appreciations { margin-top: 6px; display: block; }
    .cert-identite { margin: 6px 0; }
    .cert-identite td, .cert-identite th { font-size: 11px; padding: 4px 8px; }
    .cert-identite td:first-child { width: 34%; color: #3B453E; }
    .cert-qr { width: 84px; text-align: center; vertical-align: middle; }
    .certificat .cert-corps p.cert-sous-titre { text-align: center; font-weight: 700;
      margin-top: 10px; display: block; }
    .certificat .cert-corps p.cert-lieu { text-align: right; margin-top: 8px; display: block; }
    .cert-signature, .fiche-signature { justify-content: flex-end; margin-top: 4px; }
    /* Les valeurs du certificat sont courtes : des tirets plus étroits évitent
       que chaque mention passe à la ligne. */
    .certificat .pointilles { min-width: 26%; flex: 1 1 26%; }
    .fiche-agent h2 { text-align: center; font-size: 15px; margin: 14px 0 4px; }
    .identite-agent p, .fiche-agent p { font-size: 11.5px; margin: 0 0 4px; }
    .tableau-criteres th, .tableau-criteres td { font-size: 10.5px; padding: 5px 7px; }
    .tableau-criteres .note-critere { text-align: center; white-space: nowrap; }
    .zone-libre { border: 1px solid #D8E0DB; min-height: 46px; padding: 6px 8px;
      margin-bottom: 8px; font-size: 11px; white-space: pre-wrap; }
    .mention-droite { text-align: right; font-size: 11px; }
    .registre-imprime th, .registre-imprime td { text-align: center; padding: 2px 4px; font-size: 9px; }
    .registre-imprime .nom-eleve { text-align: left; white-space: nowrap; font-size: 9.5px; }
    .registre-imprime .case-present { color: #006B3F; font-weight: 700; }
    .registre-imprime .case-absent { color: #B3121D; font-weight: 700; }
    .registre-imprime .jour-chome { background: #F3D9DB; color: #B3121D; }
    .fiche-collecte td { width: 46%; color: #3B453E; font-size: 10.5px; }
    .fiche-collecte th { font-weight: 400; font-size: 10.5px; text-align: left; }
    .saut-page { page-break-after: always; }
    .saut-page:last-child { page-break-after: auto; }
    @media print { .carte-scolaire { break-inside: avoid; } }
  `;
})(window);
