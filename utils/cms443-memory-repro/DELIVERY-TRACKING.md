<!-- cspell:disable -->

# CMS-443 — Suivi de livraison (demandes client → livraison → statut)

> Document de suivi interne. Source : rapport client `CMS-443-headless-memory-leak-report_2026-09-10.md`
> (conservé hors git — contient des PII client). Confirmé contre `@coveo/headless` 3.55.4 (source, pas
> seulement le build). Ce fichier est un artefact de suivi, gardé sur la branche `chore/CMS-443-memory-repro`
> (commité mais sans PR) — **hors des PRs de fix**.

Dernière mise à jour : 2026-09-24

**Versions** : les fixes de fuite (Findings 1 et 2) sont publiés dans `@coveo/headless` **3.56.0**. Le token/navigator par requête (Finding 3) est **livré** dans `@coveo/headless` **[3.57.0](https://github.com/coveo/ui-kit/releases/tag/%40coveo%2Fheadless%403.57.0)** (23 sept 2026) via un stack de 5 PRs ([#8494](https://github.com/coveo/ui-kit/pull/8494) token ssr-commerce, [#8495](https://github.com/coveo/ui-kit/pull/8495) navigator context ssr-commerce, [#8504](https://github.com/coveo/ui-kit/pull/8504) retrait du setter ssr-commerce-next, [#8505](https://github.com/coveo/ui-kit/pull/8505) token ssr-next search) ; le wrapper React ([#8506](https://github.com/coveo/ui-kit/pull/8506)) est livré dans `@coveo/headless-react` **2.10.0** (même release train). La livraison initiale sur `ssr-commerce-next` (#8481) est **remplacée** par le support first-class sur le tree supporté `ssr-commerce` et son wrapper React.

---

## 1. Vue d'ensemble

### 1a. Livrables CODE — target de l'équipe support (livrés)

| #      | Demande client (§9 du rapport)                                                                                          | Type         | Livraison                                                                                                                      | Statut                                                                                                                                              |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Confirmer Finding 1 et Finding 2 comme défauts                                                                          | Confirmation | Réponse écrite + repro chiffré                                                                                                 | ✅ Confirmé                                                                                                                                         |
| 2      | Finding 1 : ne plus retenir les moteurs (dispose / weak / skip registration), `ssr-commerce` **et** `ssr-commerce-next` | Fix          | Registre faible : WeakRef + WeakMap + FinalizationRegistry, tous les chemins des 2 trees                                       | ✅ Mergé ([`fa2e9de00d`](https://github.com/coveo/ui-kit/commit/fa2e9de00d))                                                                        |
| 3      | Finding 2 : mémoïsation bornée pour `getRelayInstanceFromState`                                                         | Fix          | `lruMemoize`, maxSize 50, uniquement `memoize`                                                                                 | ✅ Mergé ([`818bdf001e`](https://github.com/coveo/ui-kit/commit/818bdf001e))                                                                        |
| 4a     | Token par requête first-class sur `fetchStaticState()` / `hydrateStaticState()` — tree `ssr-commerce-next`              | Fix          | Param `accessToken` par requête, sans muter la définition partagée                                                             | ✅ Mergé ([`01434bcbd3`](https://github.com/coveo/ui-kit/commit/01434bcbd3))                                                                        |
| 4a-bis | **Même fix sur le tree supporté `ssr-commerce`** (celui que le client utilise)                                          | Fix          | Param `accessToken` par requête via copie d'options par requête (jamais de mutation partagée) + symétrie hydratation           | ✅ Mergé ([PR #8494](https://github.com/coveo/ui-kit/pull/8494), merge [`3ed8932437`](https://github.com/coveo/ui-kit/commit/3ed8932437))           |
| 4c     | Navigator context par requête sur `ssr-commerce` (Finding 3, point a)                                                   | Fix          | Param `navigatorContext` par requête + retrait de la mutation partagée du `preprocessRequest`/navigator + symétrie hydratation | ✅ Mergé ([PR #8495](https://github.com/coveo/ui-kit/pull/8495), merge [`a01e1f3e38`](https://github.com/coveo/ui-kit/commit/a01e1f3e38))           |
| 4d     | Retrait du setter `setAccessToken` de `ssr-commerce-next` (nettoyage)                                                   | Refactor     | Retrait du setter + du helper `access-token-manager` orphelin                                                                  | ✅ Mergé ([PR #8504](https://github.com/coveo/ui-kit/pull/8504), merge [`9e88f885cf`](https://github.com/coveo/ui-kit/commit/9e88f885cf))           |
| 4e     | Token par requête pour `ssr-next` search                                                                                | Fix          | Param `accessToken` par requête sur ssr-next search + retrait du dead code                                                     | ✅ Mergé ([PR #8505](https://github.com/coveo/ui-kit/pull/8505), merge [`c3d36693a3`](https://github.com/coveo/ui-kit/commit/c3d36693a3))           |
| 4f     | Token par requête sur le wrapper React `@coveo/headless-react/ssr-commerce`                                             | Fix          | Prop `accessToken` sur le provider, transmise à `hydrateStaticState()`                                                         | ✅ Mergé ([PR #8506](https://github.com/coveo/ui-kit/pull/8506), merge [`4f82bb4f0d`](https://github.com/coveo/ui-kit/commit/4f82bb4f0d))           |
| 4b     | Migration des samples SSR commerce vers le navigator context par requête                                                | Sample       | `commerce-nextjs` + `commerce-react-router` migrés (plus de `setNavigatorContextProvider()` sur définition partagée)           | ✅ Mergé ([PR #8528](https://github.com/coveo/ui-kit/pull/8528), merge [`b02491458e`](https://github.com/coveo/ui-kit/commit/b02491458e), KIT-6209) |

> **Note de tree** : le token par requête a d'abord été livré sur `ssr-commerce-next` (#8481, mergé — **conservé**). Comme le client utilise le tree supporté `@coveo/headless/ssr-commerce`, on **étend** le même fix à ce tree via 4a-bis, et 4c y ajoute le navigator context par requête en corrigeant au passage la mutation d'état partagé (racine de Finding 3). Les deux trees sont ainsi couverts.

**→ Findings 1 et 2 (les fuites) sont livrés (`@coveo/headless` 3.56.0).** Le token/navigator par requête (Finding 3) est **livré dans `@coveo/headless` 3.57.0** (+ `@coveo/headless-react` 2.10.0 pour le wrapper React) : `ssr-commerce` (#8494/#8495), `ssr-commerce-next` d'origine (#8481, conservé) + nettoyage du setter (#8504), `ssr-next` search (#8505), et le wrapper React (#8506) ; les samples sont migrés (#8528).

### 1b. Livrables DOC / DÉCISION PRODUIT — à valider avec l'équipe

Les items ci-dessous ne sont **pas des fixes de code** : ce sont de la documentation et une prise de position produit dont la **pertinence et le propriétaire** doivent être tranchés par l'équipe (R&D / PM / DevEx), pas engagés unilatéralement par le support. La question à poser n'est pas « quand ? » mais « est-ce raisonnable, et qui le porte ? ».

| #   | Demande client (§9 du rapport)                                                                                                                                                                                                                                                                   | Type        | Question ouverte pour l'équipe                                                                                                                  | Statut                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Doc | **Article SSR de gestion des tokens/context** — [PR #8500](https://github.com/coveo/ui-kit/pull/8500) : `ssr-manage-access-tokens.md` (token + navigator context par requête sur `ssr-commerce` + note prop React) ; clarification request-scoped serveur dans `ssr-extend-engine-definitons.md` | Doc / DevEx | Documente le **mécanisme** (prouvé par le code), sans décréter de contrat de support                                                            | 🟢 **Indépendante sur `main`** (sortie du stack), en review équipe de rédaction (JP + commentaires Copilot/fbeaudoincoveo adressés) — livraison un peu plus tard (cycle éditorial distinct) |
| 4b  | Sample SSR documenté montrant l'usage de tokens per-user en multi-tenant                                                                                                                                                                                                                         | Doc / DevEx | Partie DOC couverte par #8500 ; samples migrés vers le pattern par requête (#8528) ; reste : faut-il un **sample multi-tenant dédié** au-delà ? | ✅ Doc (#8500) + samples migrés (#8528, KIT-6209 mergé) ; sample multi-tenant dédié = optionnel                                                                                             |
| 5a  | Indiquer la bonne façon d'utiliser le pattern par requête + lever la contradiction avec la doc « singleton shared server/client »                                                                                                                                                                | Doc / DevEx | Documenter le **mécanisme** (per-request token/navigator via `fetchStaticState`), sans décréter de contrat de support                           | ✅ Fait — mécanisme documenté dans [#8500](https://github.com/coveo/ui-kit/pull/8500) (sans revendiquer un support officiel)                                                                |
| 5b  | Position produit **formelle** : le pattern « definition request-scoped serveur + définition client séparée » est-il **officiellement supporté** (engagement de compat) ?                                                                                                                         | Décision    | —                                                                                                                                               | 🚫 Won't do — décision assumée de ne pas se positionner (voir §2 Demande 5b pour le pourquoi)                                                                                               |

Légende : ✅ fait · 🟢 livré / en PR · ⚠️ partiel/en cours · ⏸️ en attente de décision d'équipe · 🚫 won't do (décision assumée, justifiée) · ❌ non commencé

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

### Demande 4a — Token par requête (CODE) ✅→🟡

- **Ce que le client veut** (§9.4, §5, §8.2) : un `accessToken` par requête sur `fetchStaticState()`, sur le package qu'il utilise (`@coveo/headless/ssr-commerce`). Finding 3 pointe aussi le `navigatorContext` forcé à travers la définition partagée (race inter-requêtes).
- **Livraison sur `ssr-commerce-next`** — PR #8481 (`feat(headless)`, minor) : `accessToken` ajouté à `CommonBuildConfig`, mergé (`01434bcbd3`). **Conservé.**
- **Extension au tree supporté `ssr-commerce`** — deux PRs, **mergées** :
  - **4a-bis** — [PR #8494](https://github.com/coveo/ui-kit/pull/8494) (merge [`3ed8932437`](https://github.com/coveo/ui-kit/commit/3ed8932437)) : `accessToken?` optionnel sur `fetchStaticState()`/`build()`/`hydrateStaticState()`, appliqué via une **copie d'options par requête** (jamais de mutation partagée). Additif, backward compatible.
  - **4c** — [PR #8495](https://github.com/coveo/ui-kit/pull/8495) (merge [`a01e1f3e38`](https://github.com/coveo/ui-kit/commit/a01e1f3e38)) : `navigatorContext?` par requête + **suppression de la mutation partagée** du `preprocessRequest`/navigator (racine de la race Finding 3) + symétrie hydratation. Migre aussi le sample `commerce-express` (serveur) vers le chemin par requête.
- **Pourquoi étendre à `ssr-commerce`** : le client utilise ce tree (supporté), pas `ssr-commerce-next`. Étendre le fix y répond directement, sans retirer la couverture déjà livrée sur `-next`.
- **Preuve** : validation dans le repro versionné (`utils/cms443-memory-repro/`), **F3b** = per-request token **et** navigator context sur `ssr-commerce` — AVANT : LEAK ; APRÈS (build du stack #8494/#8495) : **FIXED** (token appliqué, moteurs concurrents isolés, navigator context par requête OK, définition partagée non mutée). F3a (`ssr-next`, #8481) reste FIXED. Suite headless complète verte (5576 tests).
- **Review** : les deux PRs ont passé la review automatique **Copilot** — tous les commentaires fondés adressés et **tous les threads résolus** (#8494 : precedence extend/token, non-abonnement au token-manager partagé, `fromBuildResult` ; #8495 : faux warning per-request-only, test concurrent navigator, commentaire de précédence, migration du sample). Aucun commentaire ouvert restant.
- **Statut** : ✅ **Livré** — #8481 (`ssr-commerce-next`), #8494 + #8495 (`ssr-commerce`), #8504 (retrait setter), #8505 (ssr-next search) dans **`@coveo/headless` 3.57.0** ; #8506 (provider React) dans **`@coveo/headless-react` 2.10.0**.

### Demande 4b — Sample SSR per-user-token documenté (DOC) 🟢/⏸️

- **Ce que le client veut** (§5, §8.2) : un sample SSR documenté montrant l'usage de tokens par utilisateur en multi-tenant, au-delà du simple param.
- **Nature** : livrable **documentation / DevEx**, pas un fix. Le param existe (4a) ; il s'agit d'illustrer son usage.
- **Partie DOC livrée** : la [PR #8500](https://github.com/coveo/ui-kit/pull/8500) (article `ssr-manage-access-tokens.md`, réorienté vers `ssr-commerce`) **documente l'usage du token par utilisateur** (section « Use a different token per user » : mint d'un token par requête + passage à `fetchStaticState`/`hydrateStaticState`), avec un exemple serveur concret. Le besoin « documenté » est donc couvert.
- **Amorce sample code** : #8495 a migré le sample `commerce-express` (`server.ts`) vers `fetchStaticState({navigatorContext})` — sur le bon pattern concurrency-safe.
- **Reste (optionnel, décision d'équipe)** : faut-il un **sample de code dédié** per-user-token (au-delà de la doc + du sample migré) ? Où ? Qui l'écrit ?
- **Statut** : 🟢 partie DOC livrée dans #8500 ; ⏸️ sample de code dédié = décision d'équipe (pas un engagement unilatéral du support).

### Demande 5a — Indiquer la bonne façon d'utiliser le pattern + doc « singleton » (DOC) ✅

- **Ce que le client veut** (§9.5, §7, §8.6) : lever la contradiction avec la doc qui affirme aujourd'hui que la définition « must be a singleton shared between server and client » (formulation qui, combinée à F1, produit la fuite), et savoir **comment** faire du per-user token/context proprement.
- **Nature** : **documentation.** Dans le périmètre DevEx, sans engagement produit.
- **Partie DOC « mécanisme » livrée** : la [PR #8500](https://github.com/coveo/ui-kit/pull/8500) ajoute à `ssr-extend-engine-definitons.md` une section « Keep per-request data out of the shared definition (server) » qui **clarifie le mécanisme** — token/navigator par requête via `fetchStaticState`, jamais sur la définition partagée (racy en concurrence). Elle documente le _comment_, factuel et prouvé par le code, **sans** décréter qu'un pattern client est « officiellement supporté ».
- **Note sur la formulation « singleton »** : le libellé exact « must be a singleton shared between server and client » **n'existe pas** littéralement dans la doc actuelle (formulations réelles plus douces : « shared definition »). Cette demande est donc « préciser/positionner le mécanisme », pas « corriger une phrase fautive ».
- **Statut** : ✅ **Fait** — mécanisme documenté dans #8500, sans revendiquer un support officiel. Suffisant pour indiquer la bonne façon d'utiliser le pattern.

### Demande 5b — Position produit formelle : pattern « officiellement supporté » ? (DÉCISION) 🚫 Won't do

- **Ce que le client veut** (§9.5) : une prise de position produit sur son pattern (définition request-scoped serveur + définition client séparée) — est-il **officiellement supporté** avec engagement de compat ?
- **Décision assumée : won't do.** On ne se positionnera pas formellement, et voici **pourquoi** :
  1. **Le vrai besoin est résolu par du code, pas par une prise de position.** `fetchStaticState({accessToken, navigatorContext})` sur `ssr-commerce` **est** l'API supportée maintenant : le client a un vrai champ par requête et n'a plus besoin de son workaround request-scoped. La question « le workaround est-il officiellement supporté ? » devient largement théorique — on offre mieux que le workaround.
  2. **Documenter le mécanisme ≠ décréter un contrat de support.** Écrire « voici comment passer un token/contexte par requête » (mécanisme prouvé par le code, fait en 5a) est un engagement DevEx normal ; déclarer « le pattern X est officiellement supporté avec garantie de compat » est un engagement **produit** qui demande un owner PM/R&D. On livre le premier ; le second n'est pas nécessaire pour débloquer le client.
  3. **On évite un faux engagement.** Ne pas écrire « officiellement supporté » protège l'entreprise d'une garantie de compat que personne côté produit n'a validée.
- **Argument produit qui renforce la décision (#8494, fix #2)** : un moteur construit avec un token par requête n'est **plus abonné** au token-manager partagé — un `setAccessToken()` partagé (queué ou concurrent) ne peut plus l'écraser. L'isolation « this call only » est désormais une **propriété de l'API supportée `ssr-commerce`**, pas seulement un effet obtenu à la main par le pattern request-scoped du client. Le param par requête fournit nativement l'isolation que le contournement visait — d'où l'inutilité d'un positionnement formel sur le contournement lui-même.
- **Nuance conservée** : si le client (ou PS) redemande explicitement « est-ce _garanti supporté / stable_ ? », la réponse restera « c'est l'API documentée et recommandée » plutôt qu'un engagement de compat formel. Non-problème tant que personne ne le pousse.
- **Statut** : 🚫 **Won't do** — décision assumée de ne pas prendre de position produit formelle. La doc du mécanisme (5a, #8500) suffit ; « good enough » et défendable.

---

## 3. Information à remettre au client (non-code)

Au-delà du code, le client attend explicitement :

1. **Confirmation écrite** que F1 + F2 sont des défauts reconnus (§9.1).
2. **Position sur le pattern §7** (definition request-scoped + définition client séparée) : supporté ou non (§9.5).
3. **Réponse sur les hooks alternatifs** qu'il a évalués — `preprocessRequest` et `renewAccessToken` (§5) — et pourquoi le param par requête est la bonne réponse plutôt que ces hooks. _(Précision apportée par le fix #1 : le token par requête est appliqué **avant** le hook déprécié `extend`, donc `extend` reste autoritaire s'il est fourni — la précédence est claire et documentée.)_
4. **MAJ documentation** : phrase « singleton partagé serveur/client », absence de sample per-user-token, et le point historique « `build()` à la fois déprécié et seul chemin de token par requête » — **ce dernier n'est plus vrai sur le tree supporté `ssr-commerce`** : `accessToken`/`navigatorContext` par requête sont acceptés **aussi par `fetchStaticState()`**, pas seulement `build()`. La réponse client doit refléter que le chemin nominal (`fetchStaticState`) porte nativement le token par requête. _(Largement livré par la [PR #8500](https://github.com/coveo/ui-kit/pull/8500) : l'article documente le token/navigator par requête via `fetchStaticState` sur `ssr-commerce` et clarifie que la définition partagée ne doit pas porter de données par requête sur le serveur.)_

Contraintes de communication (préférences projet) :

- Pas de nom de client dans les artefacts publics / git.
- Pas de numéros/liens de PR dans le texte destiné au client (repo `coveo/ui-kit` public) — sauf billet interne.
- Pas de date de livraison promise.
- Le workaround du client (définition request-scoped, §7) reste valide en attendant.

---

## 4. Points ouverts / décisions en attente

| Sujet                                                                                                                             | Décision attendue                                                                                                                                                                                                                                                                                                                          | Qui                |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| CI #8480 bloquée sur OpenACR                                                                                                      | ✅ Résolu — faux drift (report a11y incomplet), rerun complet                                                                                                                                                                                                                                                                              | Fait               |
| Sonde F3 du repro                                                                                                                 | ✅ F3a (`ssr-next`) prouvée + F3b (`ssr-commerce`, #8494/#8495) ajoutée et validée FIXED contre le build du stack                                                                                                                                                                                                                          | Fait               |
| Les 3 PRs de fix (F1/F2/F3)                                                                                                       | ✅ Mergées sur `main` (2026-09-15)                                                                                                                                                                                                                                                                                                         | Fait               |
| **Token par requête — couverture complète**                                                                                       | ✅ **Livré dans `@coveo/headless` 3.57.0** (+ `headless-react` 2.10.0) : `ssr-commerce` ([#8494](https://github.com/coveo/ui-kit/pull/8494)/[#8495](https://github.com/coveo/ui-kit/pull/8495)), `ssr-commerce-next` (#8481, conservé) + retrait setter (#8504), `ssr-next` search (#8505), wrapper React (#8506) ; samples migrés (#8528) | Fait               |
| **Stack code #8494→#8506** (`ssr-commerce` token + navigator, retrait setter, ssr-next search, provider React)                    | ✅ **Livré** dans `@coveo/headless` [3.57.0](https://github.com/coveo/ui-kit/releases/tag/%40coveo%2Fheadless%403.57.0) + `@coveo/headless-react` 2.10.0 (23 sept). Mergé le 22 sept, réapprobations post-restack obtenues, CI vert (flake `atomic-commerce-search-box` relancé au besoin)                                                 | Fait               |
| **Symétrie hydratation du token/navigator par requête**                                                                           | ✅ **Résolu** — `HydrateStaticStateOptions` porte `accessToken`/`navigatorContext`, et le moteur hydraté per-request n'est pas écrasé par le token de config. Mergé dans #8494/#8495                                                                                                                                                       | Fait               |
| **Étendre la sonde F3b au chemin hydratation**                                                                                    | Optionnel — le comportement hydratation est couvert par les tests unitaires du package ; sonde repro non étendue (non bloquant)                                                                                                                                                                                                            | Optionnel          |
| **Per-request token sur `@coveo/headless-react/ssr-commerce`**                                                                    | ✅ **Livré = #8506** dans `@coveo/headless-react` 2.10.0 (prop `accessToken` du provider)                                                                                                                                                                                                                                                  | Fait               |
| **PR doc [#8500](https://github.com/coveo/ui-kit/pull/8500)** (`ssr-manage-access-tokens.md` + `ssr-extend-engine-definitons.md`) | 🟢 **Indépendante sur `main`**, en review équipe de rédaction ; commentaires Copilot/fbeaudoincoveo adressés. À merger après review éditoriale                                                                                                                                                                                             | Toi / writing team |
| Sample per-user-token de CODE dédié (demande 4b)                                                                                  | ✅ Samples migrés (#8528, KIT-6209, mergé) ; un sample multi-tenant dédié au-delà reste optionnel (décision d'équipe)                                                                                                                                                                                                                      | Optionnel / PM     |
| Demande 5a — indiquer la bonne façon + doc « singleton »                                                                          | ✅ Fait — mécanisme documenté dans #8500 (sans revendiquer un support officiel)                                                                                                                                                                                                                                                            | Fait               |
| Demande 5b — « pattern officiellement supporté »                                                                                  | 🚫 Won't do — décision assumée de ne pas se positionner ; le code livré rend le workaround obsolète et la doc du mécanisme (#8500) suffit (voir §2 Demande 5b)                                                                                                                                                                             | Décidé             |
| Réponse client (confirmation F1/F2, position pattern §7, hooks alternatifs)                                                       | À rédiger — statut intermédiaire relayé le 2026-09-17 via le [fil Slack](https://coveo.slack.com/archives/C016TA2G485/p1789063923761429) (F1/F2 dans 3.56.0, F3 reporté)                                                                                                                                                                   | Toi / Support      |
| Sort de ce doc de suivi + harnais repro                                                                                           | Rester hors PR (jetable) ou committer quelque part                                                                                                                                                                                                                                                                                         | Toi                |

---

## 5. Artefacts

- **Fil Slack support ↔ client (via @sallain / PS)** : [thread #support-...](https://coveo.slack.com/archives/C016TA2G485/p1789063923761429) (workspace `coveo.slack.com`, accès SSO Coveo requis). Canal de communication du statut au client — statut relayé : F1/F2 livrés dans `@coveo/headless` 3.56.0, token par requête (F3) reporté à une release ultérieure.
- **Rapport client** : `docs/investigation/CMS-443-headless-memory-leak-report_2026-09-10.md` (stashé, non suivi).
- **Harnais de repro/validation** : branche `chore/CMS-443-memory-repro`, `utils/cms443-memory-repro/` (`repro.mjs`, `compare.sh`, `README.md`) — poussée, sans PR.
- **PRs de fix** (toutes **mergées** sur `main` le 2026-09-15, off `main`, sans stack) :
  - [PR #8479](https://github.com/coveo/ui-kit/pull/8479) — Finding 1 (registre faible : WeakRef + WeakMap + FinalizationRegistry, patch) — merge [`fa2e9de00d`](https://github.com/coveo/ui-kit/commit/fa2e9de00d)
  - [PR #8480](https://github.com/coveo/ui-kit/pull/8480) — Finding 2 (lruMemoize sur `memoize` uniquement, patch) — merge [`818bdf001e`](https://github.com/coveo/ui-kit/commit/818bdf001e)
  - [PR #8481](https://github.com/coveo/ui-kit/pull/8481) — Finding 3 (token par requête ssr-next, minor) — merge [`01434bcbd3`](https://github.com/coveo/ui-kit/commit/01434bcbd3)

### Résultats repro avant/après (harnais, jeu de controllers minimal)

| Métrique                                              | before (main) | after-f1    | after-f2     | after-f3    | after-f3-ssr-commerce |
| ----------------------------------------------------- | ------------- | ----------- | ------------ | ----------- | --------------------- |
| F1 `fetchStaticState` KB/call                         | 37.2          | **3.9** ✅  | 37.0         | 37.2        | 4.7                   |
| F1 `build()` moteurs encore vivants (/500)            | 500           | **1** ✅    | 500          | 500         | 1                     |
| F1 `hydrateStaticState` moteur vivant reçoit le token | true          | **true** ✅ | true         | true        | true                  |
| F2 plus vieux token encore en cache                   | true          | true        | **false** ✅ | true        | false                 |
| F3a token par requête appliqué (`ssr-next`)           | false         | false       | false        | **true** ✅ | true                  |
| F3a définition partagée non mutée (`ssr-next`)        | true          | true        | true         | **true**    | true                  |
| F3b token par requête isolé (`ssr-commerce`)          | false         | —           | —            | —           | **true** ✅           |
| F3b navigator context par requête (`ssr-commerce`)    | false         | —           | —            | —           | **true** ✅           |
| F3b définition partagée non mutée (`ssr-commerce`)    | —             | —           | —            | —           | **true**              |

Diagonale FIXED (F1→after-f1, F2→after-f2, F3a→after-f3, F3b→after-f3-ssr-commerce) : chaque fix corrige son finding et aucun autre — confirmation empirique de l'indépendance. La colonne `after-f3-ssr-commerce` est le build du stack #8494/#8495 (contient aussi F1/F2 via `main` mergé), d'où F1/F2 également verts.

Preuve F1 (registre faible) — trois signaux alignés : `fetchStaticState` 37.2 → 3.9 KB/call (le résidu est le static state, pas le moteur) ; `build()` 500 → 1 moteur retenu (le « 1 » est le dernier encore référencé au GC, artefact de mesure) ; `hydrateStaticState` — le moteur hydraté vivant reçoit toujours le token renouvelé (non-régression, là où l'option A le laissait périmé). Le compteur de rétention utilise le décompte WeakRef post-GC (déterministe), pas les finalizers du `FinalizationRegistry` (dont le timing n'est pas garanti par la spec).

Écart assumé : nos ~37 KB/moteur (sample minimal) vs 65–129 KB du client (jeu de controllers réel) — l'ampleur scale avec les controllers (le rapport le prédit, §3.3).

Sonde F3, deux trees, sans réseau :

- **F3a (`ssr-next`, #8481)** : teste `augmentCommerceEngineOptions` directement (le fichier exact que le fix modifie) — override par requête appliqué, définition partagée non mutée, fallback au token de définition si omis.
- **F3b (`ssr-commerce`, #8494/#8495)** : preuve causale via deux `build()` concurrents avec des tokens distincts — assère l'isolation des tokens, la non-mutation de la définition partagée, et l'application du navigator context par requête. C'est le tree que le client utilise réellement.
