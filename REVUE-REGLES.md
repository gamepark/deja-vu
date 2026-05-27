# Revue de code — package `rules` vs `rules-fr.pdf`

**Date :** 2026-05-27
**Périmètre :** `rules/src/**` comparé au livret de règles `app/public/rules-fr.pdf`
**Auteur :** revue assistée par Claude Code

---

## Synthèse

L'implémentation est **fidèle aux règles dans la grande majorité des cas** : mécanique Observer / Révéler, validation par intersection des chiffres oranges, seuils Réussite (3) et jeton bonus (4), victoire par instinct (7 jetons), décompte mémoire (1 pt/carte, 0,5 pt/jeton), et dernier tour de l'adversaire après la prise de la carte Fin.

La revue identifie néanmoins :

| # | Sévérité | Sujet | Fichier |
|---|----------|-------|---------|
| 1 | 🔴 Important | L'échec ne termine pas le tour « instantanément » | `RevealCardRule.ts` |
| 2 | 🔴 Majeur (archi) | Aucune information cachée (`hidingStrategies` absent) | `DejaVuRules.ts` |
| 3 | 🟡 Mineur | La carte Fin est observable / révélable | `PlayCardRule.ts` |
| 4 | 🟡 Faible | Verrou théorique au dernier tour (grille + pioche vides) | `PlayCardRule.ts` / `EndGameHelper.ts` |

---

## ✅ Points conformes aux règles

### Matériel — 32 cartes Déjà-Vu
PDF : *« 32 cartes Déjà Vu »*, face orange = deux chiffres entre 0 et 7 dont la somme (face bleue) est entre 2 et 12, chaque combinaison unique.

`material/DejaVuCard.ts` définit exactement les 32 paires non ordonnées `(a ≤ b)` avec `a,b ∈ [0,7]` et `2 ≤ a+b ≤ 12`. Les paires `(6,7)` et `(7,7)` sont correctement exclues (somme > 12). La carte Fin (`cardEnd`) est en plus, et `dejaVuCards` l'exclut bien du paquet. **Conforme.**

### Mise en place
PDF : carte Fin au centre → paquet mélangé face bleue par-dessus → 8 cartes autour (grille 3×3) → joueur de départ 3 jetons, adversaire 4.

`DejaVuSetup.ts` :
- `endCard` créé en premier (donc au fond du paquet, `x = 0`), puis les 32 cartes mélangées par-dessus avec `rotation: true` (face bleue). ✔️
- Boucle `for (i = 0; i < 8)` : 8 cartes prises du dessus du paquet vers `Grid` `x = 0..7`. ✔️
- `players[0]` reçoit 3 jetons et commence (`start()` → `startPlayerTurn(PlayCard, players[0])`), `players[1]` reçoit 4 jetons. ✔️ (Le « qui a vécu un déjà-vu le plus récemment » est purement narratif.)

### Observer
PDF : choisir 1 des 9 cartes de la grille (paquet inclus), regarder sa face orange en privé, la reposer.

`PlayCardRule.getPlayerMoves` propose les 8 cartes de grille + le dessus du paquet vers `PlayerShowCard` (`rotation: false`), en mémorisant la position d'origine dans `location.id`. `ObserveCardRule` repose ensuite la carte (grille `x = id`, ou paquet). ✔️

### Révéler / Réussite / Échec
PDF : retourner les cartes une par une jusqu'à Réussite (≥ 3 fois le même chiffre orange) ou Échec (carte sans le chiffre répété). 4+ occurrences → prendre 1 jeton à l'adversaire.

`RevealCardRule` utilise un **modèle d'intersection** (`intersectNumbers`) : on conserve l'ensemble des chiffres communs à toutes les cartes révélées ; dès qu'il devient vide → échec. Le seuil de Réussite (`canTerminate`) et le jeton bonus (`bonusTokenMove`) comptent les occurrences du chiffre commun (`countCommonOccurrences`).

Vérifié contre les deux exemples du PDF :
- **Réussite :** `4+5` → `4+4` (le 4 apparaît 3×) → continue avec `0+4` (4× → jeton bonus). ✔️
- **Échec :** `4+6` → `5+6` (commun = 6) → `4+5` (pas de 6) → échec. ✔️

Le joueur ne peut pas s'arrêter avant d'avoir une Réussite : `Terminate` n'est proposé que si `canTerminate` (≥ 3 occurrences), conforme à *« jusqu'à atteindre une Réussite ou un Échec »*.

### Fin de partie
- **Victoire par instinct** (7 jetons) vérifiée à chaque transfert de jeton (`failureMoves`, `endMoveAfterTokenChange`, `EndOfTurnRule.GiveTokenToReplay`) et dans `ScoreHelper` (score = 1000). ✔️
- **Victoire par mémoire** : `ScoreHelper.getScore` = `cartes + jetons × 0,5`, carte Fin comptée car déplacée dans `PlayerPile`. ✔️
- **Dernier tour** : `EndGameHelper.nextPlayerOrEnd` termine la partie quand le prochain joueur serait le détenteur de la carte Fin → l'adversaire joue exactement un tour. ✔️

---

## 🔴 1. L'échec ne termine pas le tour « instantanément » — Important

**Règle (PDF, section Échec) :**
> « Si vous révélez une carte qui ne porte pas le chiffre répété dans les cartes précédentes, c'est un échec. Donnez 1 jeton Instinct à votre adversaire, laissez les cartes révélées à leur place et retournez-les, face bleue visible. **Votre tour de jeu est instantanément terminé.** »

**Code — `rules/src/rules/RevealCardRule.ts:79-98` (`failureMoves`) :**
```ts
const endMove = opponentTokensAfter >= INSTINCT_WIN_THRESHOLD
  ? this.endGame()
  : (tokensBefore - (tokenMoves.length > 0 ? 1 : 0)) > 0
      ? this.startRule(RuleId.EndOfTurn)        // ← permet de rejouer
      : new EndGameHelper(this.game).nextPlayerOrEnd(this.nextPlayer)
```

**Problème :** après un échec, si le joueur conserve au moins un jeton, le code passe par `RuleId.EndOfTurn`, qui propose `GiveTokenToReplay` → le joueur peut **rejouer un tour supplémentaire** alors que les règles imposent la fin immédiate du tour.

De plus, comme le total de jetons est un invariant (= 7), un joueur qui échoue sans céder son **dernier** jeton possède forcément encore ≥ 1 jeton : la branche `EndOfTurn` est donc prise dans la quasi-totalité des échecs. Le bug n'est pas un cas limite, c'est le comportement courant.

**Correction proposée :** sur un échec, toujours terminer le tour après la vérification de victoire par instinct.
```ts
const endMove = opponentTokensAfter >= INSTINCT_WIN_THRESHOLD
  ? this.endGame()
  : new EndGameHelper(this.game).nextPlayerOrEnd(this.nextPlayer)
```
(Les variables `tokensBefore` / le calcul conditionnel deviennent inutiles pour `endMove`.)

---

## 🔴 2. Aucune information n'est cachée — Majeur (architecture)

**Règle (PDF) :** le cœur du jeu est l'information cachée :
> « regardez sa face orange **sans la montrer à votre adversaire** »

et toute la mémoire repose sur le fait que la combinaison orange d'une carte face bleue est inconnue.

**Constat :** `DejaVuRules` étend `MaterialRules` **sans aucune `hidingStrategies`** (aucune occurrence de `hidingStrategies` / `HiddenMaterialRules` / `SecretMaterialRules` dans tout le projet). En conséquence, l'`id` de chaque carte — qui encode directement sa combinaison orange via `dejaVuCardsData` — est transmis à **tous les clients** et lisible dans `game.view` et les échanges réseau, **même pour une carte face cachée ou pour la carte observée en privé**.

L'astuce d'affichage de `app/src/material/DejaVuCardDescription.ts` (image de dos indexée par la **somme** — `Back08` pour toutes les cartes de somme 8, `isFlipped` qui masque le recto à l'adversaire en `PlayerShowCard`) ne masque l'information **qu'à l'écran**. Au niveau des données, tout reste visible. Un joueur curieux ou malveillant peut donc connaître :
- toutes les combinaisons des cartes face cachée (grille + paquet) ;
- la carte qu'un adversaire observe en privé.

Cela compromet la mécanique centrale du jeu (mémoire, observation secrète, bluff).

**Piste de correction (impacte `rules` + `app`) :**
1. Restructurer l'`id` des cartes en composite `{ front: <combinaison>, back: <somme> }`. La somme (face bleue) est publique, la combinaison (face orange) est secrète.
2. Dans `DejaVuRules`, ajouter des `hidingStrategies` pour `DejaVuCard` :
   - `Deck` et `Grid` face cachée → `hideFront` (la somme reste visible, la combinaison est masquée pour tout le monde) ;
   - `PlayerShowCard` → `hideFrontToOthers` (seul l'observateur voit la face orange).
3. Adapter `DejaVuCardDescription` / les locators à la nouvelle forme d'`id`.

> L'API de masquage est disponible dans `@gamepark/rules-api` : `hideFront` (`['id.front']`), `hideFrontToOthers`, `hideItemId`, `hideItemIdToOthers`.

C'est le point le plus structurant de cette revue : sans masquage côté données, l'effort visuel ne suffit pas à garantir le secret exigé par les règles.

---

## 🟡 3. La carte Fin est observable / révélable — Mineur

**Règle (PDF, Prendre la carte Fin) :**
> « Si elle est visible dans la grille, prenez la carte Fin et posez-la sur votre pile. **C'est l'unique action de votre tour de jeu : vous ne pouvez pas utiliser de jeton Instinct** pour en faire plusieurs. »

**Code — `rules/src/rules/PlayCardRule.ts` :**
```ts
// Observer (ligne 27-29)
if (topDeckCard.length) {
  moves.push(topDeckCard.moveItem({ type: LocationType.PlayerShowCard, player: this.player, rotation: false }))
}
// Révéler (ligne 33-35)
if (topDeckCard.length) {
  moves.push(topDeckCard.rotateItem(false))
}
```

**Problème :** ces deux moves sont proposés pour le dessus du paquet **sans vérifier** qu'il ne s'agit pas de `endCard`. Quand la carte Fin est en tête de paquet (seule carte restante au centre), le joueur se voit offrir 3 actions (Prendre / Observer / Révéler) alors que seule « Prendre » est légale.

Conséquence secondaire : révéler la carte Fin (`dejaVuCardsData[cardEnd] = [0,0]`) peut bloquer `RevealCardRule` — avec `[0,0]` on ne peut jamais atteindre 3 occurrences, et s'il n'y a plus d'autre carte à révéler, `getPlayerMoves` renvoie `[]`.

**Correction proposée :** conditionner ces deux moves à `topDeckCard.getItem()?.id !== endCard`.

---

## 🟡 4. Verrou théorique au dernier tour — Faible

Si la carte Fin est prise alors que la grille **et** le paquet sont vides, le « dernier tour » de l'adversaire démarre via `PlayCardRule`, mais `getPlayerMoves` ne renvoie aucun coup (pas de carte de grille, pas de dessus de paquet). Le joueur actif se retrouve sans coup légal.

Cas extrême, peu atteignable en pratique (la partie se termine généralement par instinct ou avec des cartes encore en jeu), mais à garder à l'esprit pour la robustesse de fin de partie.

---

## Récapitulatif des corrections recommandées

| # | Action | Risque | Effort |
|---|--------|--------|--------|
| 1 | `failureMoves` : terminer toujours le tour après l'échec (supprimer la branche `EndOfTurn`) | Faible, localisé | Faible |
| 3 | Garder Observer/Révéler du paquet derrière `id !== endCard` | Faible, localisé | Faible |
| 2 | `id` composite `{ front, back }` + `hidingStrategies` (`hideFront` / `hideFrontToOthers`) | Moyen (rules + app) | Moyen |
| 4 | Sécuriser le cas grille + pioche vides au dernier tour | Faible | Faible |

Les corrections **1** et **3** sont sûres et immédiatement applicables. La **2** mérite un travail dédié car elle impacte aussi le package `app`.
