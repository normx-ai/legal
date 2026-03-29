# NORMX Legal — Audit Alignement Formulaire / Generateur / Template

**Date** : 29 mars 2026
**Auditeur** : Claude AI
**Scope** : 66 documents juridiques OHADA

---

## Resume

| Severite | Nombre | Description |
|----------|--------|-------------|
| CRITIQUE | 4 | Champ utilise dans le template Word mais undefined (affiche "undefined") |
| HAUT | 3 | Champ envoye par le formulaire mais ignore par le generateur (donnee perdue) |
| MOYEN | 2 | Decisions/options dans le generateur mais absentes du formulaire |
| OK | 57 | Alignement correct |

---

## CRITIQUE — Affiche "undefined" dans le Word

### 1. pouvoir-ag-sa

- **Fichiers** : `mobile/app/(app)/generate/pouvoir-ag-sa.tsx` / `server/src/services/generators/pouvoir-ag-sa.ts`
- **Probleme** : Le generateur attend `mandant_nombre_voix` (ligne 17) mais le frontend n'envoie que `mandant_nombre_actions`
- **Resultat** : Le champ nombre de voix affiche "0" dans le Word
- **Correction** : Mapper `mandant_nombre_voix` depuis `mandant_nombre_actions` ou ajouter le champ au formulaire

### 2. pv-reunion-ca — administrateurs visio

- **Fichiers** : `mobile/app/(app)/generate/pv-reunion-ca.tsx` / `server/src/services/generators/pv-reunion-ca.ts`
- **Probleme** : Le generateur mappe `administrateurs_visio` (ligne 61) mais le formulaire n'a pas de section visioconference
- **Resultat** : Liste vide dans le Word pour les administrateurs en visio
- **Correction** : Ajouter un champ "Administrateurs en visioconference" au formulaire ou retirer du template

### 3. pv-reunion-ca — commissaire represente par

- **Fichiers** : memes fichiers que ci-dessus
- **Probleme** : Le generateur attend `commissaire_represente_par` (ligne 61) mais le frontend n'envoie que `commissaire_nom` et `commissaire_present`
- **Resultat** : "undefined" dans le Word si le commissaire est represente
- **Correction** : Ajouter le champ `commissaire_represente_par` au formulaire

### 4. lettre-appel-fonds — RCCM

- **Fichiers** : `mobile/app/(app)/generate/lettre-appel-fonds.tsx` / `server/src/services/generators/lettre-appel-fonds.ts`
- **Probleme** : Le frontend envoie `rccm` (ligne 20, 219) mais le generateur ne le mappe pas dans les donnees du template
- **Resultat** : RCCM absent du Word genere
- **Correction** : Ajouter `rccm: formData.rccm || ""` dans le generateur

---

## HAUT — Donnees perdues (envoyees mais ignorees)

### 5. lettre-appel-fonds — champs signataire

- **Fichiers** : memes fichiers que ci-dessus
- **Probleme** : Le frontend envoie `dirigeant_civilite`, `dirigeant_nom`, `dirigeant_prenom`, `dirigeant_qualite`, `banque_depot`, `reference_ag` mais le generateur les ignore completement
- **Resultat** : Section signataire de la lettre vide ou incomplete
- **Correction** : Mapper tous les champs `dirigeant_*`, `banque_depot`, `reference_ag` dans le generateur

### 6. pouvoir-ag-sa — mandataire incomplet

- **Fichiers** : `server/src/services/generators/pouvoir-ag-sa.ts`
- **Probleme** : `mandataire_civilite` est lu avec un default (ligne 18) mais certains champs mandataire ne sont pas mappes correctement
- **Correction** : Verifier le mapping complet mandant/mandataire

### 7. convocation-ca — date signature

- **Fichiers** : `mobile/app/(app)/generate/convocation-ca.tsx` / `server/src/services/generators/convocation-ca.ts`
- **Probleme** : Le frontend envoie `date_signature` mais le generateur ne mappe que `date_envoi` et `lieu_envoi`
- **Correction** : Ajouter `date_signature` au generateur ou clarifier si `date_envoi` suffit

---

## MOYEN — Decisions non couvertes par le formulaire

### 8. pv-reunion-ca — 7 types de decisions manquants

- **Fichier** : `server/src/services/generators/pv-reunion-ca.ts` lignes 64-84
- **Decisions dans le generateur mais PAS dans le formulaire** :
  - `remplacement_president`
  - `empechement_president`
  - `deces_president`
  - `augmentation_capital_numeraire`
  - `reduction_capital_pertes`
  - `reduction_capital_remboursement`
  - `transfert_siege_autre_ville`
- **Decisions dans le formulaire** (lignes 163-174) :
  - `arrete_comptes`, `nomination_president`, `demission_president`, `revocation_president`, `nomination_dg`, `autorisation_conventions`, `cooptation`, `transfert_siege`, `rapport_ag`, `convocation_ag`
- **Correction** : Ajouter les 7 decisions manquantes au formulaire frontend

### 9. pv-age-dissolution — visioconference

- **Fichier** : `server/src/services/generators/pv-age-dissolution.ts`
- **Probleme** : `administrateurs_visioconference` mappe (ligne 24) mais formulaire ne supporte pas
- **Correction** : Ajouter le support visio au formulaire ou retirer du template

---

## DOCUMENTS VALIDES (aucun probleme detecte)

Les documents suivants sont correctement alignes (formulaire, generateur et template coherents) :

### Statuts
- sarl, sarlu, sas, sasu, sa-ag, sa-ca, sa-uni, snc, scs, gie, ste-part

### Assemblees generales
- pv-ago, pv-age, pv-ago-sa, pv-age-sa, conv-ago, conv-age
- pv-consultation-ecrite, pv-carence-ago, pv-carence-age
- deroulement-ag-sarl, deroulement-ag-sa
- feuille-presence, feuille-presence-ag-sa, feuille-presence-ca
- pouvoir-ag, pouvoir-ca
- avis-convocation-ag-sa, convocation-actionnaires-sa

### Decisions
- dec-associe-unique-gerant, dec-associe-unique-non-gerant
- dec-actionnaire-unique-ag, dec-actionnaire-unique-non-ag

### Capital et cessions
- acte-cession-parts, acte-cession-actions
- bulletin-souscription-constitution, bulletin-souscription-augmentation
- certificat-actions-nominatives
- renonciation-droits-souscription

### Dissolution et fusion
- pv-dissolution-liquidation, pv-age-dissolution
- pv-ca-dissolution, rapport-ca-dissolution
- projet-resolutions-dissolution, publication-nomination-liquidateur
- projet-fusion, projet-fusion-participation
- projet-fusion-societe-nouvelle, projet-fusion-absorbee-absorbante

### Autres
- drc, rapport-gestion, pacte-actionnaires
- lettre-consultation-gerance, lettre-info-ca-conventions
- lettre-notification-representant
- avis-cac-conventions-sa, avis-cac-conventions-sarl
- convocation-cac, requete-designation-cac
- requete-prorogation-ago
- mise-en-demeure-defaillant

---

## Recommandations

### Immediat (avant mise en production)
1. Corriger les 4 problemes CRITIQUES (champs undefined dans Word)
2. Corriger les 3 problemes HAUTS (donnees perdues)

### Court terme
3. Completer le formulaire pv-reunion-ca avec les 7 decisions manquantes
4. Ajouter le support visioconference la ou c'est pertinent

### Process
5. Ajouter un test automatise : pour chaque generateur, verifier que toutes les variables template ont un mapping frontend
6. Documenter le flux de donnees (formulaire → generateur → template) pour chaque document
