<!-- cspell:disable -->
# CMS-443 — Suivi de livraison (demandes client → livraison → statut)

> Document de suivi interne. Source : rapport client `CMS-443-headless-memory-leak-report_2026-09-10.md`
> (conservé hors git — contient des PII client). Confirmé contre `@coveo/headless` 3.55.4 (source, pas
> seulement le build). Ce fichier est un artefact de suivi, gardé sur la branche `chore/CMS-443-memory-repro`
> (commité mais sans PR) — **hors des PRs de fix**.

Dernière mise à jour : 2026-09-14

---

## 1. Vue d'ensemble

| # | Demande client (§9 du rapport) | Type | Livraison | Statut |
|---|---|---|---|---|
| 1 | Confirmer Finding 1 et Finding 2 comme défauts | Confirmation | Réponse écrite + repro chiffré | ✅ Confirmé |
| 2 | Finding 1 : ne plus retenir les moteurs (dispose / weak / skip registration), `ssr-commerce` **et** `ssr-commerce-next` | Fix | PR #8479 (option A : skip registration sur le chemin static-state) | ✅ Code prêt (draft) |
| 3 | Finding 2 : mémoïsation bornée pour `getRelayInstanceFromState` | Fix | PR #8480 (`lruMemoize`, maxSize 50) | ⚠️ Code prêt, CI bloquée (check a11y non lié) |
| 4 | Token par requête first-class sur `fetchStaticState()` (aussi `ssr-commerce-next`) **+ sample SSR documenté per-user token** | Fix + doc | PR #8481 (param `accessToken`) ; sample doc = **manquant** | ⚠️ Partiel |
| 5 | Position produit : pattern « definition request-scoped serveur + définition client séparée » supporté ? + MAJ doc « singleton » | Décision + doc | **Hors périmètre code** — R&D/PM | ❌ Non traité |

Légende : ✅ fait · ⚠️ partiel/en cours · ❌ non commencé

---

## 2. Détail par demande

### Demande 1 — Confirmer F1 et F2 comme défauts
- **Ce que le client veut** : une reconnaissance formelle que les deux rétentions sont des bugs, pas des mauvais usages.
- **Livraison** : confirmation écrite dans la réponse au billet + harnais de repro chiffré (`utils/cms443-memory-repro/`) reproduisant F1 et F2 de façon déterministe.
- **Statut** : ✅ Confirmés dans la source 3.55.4 (identique à la version testée par le client sur les fichiers concernés).

### Demande 2 — Finding 1 : lifecycle / non-rétention
- **Ce que le client veut** (§9.2, §8.1) : « unregister/dispose ou enregistrement faible dans `createAccessTokenManager` / `buildFactory`, **ou ne pas enregistrer du tout quand la définition n'a pas d'usage de renouvellement côté serveur** », pour les deux trees.
- **Livraison** — PR #8479 (`fix(headless)`, patch), **option A** :
  - `ssr-commerce-next` : le callback n'est plus enregistré du tout (aucun `build()` exposé → aucun moteur long-lived).
  - `ssr-commerce` (beta) : enregistrement conservé uniquement sur le chemin `build()` explicite (edge-case long-lived), via un flag interne `registerForTokenUpdates`. `fetchStaticState`/`hydrateStaticState` ne retiennent plus.
  - `dispose()` public **retiré** (une révision antérieure l'exposait ; abandonné car il traitait le symptôme et supposait que le consommateur l'appelle).
- **Correspondance avec la demande** : le client proposait explicitement « skip registration when no renewal is configured » — c'est exactement l'option A.
- **Preuve** : repro F1 sur le chemin `fetchStaticState` — **37 KB/call → 4 KB/call** après fix (le résidu est le static state, pas le moteur), **sans appeler dispose()**.
- **Statut** : ✅ Code prêt, draft ouvert.

### Demande 3 — Finding 2 : mémoïsation bornée
- **Ce que le client veut** (§9.3, §8.3) : cache borné (ou par moteur) pour `getRelayInstanceFromState` au lieu du `weakMapMemoize` par défaut (qui n'évince jamais les clés primitives).
- **Livraison** — PR #8480 (`fix(headless)`, patch) : `createSelectorCreator({ memoize: lruMemoize })` borné (maxSize 50).
- **Preuve** : repro F2 en mesure directe — après 500 tokens distincts, le plus ancien token n'est plus en cache (évincé) ; la mémoïsation locale fonctionne toujours.
- **Statut** : ⚠️ Code prêt. **CI bloquée** sur `Merge Storybook a11y reports and validate OpenACR` → `Check openacr.yaml is up to date`. Diagnostiqué **non lié** au changement (headless-only ; le même check passe sur #8479 et #8481, même base `main`). En attente de décision (voir §4).

### Demande 4 — Token par requête + sample documenté
- **Ce que le client veut** (§9.4, §5, §8.2) : un `accessToken` par requête sur `fetchStaticState()` (aussi `ssr-commerce-next`), **et** un sample SSR documenté montrant l'usage de tokens par utilisateur en multi-tenant.
- **Livraison — partie fix** — PR #8481 (`feat(headless)`, minor) : `accessToken` optionnel ajouté à `CommonBuildConfig` (ssr-next), consommé dans `augmentCommerceEngineOptions` — override par requête sans muter la définition partagée. Scope `ssr-commerce-next` uniquement (le chemin beta `ssr-commerce` est déprécié et racy).
- **Livraison — partie doc/sample** : ❌ **manquante**. Aucun sample per-user-token n'a été créé.
- **Statut** : ⚠️ Partiel — code livré (draft, CI verte), sample documenté à faire.

### Demande 5 — Position produit + documentation « singleton »
- **Ce que le client veut** (§9.5, §7, §8.6) : une prise de position sur son pattern (définition request-scoped serveur + définition client séparée) — supporté ou non — et une MAJ de la doc qui affirme aujourd'hui que la définition « must be a singleton shared between server and client » (formulation qui, combinée à F1, produit la fuite).
- **Livraison** : ❌ **Hors périmètre des 3 PRs de code.** Décision R&D/PM + travail de documentation.
- **Statut** : ❌ Non traité — à router vers R&D/PM.

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
| CI #8480 bloquée sur OpenACR | Rerun complet vs régénérer `openacr.yaml` vs vérifier drift sur `main` | Toi |
| Sonde F3 du repro | Corriger pour prouver le token par requête ssr-next (teste actuellement le mauvais chemin) | Toi / moi |
| Sample per-user-token (demande 4) | Le créer ? où ? | Toi / PM |
| Demande 5 (doc + pattern supporté) | Router vers R&D/PM | Toi |
| Sort de ce doc de suivi + harnais repro | Rester hors PR (jetable) ou committer quelque part | Toi |

---

## 5. Artefacts

- **Rapport client** : `docs/investigation/CMS-443-headless-memory-leak-report_2026-09-10.md` (stashé, non suivi).
- **Harnais de repro/validation** : branche `chore/CMS-443-memory-repro`, `utils/cms443-memory-repro/` (`repro.mjs`, `compare.sh`, `README.md`) — poussée, sans PR.
- **PRs de fix** (draft, tous off `main`, sans stack) :
  - #8479 — Finding 1 (option A, patch)
  - #8480 — Finding 2 (lruMemoize, patch)
  - #8481 — Finding 3 (token par requête ssr-next, minor)

### Résultats repro avant/après (harnais, jeu de controllers minimal)

| Métrique | before (main) | after-f1 | after-f2 | after-f3 |
|---|---|---|---|---|
| F1 `fetchStaticState` KB/call | 37.7 | **4.2** ✅ | 37.8 | 37.3 |
| F2 plus vieux token encore en cache | true | true | **false** ✅ | true |
| F3 mute la définition partagée | true | true | true | true |

Écart assumé : nos ~37 KB/moteur (sample minimal) vs 65–129 KB du client (jeu de controllers réel) — l'ampleur scale avec les controllers (le rapport le prédit, §3.3). F3 n'est pas prouvé par le repro (sonde à corriger).
