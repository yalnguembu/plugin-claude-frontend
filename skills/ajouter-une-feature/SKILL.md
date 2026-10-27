---
name: ajouter-une-feature
description: Recette MVVM pour ajouter un écran ou une fonctionnalité au front React + TypeScript (contrat, modèle Zod, règles pures testées, stubs de scénario, ViewModel, composants, page sur gabarit, route avec permission, textes FR/EN, specs e2e). À utiliser à l'étape « Réaliser » d'une tâche, ou dès qu'on ajoute un appel d'API, une page ou une route.
---

# Ajouter une fonctionnalité (MVVM)

Si le projet a sa propre recette (`featureRecipe` de `.claude/plugin-claude-frontend.json`, par défaut
`docs/AJOUTER-UNE-FEATURE.md`), **lis-la d'abord : elle l'emporte** et nomme la feature de référence à imiter.
Ce qui suit en est la forme générique. Chemins relatifs à `frontendDir`, alias `@/` → `src/`.

**Principe : les pages sont passives, les ViewModels portent toute la logique.**

| # | Étape | Où | À retenir |
|---|---|---|---|
| 0 | Contrat | contrat d'API, client généré | La fiche du contrat est prête. Régénérer le client, retrouver les helpers générés (`get…Options`, `…QueryKey`, `post…Mutation`). Ce que le contrat ne dit pas est une **question**, jamais une hypothèse |
| 1 | Modèle | `src/models/<x>.model.ts` | Schéma Zod + `mapToXModel(dto)`, **permissif** (`z.string()` pour un statut, défauts pour les champs absents), `version` gardée telle quelle. On mappe dans le `select` ; aucun composant ne voit un DTO |
| 2 | Règles pures | `src/lib/<x>.ts` + `<x>.test.ts` | Tout ce qui décide sans React : ce que l'écran propose, ce qui est permis, ce que fait chaque refus de l'API (on ne teste que `errorCode`). Les tests unitaires vont ici |
| 3 | Stubs et scénarios | `src/dev/scenario/<x>Stubs.ts` | Même enveloppe, mêmes `errorCode` et `detail` que le contrat (FR et EN), données crédibles, `?etat=` et `?cas=` de la fiche. Toujours derrière `import.meta.env.DEV` : rien dans le build |
| 4 | ViewModel | `src/hooks/use<X>ViewModel.ts` | `useQuery({ ...base, queryFn: stub ?? base.queryFn, select })`. Mutations : helper généré, `onError` par le gestionnaire d'erreurs. Une écriture remet la ressource en cache et invalide la liste. Permissions depuis `useSecurity()`, jamais en dur |
| 5 | Composants métier | `src/components/features/<domaine>/` | Uniquement les composants de la bibliothèque du projet. Un manque se comble dans la bibliothèque et se signale |
| 6 | Page | `src/pages/…` | Sur son gabarit. **Ni `useQuery`, ni `useState`, ni règle** : elle lit son ViewModel et remplit les zones |
| 7 | Route | `src/router/routes/…` | Mince : `component` + `beforeLoad: requirePermission(context.me, PERMISSION.X)`. Adresse du plan du site, permission du contrat |
| 8 | Textes | `src/i18n/locales/{fr,en}/*.json` | Format ICU, clés en anglais et hiérarchiques, chaque clé dans les deux langues. Jamais de texte en dur ; montants et dates par les fonctions de format uniques |
| 9 | Tests d'écran | `e2e/<x>.spec.ts` | Captures nommées selon la liste de contrôle, axe-core sur chacune, pas de défilement horizontal, puis chaque critère d'acceptation |
| 10 | Vérifier | — | `/plugin-claude-frontend:verifier` |

## Pièges

- **Erreurs** : afficher `detail` (déjà traduit par l'API), ne tester que `errorCode` ; `validationErrors` sous leurs
  champs. Un `errorCode` inconnu se traite par son statut HTTP.
- **Aucun appel axios ad hoc**, jamais d'édition du code généré, jamais de `Content-Type` global (casse le multipart).
- **Aucune donnée serveur recopiée dans un store** : TanStack Query porte l'état serveur.
- **Une modale de formulaire fait `reset()` à chaque ouverture.**
- **Aucune couleur hors des jetons du thème** ; aucune couleur Tailwind par défaut.
- **Téléphone d'abord**, puis ordinateur, puis tablette : trois mises en page dans un seul composant.
- **Rien d'inventé** : règle métier, route, champ, message, entrée de menu ou permission absents des sources sont une
  question à poser en formulaire.
