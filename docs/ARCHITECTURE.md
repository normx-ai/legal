# NORMX Legal — Architecture

## Vision
Machine à documents juridiques personnalisés, conformes OHADA et adaptés au droit congolais.

## Stack
- **Frontend** : React (Expo Web) — même stack que NORMX Tax
- **Backend** : Node.js / Express
- **BDD** : PostgreSQL (Prisma)
- **Templates** : fichiers `.docx` avec variables (docxtemplater)
- **PDF** : LibreOffice headless ou Puppeteer
- **Auth** : Compte NORMX partagé avec Tax

## Structure du projet

```
normx-legal/
├── mobile/
│   ├── app/
│   │   ├── (auth)/                  # Auth (partagée NORMX)
│   │   └── (app)/
│   │       ├── index.tsx            # Dashboard : mes documents
│   │       ├── generate/            # Wizards de génération
│   │       │   ├── index.tsx        # Choix du type de document
│   │       │   ├── sarl.tsx         # Wizard SARL
│   │       │   ├── sa.tsx           # Wizard SA
│   │       │   ├── sas.tsx          # Wizard SAS
│   │       │   ├── sci.tsx          # Wizard SCI
│   │       │   ├── gie.tsx          # Wizard GIE
│   │       │   └── ei.tsx           # Wizard Entreprise Individuelle
│   │       ├── documents/           # Liste des documents générés
│   │       │   ├── index.tsx        # Historique
│   │       │   └── [id].tsx         # Détail + téléchargement
│   │       └── templates/           # Catalogue des modèles
│   ├── components/
│   │   ├── wizard/                  # Composants wizard multi-étapes
│   │   │   ├── WizardLayout.tsx     # Conteneur avec stepper
│   │   │   ├── StepSociete.tsx      # Étape : infos société
│   │   │   ├── StepAssocies.tsx     # Étape : associés / parts
│   │   │   ├── StepGerance.tsx      # Étape : gérant / DG
│   │   │   ├── StepObjet.tsx        # Étape : objet social
│   │   │   ├── StepRecap.tsx        # Étape : récapitulatif
│   │   │   └── StepDownload.tsx     # Étape : téléchargement
│   │   ├── documents/               # Composants documents
│   │   └── landing/                 # Landing page
│   └── lib/
│       ├── templates/               # Logique templates côté client
│       ├── generators/              # Validation formulaires
│       ├── hooks/                   # useWizard, useDocuments
│       ├── theme/                   # Thème NORMX (partagé)
│       ├── i18n/locales/            # FR / EN
│       ├── api/                     # Client API
│       └── store/                   # Zustand (auth, documents)
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts              # Auth (partagée)
│   │   │   ├── generate.routes.ts   # POST /generate/:type
│   │   │   ├── documents.routes.ts  # GET /documents, GET /documents/:id
│   │   │   └── templates.routes.ts  # GET /templates (catalogue)
│   │   ├── services/
│   │   │   ├── docx-generator.ts    # docxtemplater : injection variables
│   │   │   ├── pdf-generator.ts     # Conversion DOCX → PDF
│   │   │   ├── validator.ts         # Règles OHADA (capital min, etc.)
│   │   │   └── storage.ts           # Stockage fichiers générés
│   │   └── middleware/
│   │       └── auth.middleware.ts
│   ├── templates/                   # TEMPLATES .docx (fournis par le client)
│   │   ├── sarl/
│   │   │   ├── statuts.docx
│   │   │   ├── pv-nomination-gerant.docx
│   │   │   └── registre-associes.docx
│   │   ├── sa/
│   │   │   ├── statuts.docx
│   │   │   ├── pv-ag-constitutive.docx
│   │   │   ├── pv-nomination-dg.docx
│   │   │   └── registre-actionnaires.docx
│   │   ├── sas/
│   │   │   ├── statuts.docx
│   │   │   └── pv-president.docx
│   │   ├── sci/
│   │   │   ├── statuts.docx
│   │   │   └── pv-gerant.docx
│   │   ├── gie/
│   │   │   └── convention-constitutive.docx
│   │   ├── ei/
│   │   │   └── declaration-activite.docx
│   │   ├── pv/
│   │   │   ├── pv-ago.docx
│   │   │   ├── pv-age.docx
│   │   │   └── pv-dissolution.docx
│   │   └── cessions/
│   │       ├── cession-parts-sarl.docx
│   │       ├── augmentation-capital.docx
│   │       └── reduction-capital.docx
│   └── data/
│       └── ohada-rules.json         # Règles OHADA (capital min, seuils, etc.)
│
├── nginx/
├── docs/
│   ├── ARCHITECTURE.md
│   └── VARIABLES-TEMPLATES.md
├── docker-compose.yml
├── package.json
└── README.md
```

## Variables des templates

Les templates `.docx` utilisent la syntaxe `{variable}` de docxtemplater :

### Variables communes (toutes sociétés)
- `{denomination}` — Nom de la société
- `{forme_juridique}` — SARL, SA, SAS, SCI, GIE
- `{capital}` — Montant du capital en FCFA
- `{capital_lettres}` — Capital en toutes lettres
- `{siege_social}` — Adresse du siège
- `{ville}` — Ville
- `{pays}` — Pays (défaut : République du Congo)
- `{objet_social}` — Description de l'activité
- `{duree}` — Durée de la société (défaut : 99 ans)
- `{date_creation}` — Date de création
- `{exercice_debut}` — Début exercice social (défaut : 1er janvier)
- `{exercice_fin}` — Fin exercice social (défaut : 31 décembre)

### Variables associés (boucle)
- `{#associes}` ... `{/associes}` — Boucle sur les associés
- `{nom}` — Nom complet
- `{nationalite}` — Nationalité
- `{adresse}` — Adresse
- `{parts}` — Nombre de parts
- `{apport}` — Montant de l'apport en FCFA
- `{pourcentage}` — % du capital

### Variables gérance
- `{gerant_nom}` — Nom du gérant / DG
- `{gerant_nationalite}` — Nationalité
- `{gerant_adresse}` — Adresse
- `{gerant_duree}` — Durée du mandat
- `{gerant_remuneration}` — Rémunération (si applicable)

## Règles OHADA intégrées

| Forme | Capital minimum | Associés min | Associés max |
|---|---|---|---|
| SARL | 1.000.000 FCFA | 1 | 50 |
| SA | 10.000.000 FCFA | 1 | Illimité |
| SAS | 1.000.000 FCFA | 1 | Illimité |
| SCI | Libre | 2 | Illimité |
| GIE | Libre | 2 | Illimité |

## Parcours utilisateur

1. **Choix** → Type de document (statuts SARL, PV, cession...)
2. **Formulaire** → Wizard multi-étapes avec validation OHADA
3. **Récapitulatif** → Vérification avant génération
4. **Génération** → Backend injecte les variables dans le template .docx
5. **Téléchargement** → .docx + .pdf disponibles
6. **Historique** → Documents sauvegardés dans le compte

## Pricing

| Plan | Prix | Documents/mois |
|---|---|---|
| FREE | 0€ | 1 document (preview uniquement) |
| STARTER | 79€/an | 10 documents/mois |
| PRO | 149€/an | 30 documents/mois |
| CABINET | 299€/an | Illimité + marque blanche |
