// Bibliotheque de clauses-types OHADA usuelles.
// Source : Acte uniforme relatif au droit des societes commerciales et du GIE
// (AUSCGIE revise 2014) + pratique notariale OHADA.

export type ClauseAU = "AUSCGIE" | "AUDCG" | "AUSCG-COOP";
export type ClauseFormeJuridique = "SARL" | "SAS" | "SA" | "SNC" | "Toutes";

export interface Clause {
  id: string;
  title: string;
  category: string;
  /** Acte uniforme de reference */
  au: ClauseAU;
  /** Article(s) de reference */
  articles: string;
  /** Formes juridiques applicables */
  formes: ClauseFormeJuridique[];
  /** Texte type pret a copier-coller */
  text: string;
  /** Description courte */
  description: string;
}

export const CLAUSES: Clause[] = [
  // ── PRÉEMPTION ──
  {
    id: "preemption-sarl",
    title: "Clause de préemption (SARL)",
    category: "Préemption & agrément",
    au: "AUSCGIE",
    articles: "Art. 318 à 320",
    formes: ["SARL"],
    description: "Permet aux associés existants d'acquérir prioritairement les parts en cas de cession projetée.",
    text: `En cas de projet de cession de parts sociales à un tiers, l'associé cédant doit notifier son projet à la Société et à chacun des autres associés par lettre recommandée avec accusé de réception ou par tout moyen permettant d'établir avec certitude la date de réception, en indiquant l'identité du cessionnaire pressenti, le nombre de parts à céder et le prix offert.

Les autres associés disposent d'un délai de trente (30) jours à compter de la réception de cette notification pour exercer leur droit de préemption, en proportion de leur participation au capital social.

À défaut d'exercice du droit de préemption dans le délai imparti, l'associé cédant pourra librement céder ses parts au tiers désigné, aux conditions notifiées, sous réserve toutefois de la procédure d'agrément prévue à l'article suivant.`,
  },
  {
    id: "preemption-sas",
    title: "Clause de préemption (SAS)",
    category: "Préemption & agrément",
    au: "AUSCGIE",
    articles: "Art. 853-17",
    formes: ["SAS"],
    description: "Mécanisme de préemption flexible, propre à la SAS.",
    text: `Toute cession d'actions, qu'elle soit consentie à titre onéreux ou gratuit, est soumise au droit de préemption des autres actionnaires.

L'actionnaire cédant doit notifier son projet de cession au Président de la Société, par lettre recommandée, en précisant l'identité du cessionnaire envisagé, le nombre d'actions à céder et le prix unitaire.

Le Président transmet cette notification aux autres actionnaires dans les huit (8) jours. Les actionnaires disposent alors d'un délai de quarante-cinq (45) jours pour exercer leur droit de préemption au prix offert, à proportion de leur participation au capital.

À l'expiration de ce délai, le cédant pourra céder ses actions dans les termes notifiés.`,
  },

  // ── AGRÉMENT ──
  {
    id: "agrement-sarl",
    title: "Clause d'agrément (SARL)",
    category: "Préemption & agrément",
    au: "AUSCGIE",
    articles: "Art. 319",
    formes: ["SARL"],
    description: "Soumet la cession de parts à l'autorisation des autres associés.",
    text: `Les cessions de parts sociales à des tiers étrangers à la Société, ainsi que les cessions au conjoint, ascendants ou descendants du cédant, sont soumises à l'agrément préalable de la majorité des associés représentant au moins les trois quarts (3/4) du capital social, conformément à l'article 319 de l'AUSCGIE.

L'agrément résulte d'une décision collective des associés, prise dans un délai de trois (3) mois à compter de la notification du projet de cession.

À défaut d'agrément, et si le cédant ne renonce pas à son projet, les associés ou la Société sont tenus, dans un délai de trois (3) mois, soit d'acquérir les parts sociales, soit de les faire acquérir par un tiers agréé. À l'expiration de ce délai, le cédant pourra librement céder ses parts.`,
  },
  {
    id: "agrement-sas",
    title: "Clause d'agrément (SAS)",
    category: "Préemption & agrément",
    au: "AUSCGIE",
    articles: "Art. 853-17",
    formes: ["SAS"],
    description: "Procédure d'agrément des cessionnaires en SAS.",
    text: `Toute cession d'actions est soumise à l'agrément préalable de la collectivité des actionnaires statuant à la majorité des deux tiers (2/3) des voix exprimées.

L'agrément est notifié au cédant dans un délai de trois (3) mois à compter de la demande. À défaut de notification dans ce délai, l'agrément est réputé accordé.

En cas de refus d'agrément, la Société dispose d'un délai de trois (3) mois pour faire acquérir les actions par un tiers agréé ou par la Société elle-même en vue d'une réduction de capital.`,
  },

  // ── INALIÉNABILITÉ ──
  {
    id: "inalienabilite",
    title: "Clause d'inaliénabilité",
    category: "Inaliénabilité & sortie",
    au: "AUSCGIE",
    articles: "Art. 765-1 (durée 10 ans max)",
    formes: ["SAS", "SA"],
    description: "Empêche temporairement la cession des titres pour stabiliser le capital.",
    text: `Les actionnaires s'engagent à ne pas céder, transférer ou donner en garantie tout ou partie de leurs actions pendant une durée de [DUREE] à compter de la signature du présent pacte, sauf accord écrit unanime des autres actionnaires.

Cette inaliénabilité ne peut excéder dix (10) ans, conformément à l'article 765-1 de l'AUSCGIE.

Sont toutefois autorisées, sans constituer une violation de la présente clause, les opérations suivantes :
- les cessions à un autre actionnaire signataire du pacte ;
- les transmissions par voie successorale au conjoint, aux descendants ou ascendants ;
- les transferts à une société contrôlée à 100% par l'actionnaire concerné.`,
  },

  // ── EXCLUSION ──
  {
    id: "exclusion-sas",
    title: "Clause d'exclusion (SAS)",
    category: "Inaliénabilité & sortie",
    au: "AUSCGIE",
    articles: "Art. 853-19",
    formes: ["SAS"],
    description: "Permet à la SAS d'exclure un actionnaire dans certaines situations prévues.",
    text: `Tout actionnaire peut être exclu de la Société dans les cas suivants :
- changement de contrôle de l'actionnaire personne morale ;
- liquidation judiciaire de l'actionnaire ;
- violation grave et répétée des dispositions statutaires ou du pacte d'actionnaires ;
- exercice par l'actionnaire d'une activité concurrente à celle de la Société ;
- condamnation pour atteinte aux intérêts de la Société.

L'exclusion est prononcée par décision collective des actionnaires statuant à la majorité des deux tiers (2/3), l'actionnaire concerné ne participant pas au vote.

L'actionnaire exclu doit céder ses actions dans les soixante (60) jours suivant la notification de l'exclusion, à un prix fixé d'un commun accord ou, à défaut, par expert désigné conformément à l'article 1592 du Code civil. Les actions sont rachetées en priorité par les autres actionnaires, à proportion de leur participation, ou à défaut par la Société.`,
  },

  // ── SORTIE CONJOINTE ──
  {
    id: "tag-along",
    title: "Droit de sortie conjointe (Tag-along)",
    category: "Inaliénabilité & sortie",
    au: "AUSCGIE",
    articles: "Pacte extra-statutaire",
    formes: ["SA", "SAS"],
    description: "Permet aux minoritaires de sortir aux mêmes conditions que le majoritaire en cas de cession.",
    text: `En cas de projet de cession par un actionnaire (le « Cédant ») de tout ou partie de ses actions à un tiers, conduisant à un transfert de plus de [SEUIL] % du capital, chaque autre actionnaire bénéficie d'un droit de sortie conjointe lui permettant de céder au tiers cessionnaire, dans les mêmes conditions de prix et de paiement, tout ou partie de ses propres actions, à proportion du nombre d'actions cédées.

Le Cédant doit notifier son projet de cession aux autres actionnaires au moins quarante-cinq (45) jours avant la réalisation prévue. Les actionnaires bénéficiaires disposent d'un délai de trente (30) jours pour exercer leur droit de sortie conjointe.

Le Cédant fait son affaire personnelle de l'extension de l'offre du tiers cessionnaire aux actions des actionnaires exerçant leur droit. À défaut, la cession projetée par le Cédant ne pourra avoir lieu.`,
  },
  {
    id: "drag-along",
    title: "Obligation de sortie forcée (Drag-along)",
    category: "Inaliénabilité & sortie",
    au: "AUSCGIE",
    articles: "Pacte extra-statutaire",
    formes: ["SA", "SAS"],
    description: "Permet au majoritaire de forcer les minoritaires à céder en cas d'offre globale.",
    text: `En cas d'offre d'acquisition de la totalité du capital de la Société par un tiers, à un prix permettant à chaque actionnaire de céder ses actions dans les mêmes conditions, les actionnaires détenant ensemble au moins [SEUIL] % du capital (les « Actionnaires Cédants Initiateurs ») peuvent obliger les autres actionnaires (les « Actionnaires Entraînés ») à céder leurs actions au tiers acquéreur, aux mêmes prix et conditions.

Cette faculté ne peut être exercée que si la cession porte sur l'intégralité du capital et si le prix unitaire offert n'est pas inférieur à [SEUIL_PRIX] FCFA.

Les Actionnaires Entraînés s'engagent à signer tous documents nécessaires dans un délai de trente (30) jours suivant la notification de l'opération.`,
  },

  // ── NON-CONCURRENCE ──
  {
    id: "non-concurrence",
    title: "Engagement de non-concurrence",
    category: "Non-concurrence & confidentialité",
    au: "AUSCGIE",
    articles: "Pacte extra-statutaire",
    formes: ["Toutes"],
    description: "Interdit aux associés/dirigeants d'exercer une activité concurrente.",
    text: `Pendant toute la durée de leur qualité d'associé et pendant une durée de [DUREE] à compter de la perte de cette qualité, les associés s'engagent à ne pas exercer, directement ou indirectement, à titre personnel ou par personne interposée, une activité concurrente à celle de la Société, telle que définie à l'article [X] des statuts, sur le territoire de [TERRITOIRE].

Sont notamment interdits :
- la participation au capital, à la direction ou à la gestion d'une entreprise concurrente ;
- la prestation de services en qualité de salarié, mandataire social, consultant ou tout autre statut, au profit d'une entreprise concurrente ;
- le détournement de clientèle ou de personnel de la Société.

En contrepartie de cet engagement post-contractuel, les associés concernés bénéficieront d'une indemnité forfaitaire de [MONTANT] FCFA versée en [N] échéances mensuelles.

Toute violation entraîne le versement d'une indemnité forfaitaire de [PENALITE] FCFA, sans préjudice de la possibilité pour la Société d'obtenir réparation du préjudice subi.`,
  },
  {
    id: "confidentialite",
    title: "Clause de confidentialité",
    category: "Non-concurrence & confidentialité",
    au: "AUSCGIE",
    articles: "Pacte extra-statutaire",
    formes: ["Toutes"],
    description: "Protège les informations sensibles de la société.",
    text: `Les associés, dirigeants et toute personne ayant accès aux informations de la Société dans le cadre de leurs fonctions s'engagent à conserver strictement confidentielles toutes les informations non publiques relatives à la Société, ses activités, ses affaires, ses partenaires, ses clients, ses fournisseurs et ses associés.

Cette obligation comprend notamment :
- les données financières et comptables ;
- les contrats commerciaux et conditions négociées ;
- la stratégie commerciale et les projets de développement ;
- les informations techniques, savoir-faire et secrets d'affaires ;
- les délibérations sociales et procès-verbaux non rendus publics.

L'engagement de confidentialité subsiste pendant une durée de cinq (5) ans après la cessation de la qualité d'associé ou de mandataire social.

Toute violation engage la responsabilité personnelle de son auteur, sans préjudice de la possibilité pour la Société de solliciter en référé toute mesure conservatoire utile.`,
  },

  // ── GOUVERNANCE ──
  {
    id: "majorite-renforcee",
    title: "Majorités renforcées",
    category: "Gouvernance",
    au: "AUSCGIE",
    articles: "Art. 357 à 359",
    formes: ["SARL", "SAS", "SA"],
    description: "Liste des décisions stratégiques nécessitant une majorité qualifiée.",
    text: `Les décisions suivantes sont prises à la majorité des [SEUIL] % des [parts sociales / actions] composant le capital social :

1. Modification statutaire (objet, durée, dénomination, siège social) ;
2. Augmentation ou réduction de capital ;
3. Cession totale ou partielle du fonds de commerce ;
4. Acquisition ou cession de participations significatives (> [SEUIL_2] FCFA) ;
5. Conclusion d'emprunts ou octroi de garanties au-delà de [SEUIL_3] FCFA ;
6. Investissements supérieurs à [SEUIL_4] FCFA non prévus au budget annuel ;
7. Recrutement, licenciement ou modification substantielle du contrat de travail des cadres dirigeants ;
8. Distribution de dividendes ;
9. Nomination ou révocation des dirigeants ;
10. Dissolution anticipée de la Société.`,
  },
  {
    id: "information-associes",
    title: "Information des associés",
    category: "Gouvernance",
    au: "AUSCGIE",
    articles: "Art. 344 à 346",
    formes: ["SARL", "SAS"],
    description: "Droit à l'information périodique et permanent des associés.",
    text: `Les associés bénéficient d'un droit permanent et d'un droit périodique à l'information sur la marche de la Société, conformément aux articles 344 à 346 de l'AUSCGIE.

Information permanente : tout associé peut, à tout moment, consulter au siège social les statuts, la liste des associés, les comptes annuels approuvés des trois derniers exercices, les procès-verbaux des assemblées et les rapports de gestion correspondants. Il peut en obtenir copie à ses frais.

Information périodique : au moins une fois par an, dans les six (6) mois suivant la clôture de l'exercice, le gérant adresse aux associés :
- les comptes annuels (bilan, compte de résultat, annexes) ;
- le rapport de gestion sur l'exercice écoulé ;
- le texte des résolutions proposées à l'assemblée annuelle ;
- le cas échéant, le rapport du commissaire aux comptes.

Quinze (15) jours avant l'assemblée générale ordinaire annuelle, ces documents sont déposés au siège social et tenus à la disposition des associés.`,
  },

  // ── DURÉE & DISSOLUTION ──
  {
    id: "duree-societe",
    title: "Durée de la société",
    category: "Durée & dissolution",
    au: "AUSCGIE",
    articles: "Art. 28",
    formes: ["Toutes"],
    description: "Clause statutaire de durée (max 99 ans, prorogeable).",
    text: `La durée de la Société est fixée à quatre-vingt-dix-neuf (99) années à compter de son immatriculation au Registre du Commerce et du Crédit Mobilier (RCCM), sauf cas de dissolution anticipée ou de prorogation.

Conformément à l'article 28 de l'AUSCGIE, un an au moins avant la date d'expiration de la Société, les associés sont consultés à l'effet de décider, dans les conditions requises pour la modification des statuts, si la Société doit être prorogée.

À défaut de prorogation, la Société est dissoute de plein droit à l'arrivée du terme.`,
  },
  {
    id: "dissolution-anticipee",
    title: "Dissolution anticipée",
    category: "Durée & dissolution",
    au: "AUSCGIE",
    articles: "Art. 200 à 204",
    formes: ["Toutes"],
    description: "Causes et procédure de dissolution anticipée.",
    text: `La dissolution anticipée de la Société peut être prononcée à tout moment par décision collective des associés statuant aux conditions de modification des statuts.

La dissolution intervient également de plein droit dans les cas suivants :
- réalisation ou extinction de l'objet social ;
- annulation du contrat de société ;
- jugement ordonnant la liquidation judiciaire ;
- décès d'un associé en nom dans une SNC, sauf clause contraire ;
- réduction du nombre d'associés en deçà du minimum légal pendant plus d'un (1) an.

La dissolution entraîne la liquidation de la Société. Le ou les liquidateurs sont désignés par la décision de dissolution. Pendant toute la durée de la liquidation, la personnalité morale de la Société subsiste pour les besoins de cette liquidation, jusqu'à la clôture de celle-ci.`,
  },

  // ── DROITS POLITIQUES ──
  {
    id: "droit-veto",
    title: "Droit de veto",
    category: "Gouvernance",
    au: "AUSCGIE",
    articles: "Pacte extra-statutaire",
    formes: ["SAS"],
    description: "Permet à un actionnaire/groupe d'actionnaires de bloquer certaines décisions stratégiques.",
    text: `Les actionnaires titulaires d'au moins [SEUIL] % du capital disposent d'un droit de veto sur les décisions suivantes :

1. Modification de l'objet social ;
2. Cession ou apport partiel d'actif portant sur plus de [SEUIL_2] % de l'actif net ;
3. Conclusion ou modification d'un pacte d'actionnaires ;
4. Émission de valeurs mobilières donnant accès au capital ;
5. Distribution exceptionnelle de dividendes au-delà de [SEUIL_3] % du résultat distribuable ;
6. Conclusion de toute convention réglementée d'un montant supérieur à [SEUIL_4] FCFA.

Le veto est exercé dans un délai de trente (30) jours à compter de la notification du projet de décision. À défaut d'exercice dans ce délai, le veto est réputé non opposé.`,
  },

  // ── COMMISSAIRE AUX COMPTES ──
  {
    id: "cac-obligatoire",
    title: "Désignation obligatoire du CAC",
    category: "Contrôle",
    au: "AUSCGIE",
    articles: "Art. 376 (SARL) et 694 (SA)",
    formes: ["SARL", "SA", "SAS"],
    description: "Seuils légaux de désignation obligatoire d'un commissaire aux comptes.",
    text: `La désignation d'un commissaire aux comptes est obligatoire dans les conditions suivantes :

SARL (article 376 AUSCGIE) :
La désignation est obligatoire si, à la clôture de l'exercice, deux (2) des trois (3) seuils suivants sont franchis :
- total du bilan supérieur à 250 millions de FCFA ;
- chiffre d'affaires hors taxes supérieur à 500 millions de FCFA ;
- effectif permanent supérieur à 50 salariés.

SA (article 694 AUSCGIE) :
La désignation d'au moins un commissaire aux comptes titulaire est obligatoire dans toutes les sociétés anonymes, sans condition de seuil. Un commissaire suppléant doit également être désigné.

SAS : la désignation est obligatoire si la SAS dépasse les seuils SARL ou si elle contrôle ou est contrôlée par une autre société.

La durée du mandat est de six (6) exercices. Le commissaire aux comptes est nommé par l'assemblée générale ordinaire et certifie la régularité et la sincérité des comptes annuels.`,
  },
];

export const CLAUSE_CATEGORIES = [
  "Toutes",
  "Préemption & agrément",
  "Inaliénabilité & sortie",
  "Non-concurrence & confidentialité",
  "Gouvernance",
  "Contrôle",
  "Durée & dissolution",
];

export const CLAUSE_AU_LABELS: Record<ClauseAU, string> = {
  AUSCGIE: "Sociétés commerciales et GIE",
  AUDCG: "Droit commercial général",
  "AUSCG-COOP": "Sociétés coopératives",
};
