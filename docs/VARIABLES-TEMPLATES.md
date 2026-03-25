# NORMX Legal — Variables des Templates

## Comment préparer un template .docx

1. Créer le document Word normalement
2. Remplacer chaque donnée variable par `{nom_variable}`
3. Pour les listes (associés), utiliser `{#associes}` ... `{/associes}`
4. Déposer dans `server/templates/<type>/`

## Syntaxe

| Syntaxe | Usage |
|---|---|
| `{variable}` | Texte simple |
| `{#liste}` ... `{/liste}` | Boucle (répète le bloc pour chaque élément) |
| `{#condition}` ... `{/condition}` | Conditionnel (affiche si vrai) |
| `{variable \| upper}` | Majuscules |

## Variables par type de document

### SARL — Statuts

```
{denomination}
{forme_juridique}          → "Société à Responsabilité Limitée"
{sigle}                    → Sigle éventuel
{capital}                  → "5.000.000"
{capital_lettres}          → "cinq millions"
{devise}                   → "FCFA"
{siege_social}             → Adresse complète
{ville}
{pays}                     → "République du Congo"
{objet_social}             → Description activité
{duree}                    → "99"
{date_creation}
{exercice_debut}           → "1er janvier"
{exercice_fin}             → "31 décembre"
{nombre_parts}             → Total parts sociales
{valeur_nominale}          → Valeur d'une part

{#associes}
  {rang}                   → "1", "2", "3"...
  {civilite}               → "Monsieur" / "Madame"
  {nom}
  {prenom}
  {date_naissance}
  {lieu_naissance}
  {nationalite}
  {profession}
  {adresse}
  {parts}                  → Nombre de parts
  {apport}                 → Montant apport FCFA
  {apport_lettres}
  {pourcentage}            → "33,33"
  {type_apport}            → "numéraire" / "nature"
{/associes}

{gerant_civilite}
{gerant_nom}
{gerant_prenom}
{gerant_date_naissance}
{gerant_lieu_naissance}
{gerant_nationalite}
{gerant_adresse}
{gerant_duree_mandat}      → "4 ans" / "durée de la société"
{gerant_remuneration}      → "fixée par décision collective"

{rcs_ville}                → Ville du RCS
{date_signature}
{lieu_signature}
```

### SA — Statuts

Mêmes variables que SARL plus :
```
{nombre_actions}
{valeur_action}
{capital_autorise}
{conseil_admin_min}        → Nombre minimum administrateurs
{conseil_admin_max}
{president_ca_nom}
{dg_nom}
{commissaire_comptes_nom}
{commissaire_comptes_cabinet}
```

### PV de nomination (gérant SARL)

```
{denomination}
{forme_juridique}
{capital}
{siege_social}
{rcs_numero}
{date_assemblee}
{heure_assemblee}
{lieu_assemblee}
{president_seance}
{scrutateur}

{#associes}
  {nom}
  {parts}
  {present}                → "présent" / "représenté"
{/associes}

{total_parts_presentes}
{quorum}                   → "100%" / "75%"

{gerant_nom}
{gerant_prenom}
{gerant_adresse}
{gerant_duree_mandat}
{gerant_remuneration}
{date_effet}
```

### Cession de parts (SARL)

```
{cedant_nom}
{cedant_prenom}
{cedant_adresse}
{cedant_parts}             → Nombre de parts cédées

{cessionnaire_nom}
{cessionnaire_prenom}
{cessionnaire_adresse}

{denomination}
{capital}
{prix_unitaire}
{prix_total}
{prix_total_lettres}
{date_cession}

{#associes_agreant}
  {nom}
  {parts}
{/associes_agreant}
```

## Règles de validation OHADA

### SARL
- Capital minimum : 1.000.000 FCFA
- Parts : valeur nominale ≥ 5.000 FCFA
- Associés : 1 à 50
- Gérant : personne physique obligatoire
- Commissaire aux comptes : obligatoire si CA > 250.000.000 FCFA

### SA
- Capital minimum : 10.000.000 FCFA (sans APE) / 100.000.000 FCFA (avec APE)
- Actions : valeur nominale ≥ 10.000 FCFA
- Actionnaires : minimum 1
- Conseil d'administration : 3 à 12 membres
- Commissaire aux comptes : obligatoire

### SAS
- Capital minimum : 1.000.000 FCFA
- Actions : valeur libre
- Associés : minimum 1
- Président : obligatoire (personne physique ou morale)

### SCI
- Capital : libre
- Associés : minimum 2
- Gérant : personne physique obligatoire
