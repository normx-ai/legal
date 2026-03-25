# NORMX Legal — État d'avancement

> Dernière mise à jour : 25 mars 2026

## Vue d'ensemble

Application de génération automatique de documents juridiques conformes à l'Acte Uniforme OHADA, adaptés au droit congolais.

**Stack technique** : Expo (React) + Express + PostgreSQL (Prisma) + docxtemplater + Docker/Nginx

---

## Documents implémentés

### 1. Statuts SARL (30 articles)
- **Route** : `POST /api/generate/sarl`
- **Template** : `server/templates/sarl/statuts.docx` (16 Ko)
- **Wizard** : 7 étapes (Société, Associés, Capital, Gérance, Clauses, Récapitulatif, Aperçu)
- **Spécificités** :
  - 2 à 50 associés
  - Capital minimum : 1.000.000 FCFA
  - Valeur nominale minimum : 5.000 FCFA
  - Libération : intégrale ou à la moitié
  - Apports : numéraire, nature (avec/sans commissaire aux apports), industrie
  - Cessions entre associés : libre ou soumis à agrément (conditionnel)
  - Cessions famille : libre ou soumis à agrément (conditionnel)
  - Transmission décès : libre ou agrément requis (conditionnel)
  - Contestations : droit commun ou arbitrage OHADA (conditionnel)
  - Limitation de pouvoirs du gérant (conditionnel)
  - Majorité de nomination personnalisable
  - Mandataire pour engagements (art. 29)

### 2. Statuts SARLU — SARL Unipersonnelle (23 articles)
- **Route** : `POST /api/generate/sarlu`
- **Template** : `server/templates/sarlu/statuts.docx` (9 Ko)
- **Wizard** : Même wizard que SARL, auto-détecté quand 1 seul associé
- **Spécificités** :
  - Associé unique (formulations au singulier)
  - Pas de cessions entre associés
  - Décisions de l'associé unique (pas d'assemblée)
  - Art. 21 : dissolution sans mise en liquidation (transmission universelle)

### 3. Statuts SA avec Administrateur Général (22 articles)
- **Route** : `POST /api/generate/sa-ag`
- **Template** : `server/templates/sa-ag/statuts.docx` (15 Ko)
- **Wizard** : 8 étapes (Société, Actionnaires, Capital, Admin. Général, CAC, Clauses, Récapitulatif, Aperçu)
- **Spécificités** :
  - Capital minimum : 10.000.000 FCFA (sans APE)
  - Valeur nominale minimum : 10.000 FCFA
  - Actions (pas des parts)
  - Libération : intégrale, au 1/4 ou à la 1/2
  - Administrateur Général unique (nomination, pouvoirs, rémunération, AG adjoint, révocation)
  - Commissaire aux comptes obligatoire (titulaire + suppléant)
  - 3 variantes cession à des tiers : clause d'agrément, clause de préemption, clause d'inaliénabilité
  - Représentation en assemblée : libre ou actionnaire uniquement
  - Actions de préférence, vote double possible

### 4. Statuts SA avec Conseil d'Administration (27 articles)
- **Route** : `POST /api/generate/sa-ca`
- **Template** : `server/templates/sa-ca/statuts.docx` (18 Ko)
- **Wizard** : 9 étapes (Société, Actionnaires, Capital, Conseil d'Administration, Direction Générale, CAC, Clauses, Récapitulatif, Aperçu)
- **Spécificités** :
  - CA de 3 à 12 membres
  - Président du CA choisi parmi les membres
  - 2 variantes direction générale :
    - Variante 1 : PCA + Directeur Général séparés
    - Variante 2 : Président-Directeur Général (PDG)
  - Délibérations du CA : quorum, majorité, voix prépondérante du président (conditionnel)
  - Représentation au CA : libre ou administrateur uniquement
  - Conventions réglementées (>10% du capital)
  - Mêmes clauses de cession que SA AG

---

## Infrastructure technique

### Frontend (mobile/)
- **Framework** : Expo SDK 54 / React 19 / React Native 0.81
- **Routing** : expo-router v6
- **State** : Zustand (auth, documents, wizard) avec persistance sessionStorage
- **Theme** : Light/Dark mode, palette NORMX (gold #D4A843 / navy #1A3A5C)
- **Fonts** : Playfair Display (titres) + Outfit (corps) via Google Fonts
- **i18n** : FR/EN via i18next
- **Design** : Style professionnel (inspiré LegalPlace/Legalstart)

### Backend (server/)
- **Framework** : Express 5
- **ORM** : Prisma (PostgreSQL)
- **Auth** : JWT + cookies httpOnly, refresh tokens
- **Génération DOCX** : docxtemplater + PizZip
- **Templates** : Times New Roman 12pt, justifié, en-tête société, pied de page (paraphes + page X/Y)
- **Validation** : Règles OHADA (capital min, valeur nominale, nombre associés/actionnaires)
- **Nombres en lettres** : Conversion automatique (ex: 5.000.000 → "cinq millions")

### Base de données
- **PostgreSQL 16** (container Docker, port 5435)
- **Modèles** : User, Organization, OrganizationMember, Subscription, Document

### Docker / Déploiement
- `docker-compose.yml` : API + PostgreSQL + Nginx
- Nginx : reverse proxy, SSL ready (LetsEncrypt), gzip, rate limiting
- Page de garde dans chaque document généré

---

## Documents à implémenter

| Document | Priorité | Statut |
|---|---|---|
| Statuts SAS | Haute | À faire |
| Statuts SCI | Haute | À faire |
| Convention GIE | Moyenne | À faire |
| Déclaration EI | Moyenne | À faire |
| PV de nomination gérant (SARL) | Haute | À faire |
| PV d'AGO | Haute | À faire |
| PV d'AGE | Haute | À faire |
| Cession de parts (SARL) | Haute | À faire |
| Augmentation de capital | Moyenne | À faire |
| Réduction de capital | Moyenne | À faire |
| PV de dissolution | Moyenne | À faire |

---

## Fonctionnalités à ajouter

- [ ] Conversion PDF (LibreOffice headless)
- [ ] Historique des documents avec re-téléchargement
- [ ] Système d'abonnement (FREE/STARTER/PRO/CABINET)
- [ ] Repo GitHub + déploiement VPS
- [ ] Tests unitaires (validation OHADA)
- [ ] Sidebar desktop pour navigation
- [ ] Gestion multi-organisation
- [ ] Export en lot (tous les documents d'une société)
