---
description: Rédige le compte rendu de la tâche (fait, textes nouveaux, écarts, questions, contrôle) pour la validation
---

Applique le skill `workflow-tache`. Compte rendu de la tâche en cours (fichier d'état, `git diff <baseBranch>...HEAD`,
résultats de la dernière vérification). Rien d'inventé : un contrôle non lancé est dit non lancé.

| Rubrique | Contenu |
|---|---|
| Fait | Ce qui est livré ; les critères d'acceptation de la fiche, cochés un par un |
| Textes nouveaux | Les textes absents du brief, en FR **et** en EN, avec leur clé |
| Écarts | Chaque écart au brief ou à la fiche et sa raison. Un écart non signalé est un défaut |
| Questions | Les manques rencontrés, à reporter dans les questions ouvertes du projet |
| Contrôle | Contrôles automatiques, tests (réussis / ignorés / en échec), bloquants, à corriger, remarques, captures |

Puis passe le fichier d'état à l'étape 7 avec la prochaine action « validation par `reviewer`, sur ordinateur et
téléphone ». Termine en demandant, par formulaire, l'accord pour les commits proposés (messages listés) et la pull
request.
