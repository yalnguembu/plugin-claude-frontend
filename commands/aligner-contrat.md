---
description: Met le front à jour sur la dernière version du contrat d'API (sous-module en lecture seule, CHANGELOG, client régénéré)
---

Applique le skill `workflow-tache`. Vérifie d'abord d'être sur la branche d'une tâche (jamais `baseBranch`, jamais une
branche protégée).

1. Depuis la racine : `git submodule update --init --remote <contractSubmodule>`. Ne rien écrire dans le sous-module.
2. Lis la version actuelle (`contractVersionFile`) et la nouvelle (CHANGELOG du contrat, ou son étiquette). Si elles sont
   égales, dis-le et arrête.
3. Lis le `CHANGELOG.md` du contrat **depuis la version actuelle** : liste pour chaque version les ruptures et
   « ce que le frontend doit faire ».
4. Dans `frontendDir` : les scripts de synchronisation et de génération du client du `package.json`
   (par exemple `sync:contract` puis `generate:api`). Ne jamais modifier le code généré à la main.
5. Mets `contractVersionFile` à la nouvelle version, puis `typecheck`. Corrige ce que les ruptures cassent, ou
   signale-le à `reviewer` si cela dépasse la tâche.
6. Mets à jour le fichier d'état (version du contrat, ce que les versions suivantes annoncent).

Propose le commit `chore(contract): align on contract X.Y.Z` (pointeur du sous-module, fichier de version, contrat
copié, client généré), **sans le faire** : il attend l'accord de `reviewer`.
