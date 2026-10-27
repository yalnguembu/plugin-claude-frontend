---
description: Ouvre ou reprend une tâche (branche tirée de la branche de base, contrat à jour, lecture de la fiche, questions avant de coder)
argument-hint: <type>/<id>-<sujet> | <ID de fiche>
---

Applique le skill `workflow-tache` (configuration du projet, règles absolues). Tâche demandée : $ARGUMENTS

1. **Reprise ?** Lis le fichier d'état (`stateFile`). S'il décrit une tâche en cours, compare-le à l'état git
   (`git status -sb`, branche courante). Si c'est la même tâche, repars de sa branche et de sa « Prochaine action ».
   Si une autre tâche a des modifications non commitées, arrête-toi et demande à `reviewer` quoi en faire
   (formulaire), sans rien jeter ni remiser.
2. **Ouvrir la branche**, avant toute modification :
   - `git switch <baseBranch>` puis `git pull --ff-only` ;
   - `git switch -c <type>/<id>-<sujet>` (déduis le nom de la fiche si seul l'ID est donné, en minuscules, sans accent).
   - Jamais depuis une branche protégée.
3. **Contrat** : si `contractSubmodule` existe, suis `/claude-pluggin-frontend:aligner-contrat` (sans commit).
4. **Lire** la fiche de tâche (`taskSheetsDir`), la fiche du contrat qu'elle cite, puis seulement les sources
   qu'elle cite. Vérifie que la fiche du contrat est prête côté API ; sinon dis-le : la tâche attend ou se prépare sur
   des stubs, en le disant.
5. **Signaler avant de coder** chaque manque ou contradiction (contrat, fiche, brief), en **un formulaire à choix**.
   Ce que l'API ne fournit pas ne s'invente pas.
6. **Écrire le fichier d'état** (modèle du skill) : tâche, branche et sha de départ, version du contrat, étape 4,
   décisions, prochaine action.

Termine par un résumé de trois lignes : branche, version du contrat, questions en attente.
