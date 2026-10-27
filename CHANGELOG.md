# Changelog

Ce fichier suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le
[versionnage sémantique](https://semver.org/lang/fr/) :

- **majeure** : une règle de garde plus stricte, une clé de configuration renommée ou retirée, une commande renommée ;
- **mineure** : une commande, un skill, un agent, une garde ou une clé de configuration en plus ;
- **correctif** : une garde corrigée, un texte précisé.

## [Non publié]

## [0.1.0] - 2026-10-27

### Ajouté

- Commandes du workflow : `tache-debut`, `aligner-contrat`, `verifier`, `compte-rendu`, `livrer`, `etat`.
- Skills : `workflow-tache` (règles et configuration), `ajouter-une-feature` (recette MVVM), `controle-visuel`.
- Agent `revue-tache` : revue en lecture seule contre la fiche, le contrat et la liste de contrôle.
- Hooks : état git au démarrage ; gardes sur les branches protégées, la branche de base, les fusions locales,
  l'accord avant commit, envoi et pull request, l'attribution, les chemins en lecture seule et les fichiers `.env`.
- Configuration par projet : `.claude/claude-pluggin-frontend.json`.
