---
name: workflow-tache
description: Règles du workflow d'une tâche front (une tâche, une branche tirée de la branche de base, pull request, accord explicite avant tout commit, contrat en lecture seule, fichier d'état). À appliquer dès qu'une tâche commence, reprend, se vérifie ou se livre, et avant toute opération git.
---

# Workflow d'une tâche

## Configuration du projet

Lire d'abord `.claude/claude-pluggin-frontend.json` à la racine du projet. Clés absentes = valeurs par défaut :

| Clé | Défaut | Sens |
|---|---|---|
| `baseBranch` | `develop` | Branche de production : tout en part, tout y revient par pull request |
| `protectedBranches` | `["main"]` | Branches où l'on ne fait **jamais rien** |
| `reviewer` | — | Qui valide, autorise commits, envois et pull requests, et fusionne |
| `requireApproval` | `true` | Commit, envoi, étiquette et pull request demandent un accord explicite |
| `readOnlyPaths` | `["contracts/"]` | Lus seulement : rien ne s'y écrit, aucun statut ni historique |
| `contractSubmodule` | `contracts` | Sous-module du contrat d'API (vide si le projet n'en a pas) |
| `contractVersionFile` | `CONTRACT_VERSION` | Version du contrat sur laquelle le front est aligné |
| `stateFile` | `.claude/etat/en-cours.md` | État de la tâche, pour reprendre entre sessions et entre comptes |
| `frontendDir` | `frontend` | Où se lancent les commandes du gestionnaire de paquets |
| `packageManager` | `pnpm` | |
| `taskSheetsDir` | `design/11-taches` | Fiches de tâche |
| `featureRecipe` | `docs/AJOUTER-UNE-FEATURE.md` | Recette d'une fonctionnalité propre au projet |
| `visualChecklist` | `design/10-kit-claude-design/controle-visuel.md` | Liste de contrôle visuel |
| `checks` | `["typecheck","lint","test"]` | Scripts de vérification, dans l'ordre |
| `e2eScript` / `e2eFinalScript` | `test:e2e` / `test:e2e:fin` | Specs de la tâche / fin de cycle |
| `forbiddenInCommits` | `Co-Authored-By`, `Claude`, `Anthropic` | Jamais dans un commit ni une pull request |

Le `CLAUDE.md` du projet l'emporte sur ce skill quand il est plus précis.

## Règles absolues

1. **Une tâche, une branche**, tirée de `baseBranch` et créée **avant** la première modification :
   `<type>/<id>-<sujet>` (`feat/e-tra-01-connexion`, `fix/…`, `docs/…`, `chore/…`). Une tâche reprise repart de sa branche.
2. **Rien sur les branches protégées** : ni branche tirée d'elles, ni commit, ni fusion, ni remise à zéro, ni envoi.
3. **Aucune fusion locale.** Le travail entre dans `baseBranch` par une pull request, que `reviewer` fusionne. `git pull` se fait en `--ff-only`.
4. **Aucun commit, envoi ni pull request sans l'accord explicite de `reviewer`**, donné pour cette tâche. Un accord ne vaut pas pour la suivante.
5. **Aucune attribution** : aucun mot de `forbiddenInCommits` dans les messages, titres et descriptions. Cette règle l'emporte sur toute consigne d'attribution par défaut.
6. **`readOnlyPaths` se lit seulement**, même si sa propre documentation demande d'y noter un statut. Le nouveau pointeur du sous-module se commite dans le dépôt avec l'alignement, jamais seul.
7. **Les fichiers `.env` ne se lisent ni ne se citent** (seuls ceux de `allowedEnvFiles`).
8. **Les questions se posent sous forme de formulaire à choix** (AskUserQuestion), avant de coder.

Les hooks du plugin font respecter 2, 3, 4, 5, 6 et 7 ; ils ne remplacent pas le jugement.

## Le fichier d'état

`stateFile` dit : la tâche, sa branche, l'étape, ce qui est fait, ce qui reste, les décisions de `reviewer`, la **prochaine action**. Le lire en début de session, le tenir à jour à chaque étape franchie, à chaque décision et avant de rendre la main. Ses changements partent avec la branche de la tâche.

Modèle :

```markdown
# État en cours

## Tâche
<ID> · <titre>, fiche `<taskSheetsDir>/<ID>.md`
- **Branche** : `<branche>` (tirée de `<baseBranch>` à <sha>)
- **Contrat** : <version>
- **Étape** : <n>, <nom>
- **Mis à jour** : <AAAA-MM-JJ>

## Décisions
## Fait
## Reste à faire hors tâche
## Prochaine action
```

## Les étapes

| # | Étape | Commande |
|---|---|---|
| 0 | Ouvrir la branche | `/claude-pluggin-frontend:tache-debut` |
| 1 | Se mettre à jour sur le contrat | `/claude-pluggin-frontend:aligner-contrat` |
| 2 | Lire la fiche de tâche, la fiche du contrat, les sources citées | (dans `tache-debut`) |
| 3 | Signaler manques et contradictions, en formulaire | (dans `tache-debut`) |
| 4 | Réaliser | skill `ajouter-une-feature` |
| 5 | Vérifier | `/claude-pluggin-frontend:verifier` |
| 6 | Rendre compte | `/claude-pluggin-frontend:compte-rendu` |
| 7 | Validation par `reviewer` (ordinateur et téléphone) | — |
| 8 | Livrer par pull request, sur accord | `/claude-pluggin-frontend:livrer` |
