---
name: controle-visuel
description: Applique la liste de contrôle visuel du projet à un écran développé (contrôles automatiques, captures par largeur, thème, langue, état et cas, principes, finition, code) et rédige le rapport de contrôle avec gravités. À utiliser avant de présenter un écran, ou quand on demande de contrôler des captures.
---

# Contrôle visuel d'un écran

La liste du projet fait foi : `visualChecklist` de `.claude/plugin-claude-frontend.json` (par défaut
`design/10-kit-claude-design/controle-visuel.md`). **Lis-la entière** ; ce skill dit seulement comment l'appliquer.

## Gravité

| Gravité | Définition | Effet |
|---|---|---|
| Bloquant | Échec d'un contrôle automatique, d'un principe, d'une règle métier, de l'accessibilité, mot interdit | Écran non validé |
| À corriger | Écart de finition sans effet sur le sens ni l'accès | Corrigé avant la validation |
| Remarque | Amélioration possible, question non tranchée | Remontée dans le compte rendu |

Une tâche est validée quand il ne reste ni bloquant ni « à corriger ».

## Déroulé

1. **Contrôles automatiques**, dans l'ordre de la liste ; un échec arrête le contrôle.
2. **Captures** produites par les specs e2e de l'écran (scénarios `?theme=`, `?langue=`, `?etat=`, `?cas=`, `?sans=`) :
   au minimum FR clair à 360, 768 et 1440 ; FR sombre à 360 et 1440 ; EN clair à 360 ; une à 360 par état, cas et
   permission retirée de la fiche. **Regarde chaque image** (outil Read) : un contrôle sur image non regardée est un
   contrôle non fait.
3. **Contrôles par principe, de finition, de comportement et du code** de la liste, en citant leur identifiant.
4. Les largeurs sans capture conservée (390, paysage, 1024, 1280) se vérifient en direct si l'outil le permet ; sinon
   dis qu'elles n'ont pas été vues.

## Rapport

```markdown
### Contrôle — <ID> · <écran> — <JJ/MM/AAAA>

CV-AUTO-1 ✅ · CV-AUTO-2 ✅ · … · Captures n / n · Bloquants b · À corriger c · Remarques r

| Contrôle | Gravité | Constat | Capture |
|---|---|---|---|
```

Seuls les points relevés sont détaillés. Il va dans la rubrique « Contrôle » du compte rendu.
