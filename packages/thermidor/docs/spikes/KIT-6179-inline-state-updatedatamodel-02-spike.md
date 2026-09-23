# Spike KIT-6179 — Transport inline de Component_State via `updateDataModel` A2-UI

- **Ticket :** [KIT-6179](https://coveord.atlassian.net/browse/KIT-6179) — _Évaluer l'utilisation des opérations `updateDataModel` d'A2-UI pour le transport inline de Component_State_
- **Type :** Spike (investigation, pas un relevé de décision)
- **Statut :** Terminé — les constats sont consignés ci-dessous, incluant les critères d'acceptation et la recommandation Go / No-Go.
- **Branche de base :** `KIT-6193-thermidor-session-client-rework` (ui-kit) / `beta` (thermidor-schema)
- **Portée (selon le ticket) :** `integration/thermidor-schema`, `integration/ui-kit/packages/thermidor`, `integration/ui-kit/packages/platform-mock-api`, `integration/ui-kit/samples/thermidor/demo-schema-react`. Hors portée : le backend, `agent-smith`, `agent-gateway` (aucune modification).

> **Note sur les sources.** Chaque réponse ci-dessous s'appuie sur une source concrète : un fichier de schéma, une ligne du renderer figé / du core, ou un test. Les chemins sont relatifs à la racine du dépôt. Les numéros de ligne sont indicatifs (ils dérivent à mesure que les fichiers changent) — les noms de symboles sont l'ancrage durable.

## Sommaire

- [Contexte](#contexte)
- [Objectif](#objectif)
- [Comment fonctionne le modèle](#comment-fonctionne-le-modèle-updatedatamodel-en-une-page)
- [Questions à traiter](#questions-à-traiter)
- [Constat : composition standard A2-UI (le constat Y2)](#constat--composition-standard-a2-ui-le-constat-y2)
- [Constats positifs](#constats-positifs)
- [Constats (smells et risques)](#constats-smells-et-risques)
- [Obstacles d'implémentation rencontrés](#obstacles-dimplémentation-rencontrés)
- [Analyse des options](#analyse-des-options)
- [Critères d'acceptation](#critères-dacceptation)
- [Recommandation Go / No-Go](#recommandation-go--no-go)

## Contexte

La fonctionnalité remplace le transport d'état basé sur les événements AG-UI (`StateSnapshot` / `StateDelta`) par un état porté **inline à travers le modèle de données A2-UI** via des opérations `updateDataModel` (écritures RFC 6901 JSON Pointer) et des objets Data_Binding `{ "path": <JSON Pointer> }`. Cela inverse la décision ADR-002 et nécessite une révision de l'ADR (livrable bloquant dans `thermidor-schema`).

L'intention est d'abandonner le modèle d'état AG-UI ad-hoc — ainsi que le `RemoteController` qui fait le pont entre un composant A2-UI et son état porté par AG-UI — et de s'aligner sur le standard A2-UI pour les données de composant, afin que chaque consommateur du backend (pas seulement Thermidor) obtienne un modèle intuitif et standard. Sur la base KIT-6193, le handle client est le `Session` issu de `createSession` ; l'API publique du RemoteController et sa jointure interne sont supprimées, et la validation de contrat est relocalisée dans le chemin de transport du core (validation `updateDataModel` entrante sur le fold) et le point d'entrée unique de dispatch exposé au consommateur (`Session.dispatchAction`).

### Pourquoi adopter `updateDataModel` — l'argument d'alignement au standard

Un argument primordial en faveur de l'adoption d'`updateDataModel` (plutôt que le modèle d'état AG-UI
ad-hoc) est **l'alignement sur le standard A2-UI**. Thermidor n'est **pas** le seul consommateur de ce
backend, de sorte que le contrat de données ne doit pas être architecturé autour de la seule
implémentation de Thermidor. Un canal d'état ad-hoc, spécifique à Thermidor, force tout autre
consommateur du backend à réimplémenter ou à s'adapter à un modèle sur mesure ; transporter
`Component_State` à travers le modèle de données standard A2-UI signifie que tout consommateur
conforme à A2-UI lit l'état de la même façon, standard — aucun pont spécifique à Thermidor requis. Ce
principe de conception s'applique au-delà du transport d'état : c'est la même raison pour laquelle la
composition devrait suivre les conventions standard A2-UI (slots nommés `ComponentId` / listes
`ChildList`) plutôt qu'une forme propre à Thermidor (voir
[Constat : composition standard A2-UI](#constat--composition-standard-a2-ui-le-constat-y2)). Partout où
un choix se pose entre « pratique pour Thermidor » et « standard A2-UI », la réalité multi-consommateurs
favorise le standard.

Le rôle du spike : confirmer que le modèle `updateDataModel` couvre nos besoins (mises à jour complètes et granulaires, validation en transit, sémantique de fusion côté renderer), déterminer comment la composition A2-UI est censée fonctionner avec le renderer figé, et faire ressortir les risques **avant** de figer l'implémentation.

## Objectif

Déterminer si et comment les opérations `updateDataModel` d'A2-UI peuvent porter `Component_State` de bout en bout à travers la stack Thermidor sur la base KIT-6193, comment les surfaces sont composées avec le renderer figé en utilisant les conventions standard A2-UI, et documenter les contraintes et les zones de risque.

## Comment fonctionne le modèle (`updateDataModel` en une page)

Le backend décrit une surface puis diffuse son état ; le renderer figé résout les liaisons par rapport à cet état. Trois plans sont maintenus distincts :

Suivant le modèle **adjacency list A2-UI v1.0**, un nœud est **plat** : identité, valeurs, liaisons et liens de composition sont portés directement au **niveau supérieur du nœud** (pas de wrapper `props`).

- **Composition** — `createSurface` et les références d'enfants de chaque nœud : quel nœud contient quel autre, et (pour les listes ordonnées) dans quel ordre. La composition est déclarée au **niveau supérieur du nœud**, typée : un **slot nommé à enfant unique** est un `ComponentId` (comme le `Card` du catalogue de base A2-UI utilise `child` et le `Modal` utilise `trigger`/`content` ; ici `CommerceSearch` utilise `sidebarChild`/`mainChild`), une **liste ordonnée** est un `ChildList` (`children`, comme `Row`/`Column`). Le renderer figé monte chaque enfant par la fonction `children(id)` (alias `buildChild(id)`).
- **Identité** — `id` + le discriminant `component`, portés au **niveau supérieur du nœud** (jamais de seconde identité `componentId`/`componentType`).
- **État** — poussé via des opérations `updateDataModel` sous l'espace de noms `/state/<id>`, et référencé depuis les propriétés du nœud à travers des objets Data_Binding A2-UI `{ "path": <JSON Pointer> }`.

Les propriétés d'un nœud portent donc des valeurs de présentation, des liaisons d'état `{ path }` et des champs de composition (`ComponentId` / `ChildList`) — aucune identité dupliquée, aucune valeur d'état inline. Le renderer lit l'état en résolvant les liaisons `{ path }` par rapport au modèle de données que `updateDataModel` peuple, et monte les enfants en résolvant les champs de composition via `children(id)`.

**Les actions ne sont pas portées dans les messages de données du backend — elles sont déclarées uniquement dans le schéma.** Les actions d'un composant (p. ex. `selectPage` / `setPageSize` de `Pagination`) sont statiques par type de composant, définies dans son contrat de schéma et projetées dans l'union `XxxAction` générée. Les messages ne portent jamais de champ `actions` sur un nœud ; au moment du dispatch, le core résout le contrat d'action à partir du discriminant `component` du nœud, valide la charge utile par rapport à celui-ci, et POST l'action. Le seul endroit où une action apparaît dans un message est **en sortie**, lorsque le client en dispatche une.

**Écritures complètes vs granulaires.** Une op à `/state/<id>` **remplace** l'objet d'état entier du nœud ; une op à `/state/<id>/<field>` **fusionne** ce seul champ. Les producteurs envoient une op partielle pour préserver les champs non listés, ou une op de nœud complet portant l'état complet.

**Propriété.** Le backend est l'unique source de vérité pour l'état ; le frontend ne mute pas directement l'état lié. Une interaction utilisateur dispatche une action sur HTTP ; la réponse rediffuse l'état recalculé sous forme d'ops `updateDataModel`, que le core réapplique. Les propriétés liées sont en lecture seule côté renderer.

**Validation en transit.** Chaque op d'état entrante est validée par rapport au contrat Zod du composant avant d'atteindre le renderer ; une op non conforme est écartée (le renderer conserve son état antérieur), jamais appliquée. Sur la base KIT-6193, cette validation réside sur le fold d'événements pur (`src/session/fold.ts`), le seul endroit où un `TurnResponse` est construit à partir du flux.

### Forme concrète

```jsonc
// 1. createSurface — le nœud PLAT déclare son identité + ses liaisons { path } au top-level (aucun état inline).
//    L'enveloppe ne porte pas de `rootId` : le nœud racine est le nœud canonique `id: "root"`.
{
  "version": "v1.0",
  "createSurface": {
    "surfaceId": "ui-commerce-water-sports",
    "catalogId": "https://schema.thermidor.coveo.com/a2-ui/catalog.json",
    "components": [
      {
        "id": "pagination-2",
        "component": "Pagination",
        "page": { "path": "/state/pagination-2/page" },
        "pageSize": { "path": "/state/pagination-2/pageSize" },
        "totalEntries": { "path": "/state/pagination-2/totalEntries" },
        "totalPages": { "path": "/state/pagination-2/totalPages" }
      }
      // ... autres nœuds (dont le nœud `id: "root"` de la surface)
    ]
  }
}

// 2. updateDataModel — the backend pushes the state the bindings resolve against
//    whole-node write at /state/<id> (replaces the node's state object)
{
  "version": "v1.0",
  "updateDataModel": {
    "surfaceId": "ui-commerce-water-sports",
    "path": "/state/pagination-2",
    "value": { "page": 0, "pageSize": 12, "totalEntries": 43, "totalPages": 4 }
  }
}

// 3. a later granular write merges a single field without clobbering its siblings
{
  "version": "v1.0",
  "updateDataModel": {
    "surfaceId": "ui-commerce-water-sports",
    "path": "/state/pagination-2/page",
    "value": 1
  }
}
```

## Questions à traiter

Chaque question reçoit une réponse structurée en : **Réponse** / **Standard A2-UI** (ce que dit la spécification, avec un lien officiel, ou un « pas de standard — décision Thermidor » explicite) / **Validation** (comment cela a été confirmé face à `@copilotkit/a2ui-renderer` v1.61 / `@a2ui/web_core` 0.9). La question de composition (Q4) est développée dans sa propre section de constat plus bas.

### Q1 — Comment le renderer figé applique-t-il une op `updateDataModel`, et respecte-t-il la sémantique de fusion granulaire ?

**Réponse :** Oui — une op `updateDataModel` complète ou partielle écrit sur la feuille de son JSON Pointer et le composant lié se re-rend, sans écraser les champs voisins.

**Standard A2-UI :** Le protocole maintient la structure UI séparée d'un modèle de données par surface et lie les composants par JSON Pointer. L'entrée `updateDataModel` de la [A2-UI — Message Reference](https://a2ui.org/reference/messages/) illustre la mise à jour d'un chemin imbriqué de sorte que seul ce chemin change, et le guide [A2-UI — Data Binding](https://a2ui.org/concepts/data-binding/) recommande des « mises à jour granulaires » qui ne touchent que le chemin modifié.

**Validation :** Confirmé dans `@a2ui/web_core@0.9.0` : `message-processor` `processUpdateDataModelMessage` appelle `surface.dataModel.set(path, value)`, et `data-model.js#set` parcourt le JSON Pointer et écrit **uniquement la feuille** (`current[lastSegment] = value`), créant les conteneurs intermédiaires sans réécrire les voisins, puis notifie les abonnés de ce chemin. **Asymétrie à noter :** une op de composant complet à `/state/<id>` écrit l'objet d'état entier (elle **remplace**), tandis qu'une op de sous-chemin `/state/<id>/<field>` **fusionne** dans les voisins — les producteurs doivent envoyer une op partielle pour préserver les champs non listés.

### Q2 — Les mises à jour partielles (un sous-chemin sous `statePath(id)`) se comportent-elles conformément à la bonne pratique A2-UI des mises à jour granulaires ?

**Réponse :** Oui.

**Standard A2-UI :** Mêmes références que Q1 — l'exemple `updateDataModel` à chemin imbriqué et la recommandation des « mises à jour granulaires » décrivent l'écriture du seul sous-chemin modifié afin que les champs voisins survivent.

**Validation :** Même mécanisme `data-model.js#set` qu'en Q1 — une op partielle fixe sa feuille et notifie ce chemin, de sorte que le renderer ne re-rend que la liaison affectée.

### Q3 — Où réside le typage state/action par composant, et est-il préservé une fois le RemoteController supprimé ?

**Réponse :** Oui, préservé. L'état est typé par le schéma `*State` du composant et les actions par son schéma `*Actions`, tous deux projetés dans le contrat Zod généré ; supprimer le RemoteController relocalise la _validation_, pas le typage.

**Standard A2-UI :** Pas de réponse standard A2-UI — l'endroit où réside la validation de contrat en transit est une décision d'architecture Thermidor, pas une partie du protocole A2-UI.

**Validation (base KIT-6193) :** Sur KIT-6193, le handle client est le `Session` (`src/session/create-session.ts`), le flux est folded dans `src/session/fold.ts`, et l'API publique du RemoteController + la jointure interne sous `src/remote-controller/` sont supprimées. La validation `updateDataModel` entrante réside sur le chemin de fold/transport, qui suit l'identité de nœud (`id` + `component`) issue de `createSurface`/`updateComponents` et valide chaque op par rapport au contrat Zod du composant, écartant les ops non conformes. La validation de la charge utile d'action en sortie se déplace dans le `executeAction` privé atteint depuis `Session.dispatchAction`. `findComponentContract(component)` est conservé en interne.

### Q4 — Comment fonctionne la composition standard A2-UI avec le renderer figé, et comment un conteneur multi-slots comme `CommerceSearch` devrait-il être composé ?

**Réponse :** Voir le constat dédié plus bas — [Constat : composition standard A2-UI (le constat Y2)](#constat--composition-standard-a2-ui-le-constat-y2). En bref : le renderer compose les enfants par **propriété du nœud** (`children(node.<slot>)`), de sorte qu'un conteneur multi-slots hétérogène déclare des **slots `ComponentId` nommés** au niveau supérieur du nœud (`sidebarChild`/`mainChild`), jamais un tableau indexé par position.

### Q5 — `statePath(id)` et le résolveur d'opération couvrent-ils les cas de rejet, et la préservation du pont v1.0→v0.9 est-elle intacte ?

**Réponse :** Oui pour les deux. `statePath(id)`/`resolveOperation` n'acceptent que `statePath(id)` ou un sous-chemin en dessous et rejettent tout le reste (modèle inchangé, chemin rapporté) ; `convertV1ToV09` transfère les nœuds plats tels quels — les liaisons `{ "path": ... }` sont préservées octet pour octet et l'identité unique `id`/`component` conservée, sans réintroduire de `componentId`/`componentType`. (Depuis la mise en conformité adjacency list, le nœud racine est déjà le nœud canonique `id: "root"` et l'enveloppe ne porte plus de `rootId` : le pont n'a plus aucun remap de racine à faire.)

**Standard A2-UI :** Seule la syntaxe de chemin JSON Pointer est normative ([A2-UI — Data Binding](https://a2ui.org/concepts/data-binding/)) ; l'espace de noms `/state/<id>` et les règles d'acceptation/rejet sont des conventions Thermidor. La forme de nœud cible v0.9 est définie par la [A2-UI — Message Reference](https://a2ui.org/reference/messages/) ; le pont v1.0→v0.9 lui-même est une préoccupation de l'échantillon Thermidor (le renderer figé ne parle que v0.9).

**Validation :** `statePath`/`resolveOperation` sont exportés depuis `@coveo/thermidor-schema` et consommés par le validateur du core ; le pont (`src/a2ui/surfaces.tsx#convertV1ToV09`) transporte l'identité + les liaisons et interdit les clés d'identité. (Les deux ont été re-confirmés face au câblage de l'échantillon KIT-6193 durant l'implémentation.)

## Constat : composition standard A2-UI (le constat Y2)

**Comment les enfants sont censés atteindre une render function en A2-UI, la forme non standard qui était en place au moment du spike, et la convention standard qui l'a éliminée.** Le constat identifie deux problèmes de l'état de départ, puis la remédiation — désormais **implémentée** (voir « Résultat de validation » et la clôture en fin de section).

### Problème 1 (état de départ) — La façon non standard dont les render functions recevaient leurs enfants

**Ce que fait le standard.** Un conteneur déclare ses enfants comme des propriétés **au niveau supérieur du nœud** (modèle adjacency list A2-UI v1.0 — pas de wrapper `props`), et le renderer monte un enfant par id via la fonction `children(id)` (alias `buildChild(id)`). Le catalogue de base A2-UI montre les deux formes légitimes :

- **Slot nommé à enfant unique** — `Card` déclare un `child` singulier et `Modal` déclare des slots `trigger` / `content`, chacun un `ComponentId`, monté avec `children(node.<slot>)`. Le slot est adressé par **nom**.
- **Liste `children`** — `Row` / `Column` déclarent une liste `children` (`ChildList`) et la montent dans l'ordre. Elle n'est utilisée **que là où la liste ordonnée constitue elle-même la sémantique** (une liste homogène).

Le contrat que le renderer figé livre au composant est fixe : `props` (les valeurs résolues), `children: (id) => ReactNode`, et un `dispatch` optionnel — mais sur le fil, la composition et les liaisons sont portées **au niveau supérieur du nœud plat**, pas dans un wrapper `props`. Une fois le nœud résolu par le binder, le renderer expose ces champs au composant via son objet `props`.

**Ce que nous faisions à la place (non standard, avant la mise en conformité).** L'approche non standard ne déclarait pas les enfants du conteneur de façon typée. Le schéma de `CommerceSearch` exposait un `children` non typé (un simple tableau d'ids) et la render function récupérait les ids avec un lecteur défensif (`readChildIds`) — un champ que le type généré ne faisait pas apparaître. La composition était donc lue **hors contrat**, et non comme des entrées typées.

### Problème 2 (état de départ) — La composition était fragile (couplage positionnel)

Même en admettant la lecture hors contrat, l'approche non standard assignait les slots **par position dans le tableau** (ancien code de `CommerceSearch.tsx`, depuis remplacé) :

```tsx
// ANCIEN — remplacé par la lecture de slots nommés (voir Remédiation)
const childIds = readChildIds(props);
const [sidebarId, mainId, ...extraIds] = childIds;
```

« Le premier enfant est la sidebar, le second est la zone principale » est une hypothèse que les données ne garantissent pas. L'ordre d'un `string[]` ne porte aucune sémantique : si le producteur réordonne les enfants, ou en insère un, la sidebar et la zone principale s'intervertissent silencieusement. Deux slots hétérogènes, aux finalités différentes, sont récupérés à partir de l'index ordinal d'une liste d'ids plate — un bug de correction latent, pas seulement un smell de style.

### Remédiation — modéliser la composition avec la convention A2-UI (Y2)

Les deux problèmes se dissolvent en suivant la convention standard et en déclarant la composition **sur le contrat du conteneur**, en cohérence avec sa sémantique :

- **Slots hétérogènes et nommés → un slot `ComponentId` nommé par slot.** `CommerceSearch` déclare `sidebarChild` et `mainChild` (des slots `ComponentId` au niveau supérieur du nœud). La render function les monte par nom :

  ```tsx
  // cible (implémentée) — les slots résolus arrivent dans props
  function CommerceSearchRenderer({
    props,
    children,
  }: TypedRendererProps<CommerceSearchProps, never>) {
    const {sidebarChild, mainChild} = props;
    return (
      <div className={styles.page}>
        <aside className={styles.sidebar}>{children(sidebarChild)}</aside>
        <main className={styles.main}>{children(mainChild)}</main>
      </div>
    );
  }
  ```

  Pas de tableau, pas d'hypothèse ordinale, pas de `readChildIds`. Le réordonnancement est impossible à mal gérer parce que chaque slot est adressé par nom.

- **Liste ordonnée homogène → un `children` `ChildList`.** Ce n'est que là où la liste ordonnée _est_ le sens (les éléments d'un carrousel, l'ordre des facettes d'un facet-manager) qu'un conteneur conserve une liste `children`, montée dans l'ordre via `children(id)` — la forme `Row`/`Column`.

Comme ces champs de composition sont déclarés au niveau supérieur du nœud, la projection résolue `XxxProps` du conteneur les porte comme des champs **typés** (ex. `CommerceSearchProps = CommerceSearchState & { sidebarChild?: string; mainChild?: string }`, `LayoutStackProps = LayoutStackState & { children?: string[] }`). Ce sont des références statiques (`ComponentId` / `ChildList`, pas des Dynamic_Values), de sorte que le binder les classifie comme STATIC et transmet les valeurs sans les résoudre — de la même façon que le `Column` du catalogue de base lit sa liste `children` et que `Card` lit son `child`. Le consommateur lit `props.<slot>` / `props.children` comme des entrées typées, sans lecture défensive ni déstructuration positionnelle. C'est **Y2** : le package possède le contrat de composition ; le consommateur reste bête.

**Rejeté :** `readChildIds` + déstructuration positionnelle (Problème 1 + Problème 2 combinés). **Ultime recours absolu uniquement** (pas un objectif) : si la modélisation en slots nommés ne peut, pour une raison quelconque, être réalisée face au renderer figé, un lecteur de composition peut être fourni comme helper d'exécution de `@coveo/thermidor` (jamais l'échantillon, jamais `@coveo/thermidor-schema`), consigné comme une déviation. La migration épuise d'abord la modélisation en slots nommés.

**Résultat de validation — CONFIRMÉ (Y2 viable).** Le renderer figé livre les champs de slot `child-ref` statiques déclarés sur les `props` résolus **intacts**, et `children(props.<slot>)` monte l'enfant correspondant. Vérifié de bout en bout face à `@copilotkit/a2ui-renderer` v1.61.2 + `@a2ui/web_core` 0.9.0 en pilotant le vrai chemin `A2UIProvider` → `createCatalog` → `processMessages` → `A2UIRenderer` (aucun binder/renderer mocké) dans `integration/ui-kit/samples/thermidor/demo-schema-react/src/a2ui/named-slot-delivery.test.tsx`. Le test enregistre un petit conteneur dont le schéma de props déclare la composition comme des champs child-ref statiques — `sidebarChild: z.string()`, `mainChild: z.string()`, et `children: z.array(z.string())` — alimente une surface v0.9 minimale dont le nœud racine les porte comme des ids chaînes littérales, et affirme que la render function les reçoit octet pour octet identiques (`props.sidebarChild`/`props.mainChild` égaux aux ids littéraux ; `props.children` deep-equal au tableau d'ids) avec chaque enfant monté via `children(props.<slot>)`. Exécuté avec le runner local de l'échantillon (`node_modules/.bin/vitest run src/a2ui/named-slot-delivery.test.tsx`, vitest 4.1.11) : **1 fichier / 1 test réussi**.

**Pourquoi ça tient (mécanisme, pour mémoire).** `GenericBinder.scrapeSchemaBehavior` (`@a2ui/web_core/src/v0_9/rendering/generic-binder.js`) classifie un prop `z.string()` simple comme `STATIC` (renvoyé tel quel) et un prop `z.array(z.string())` comme `ARRAY` dont l'élément est `STATIC` (chaque élément renvoyé tel quel), de sorte que les deux traversent la boucle de résolution `OBJECT` sans être résolus. C'est le même traitement sur lequel repose le catalogue de base : `Card` lit `props.child` (une référence d'id chaîne) et monte `buildChild(props.child)`. **Frontière contrat / binder (état actuel).** Le contrat canonique déclare désormais les listes d'enfants comme `ChildList` et les slots uniques comme `ComponentId` (mise en conformité, ADR-012). Mais le binder figé ne classifie comme STATIC qu'un `z.string()` / `z.array(z.string())` **nu** : la forme `oneOf` complète de `ChildList` (dont la branche template `{ componentId, path }`) est classifiée `STRUCTURAL` et réécrite en `[{ id, basePath }]` au lieu de livrer le tableau d'ids brut. C'est exactement le rôle de la projection runtime `toBinderProps` (voir S1) : elle présente au binder un `z.array(z.string())` / `z.string()` simple pour les champs de composition, de sorte que les ids traversent INTACTS. Le contrat reste `ComponentId`/`ChildList` ; seule la vue livrée au binder v0.9 est aplatie. Le backend n'émet que la forme statique tableau-d'ids ; la branche template n'est pas exercée.

**Conformité au standard (contrat v1.0 vs binder figé v0.9).** La STRATÉGIE Y2 est fidèle au standard A2-UI : la spécification définit la composition comme un modèle de liste d'adjacence où un conteneur porte ses références d'enfants comme propriétés **au niveau supérieur du nœud** et où le renderer reconstruit l'arbre par id ([A2-UI v1.0 — UI composition](https://a2ui.org/specification/v1.0-a2ui/)), et le catalogue de base v1.0 ([catalog.json](https://a2ui.org/specification/v1.0-basic-catalog-implementation-guide/)) légitime à la fois les slots nommés à enfant unique et une liste `children`. Concrètement, `Card` déclare un seul `child`, et `Modal` déclare DEUX slots nommés à enfant unique (`trigger` et `content`) — preuve qu'un composant peut porter plusieurs slots d'enfants nommés distincts, exactement la forme que suivent `sidebarChild`/`mainChild` de `CommerceSearch`. Une liste `children` pour un contenu ordonné homogène (`Row`/`Column`/`List`) est l'autre forme standard. Les slots hétérogènes nommés plus une liste `children` sont donc le modèle aligné au standard, pas une forme propre à Thermidor.

**Mise à jour — le contrat est désormais typé `ComponentId` / `ChildList` (mise en conformité adjacency list, ADR-012).** Depuis ce spike, le contrat canonique a été aplati « by the book » : les slots à enfant unique sont typés `ComponentId` (`definitions/component-id.schema.json`) et les listes d'enfants `ChildList` (`definitions/child-list.schema.json`), au niveau supérieur du nœud, comme l'exigent les règles de « Validator compliance » de v1.0 (un `type: string` brut serait traité comme du texte, pas comme un lien structurel). Un point subsiste où l'implémentation suit le binder FIGÉ v0.9 plutôt que la forme normative : le binder ne classifie comme STATIC qu'un `z.string()` / `z.array(z.string())` nu, donc la **projection** exécutée (`XxxPropsSchema`, après `toBinderProps`) présente les slots comme des chaînes simples au binder — même si le **contrat JSON Schema** les déclare `ComponentId` / `ChildList`. Second point : le `ChildList` de v1.0 prend aussi en charge une forme TEMPLATE (enfants générés depuis une liste du modèle de données via `{ componentId, path }`) ; le contrat l'admet désormais, mais le backend n'émet que la forme statique tableau-d'ids, seule exercée ici. Aucun de ces points ne change la conclusion Y2 face au renderer figé ; ils marquent où un futur passage sur un renderer natif v1.0 laisserait tomber le shim `toBinderProps`.

**Clôture — Problème 1 et Problème 2 ne sont plus ouverts.** La remédiation Y2 est l'état **implémenté** : `CommerceSearch` déclare `sidebarChild`/`mainChild` (`ComponentId`) et son renderer lit les slots par nom ; les listes ordonnées (`LayoutStack`/`FacetManager`) utilisent `children` (`ChildList`) ; `readChildIds` et la déstructuration positionnelle ont été supprimés. La lecture hors contrat (Problème 1) et le couplage positionnel (Problème 2) n'existent plus dans le code ; ils sont conservés ici comme l'état de départ que le constat a diagnostiqué et corrigé.

### Constats de composition adjacents (différés)

Les deux constats ci-dessous portent sur la **composition** A2-UI, qui est ADJACENTE à — et non le cœur de — ce spike (le sujet du spike est le transport inline de `Component_State` via `updateDataModel`). Ils sont apparus parce que le renderer figé porte À LA FOIS la liaison d'état et la composition sur le même contrat de renderer-props, et parce que le modèle à identité unique `id`/`component` touche les deux. Ils sont consignés ici et DIFFÉRÉS (hors portée pour ce spike) ; aucun ne bloque la conclusion sur updateDataModel.

**Constat 1 — `LayoutStack(direction)` vs séparation `Row`/`Column` (décision de conception différée).** `LayoutStack` est un conteneur unique doté d'un prop de présentation `direction: 'column' | 'row'`, de sorte qu'un seul composant joue deux rôles de mise en page. Le catalogue de base A2-UI expose plutôt DEUX composants distincts, `Row` et `Column` (pas de `Stack(direction)`), de sorte que `LayoutStack(direction)` est une forme propre à Thermidor, pas la forme standard. Options envisagées : (A) conserver `LayoutStack` + `direction` ; (B1) séparer en primitives `Row`/`Column` POSSÉDÉES par Thermidor ; (B2) réutiliser les `Row`/`Column` du `basicCatalog` A2-UI. B2 est REJETÉE : réutiliser le catalogue de base forcerait le consommateur à implémenter des composants A2-UI génériques sans que le contrat Thermidor n'indique s'ils sont réellement utilisés. Conserver des primitives MAISON (possédées par Thermidor) préserve la propriété clé selon laquelle le catalogue Thermidor est une liste FERMÉE et énumérable — un type qui dit exactement ce qu'un consommateur doit implémenter, ni plus ni moins.

**Recommandation (différée) : B1 — séparer en `Row`/`Column` maison.** Elle conserve la propriété de catalogue fermé ET s'aligne sur la forme standard A2-UI, et elle élimine le prop de présentation orphelin `direction` (voir ci-dessous). Différée car il s'agit d'un changement de CONTRAT couvrant plusieurs répertoires dans la portée (le schéma `layout-stack.schema.json` + l'union des contrats + la régénération + le gate ; les 4 nœuds `LayoutStack` du mock dans `schema-response-search.ts` qui portent `direction: column/row` ; le renderer `LayoutStack` de l'échantillon + l'enregistrement au catalogue + la documentation). Trop de brassage de contrat pour un spike ; consigné en suivi. Conséquence tant que `LayoutStack(direction)` subsiste (l'anomalie concrète que cela a fait apparaître) : `direction` est une valeur de présentation STATIC portée au niveau supérieur du nœud, mais qui n'est PAS dans le `LayoutStackState` (vide) et n'est PAS un lien de composition (`ComponentId`/`ChildList`). La projection résolue `LayoutStackProps` ne fold que l'état plus les champs de composition (`& { children?: string[] }`), de sorte qu'elle ne porte PAS `direction`. Le `LayoutStackRenderer` de l'échantillon élargit donc les props en ligne avec `& { direction?: 'column' | 'row' }`. Si la séparation aboutit, `direction` disparaît entièrement (Row/Column sont de purs conteneurs de liste ordonnée sans prop de présentation), de sorte que le travail du générateur pour fold les props de présentation statiques dans `TProps` serait jetable — c'est pourquoi aucun correctif de générateur n'est fait pour `direction`.

**Constat 2 — le montage d'enfants (`children(id)`) reste spécifique au renderer figé.** `@coveo/thermidor-schema` ne doit pas dépendre de React (Req 8), donc il n'expose **aucun** type de renderer-props (pas de wrapper `children`) — seulement les types de DONNÉES résolues `XxxProps` / `XxxAction`. Le renderer figé, lui, type `children` comme `(id: string) => React.ReactNode`. Le consommateur comble l'écart avec un petit type local, `TypedRendererProps<TProps, TAction> = Omit<RendererProps<TProps>, 'dispatch'> & { dispatch?: (action: TAction) => void }` (dans `renderer-props.ts`), qui réutilise le `children` du contrat du renderer et restreint `dispatch` à l'union `XxxAction`. Chaque renderer de conteneur (CommerceSearch, LayoutStack, FacetManager, BundleDisplay) déstructure `{ props, children }` à partir de `TypedRendererProps<XxxProps, …>`. C'est un pont agnostique-du-package→renderer, écrit une seule fois côté consommateur.

**Note sur BundleDisplay (motif de composition « portée dans l'état »).** BundleDisplay compose des enfants (il monte `children(slot.childId)`) mais sa composition vit à la fois dans son ÉTAT (`tiers[].slots[].childId`) et dans un `children` `ChildList` déclaré au niveau du nœud. C'est un motif hybride que la simple distinction feuille/conteneur ne capture pas entièrement ; consigné comme constat différé. Depuis la mise en conformité adjacency list, la distinction feuille-vs-conteneur n'est plus portée par des types de renderer-props générés (`LeafRendererProps`/`ContainerRendererProps` n'existent plus) mais par la **forme de `XxxProps`** : une feuille est exactement son `XxxState` ; un conteneur est `XxxState & { <slots>?/ children? }`. La remédiation structurelle que pointe S3 (rendre la distinction visible dans la projection générée) est donc partiellement réalisée pour l'axe composition ; l'axe résolu-vs-non-résolu reste ouvert.

## Constats positifs

### P1 — Typage strict de bout en bout préservé, duplication d'identité supprimée

Le typage strict des props et des actions n'est pas nouveau — nous l'avions déjà avant `updateDataModel`, mais au prix de passer `componentId` + `componentType` comme props à chaque fonction de renderer, puis d'appeler `useRemoteController(componentId, componentType)` pour obtenir l'état et les actions typés. Le modèle inline `updateDataModel` **conserve le typage strict et supprime cette duplication** :

- les `props` sont typées comme le `XxxState` résolu ; l'identité (`id` / `component`) vit au niveau supérieur du nœud, n'est plus dupliquée dans `props`, et il n'y a plus d'indirection `useRemoteController(componentId, componentType)` pour atteindre l'état.
- `dispatch` est restreint à l'union `XxxAction` générée du composant (nom d'action + payload typé) ; un nom d'action inconnu ou un payload non conforme est une erreur de compilation.

Le résultat est une simplification nette de l'approche précédente typée-mais-dupliquée : les mêmes garanties à la compilation, sans les props d'identité par nœud ni l'indirection du controller qui les portait.

### P2 — Toute une couche d'accès à l'état a été supprimée (la machinerie RemoteController)

Dans le modèle précédent (ADR-002), atteindre l'état typé d'un composant exigeait un controller d'accès à l'état câblé explicitement par nœud. Le modèle inline `updateDataModel` fait arriver l'état par des bindings `{ path }` résolus par le renderer, de sorte que cette couche entière est devenue du poids mort et a été **supprimée** — pas relocalisée. Supprimé : l'API publique `RemoteController` **et** sa jointure interne sous `src/remote-controller/`, ainsi que le `controllers.tsx` (`useRemoteController`) de l'échantillon et le `read-child-ids.ts` positionnel.

Pourquoi le modèle la supprime :

- **L'état n'a plus besoin d'un accesseur par nœud.** Avant, un renderer obtenait son état en appelant `useRemoteController(componentId, componentType)`, qui résolvait le contrat et lisait la tranche d'état du composant depuis le tour actif. Maintenant le backend écrit l'état vers `/state/<id>` et le renderer le reçoit déjà résolu à travers ses bindings `{ path }` — pas de controller, pas de hook, pas d'abonnement par nœud.
- **L'identité n'est plus dupliquée pour piloter la résolution.** `RemoteController` était indexé sur `componentId` + `componentType` (passés comme props) pour rechercher le contrat et indexer l'état. C'est exactement la duplication que décrit P1 ; supprimer cette couche est ce à quoi ressemble en pratique la simplification de P1.
- **Le dispatch typé a survécu, relocalisé.** Le dispatch typé qu'offrait le `RemoteController` est préservé — il vit désormais sur `Session.dispatchAction` plus les unions `XxxAction` générées, non sur un controller par nœud.

Avant / après — le renderer `Pagination` (abrégé) :

```tsx
// BEFORE — the renderer wires a per-node state-access controller
import {useRemoteController} from '../controllers.js';
import type {PaginationProps} from '@coveo/thermidor-schema';

export function PaginationRenderer({props}: {props: PaginationProps}) {
  const controller = useRemoteController(props.componentId, props.componentType);
  if (!controller.state) return null;
  const {page, totalPages} = controller.state; // state via the controller
  // ...
  const handlePageChange = (newPage: number) => controller.dispatch('selectPage', {page: newPage}); // dispatch via the controller
}
```

```tsx
// AFTER — state arrives resolved in props; dispatch is a plain prop typed to the action union.
// Le package expose les types de DONNÉES (XxxProps résolu, XxxAction) ; le consommateur combine
// ceux-ci avec le contrat de renderer figé via un petit type local `TypedRendererProps`.
import type {PaginationProps, PaginationAction} from '@coveo/thermidor-schema';

export function PaginationRenderer({
  props,
  dispatch,
}: TypedRendererProps<PaginationProps, PaginationAction>) {
  const page = props.page ?? 0; // resolved from its { path } binding
  const totalPages = props.totalPages ?? 0;
  // ...
  const handlePageChange = (newPage: number) =>
    dispatch?.({event: {name: 'selectPage', context: {page: newPage}}});
}
```

L'appel `useRemoteController(componentId, componentType)` et l'identité `props.componentId` / `props.componentType` ont disparu ; le renderer reçoit désormais l'état résolu directement et un `dispatch` restreint à l'union `XxxAction` du composant.

Cette suppression est **gardée** par `src/a2ui/import-boundary.test.ts` : il échoue si `RemoteController` / `useRemoteController` / `.remoteController(` / `controllers.js` / `read-child-ids.js` réapparaissent, et il vérifie que `RemoteController` / `RemoteAction` / `RemoteControllerOptions` ne sont **pas** exportés depuis `@coveo/thermidor`. La couche supprimée ne peut pas se réintroduire subrepticement.

### P3 — Le câblage du dispatch tient en un seul prop ; aucun adaptateur consommateur

Envoyer une action de composant vers le backend ne requiert aucun code d'adaptateur de la part du consommateur. Le `onAction` du renderer A2-UI est câblé directement sur la session :

```tsx
<A2UIProvider catalog={catalog} onAction={session.dispatchAction}>
```

`dispatchAction` est un champ pré-lié et neutre vis-à-vis du framework sur la `Session` (retournée par `createSession`) qui accepte le message client-vers-serveur standard A2-UI (`A2uiClientMessage = { userAction? }`). Il déballe le `userAction`, récupère le discriminant du composant depuis les surfaces du tour actif (via le registre d'identité de nœud dérivé dans `in-transit-validation.ts`), valide le payload face au contrat d'action Zod du composant, et POSTe sur le Action_Channel. Il est fire-and-forget (se résout toujours, ne lève jamais), de sorte que le consommateur n'a besoin d'aucun `.catch`.

Le cœur possède tout l'adaptateur : le consommateur n'écrit aucune résolution node-id→component, aucune traduction de message, aucune capture de surface. `dispatchAction` est l'unique point d'entrée public de dispatch ; le dispatch bas niveau est une closure privée (`executeAction`), non exposée sur la `Session` publique. Le cœur reste agnostique du framework — il consomme le message du protocole A2-UI, pas un type React ou renderer — de sorte qu'un consommateur sur n'importe quel framework câble le seul binding `onAction` que son framework fournit déjà.

### P4 — La résolution d'identité de surface est unifiée

La découverte des surfaces est faite UNE SEULE FOIS par le fold du cœur : `deriveSurfaces` / `readSurface` dans `src/session/fold.ts` dérivent la projection typée `response.surfaces` (`DiscoveredSurface[]`), et `resolveTargetSurfaceId` sélectionne la surface commerce. Chaque `rootComponentType` porte le discriminant `component` en PascalCase (`'CommerceSearch'`).

Les consommateurs lisent la projection typée plutôt que les payloads bruts : le `use-navigation.ts` de l'échantillon FILTRE simplement `turn.response.surfaces` (`surfaces.find(s => s.rootComponentType === 'CommerceSearch')`) et ne parcourt jamais `response.activities`. Le parsing dupliqué de payload brut a disparu.

Nuance résiduelle (mineure, suivie, non bloquante) : le littéral du discriminant racine commerce `'CommerceSearch'` est écrit à deux endroits — `fold.ts` (`COMMERCE_SEARCH_ROOT_TYPE`) et le `use-navigation.ts` de l'échantillon. C'est un LITTÉRAL dupliqué, pas une logique dupliquée ; `fold.ts` porte déjà une note intérimaire ADR-015 indiquant que cette chaîne magique persiste jusqu'à l'arrivée d'un routage typé exposé par le serveur.

### P5 — Le cœur est découplé de tout package de contrats concret (les contrats sont injectés)

`@coveo/thermidor` n'importe pas `@coveo/thermidor-schema` nulle part — ni dans le source ni dans les tests. Les contrats de composants sont INJECTÉS par le consommateur via `createSession({ contracts })`, typés par une jointure structurelle (`src/session/contracts.ts` : `ContractsSchema` / `ComponentContractsSchema`) qui décrit la FORME qu'un contrat doit avoir (`z.discriminatedUnion('component', [...])` de membres `z.strictObject` portant des sous-schémas optionnels `state` et `actions`) sans importer aucune classe Zod concrète ni le package de schéma Coveo. Le runtime résout le discriminant du composant, le sous-schéma `*State` complet/partiel, et le sous-schéma de payload d'action directement à partir de la valeur injectée, de sorte que le même moteur fonctionne avec N'IMPORTE QUEL contrat A2-UI de cette forme — le schéma Coveo n'est qu'un contrat parmi ceux qu'un consommateur peut injecter. C'est la réalisation concrète du principe multi-consommateur du spike : un second package de schéma, différent, pourrait piloter le même `@coveo/thermidor` sans changement de code.

C'est prouvé par `src/session/injection-seam.test.ts`, qui construit un contrat `Widget` écrit à la main avec le propre Zod du package (sans import de package concret) et pilote la résolution du discriminant, la validation entrante complète/partielle, et la validation sortante du payload d'action à travers le runtime réel. La suite unitaire de `packages/thermidor` est entièrement autonome : chaque test construit son contrat localement, de sorte que `pnpm --filter @coveo/thermidor run test` est VERT (toute la suite unitaire du package) sans aucune dépendance à `@coveo/thermidor-schema` (le package ne déclare aucune dépendance à celui-ci sous quelque forme que ce soit). Le vérificateur de redirection du stack (`scripts/pnpm/verify-redirect.cjs`) ne liste pas `@coveo/thermidor` parmi ses consommateurs : le cœur n'est intentionnellement pas un consommateur de schéma ; seul l'échantillon `demo-schema-react` l'est.

## Constats (smells et risques)

### S1 (CRITIQUE) — Le binder figé lit les internes **Zod 3** ; nos schémas générés sont en **Zod 4**

Le générateur de `@coveo/thermidor-schema` émet des schémas Zod 4, de sorte que chaque `XxxPropsSchema` est un objet Zod 4. Le binder figé `@a2ui/web_core@0.9.0` (`rendering/generic-binder.js`, `scrapeSchemaBehavior` / `getFieldBehavior`) classifie chaque champ de prop en lisant les internes runtime **Zod 3** — `_def.typeName` (`'ZodUnion'` / `'ZodObject'` / `'ZodArray'` / `'ZodString'` / ...), `_def.options`, et `_def.shape()` (une fonction). Sur un objet Zod 4, `_def.typeName` est `undefined`, de sorte que **chaque champ retombe en STATIC**, un binding `{ path }` fuit non résolu, et le renderer plante — le symptôme concret est `NextActionsBar.tsx: actions.map is not a function` (le binding `actions` ne s'est jamais résolu en tableau). Un cast TypeScript ne peut pas corriger cela : le binder inspecte l'objet runtime, pas le type.

C'est exercé au runtime : les tests unitaires mockés passent parce qu'ils rendent des props déjà résolues et n'exercent jamais le vrai binder, de sorte qu'un test de régression pilote le VRAI catalog à travers `A2UIProvider` / `A2UIRenderer` + `processMessages` (`src/a2ui/binding-resolution.test.tsx`) : il échoue sans le shim (le crash `actions.map` exact) et passe avec lui.

**Le smell / le shim restant.** Une migration runtime Zod 4 → Zod 3, `toBinderProps` (`src/a2ui/catalog-props-migration.ts`), reconstruit chaque `XxxPropsSchema` comme un vrai `ZodObject` Zod 3 que le binder classifie comme DYNAMIC, en récoltant l'instance Zod 3 (et les unions de valeurs dynamiques canoniques d'A2-UI) depuis le propre `basicCatalog` du renderer — aucune nouvelle dépendance `zod@3`, aucun changement de lockfile ou de catalog. Il est couplé aux internes privés `_def` du renderer figé et ne disparaît que lorsque le renderer passe à Zod 4 (ou que nous possédons le renderer). C'est le point le plus fragile de tout le pipeline.

**Deux propriétés du shim.**

1. Le shim est appliqué à **un seul endroit** : `asCatalogDefinitions` (dans `src/a2ui/components.tsx`) exécute `toBinderProps` sur les `props` de chaque définition en interne, de sorte que les 16 définitions du catalog passent le `XxxPropsSchema` généré BRUT et que tout le contournement (reconstruction runtime + cast de type Zod3-vs-Zod4) est concentré dans cette seule fonction. Son retrait lorsque le renderer passe à Zod 4 est un changement en un seul point.
2. `migrateField` gère les schémas générés actuels, qui déclarent les child-refs de composition comme `z.string().optional()` / `z.array(z.string()).optional()` (STATIC), distincts des unions bindables `Dynamic*Schema`. Il (a) déballe `optional` / `nullable` / `default`, (b) mappe une union Zod 4 vers une union dynamique Zod 3 UNIQUEMENT quand elle porte effectivement un membre `{ path }` DataBinding (sinon STATIC), et (c) mappe un `string` / `string[]` nu non-union vers un `ZodString` / `ZodArray(ZodString)` statique Zod 3 simple (récolté depuis le `Card.child` du catalog de base) de sorte que le binder laisse passer les ids de composition INTACTS — préservant la livraison de slots nommés validée dans `named-slot-delivery.test.tsx`.

Parce qu'un binding `{ path }` ne se résout qu'une fois le champ classifié DYNAMIC, ce décalage de version Zod **a silencieusement mis en échec le mécanisme même que le spike s'était fixé de valider** : la fusion granulaire de Q1/Q2 ne fonctionne qu'une fois le champ résolvable.

**Même cause racine, second symptôme : quelle copie du schéma les tests chargent.** `@coveo/thermidor` est découplé de tout schéma concret (il n'importe aucun schéma concret, voir P5), de sorte que sa suite unitaire est VERTE et ce symptôme ne l'affecte PAS. Le symptôme n'apparaît QUE dans l'ÉCHANTILLON `demo-schema-react`, qui injecte légitimement le contrat Coveo concret, et il dépend entièrement de **quelle copie** de `@coveo/thermidor-schema` vite/vitest charge : la copie publiée hissée, ou le sous-module local vers lequel pointe le lien symbolique `link:`. Quand la redirection du stack est active (après `mise run install`, qui build le sous-module local et matérialise le `link:` via le pnpmfile), l'échantillon résout la **build locale** — au runtime ET sous vitest — et la suite complète de l'échantillon passe. Le risque résiduel est le cas inverse : si la copie publiée `beta.x` est hissée (redirection non matérialisée), l'échantillon charge une forme de schéma périmée et des tests qui affirment la forme locale (résolution de liaison `{ path }`, formes de `*State`/`*Actions`) échouent. DÉCISION pour ce spike : aucun `resolve.alias` vitest de contournement n'est ajouté (cela garde le runtime propre et évite un shim uniquement de test) ; la source de vérité est la redirection `link:` du stack, à garder active. Le correctif durable est que le lockfile résolve `catalog:` vers la build locale du sous-module.

### S3 (SMELL LÉGER) — Les renderers doivent se prémunir contre les bindings non résolus, par convention seulement

La résolution des bindings est asynchrone : au premier rendu, avant que l'op `/state/<id>` du nœud n'arrive, une prop objet/tableau adossée à un binding est `undefined` ; un renderer qui la déréférence de façon synchrone (`.map` / `.length` / déstructuration) plante.

**Standard A2-UI.** La spec ne définit aucune valeur par défaut ni placeholder pour un binding non résolu ; elle impose le rendu progressif (voir [Renderer Development](https://a2ui.org/guides/renderer-development/), « Progressive Rendering »). L'état « binding pas encore résolu » est un état de fonctionnement normal, et le standard en délègue la tolérance au renderer et à ses composants, non à une valeur par défaut typée. Nos gardes défensives honorent ce contrat.

**Validation.** Confirmé face à `@copilotkit/a2ui-renderer` v1.61 / `@a2ui/web_core` 0.9 — le renderer résout `{ path }` face à son propre DataModel et expose `undefined` jusqu'à ce que l'op `updateDataModel` correspondante arrive, sans aucune projection typée « possiblement-non-résolue » exposée au code des composants.

**Ce qui a été fait.** Les renderers touchés dans la migration de l'échantillon ont été rendus défensifs ; en particulier RegularFacet, NumericFacet, CategoryFacet, QuerySummary et Sort ont été durcis (`values ?? []`, `facetSearch ?? {...}`, déstructuration avec valeurs par défaut comme `const {ancestry = [], children = []} = values ?? {}`, `totalEntries ?? 0`, `availableSorts ?? []`), et les autres étaient déjà scalaire-sûrs ou gardés.

**Le smell.** La protection est par convention, pas imposée par les types — les types `XxxState` générés décrivent les champs comme toujours présents (leur forme résolue), de sorte que rien à la compilation n'empêche un nouveau renderer ou un nouveau champ de réintroduire le crash au premier rendu. Elle ne disparaît que si la distinction résolu-vs-non-résolu est rendue visible dans les types que le renderer consomme (une projection « possiblement-non-résolue »), ce que nous ne contrôlons pas tant que le renderer figé possède la résolution.

**Re-confirmé par PageSize (test runtime manuel).** Lors du test manuel de l'échantillon face au mock, `PageSize` a fait ressurgir ce smell au runtime sous forme d'un avertissement React : `Each child in a list should have a unique "key" prop` dans `PageSizeRenderer`. Cause racine : `PageSize` construit sa liste d'`<option>` à partir de `[...new Set([...DEFAULT_PAGE_SIZE_OPTIONS, pageSize])]`, et au premier rendu `pageSize` (une valeur liée par `{ path }`) est `undefined` jusqu'à ce que son op `/state/<id>` arrive — de sorte qu'une `<option key={undefined}>` est émise et que `.sort()` compare `NaN`. Corrigé avec la même convention de garde en ligne (ne replier qu'un vrai `number` dans la liste d'options). `PageSize` ne faisait PAS partie des renderers durcis (contrairement à RegularFacet/NumericFacet/CategoryFacet/QuerySummary/Sort), ce qui est en soi une preuve du smell : la garde est facile à oublier parce que rien ne l'impose.

**La question de la duplication (question ouverte).** Parce que la garde est par convention, chaque nouveau renderer, chaque nouveau champ lié, et chaque nouveau contrôle (p. ex. un autre `<select>` qui dérive ses options d'une valeur liée à la manière de `PageSize` et `Sort`) doit ré-appliquer indépendamment la même forme défensive (`?? []`, `?? {}`, filtres de restriction de type, déstructuration avec valeurs par défaut). Cela accumulera du code défensif quasi identique à travers l'échantillon et invite exactement le genre d'omission que `PageSize` a démontré. Deux directions de remédiation ont été envisagées et DIFFÉRÉES (hors du périmètre de ce spike) : (1) un petit helper CIBLÉ côté échantillon pour le motif récurrent spécifique (p. ex. construire une liste d'options `<select>` numérique unique et triée à partir de valeurs par défaut plus une valeur courante possiblement non résolue) — cela supprime la duplication par-select mais NE supprime PAS la convention sous-jacente, puisqu'un renderer doit toujours penser à router son champ lié à travers le helper ; c'est un gain ergonomique local, pas un correctif structurel ; (2) le correctif STRUCTUREL (le vrai, cohérent avec la conclusion S3 existante) — rendre la distinction résolu-vs-non-résolu visible dans les types générés, c.-à-d. typer chaque champ lié par `{ path }` sur `XxxState` comme possiblement non résolu (`T | undefined`) dans la projection que le renderer consomme, de sorte que le compilateur FORCE une garde à chaque site de déréférencement plutôt que de le laisser à la convention ; cela vit dans `@coveo/thermidor-schema` (la projection), pas dans l'échantillon, et n'est réalisable que si/tant que nous pouvons façonner ces types exposés au consommateur — ce n'est pas quelque chose que la résolution du renderer figé nous laisse exprimer aujourd'hui. Consigner la décision : pour le spike nous gardons les gardes en ligne (idiomatiques, cohérentes avec les cinq renderers déjà durcis) et n'introduisons PAS de helper « défensif » générique, car il déplacerait la convention plutôt que de l'éliminer. La projection typée possiblement-non-résolue est la remédiation durable et est notée comme travail de suivi appartenant à la projection de schéma.

### S4 (CONFIRMATION DE CONCEPTION) — La réactivité de la recherche commerce exige un aller-retour serveur, pas un binding bidirectionnel local

A2-UI offre une écriture bidirectionnelle locale (`data-context.js#set` → `dataModel.set`), adaptée à un écho local optimiste — ce que fait exactement `useOptimisticFacetSearch` pour l'INPUT de recherche de facette (saisie en cours gardée dans l'état React local, jamais écrite dans le data model partagé).

Mais les actions commerce (selectPage, toggleSelect, setPageSize, selectSort) exigent que le serveur/moteur recalcule les résultats, les comptes de facettes et la pagination ; le client ne peut pas dériver le nouvel état localement. Le modèle correct est : action → HTTP POST sur le Action_Channel → flux de réponse → réapplication de l'état via des ops `updateDataModel` entrantes (validées en transit sur le fold). Sur la base KIT-6193, l'entrée de dispatch est `Session.dispatchAction` (fire-and-forget), qui valide le payload dans le chemin d'exécution privé avant le POST ; la réponse fait circuler les ops `/state/<id>` recalculées en retour à travers la validation en transit du fold.

**Conclusion (une confirmation de conception, pas un smell).** Utiliser la « bidirectionnalité » d'A2-UI pour l'état commerce ne réduirait pas la glue consommateur ; cela déplacerait la complexité dans la réconciliation d'état et casserait le modèle « le serveur est la source de vérité ». Cela règle la question récurrente « devrions-nous plutôt utiliser la bidirectionnalité ? », et c'est cohérent avec la déclaration de divergence intentionnelle consignée dans ADR-011 (saisie en cours locale ; actions sur le Action_Channel HTTP non bidirectionnel).

### S6 (DETTE PERSISTANTE) — Inventaire des shims persistants (liés au renderer figé)

Les shims ci-dessous existent UNIQUEMENT à cause du `@copilotkit/a2ui-renderer` v1.61.2 / `@a2ui/web_core` 0.9 figé. Le renderer figé est la racine commune, mais les shims se répartissent selon ce qui les impose — l'écart de version seul, ou le modèle d'état inline superposé par-dessus :

1. `src/a2ui/catalog-props-migration.ts` (`toBinderProps`) — migration runtime des props de catalog Zod 4 → Zod 3 (S1). **Introduit par le modèle inline :** alimenter le catalog avec les unions `{ path }` dynamiques de `*PropsSchema` est ce qui traîne les schémas Zod 4 à travers la frontière du binder Zod 3. Désormais appliqué à **un seul endroit**, à l'intérieur de `asCatalogDefinitions` (`components.tsx`). **Déclencheur de retrait :** le renderer met à niveau son binder vers Zod 4 (ou nous possédons le renderer).
2. `src/a2ui/surfaces.tsx#convertV1ToV09` — pont de message v1.0 → v0.9 (Q5). **Précède le modèle inline :** le renderer ne parle que v0.9 tandis que le backend émet v1.0, de sorte que ce pont est requis sous n'importe quel mode de transport d'état et resterait même sans `updateDataModel`. **Déclencheur de retrait :** le renderer supporte v1.0 nativement.
3. Gardes de null-safety au premier rendu à travers les renderers (S3) — elles honorent le contrat de rendu progressif d'A2-UI tant que le renderer figé possède la résolution des bindings. **Introduites par le modèle inline :** la résolution asynchrone des bindings `{ path }` est une conséquence directe de l'état qui arrive par binding plutôt que pré-résolu. **Déclencheur de retrait :** la distinction résolu-vs-non-résolu devient exprimable dans les types consommés (ou nous possédons la résolution).

Renvoi croisé : le second symptôme de S1 — l'absence d'un `resolve.alias` vitest (intentionnellement PAS ajouté, voir S1) — signifie que les tests de l'échantillon `demo-schema-react` résolvent la copie publiée hissée du schéma. Ce n'est pas un shim dans le dépôt, mais cela appartient à la même grappe de dette renderer-figé / copie-publiée.

**Conclusion.** Ensemble, ceux-ci constituent une dette concentrée, liée à la version du renderer, qu'un « renderer maison » (voir [Analyse des options](#analyse-des-options), option B) retirerait en bloc. Le modèle inline a ajouté le shim Zod (1) et les gardes S3 (3) par-dessus le pont v0.9 préexistant (2).

## Obstacles d'implémentation rencontrés

### O1 (RÉSOLU) — Feuille vs conteneur : ne pas imposer `children` là où il n'y a pas d'enfant

**L'obstacle.** Le contrat de renderer figé (`RendererProps<T>`) porte toujours `children: (id) => ReactNode`, car le renderer le fournit toujours. Mais la plupart des composants sont des FEUILLES qui ne composent aucun enfant — Pagination, PageSize, Sort, QuerySummary, les facettes, ProductList, ProductCarousel, ProductSummary, ComparisonTable, NextActionsBar. Faire porter `children` à un type de feuille rejette sur le consommateur la connaissance « ce composant est une feuille » sous forme de convention (retirer le membre inutilisé), la même classe de smell que S3.

**Résolution retenue (mise en conformité adjacency list).** Plutôt qu'exposer des types de renderer-props depuis `@coveo/thermidor-schema` (une itération intermédiaire avait généré `LeafRendererProps` / `ContainerRendererProps` ; ils ont été **retirés**), le package n'expose que les types de DONNÉES résolues `XxxProps`, et c'est leur **forme** qui encode la distinction :

- une **feuille** est exactement son état — `PaginationProps = PaginationState` — donc aucune composition ;
- un **conteneur** est son état intersecté avec ses champs de composition — `CommerceSearchProps = CommerceSearchState & { sidebarChild?: string; mainChild?: string }`, `LayoutStackProps = LayoutStackState & { children?: string[] }`, `FacetManagerProps = FacetManagerState & { children?: string[] }`.

Le consommateur relie ces types de données au contrat du renderer figé via un seul type local, `TypedRendererProps<TProps, TAction>` (dans `renderer-props.ts`) : il réutilise `props` et `children` du renderer et restreint `dispatch` à l'union `XxxAction`. Un renderer feuille se type `TypedRendererProps<PaginationProps, PaginationAction>` et n'appelle jamais `children` ; un conteneur déstructure `{ props, children }`. La distinction feuille/conteneur vit donc dans la forme de `XxxProps` (générée), pas dans un wrapper de renderer-props que le package aurait à exposer — ce qui garde `@coveo/thermidor-schema` libre de toute dépendance renderer (Req 8).

**Validation.** Le garde-fou de schéma `mise //integration/thermidor-schema:check` passe (le généré correspond au générateur ; tests du générateur, du package et Java au vert), et l'échantillon type-checke : ses renderers utilisent `TypedRendererProps<XxxProps, XxxAction>` sans aucun `Omit<…, 'children'>`. Le changement est purement au niveau des types projetés (Zod à l'exécution identique, `check:generated` passé) ; aucun `pnpm install`, aucun changement de lockfile/catalogue.

## Analyse des options

La glue de dispatch côté consommateur a déjà disparu (voir [P3](#constats-positifs)) ; la question architecturale ouverte est de savoir s'il faut continuer d'adapter le renderer figé ou le remplacer par le nôtre. Les options :

| Option                                     | Ce qu'elle fait                                                                                                                                                   | Coût                                                                                                                                                                              | Supprime                                                                                                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A. Conserver le renderer figé (actuel)** | L'adapter : `Session.dispatchAction` consomme le message standard A2-UI et résout le composant côté cœur ; les shims Zod4→Zod3 et v1→v0.9 (S6) comblent le reste. | Faible                                                                                                                                                                            | Rien de plus pour le consommateur ; les shims S6 restent, internes.                                                                                          |
| **B. Renderer maison**                     | Remplacer `@copilotkit/a2ui-renderer` + `@a2ui/web_core` par un renderer Thermidor consommant v1.0 + Zod 4 nativement.                                            | Élevé (réimplémenter le binder : `scrapeSchemaBehavior`, abonnements réactifs au modèle de données, résolution de liste d'enfants, dispatch avec résolution de liaison profonde). | La glue consommateur **et** tout S6 **et** les causes racines S1/S3. Contrôle total du format + de la résolution de liaison + des versions de bibliothèques. |
| **C. Ne rien faire de plus**               | Conserver l'option A telle quelle.                                                                                                                                | Aucun                                                                                                                                                                             | Laisse les shims S1/S6 et la fragilité S3 en place indéfiniment.                                                                                             |

**Pourquoi un renderer maison est attrayant (stratégique, au-delà de la suppression de la glue) :**

- S'aligner sur nos propres versions de bibliothèques (p. ex. Zod) sans être épinglé aux choix transitifs d'un renderer externe — c'est ce qui dissout S1 à la racine plutôt que de le shimmer.
- Simplifier davantage les internes : tout ce qui dérive du standard A2-UI (résolution d'identité, résolution de liaison, traduction de dispatch) serait géré nativement par notre renderer, retirant les shims (S6) plutôt que de contourner autour d'eux.
- Évoluer à notre propre rythme (v1.0 nativement, notre sémantique de résolution de liaison, nos types).

**Points de départ possibles à évaluer (pas un mandat de réécriture from-scratch) :** l'écosystème A2-UI livre `@a2ui/web_core` (le binder + le modèle de données + le moteur de catalogue), des wrappers de framework et un pont d'intégration Composer. Réserve : `@a2ui/web_core` est exactement le paquet qui impose Zod 3 (la cause racine S1), et le Composer A2UI est un outil de création/prévisualisation (iframe + postMessage), pas un moteur de rendu à l'exécution. Construire sur `web_core` ne résoudrait PAS S1 à lui seul ; un renderer indépendant de la version devrait remplacer ou forker le binder. **Ce compromis (construire-sur-`web_core` vs. binder maison, et l'impact réel sur S1) est incertain et conséquent — il mérite son propre spike de suivi dédié avant tout engagement.**

**Ce qu'un renderer maison ne supprime PAS — mais posséderait et cacherait au consommateur :** le moteur de résolution de liaison, l'aller-retour action→HTTP→réponse et le montage d'enfant par id existent toujours et restent nécessaires ; le point est que nous les **encapsulerions** à l'intérieur de notre renderer au lieu de les exposer (ou la glue d'adaptateur autour d'eux) au consommateur. Le seul élément qui reste rédigé par le consommateur est les **renderers par composant** — c'est leur UI, légitimement la leur, ni moteur ni glue. Cela rejoint aussi la décision de « catalogue fermé » consignée dans les [Constats de composition adjacents](#constats-de-composition-adjacents-différés) : un renderer maison laisserait tout de même ces renderers par composant au consommateur. L'option B ne fait donc pas disparaître le travail d'UI par composant ; elle déplace le MOTEUR derrière notre frontière et ne laisse au consommateur que ce qui est légitimement le sien.

## Critères d'acceptation

Chaque critère d'acceptation du ticket, relié à sa preuve :

- **Chaque question a une réponse documentée et sourcée.** Q1–Q5 ci-dessus, chacune appuyée par un fichier de schéma, une ligne du renderer figé / du cœur, ou un test. ✅
- **Le comportement de fusion granulaire du renderer v0.9 est confirmé par une preuve concrète, pas une hypothèse.** Confirmé par le code (`@a2ui/web_core` `data-model.js#set` — écriture sur la feuille uniquement + notification des abonnés du chemin) et exercé de bout en bout par l'échantillon `demo-schema-react` en fonctionnement, plus les property tests P12 (composant complet) et P14 (sous-chemin partiel). ✅
- **Une recommandation claire est donnée pour la suite de la fonctionnalité.** GO, avec les conditions et suivis ci-dessous. ✅

**Livrable optionnel (prototype jetable) :** non produit comme artefact séparé — la preuve vit dans l'échantillon réel (`demo-schema-react`) et les property tests plutôt que dans un prototype jetable, ce qui est une preuve plus forte qu'un prototype ne l'aurait été.

## Recommandation Go / No-Go

**GO** pour le transport inline `updateDataModel`. Le modèle est sain et confirmé par le code et les tests : les mises à jour complètes et granulaires s'appliquent avec la bonne sémantique de fusion (Q1/Q2), le typage state/action est préservé et la validation en transit relocalisée (Q3), la composition standard A2-UI tient face au renderer figé (Q4), et les cas de rejet du state-path/résolveur ainsi que la préservation du pont v1.0→v0.9 sont couverts (Q5).

**Ce que cela débloque (KIT-6004) :** le transport inline `updateDataModel` étant validé, KIT-6004 (synchronisation de l'état des contrôleurs Thermidor) peut s'appuyer sur ce mécanisme comme canal d'état plutôt que sur le chemin snapshot/delta AG-UI d'ADR-002. La précondition dure à reporter est S1 : le décalage de binder Zod 4 ↔ Zod 3 doit rester atténué (shim) ou être résolu (renderer maison) pour que le transport livre réellement l'état résolu au renderer — une op complète ou partielle n'atteint l'UI qu'une fois son champ classifié comme résolvable.

**Conditions / suivis :**

1. Le décalage de binder Zod 4 ↔ Zod 3 (S1) est le risque principal, tenu par un shim runtime. Le suivre explicitement ; réévaluer quand `@copilotkit/a2ui-renderer` passe à Zod 4.
2. La résolution d'identité de surface est unifiée côté cœur (P4) : le littéral `'CommerceSearch'` reste dupliqué entre `fold.ts` (`COMMERCE_SEARCH_ROOT_TYPE`) et le `use-navigation.ts` de l'échantillon jusqu'à l'arrivée d'un routage typé exposé par le serveur (note intérimaire ADR-015). À refermer à ce moment-là.
3. Garder l'inventaire des shims (S6) visible ; chaque shim a un déclencheur de retrait défini.
4. Les renderers doivent rester défensifs face aux bindings non résolus (S3) tant que la résolution des bindings n'est pas sous notre contrôle.
5. Envisager un spike de suivi dédié sur un renderer maison (option B / l'option A de l'annexe) : construire sur `@a2ui/web_core` + les wrappers de framework, ou remplacer le binder d'emblée, et l'impact concret sur S1 (indépendance vis-à-vis de la version de Zod), sur la dette de shims (S6), et sur notre capacité à évoluer à notre rythme. Le Composer A2UI est un outil de création/prévisualisation uniquement, pas un moteur de rendu à l'exécution.
