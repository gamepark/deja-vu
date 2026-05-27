# Revue de code — package `app` vs `rules-fr.pdf`

**Date :** 2026-05-27
**Périmètre :** `app/src/**` (UI React, locators, headers, historique, IA, tutoriel, thème, traductions) comparé au livret `app/public/rules-fr.pdf` et au package `rules`.
**Auteur :** revue assistée par Claude Code
**Voir aussi :** `REVUE-REGLES.md` (revue du package `rules`).

---

## Synthèse

La couche `app` est **soignée et globalement cohérente** avec les règles : disposition 3×3 fidèle, modèle d'affichage recto/verso ingénieux (face orange = combinaison, face bleue = somme partagée par image), headers et aides complets, tutoriel pédagogique correct, thème homogène. Les clés de traduction utilisées sont toutes présentes dans `fr.json`.

La revue relève les points suivants :

| # | Sévérité | Sujet | Fichier(s) |
|---|----------|-------|-----------|
| 1 | 🔴 Majeur | Masquage purement visuel : l'`id` (combinaison) reste exposé dans l'état | `DejaVuCardDescription.ts`, `*Log.tsx`, `AI.ts` |
| 2 | 🟠 Important | Le tutoriel dépend du bug « échec → EndOfTurn » des règles | `tutorial/Tutorial.tsx` |
| 3 | 🟠 Moyen | L'IA ne prend jamais la carte Fin → risque de blocage de partie | `AI.ts` |
| 4 | 🟡 Mineur | Les logs Révéler/Retourner affichent la face bleue (somme) | `DejaVuCardChip.tsx` |
| 5 | 🟡 Mineur | En-têtes de score codés en dur en français | `Scoring.ts` |
| 6 | 🟡 À vérifier | Bouton « Terminer » affiché même quand l'action est illégale | `RevealCardHeader.tsx` |
| 7 | 🔵 Faible | Branche d'égalité = code mort (impossible) | `GameOverHeader.tsx` |
| 8 | 🔵 Info | Traductions en/de/es/it/ru vides (conforme au workflow) | `public/translation/*.json` |
| 9 | 🔵 Mineur | Clés i18n inutilisées | `fr.json` |

---

## ✅ Points conformes / bien réalisés

### Disposition de la grille 3×3
`locators/DejaVuGridLocator.ts` place les 8 positions (`x = 0..7`) autour du paquet centré en `(0,0)` (`DejaVuCardsDeckLocator`), reproduisant la grille 3×3 du livret. Piles, jetons et cartes observées sont disposés à gauche/droite selon `getRelativePlayerIndex`. **Conforme.**

### Modèle recto/verso (`DejaVuCardDescription.ts`)
- `images` (recto) = face **orange** (combinaison, image unique par carte).
- `backImages` (verso) = face **bleue**, indexée par la **somme** (toutes les cartes de somme 8 → `Back08`). Astucieux : le dos ne révèle visuellement que la somme.
- `isFlipped` : en `PlayerShowCard`, la carte n'est montrée de face qu'à l'observateur (`location.player === context.player`), l'adversaire voit le dos. Ailleurs, `rotation` pilote le verso. **Visuellement conforme** à *« regardez sa face orange sans la montrer à votre adversaire »* (sous réserve du point 🔴 1).

### Headers, aides et tutoriel
- Les 4 headers (`PlayCard`, `ObserveCard`, `RevealCard`, `EndOfTurn`) + `GameOver` couvrent toutes les phases et distinguent joueur actif / adversaire.
- `DejaVuCardHelp` / `InstinctTokenHelp` décrivent fidèlement faces, Observer, Retourner, Terminer, bonus 4+, échec, carte Fin, victoire instinct, score (1 pt/carte, 0,5 pt/jeton). **Conforme au PDF.**
- Le tutoriel met en place une grille fixe cohérente et une séquence valide : observation de `card45 (4,5)`, échec d'Alex (`4,7` puis `2,3` sans chiffre commun), puis réussite du joueur sur le chiffre `5` (`4+5`, `1+5`, `2+5` → 3 occurrences → Terminer). Les 32 cartes + carte Fin sont bien réparties (8 grille + 24 paquet + Fin). **Mécaniquement correct.**

### Traductions
Toutes les clés `i18nKey` référencées par les composants existent dans `fr.json`. Aucune clé manquante détectée.

---

## 🔴 1. Masquage purement visuel — l'information cachée reste exposée — Majeur

C'est le prolongement, côté `app`, du point **#2 de `REVUE-REGLES.md`**.

Le travail visuel est réel : `backImages` indexées par la somme et `isFlipped` par joueur empêchent **l'affichage** de la combinaison orange d'une carte face cachée ou observée. **Mais** comme le package `rules` ne déclare aucune `hidingStrategies`, l'`id` complet de chaque carte (= sa combinaison via `dejaVuCardsData`) est transmis à tous les clients et lisible dans `game.view` / le réseau. Le masquage n'est donc que cosmétique.

Le code `app` confirme cette dépendance à l'`id` réel :
- `history/RevealCardLog.tsx` / `FlipCardLog.tsx` lisent `material.getItem(itemIndex)` (donc l'`id`) pour afficher la carte ;
- `AI.ts` lit directement les `id` des cartes **face cachée** (`allCards[m.itemIndex].id`) pour décider ses coups ;
- `DejaVuCardChip.tsx` indexe `backImages[cardId]`.

**Conséquence :** un joueur curieux ou malveillant peut connaître toutes les combinaisons face cachée et la carte observée en secret — ce qui ruine la mémoire / le bluff, cœur du jeu.

**Correction :** voir `REVUE-REGLES.md` #2 (id composite `{ front, back }` + `hideFront` / `hideFrontToOthers`). Côté `app`, adapter ensuite `DejaVuCardChip` et les locators à la nouvelle forme d'`id`. Sans cette correction côté `rules`, aucun effort `app` ne peut garantir le secret.

---

## 🟠 2. Le tutoriel dépend du bug « échec → EndOfTurn » — Important

Dans `tutorial/Tutorial.tsx` :
- **Étape 8** : Alex retourne `Grid[7]` (`card23`) après `Grid[4]` (`card47`) → aucun chiffre commun → **échec**.
- **Étape 9** : la suite attend un coup `CustomMoveType.EndTurn` joué par l'adversaire :
```ts
move: { player: opponent, filter: (move) => isCustomMoveType(CustomMoveType.EndTurn)(move) }
```

Ceci ne fonctionne **que** parce que le package `rules` route actuellement un échec vers `RuleId.EndOfTurn` quand le joueur garde des jetons (bug **#1** de `REVUE-REGLES.md` : Alex a 4 jetons, en cède 1, lui en reste 3 → `EndOfTurn` → `EndTurn` disponible).

**Si on corrige le bug rules #1** (l'échec termine le tour immédiatement via `nextPlayerOrEnd`), il n'y aura plus de coup `EndTurn` à jouer à l'étape 9 → **le tutoriel se bloquera** (aucun coup ne satisfait le filtre).

**Action coordonnée :** lors de la correction de rules #1, supprimer/adapter l'étape 9 (le tour d'Alex se terminera automatiquement après l'échec ; le popup d'explication `tuto.fail-result` peut devenir une simple popup sans `move`, ou être fusionné avec l'étape 8).

---

## 🟠 3. L'IA ne prend jamais la carte Fin → risque de blocage — Moyen

`AI.ts` → `getPlayCardMove` ne considère que les coups **Retourner** (`flipMoves`) et **Observer** (`observeMoves`) ; le coup **Prendre la carte Fin** (déplacement vers `PlayerPile`) n'est jamais sélectionné tant qu'il existe un autre coup légal.

Combiné au bug **#3 de `REVUE-REGLES.md`** (la carte Fin est *observable / révélable* quand elle est au sommet du paquet), cela crée un scénario de **blocage dur** :
1. En fin de partie, il ne reste que la carte Fin au centre, grille vide.
2. `getPlayCardMove` voit `reveal-end` (un coup `rotation === false` sur le `Deck`) dans `flipMoves` → l'IA **révèle** la carte Fin au lieu de la prendre.
3. On entre dans `RevealCard` avec `[0,0]` : impossible d'atteindre 3 occurrences, et plus aucune carte à révéler → `getLegalMoves` renvoie `[]` → **l'IA n'a aucun coup**, la partie est figée.

Même sans atteindre ce cas extrême, l'IA repousse indéfiniment la prise de la carte Fin, donc ne déclenche jamais la victoire par mémoire.

**Corrections :**
- Côté `rules` : appliquer le #3 (carte Fin ni observable ni révélable) — résout aussi le blocage car `legalMoves` se réduit alors à `[prendre la carte Fin]`, capté par le early-return `length === 1`.
- Côté `app` : faire que `getPlayCardMove` prenne la carte Fin selon une heuristique (au moins quand c'est avantageux au score, ou par défaut quand elle est disponible).

---

## 🟡 4. Les logs Révéler / Retourner affichent la face bleue — Mineur

`DejaVuCardChip.tsx` utilise systématiquement `backImages[cardId]` (la face **bleue** / somme). Or `RevealCardLog` (« {player} révèle [carte] ») et `FlipCardLog` (« {player} retourne [carte] ») décrivent une carte qu'on vient de **révéler** : l'information pertinente est la **combinaison orange**, pas la somme.

Afficher la somme dans un log de révélation est peu informatif (et la carte étant révélée, montrer le recto orange ne pose aucun problème de secret). 

**Suggestion :** dans les contextes « révéler/retourner », afficher `images[cardId]` (face orange) ; conserver `backImages` pour les contextes où seule la somme est connue.

---

## 🟡 5. En-têtes de score codés en dur en français — Mineur (i18n)

`Scoring.ts` → `getScoringHeader` renvoie des chaînes littérales :
```ts
if (key === ScoringKey.Cards) return 'Cartes'
if (key === ScoringKey.Tokens) return 'Jetons (×½)'
return 'Total'
```
Ces libellés resteront en français dans toutes les langues. À remplacer par des clés de traduction (`t('score.cards')`, etc.) avant la passe d'internationalisation.

---

## 🟡 6. Bouton « Terminer » affiché hors légalité — À vérifier

`RevealCardHeader.tsx` rend toujours la clé `header.reveal.you` qui contient `<terminate>Terminer</terminate>`, avec `move={terminateMove!}`. Or `terminateMove` est `undefined` tant que moins de 3 occurrences ne sont pas atteintes (`Terminate` non légal).

Selon le comportement de `PlayMoveButton` avec un `move` indéfini (rendu masqué/désactivé ou bouton inerte), le joueur pourrait voir un bouton « Terminer » **avant** d'avoir le droit de terminer.

**À vérifier en jeu.** Si le bouton apparaît à tort, conditionner son rendu à `terminateMove !== undefined` (afficher une clé alternative sans `<terminate>` quand l'action n'est pas disponible).

---

## 🔵 7. Branche d'égalité = code mort — Faible

`GameOverHeader.tsx` gère `isTie` (`game.over.tie`). Or une égalité de score est **mathématiquement impossible** : le total de jetons est impair (7), donc `score(A) − score(B) = (cartesA − cartesB) + 0,5·(2·jetonsA − 7)` est toujours un demi-entier non nul. La victoire par instinct (1000 vs 0) n'est pas non plus une égalité. La branche est inoffensive (défensive) mais inutile.

---

## 🔵 8. Traductions en/de/es/it/ru vides — Information

`public/translation/{en,de,es,it,ru}.json` valent `{}`. **Conforme au workflow** documenté dans `CLAUDE.md` (ne remplir que la langue du développeur pendant le dev). À traiter lors de la passe de traduction avant mise en production.

---

## 🔵 9. Clés i18n inutilisées — Mineur

`fr.json` définit `action.reveal`, `action.terminate`, `action.give-token`, `action.end-turn`, qui ne sont référencées nulle part dans `app/src` (les boutons correspondants utilisent le texte inline des balises `<terminate>`, `<give>`, `<end>`). À supprimer ou à brancher pour éviter la dette.

---

## Récapitulatif des corrections recommandées

| # | Action | Dépend de | Effort |
|---|--------|-----------|--------|
| 1 | Masquage réel des combinaisons (id composite + `hidingStrategies`) | rules #2 | Moyen |
| 2 | Adapter l'étape 9 du tutoriel à la fin de tour automatique sur échec | rules #1 | Faible |
| 3 | IA : gérer la prise de la carte Fin | rules #3 | Faible |
| 4 | Logs reveal/flip : afficher la face orange | — | Faible |
| 5 | i18n des en-têtes de score | — | Faible |
| 6 | Vérifier/masquer le bouton « Terminer » hors légalité | — | Faible |
| 7 | (Optionnel) retirer la branche d'égalité morte | — | Trivial |
| 9 | Nettoyer les clés i18n inutilisées | — | Trivial |

**À noter :** les points **1, 2 et 3** sont couplés aux corrections du package `rules` (`REVUE-REGLES.md` #1, #2, #3) et devraient être traités conjointement.
