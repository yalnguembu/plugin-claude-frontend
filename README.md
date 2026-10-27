# plugin-claude-frontend

Plugin Claude Code pour les projets front : le workflow d'une tâche (une tâche, une branche, une pull request vers
`develop`), des gardes qui le font respecter, la recette MVVM du front et une revue avant présentation.
Générique : chaque projet le règle par un fichier de configuration.

Ce dépôt est à la fois **le plugin** et **sa marketplace** (`.claude-plugin/marketplace.json`).

## Contenu

| Type | Nom | Rôle |
|---|---|---|
| Commande | `/plugin-claude-frontend:tache-debut <branche ou ID>` | Ouvre ou reprend une tâche : branche tirée de la base, contrat à jour, lecture de la fiche, questions avant de coder |
| Commande | `/plugin-claude-frontend:aligner-contrat` | Sous-module du contrat, CHANGELOG depuis la version alignée, client régénéré, commit proposé |
| Commande | `/plugin-claude-frontend:verifier [fin]` | Scripts de contrôle, specs e2e de la tâche (ou suite de fin de cycle), revue, contrôle visuel, critères |
| Commande | `/plugin-claude-frontend:compte-rendu` | Fait, textes nouveaux, écarts, questions, contrôle ; demande l'accord |
| Commande | `/plugin-claude-frontend:livrer` | Commits conventionnels, envoi, pull request vers la base, après accord |
| Commande | `/plugin-claude-frontend:etat [note]` | Met à jour le fichier d'état pour la session suivante |
| Skill | `workflow-tache` | Règles absolues, configuration, fichier d'état, étapes |
| Skill | `ajouter-une-feature` | Recette MVVM : modèle Zod, règles pures, stubs, ViewModel, page, route, textes, specs |
| Skill | `controle-visuel` | Application de la liste de contrôle visuel et rapport par gravité |
| Agent | `revue-tache` | Revue en lecture seule du diff contre la fiche, le contrat et les règles |
| Hook | `SessionStart` | État git et du sous-module, alerte sur une branche protégée, rappel du fichier d'état |
| Hook | `PreToolUse` | Les gardes ci-dessous |

### Gardes

| Refusé | Demande l'accord |
|---|---|
| Toute action sur une branche protégée (`main`) : branche, commit, fusion, remise à zéro, envoi | `git commit` |
| Commit, envoi ou remise à zéro directement sur la branche de base | `git push` |
| `git merge`, `git pull` sans `--ff-only`, `gh pr merge` | `gh pr create` / `gh pr edit` |
| Un mot de `forbiddenInCommits` dans un commit ou une pull request | `git tag <nom>` |
| Écriture dans `readOnlyPaths` (outils d'édition, redirection, git dans le sous-module) | |
| Lecture, recherche, modification ou ajout d'un fichier `.env` (sauf `allowedEnvFiles`) | |

« Demande l'accord » force la question à l'utilisateur, même en mode automatique (`requireApproval: false` la retire).

## Installation

Prérequis : Claude Code, Node.js 18 ou plus (les hooks sont en Node, pour tourner pareil sous Windows, macOS et Linux).

### Pour soi

```
/plugin marketplace add yalnguembu/plugin-claude-frontend
/plugin install plugin-claude-frontend@plugin-claude-frontend
```

### Pour un projet (toute l'équipe)

Dans le `.claude/settings.json` du projet, version épinglée par son étiquette :

```json
{
  "extraKnownMarketplaces": {
    "plugin-claude-frontend": {
      "source": { "source": "github", "repo": "yalnguembu/plugin-claude-frontend", "ref": "v0.2.0" }
    }
  },
  "enabledPlugins": {
    "plugin-claude-frontend@plugin-claude-frontend": true
  }
}
```

Claude Code propose alors le plugin à chaque personne qui fait confiance au dossier. Monter de version = changer
`ref`, puis `/plugin marketplace update plugin-claude-frontend`.

### Configuration

Copier [`templates/plugin-claude-frontend.json`](templates/plugin-claude-frontend.json) dans
`.claude/plugin-claude-frontend.json` du projet et l'adapter. Les clés absentes prennent leur valeur par défaut
(table du skill [`workflow-tache`](skills/workflow-tache/SKILL.md)). Sans fichier, le hook de démarrage le signale.

Si le projet avait déjà son hook de démarrage (état git), le retirer : celui du plugin le remplace.

### Développer le plugin en local

```bash
claude --plugin-dir D:/Projets/plugin-claude-frontend
```

## Versionnage

[Versionnage sémantique](https://semver.org/lang/fr/), règles dans le [CHANGELOG](CHANGELOG.md). La version vit dans
`.claude-plugin/plugin.json` seulement.

- Branches : `develop` est la branche de référence ; une modification = une branche (`feat/…`, `fix/…`) et une pull
  request vers `develop`. Rien sur `main`.
- Publier une version :

```bash
npm run version:bump -- minor
```

  Le script date la section « Non publié » du CHANGELOG et monte la version de `plugin.json`. Puis commit
  `chore(release): X.Y.Z`, pull request, et après la fusion l'étiquette `vX.Y.Z` sur `develop`, que les projets
  épinglent par `ref`.

## Tests

```bash
npm test
```

Les règles des gardes sont des fonctions pures (`hooks/lib/rules.mjs`), testées avec `node:test`, sans dépendance.
