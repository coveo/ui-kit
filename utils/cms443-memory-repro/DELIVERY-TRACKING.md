<!-- cspell:disable -->
# CMS-443 — Suivi de livraison (demandes client → livraison → statut)

> Document de suivi interne. Source : rapport client `CMS-443-headless-memory-leak-report_2026-09-10.md`
> (conservé hors git — contient des PII client). Confirmé contre `@coveo/headless` 3.55.4 (source, pas
> seulement le build). Ce fichier est un artefact de suivi, gardé sur la branche `chore/CMS-443-memory-repro`
> (commité mais sans PR) — **hors des PRs de fix**.

Dernière mise à jour : 2026-09-16

**Versions publiées contenant les fixes** : `@coveo/headless` **3.56.0** (fix direct) et `@coveo/atomic` **3.61.3** (re-bundle de headless, propage le fix aux consommateurs Atomic).

---

## 1. Vue d'ensemble

### 1a. Livrables CODE — target de l'équipe support (livrés)

| # | Demande client (§9 du rapport) | Type | Livraison | Statut |
|---|---|---|---|---|
| 1 | Confirmer Finding 1 et Finding 2 comme défauts | Confirmation | Réponse écrite + repro chiffré | ✅ Confirmé |
| 2 | Finding 1 : ne plus retenir les moteurs (dispose / weak / skip registration), `ssr-commerce` **et** `ssr-commerce-next` | Fix | PR #8479 (registre faible : WeakRef + WeakMap + FinalizationRegistry, tous les chemins des 2 trees) | ✅ Mergé (`fa2e9de00d`) |
| 3 | Finding 2 : mémoïsation bornée pour `getRelayInstanceFromState` | Fix | PR #8480 (`lruMemoize`, maxSize 50, uniquement `memoize`) | ✅ Mergé (`818bdf001e`) |
| 4a | Token par requête first-class sur `fetchStaticState()` / `hydrateStaticState()` (`ssr-commerce-next`) | Fix | PR #8481 (param `accessToken`) | ✅ Mergé (`01434bcbd3`) |

**→ Tout le périmètre CODE demandé est livré et mergé.** La confirmation (1) et les trois fixes (2, 3, 4a) sont clos. **Disponible dans `@coveo/headless` 3.56.0 et `@coveo/atomic` 3.61.3.**

### 1b. Livrables DOC / DÉCISION PRODUIT — à valider avec l'équipe

Les items ci-dessous ne sont **pas des fixes de code** : ce sont de la documentation et une prise de position produit dont la **pertinence et le propriétaire** doivent être tranchés par l'équipe (R&D / PM / DevEx), pas engagés unilatéralement par le support. La question à poser n'est pas « quand ? » mais « est-ce raisonnable, et qui le porte ? ».

| # | Demande client (§9 du rapport) | Type | Question ouverte pour l'équipe | Statut |
|---|---|---|---|---|
| 4b | Sample SSR documenté montrant l'usage de tokens per-user en multi-tenant | Doc / DevEx | Raisonnable d'ajouter un sample dédié ? Où (samples/ ? doc headless SSR ?) ? Qui l'écrit ? | ⏸️ À valider avec l'équipe |
| 5 | Position produit : pattern « definition request-scoped serveur + définition client séparée » supporté ? + MAJ doc « singleton shared server/client » | Décision + doc | Le pattern est-il officiellement supporté ? La doc « singleton » doit-elle être nuancée/corrigée ? | ⏸️ À router vers R&D/PM |

Légende : ✅ fait · ⚠️ partiel/en cours · ⏸️ en attente de décision d'équipe · ❌ non commencé

---

## 2. Détail par demande

### Demande 1 — Confirmer F1 et F2 comme défauts
- **Ce que le client veut** : une reconnaissance formelle que les deux rétentions sont des bugs, pas des mauvais usages.
- **Livraison** : confirmation écrite dans la réponse au billet + harnais de repro chiffré (`utils/cms443-memory-repro/`) reproduisant F1 et F2 de façon déterministe.
- **Statut** : ✅ Confirmés dans la source 3.55.4 (identique à la version testée par le client sur les fichiers concernés).

### Demande 2 — Finding 1 : lifecycle / non-rétention
- **Ce que le client veut** (§9.2, §8.1) : « unregister/dispose ou enregistrement faible dans `createAccessTokenManager` / `buildFactory`, **ou ne pas enregistrer du tout quand la définition n'a pas d'usage de renouvellement côté serveur** », pour les deux trees.
- **Livraison** — PR #8479 (`fix(headless)`, patch), **registre faible** :
  - Le registre de callbacks du token manager devient faible : `Set<WeakRef>` + `WeakMap<engine, callback>` (ancrage de durée de vie) + `FinalizationRegistry` (élagage). Appliqué aux 2 copies (`ssr/common` et `ssr-next/common`).
  - Le GC libère la souscription dès que le moteur devient inatteignable → corrige **tous** les chemins (`fetchStaticState`, `hydrateStaticState`, `build()`) dans **les deux** trees (commerce + search).
  - `owner` typé `object` (pas `WeakKey`) : `WeakKey` n'existe dans le lib TypeScript qu'à partir de 5.2, or le peer range du package est `typescript >=5.0.0` — l'exposer sur la signature publique `onAccessTokenUpdate` casserait les déclarations pour les consommateurs sur TS 5.0/5.1. `object` suffit pour une clé faible et est disponible partout. (Une révision antérieure typait `WeakKey` ; revert `27ea69b364` suite à la review Copilot.)
  - `dispose()` public **retiré** (une révision antérieure l'exposait ; abandonné car il traitait le symptôme et supposait que le consommateur l'appelle).
- **Correspondance avec la demande** : le client proposait « revisiter avec WeakRef/WeakMap/FinalizationRegistry pour laisser le GC faire son travail » — c'est exactement cette approche.
- **Pourquoi pas l'option A (skip registration)** : elle **régressait** `hydrateStaticState`, qui s'exécute dans le navigateur (`providers.tsx` est `'use client'`, garde le moteur hydraté dans `useState` toute la session). Ne pas enregistrer ce moteur vivant le laissait sur un token périmé — prouvé par la sonde F1c.
- **Preuve** : repro F1 — `fetchStaticState` **37 KB/call → 4 KB/call** ; `build()` **500 moteurs retenus → 1** (libérés) ; `hydrateStaticState` moteur vivant **reçoit toujours** le token renouvelé (non-régression), **sans appeler dispose()**.
- **Statut** : ✅ Mergé sur `main` (`fa2e9de00d`, 2026-09-15).

### Demande 3 — Finding 2 : mémoïsation bornée
- **Ce que le client veut** (§9.3, §8.3) : cache borné (ou par moteur) pour `getRelayInstanceFromState` au lieu du `weakMapMemoize` par défaut (qui n'évince jamais les clés primitives).
- **Livraison** — PR #8480 (`fix(headless)`, patch) : `createSelectorCreator({ memoize: lruMemoize, memoizeOptions: { maxSize: 50 } })`. **Seul `memoize` (le cache résultat keyé par le token primitif) est borné** ; `argsMemoize` reste au défaut `weakMapMemoize` — sinon un LRU fort sur les args retiendrait jusqu'à 50 arbres de state SSR complets par référence (correction `7c3a5456bb` suite review Copilot).
- **Preuve** : repro F2 en mesure directe — après 500 tokens distincts, le plus ancien token n'est plus en cache (évincé) ; la mémoïsation locale fonctionne toujours.
- **Statut** : ✅ Mergé sur `main` (`818bdf001e`, 2026-09-15). La CI avait été bloquée par un faux drift OpenACR (report a11y incomplet, non lié au changement) — résolu par rerun complet.

### Demande 4a — Token par requête (CODE) ✅
- **Ce que le client veut** (§9.4, §5, §8.2) : un `accessToken` par requête sur `fetchStaticState()` (aussi `ssr-commerce-next`).
- **Livraison** — PR #8481 (`feat(headless)`, minor) : `accessToken` optionnel ajouté à `CommonBuildConfig` (ssr-next), consommé dans `augmentCommerceEngineOptions` — override par requête sans muter la définition partagée. S'applique à `fetchStaticState()` **et** `hydrateStaticState()`. Scope `ssr-commerce-next` uniquement (le chemin beta `ssr-commerce` est déprécié et racy).
- **Preuve** : repro F3 (mesure directe sur `augmentCommerceEngineOptions`) — avant : override ignoré (`perRequestTokenApplied: false`) ; après : token par requête appliqué **et** définition partagée non mutée.
- **Statut** : ✅ Mergé sur `main` (`01434bcbd3`, 2026-09-15) et prouvé.

### Demande 4b — Sample SSR per-user-token documenté (DOC) ⏸️
- **Ce que le client veut** (§5, §8.2) : un sample SSR documenté montrant l'usage de tokens par utilisateur en multi-tenant, au-delà du simple param.
- **Nature** : livrable **documentation / DevEx**, pas un fix. Le param existe (4a) ; il s'agirait d'illustrer son usage.
- **À trancher avec l'équipe** : est-ce raisonnable d'ajouter un sample dédié ? Où le placer (`samples/` ? doc headless SSR ? README) ? Qui l'écrit (support / DevEx / PM) ?
- **Statut** : ⏸️ En attente de décision d'équipe — pas un engagement unilatéral du support.

### Demande 5 — Position produit + documentation « singleton » (DÉCISION + DOC) ⏸️
- **Ce que le client veut** (§9.5, §7, §8.6) : une prise de position sur son pattern (définition request-scoped serveur + définition client séparée) — supporté ou non — et une MAJ de la doc qui affirme aujourd'hui que la définition « must be a singleton shared between server and client » (formulation qui, combinée à F1, produit la fuite).
- **Nature** : **décision produit + documentation.** Hors périmètre des fixes de code.
- **À trancher avec l'équipe** : le pattern request-scoped est-il officiellement supporté ? La doc « singleton » doit-elle être nuancée/corrigée ?
- **Statut** : ⏸️ À router vers R&D/PM — décision d'équipe requise.

---

## 3. Information à remettre au client (non-code)

Au-delà du code, le client attend explicitement :

1. **Confirmation écrite** que F1 + F2 sont des défauts reconnus (§9.1).
2. **Position sur le pattern §7** (definition request-scoped + définition client séparée) : supporté ou non (§9.5).
3. **Réponse sur les hooks alternatifs** qu'il a évalués — `preprocessRequest` et `renewAccessToken` (§5) — et pourquoi le param par requête est la bonne réponse plutôt que ces hooks.
4. **MAJ documentation** : phrase « singleton partagé serveur/client », absence de sample per-user-token, `build()` à la fois déprécié et seul chemin de token par requête.

Contraintes de communication (préférences projet) :
- Pas de nom de client dans les artefacts publics / git.
- Pas de numéros/liens de PR dans le texte destiné au client (repo `coveo/ui-kit` public) — sauf billet interne.
- Pas de date de livraison promise.
- Le workaround du client (définition request-scoped, §7) reste valide en attendant.

---

## 4. Points ouverts / décisions en attente

| Sujet | Décision attendue | Qui |
|---|---|---|
| CI #8480 bloquée sur OpenACR | ✅ Résolu — faux drift (report a11y incomplet), rerun complet | Fait |
| Sonde F3 du repro | ✅ Corrigée — teste `augmentCommerceEngineOptions` directement, F3 prouvé sur after-f3 | Fait |
| Les 3 PRs de fix | ✅ Mergées sur `main` (2026-09-15) | Fait |
| Sample per-user-token (demande 4) | Le créer ? où ? | Toi / PM |
| Demande 5 (doc + pattern supporté) | Router vers R&D/PM | Toi |
| Réponse client (confirmation F1/F2, position pattern §7, hooks alternatifs) | À rédiger | Toi / Support |
| Sort de ce doc de suivi + harnais repro | Rester hors PR (jetable) ou committer quelque part | Toi |

---

## 5. Artefacts

- **Rapport client** : `docs/investigation/CMS-443-headless-memory-leak-report_2026-09-10.md` (stashé, non suivi).
- **Harnais de repro/validation** : branche `chore/CMS-443-memory-repro`, `utils/cms443-memory-repro/` (`repro.mjs`, `compare.sh`, `README.md`) — poussée, sans PR.
- **PRs de fix** (toutes **mergées** sur `main` le 2026-09-15, off `main`, sans stack) :
  - #8479 — Finding 1 (registre faible : WeakRef + WeakMap + FinalizationRegistry, patch) — merge `fa2e9de00d`
  - #8480 — Finding 2 (lruMemoize sur `memoize` uniquement, patch) — merge `818bdf001e`
  - #8481 — Finding 3 (token par requête ssr-next, minor) — merge `01434bcbd3`

### Résultats repro avant/après (harnais, jeu de controllers minimal)

| Métrique | before (main) | after-f1 | after-f2 | after-f3 |
|---|---|---|---|---|
| F1 `fetchStaticState` KB/call | 37.2 | **3.9** ✅ | 37.0 | 37.2 |
| F1 `build()` moteurs encore vivants (/500) | 500 | **1** ✅ | 500 | 500 |
| F1 `hydrateStaticState` moteur vivant reçoit le token | true | **true** ✅ | true | true |
| F2 plus vieux token encore en cache | true | true | **false** ✅ | true |
| F3 token par requête appliqué | false | false | false | **true** ✅ |
| F3 définition partagée non mutée | true | true | true | **true** |

Diagonale FIXED (F1→after-f1, F2→after-f2, F3→after-f3) : chaque fix corrige son finding et aucun autre — confirmation empirique de l'indépendance des 3 PRs.

Preuve F1 (registre faible) — trois signaux alignés : `fetchStaticState` 37.2 → 3.9 KB/call (le résidu est le static state, pas le moteur) ; `build()` 500 → 1 moteur retenu (le « 1 » est le dernier encore référencé au GC, artefact de mesure) ; `hydrateStaticState` — le moteur hydraté vivant reçoit toujours le token renouvelé (non-régression, là où l'option A le laissait périmé). Le compteur de rétention utilise le décompte WeakRef post-GC (déterministe), pas les finalizers du `FinalizationRegistry` (dont le timing n'est pas garanti par la spec).

Écart assumé : nos ~37 KB/moteur (sample minimal) vs 65–129 KB du client (jeu de controllers réel) — l'ampleur scale avec les controllers (le rapport le prédit, §3.3).

Sonde F3 : teste `augmentCommerceEngineOptions` directement (le fichier exact que le fix modifie), sans réseau. Prouve les 3 propriétés — override par requête appliqué, définition partagée non mutée, fallback au token de définition si omis.
