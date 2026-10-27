---
description: Vérifie la tâche avant de la présenter (scripts de contrôle, specs e2e de la tâche, contrôle visuel, critères d'acceptation)
argument-hint: [fin]  — « fin » ajoute la suite de fin de cycle, avant la pull request
---

Applique le skill `workflow-tache`. Dans `frontendDir`, avec `packageManager` :

1. Chaque script de `checks`, dans l'ordre (par défaut `typecheck`, `lint`, `test`), puis les autres contrôles que
   le `CLAUDE.md` du projet impose (couleurs, traductions…). Un échec : corrige-le, puis relance ce script.
2. `<e2eScript> <specs de la tâche>` : **les specs de la tâche seulement**, jamais la suite entière sur le serveur de
   développement. Lance les commandes longues en arrière-plan.
3. Si `$ARGUMENTS` contient `fin` : `<e2eFinalScript>` (toute la suite sur l'app construite). Un test instable se
   corrige à sa cause, jamais par un réessai.
4. Lance l'agent `revue-tache` sur la tâche (fiche, branche) et le skill `controle-visuel` sur les captures.
5. Reprends les critères d'acceptation de la fiche **un par un** : rempli, ou pourquoi pas.

Rends les résultats tels quels (nombre de tests réussis, ignorés, en échec, avec la sortie d'un échec), puis mets à
jour la rubrique « Fait » du fichier d'état.
