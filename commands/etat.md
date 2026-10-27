---
description: Met à jour le fichier d'état de la tâche (étape, fait, décisions, prochaine action) avant de rendre la main
argument-hint: [ce qui vient de changer]
---

Applique le skill `workflow-tache`. Mets à jour `stateFile` d'après l'état git, la conversation et `$ARGUMENTS` :
étape franchie, ce qui est fait (avec les résultats de vérification réels), décisions de `reviewer` avec leur date
(AAAA-MM-JJ, jamais « hier »), ce qui reste hors tâche, et une **prochaine action** assez précise pour qu'une autre
session, sur un autre compte, reprenne sans la conversation. Ne commite rien.
