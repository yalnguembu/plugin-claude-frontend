---
description: Livre la tâche par pull request vers la branche de base, après l'accord explicite du responsable
---

Applique le skill `workflow-tache`.

1. **Accord** : ne continue que si `reviewer` a donné, dans cette conversation, son accord explicite pour **ces**
   commits et **cette** pull request. Sinon, demande-le par formulaire et arrête-toi.
2. **Branche** : celle de la tâche, jamais `baseBranch` ni une branche protégée.
3. **Commits** conventionnels en anglais, une intention par commit (`docs/CONVENTIONS.md` du projet s'il existe) :
   l'alignement du contrat d'abord (`chore(contract): align on contract X.Y.Z`), puis la fonctionnalité, les tests,
   l'état. N'ajoute jamais de fichier `.env` (sauf `allowedEnvFiles`) ni de fichier hors tâche. **Aucun** mot de
   `forbiddenInCommits`, aucune ligne `Co-Authored-By`.
4. Mets le fichier d'état à l'étape 8 et commite-le avec le reste.
5. `git push -u origin <branche>`.
6. Pull request **vers `baseBranch`** (`gh pr create --base <baseBranch>`) : titre conventionnel, description reprenant
   le compte rendu (fait, écarts, questions, contrôle). Aucune attribution, aucune mention d'un outil d'IA.
7. Donne le lien de la pull request. Ne la fusionne pas : `reviewer` la relit et la fusionne. La tâche est finie.
