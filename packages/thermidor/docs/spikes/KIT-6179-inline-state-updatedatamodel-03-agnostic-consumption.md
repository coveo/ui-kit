# Annexe KIT-6179 — Un contrat de consommation framework-agnostic

- **Type :** Note d'architecture / recommandation.
- **Accompagne :** `KIT-6179-inline-state-updatedatamodel-02-spike.md` (même répertoire).
- **Prémisse acquise :** `updateDataModel` est adopté comme transport (standard A2-UI), sous l'argument « Thermidor n'est qu'un consommateur parmi d'autres » de la fonctionnalité agentique de Coveo. Ce point n'est pas rediscuté ici.
- **Objectif :** Définir le contrat de consommation à offrir aux consommateurs, qui soit framework-agnostic et non lié à un renderer A2-UI tiers.

## Le problème

Un consommateur — React, Angular, Vue, peu importe — a besoin de trois choses de Thermidor pour afficher une surface :

1. **La structure / composition** : quels nœuds, quel arbre, quels slots nommés, quelles listes ordonnées d'enfants.
2. **L'état de chaque nœud** : les valeurs résolues que le nœud doit afficher.
3. **Un canal pour renvoyer les actions.**

Le point 3 est déjà réglé : `Session.dispatchAction` consomme un message A2-UI standard, ne dépend d'aucun framework, et vit dans le core. Le vrai sujet est donc de livrer la structure (1) et l'état (2) sans imposer ni framework, ni renderer.

Aujourd'hui, ces deux points sont délégués au renderer tiers — `@copilotkit/a2ui-renderer` en React, `@a2ui/angular` en Angular, `@copilotkit/vue` en Vue. C'est lui qui dicte la forme livrée au composant, et cette forme change selon le framework. C'est précisément là, à cette frontière, qu'on perd l'agnosticisme. Appelons cela **le dernier mètre** : le trajet final entre ce que Thermidor produit et le composant natif du consommateur.

## Ce qu'on observe en regardant les renderers

Le wire A2-UI (`createSurface` / `updateComponents` / `updateDataModel`) est standard et agnostic : le protocole est traité de façon identique partout. Mais chaque renderer dicte ensuite la forme livrée au composant.

Fait vérifié : il existe trois renderers web officiels — `@a2ui/react`, `@a2ui/lit`, `@a2ui/angular` — tous bâtis sur le socle commun `@a2ui/web_core` (message processor, gestion d'état, data binding). Seule la couche de rendu de chaque framework diffère. Et les formes divergent :

- **React** (`@copilotkit/a2ui-renderer`) expose `RendererProps<T>` = `{ props: T; children: (id: string) => React.ReactNode; dispatch?: (action: any) => void }`. Le générique `T` type l'état résolu (on peut écrire `RendererProps<PaginationState>`), mais `children` est figé à `React.ReactNode` (React-spécifique) et `dispatch` est typé `any`.
- **Angular** (`@a2ui/angular/v0_9`) : l'état arrive en `BoundProperty<T>`, lu via `.value()` ; la configuration passe par `provideA2Ui({ catalogs, actionHandler })` ; `A2uiRendererService` gère le processor et le modèle réactif ; les child refs arrivent dans les props et sont montées via `<a2ui-v09-component-host>`, fourni par le renderer. Le composant dispatche l'action via la surface (`surface.dispatchAction`), relayée en bout de chaîne par l'`actionHandler` global de `provideA2Ui` — pas par un `dispatch` typé reçu en prop comme en React.
- **Vue** (`@copilotkit/vue`) : l'état arrive en `props` plates et résolues (`ResolveA2uiProps<...>`, via le `GenericBinder`) ; le composant s'enregistre par `createVueComponent` et reçoit un `ComponentContext` en prop ; les child refs arrivent dans les props et sont montées via `buildChild(id)`, fourni par le renderer. Le composant dispatche via `context.dispatchAction` ; le pont vers le cœur est le handler du `MessageProcessor`, monté via le composant `<A2uiSurface>` exporté (l'équivalent bas niveau de `onAction` / `actionHandler`).

Conclusion : dans tous les cas, le générique (ou le binder) type **l'état** ; mais **aucun renderer ne type le payload de l'action** (typé `any` côté React, non typé côté Angular ni Vue), et la composition / les children sont figées au framework. Nos schémas `XxxState` peuvent donc typer l'état contre le générique du renderer, mais nos `XxxAction` sont un **surcroît de typage que nous apportons** — aucun renderer ne l'exige ni ne le fournit.

Point vérifié : **nos types sont utiles même sans générique renderer**. Le typage n'a pas besoin de venir d'un générique fourni par le renderer. Exemple côté Angular (`@a2ui/angular`, composant `MilesProgress`) : le composant déclare lui-même `interface Ctx { passenger: BoundProperty<Passenger> }` et le consomme via `input<Ctx>()` — le typage vient d'un type importé, pas d'un générique du renderer. Un consommateur React ou Angular gagne donc à récupérer nos types comme source de vérité, même si son renderer n'offre aucun générique.

### Le chemin d'action, vérifié dans le code

Dans les trois frameworks, le composant **fabrique** un payload d'action `{ name, context }` et le pousse vers un point de dispatch. Ce payload est libre (`any` au niveau renderer), donc nos `XxxAction` le typent côté consommateur.

En React, le composant reçoit `dispatch` en prop et fabrique l'action :

```tsx
// Pagination React (notre sample)
dispatch?.({event: {name: 'selectPage', context: {page: newPage}}});
```

Le renderer relaie vers `A2UIProvider onAction={session.dispatchAction}` — le pont vers Thermidor.

En Angular, le composant custom étend `CatalogComponent` (de `@a2ui/angular/v0_9`) (qui expose `props()`, `surfaceId()`, et `componentId()`, mais PAS `surface()`) ; il injecte lui-même `A2uiRendererService`, puis fabrique l'action et la dispatche directement :

```ts
// Équivalent Pagination Angular (@a2ui/angular)
selectPage(newPage: number) {
  this.renderer.surfaceGroup.getSurface(this.surfaceId())?.dispatchAction(
    {name: 'selectPage', context: {page: newPage}}, // action FABRIQUÉE (valeurs concrètes)
    this.componentId()
  );
}
```

`resolveAction` / `DataContext` ne servent QUE pour une action venant du nœud — le cas du `Button` officiel, dont l'action (`props()['action']`) peut contenir des `{path}` à résoudre. Pour une action fabriquée dans le code avec des valeurs concrètes — tous les composants Thermidor (Pagination, Sort, facets) — il n'y a rien à résoudre : on appelle `dispatchAction({name, context}, componentId)` directement.

La chaîne Angular complète : `composant → SurfaceModel.dispatchAction → surfaceGroup.onAction → actionHandler de provideA2Ui → session.dispatchAction`. Le pont vers Thermidor est l'`actionHandler`, exactement là où React met `onAction`.

L'asymétrie réelle se réduit à peu de chose : React reçoit `dispatch` en prop (rien à injecter, `sourceComponentId` implicite) ; Angular injecte lui-même le service et passe `componentId` explicitement. C'est du boilerplate léger, pas de la résolution de bindings.

En Vue, le composant dispatche via le `ComponentContext` reçu en prop (`context.dispatchAction`). Le pont vers le cœur est le handler du `MessageProcessor` — l'équivalent bas niveau de `onAction` / `actionHandler` : on construit le processor avec notre handler, puis on monte sa surface via le composant `<A2uiSurface>` exporté par `@copilotkit/vue`.

```ts
// Équivalent Pagination Vue (@copilotkit/vue) — dans createVueComponent(PaginationApi, ({props, context}) => ...)
selectPage(next: number) {
  context.dispatchAction({event: {name: 'selectPage', context: {page: next}}});
}

// Le pont vers le cœur — le handler du MessageProcessor relaie l'action vers la session,
// exactement comme onAction (React) / actionHandler (Angular).
const processor = new MessageProcessor([thermidorCatalog], (action) =>
  session.dispatchAction({userAction: action})
);
// La surface est ensuite montée par le composant A2uiSurface exporté par @copilotkit/vue :

<A2uiSurface :surface="processor.model.getSurface(surfaceId)" />
```

Les trois renderers convergent vers le même `session.dispatchAction` ; seul le mode de branchement diffère : un _hook_ déclaratif en React (`onAction`) et en Angular (`actionHandler`), un handler de `MessageProcessor` monté via `A2uiSurface` en Vue (un cran plus explicite, sans que ce soit un obstacle).

## Où vit la résolution aujourd'hui

Aujourd'hui, la résolution est partagée entre le cœur et le renderer. Le fold du cœur produit deux projections indépendantes du framework :

- `response.state` — l'état des composants (validé en transit ; sur AG-UI, déjà résolu et plat par `componentId`).
- `response.surfaces` — la **découverte** des surfaces (`{ surfaceId, rootComponentType }`), pas l'arbre de composition.

C'est le **renderer tiers** qui résout l'arbre de composition : parcourir les messages `createSurface`, monter les nœuds, résoudre les slots et les child-refs. Le cœur a la matière brute (les messages `createSurface` dans `response.activities`) mais ne dérive aujourd'hui que la découverte de surface. L'option A consisterait donc à **porter cette résolution de composition dans le cœur** et à en exposer le résultat typé — ce n'est pas exposer une projection déjà là, c'est déplacer la résolution du renderer vers Thermidor.

### La vraie question

On ne choisit pas un renderer. La vraie question : **sous quelle forme Thermidor livre-t-il la structure et l'état** pour qu'un consommateur de n'importe quel framework les consomme ?

## Les options

### A. La projection de vue résolue (resolved view tree)

Thermidor expose un arbre de vue résolu, **typé par composant** : chaque nœud est une variante d'une union discriminée sur `component`, où `state` porte l'état déjà résolu du composant et la composition (slots nommés ou liste ordonnée) est typée par sa forme réelle. Un `subscribe(surfaceId, listener)` complète l'API. Aucun concept de rendu, aucune fonction `children(id)` imposée, aucun type React/Angular/Vue. Le consommateur parcourt l'arbre, mappe `component` vers son composant natif, lit `state` (déjà plat) et récurse sur `children` / `slots`. Il monte avec ses primitives natives, dans son idiome (React `map`, Angular `@for` / `ngComponentOutlet`, Vue `<component :is>`).

**Ce que Thermidor expose** — l'arbre résolu, généré depuis le catalogue JSON Schema : une variante par composant, `state` typé, composition typée par sa forme (slots nommés vs liste). Une variante feuille ne porte ni `slots` ni `children` :

```tsx
// Généré depuis le catalogue Thermidor fermé — une variante par composant.
// Le discriminant `component` type `state` ET la composition : le switch de montage narrow chaque cas, sans cast.
type ResolvedNode =
  // Feuille : ni slots ni children.
  | {id: string; component: 'Pagination'; state: PaginationState}
  // Container à slots nommés : chaque slot est typé par son nom réel (du schéma).
  | {
      id: string;
      component: 'CommerceSearch';
      state: CommerceSearchState;
      slots: {sidebarChild?: string; mainChild?: string};
    }
  // Container à liste ordonnée : children typé.
  | {id: string; component: 'LayoutStack'; state: LayoutStackState; children: string[]};
// ... une variante par composant du catalogue
```

**Ce que le consommateur écrit** — le câblage habituel (session, turns, routing), puis le montage récursif `component` → composant natif :

```tsx
function AppShell() {
  const session = useSession();
  const turns = useSyncExternalStore(session.subscribe, () => session.turns);

  const commerceSurface = turns
    .at(-1)
    ?.response.surfaces.find((s) => s.rootComponentType === 'CommerceSearch');

  return commerceSurface ? (
    <SearchResultsPage surface={commerceSurface} onAction={session.dispatchAction} />
  ) : (
    <ConversationPage turns={turns} onAction={session.dispatchAction} />
  );
}

function renderNode(
  surface: DiscoveredSurface,
  id: string,
  dispatchAction: Session['dispatchAction']
) {
  const node = surface.node(id);
  if (!node) return null;
  switch (node.component) {
    case 'Pagination':
      // node.state est typé PaginationState — aucun cast.
      return <Pagination state={node.state} onAction={dispatchAction} />;
    case 'CommerceSearch':
      // node.state: CommerceSearchState ; node.slots.sidebarChild/mainChild: string | undefined — typés.
      return (
        <CommerceSearch state={node.state}>
          <aside>
            {node.slots.sidebarChild &&
              renderNode(surface, node.slots.sidebarChild, dispatchAction)}
          </aside>
          <main>
            {node.slots.mainChild && renderNode(surface, node.slots.mainChild, dispatchAction)}
          </main>
        </CommerceSearch>
      );
    // ... un cas par composant ; sur une feuille comme Pagination, node.slots n'existe pas (TS l'interdit).
  }
}
```

Le consommateur n'écrit pas de binder, pas de résolveur de `{path}`, pas de réactivité A2-UI — seulement ce `switch` de montage (~20-40 lignes), qui est légitimement le sien puisqu'il monte SES composants natifs.

Seul le montage change : `AppShell` (session, abonnement aux turns, routing) et les layouts (comme `SearchResultsPage`) restent exactement ce qu'ils sont déjà aujourd'hui ; c'est le renderer A2-UI tiers (`<A2UIProvider>` + `<A2UIRenderer surfaceId>`) qui est remplacé par `renderNode`. Les types utilisés (`Session`, `DiscoveredSurface`) sont l'API actuelle ; l'option A n'y ajoute que l'arbre résolu (`node(id)` / `rootId`, plus `ResolvedNode`). Cette union `ResolvedNode` est **générée depuis le catalogue JSON Schema** au même titre que `XxxState` / `XxxAction` : ajouter un composant au schéma enrichit l'arbre typé du consommateur sans qu'aucun type soit écrit à la main.

### B. Le moteur headless exposé au consommateur

Le core exposerait un moteur (`registerRenderer` + montage) qui pilote le montage des composants du consommateur. Écarté : « monter un composant » est framework-spécifique (monter du React ≠ monter de l'Angular), donc le moteur recouple au framework ou exige un moteur par framework — il n'atteint pas l'agnosticisme visé (le montage ne devient agnostic qu'en imposant des Web Components, au prix de la techno de composant et du typage à la frontière). Concrètement, B revient à réécrire nous-mêmes un renderer tiers axé sur un framework — l'équivalent maison de `@copilotkit/a2ui-renderer` pour React, donc un renderer par framework, exactement le couplage qu'on cherche à quitter. La résolution, elle, se réutilise via `@a2ui/web_core` (c'est ce que fait A) ; le problème de B n'est pas la résolution, mais de posséder et exposer la couche de montage.

### C. Les contrats de types purs

Thermidor n'impose aucun renderer ni moteur : il fournit **les types** dérivés de nos schémas (`XxxState`, `XxxAction`), plus le wire standard et `dispatchAction`. Le consommateur choisit son renderer A2-UI et type son intégration contre nos types. Thermidor devient une source de vérité de types + transport + dispatch, sans jamais toucher au rendu.

Voici le même composant `Pagination` — dispatch et câblage vers `session.dispatchAction` — en React, en Angular, puis en Vue. Mêmes types Thermidor partout ; seule la mécanique du framework change.

**React** — le renderer donne un générique pour l'état mais pas pour l'action ; on l'affine une fois, puis le `A2UIProvider` relaie l'action (déjà enveloppée en `{ userAction }`) vers `session.dispatchAction` :

```tsx
import type {PaginationState, PaginationAction} from '@coveo/thermidor-schema';

// Le renderer donne un générique pour l'état, mais pas pour l'action ; on affine une fois :
type TypedRendererProps<TState, TAction> = Omit<RendererProps<TState>, 'dispatch'> & {
  dispatch?: (action: TAction) => void;
};

function PaginationRenderer({
  props,
  dispatch,
}: TypedRendererProps<PaginationState, PaginationAction>) {
  return (
    <Pagination
      state={props}
      onSelect={(page) => dispatch?.({event: {name: 'selectPage', context: {page}}})}
    />
  );
}

// Le A2UIProvider enveloppe déjà l'action en { userAction } ; onAction se branche direct.
<A2UIProvider catalog={thermidorCatalog} onAction={session.dispatchAction}>
  {/* ... */}
</A2UIProvider>;
```

**Angular** (`@a2ui/angular`) — chaque champ du state est un `BoundProperty` lu via `.value()`, l'action part par `surface().dispatchAction`, et `provideA2Ui` la relaie vers `session.dispatchAction` (enveloppée à la main, un adaptateur d'une ligne) :

```ts
import {PaginationStateSchema} from '@coveo/thermidor-schema';
import type {PaginationAction} from '@coveo/thermidor-schema';
import {ComponentApi} from '@a2ui/web_core/v0_9';
import {CatalogComponent, A2uiRendererService} from '@a2ui/angular/v0_9';
import {Component, computed, inject} from '@angular/core';

// PaginationApi : la description de catalogue A2-UI ; son schema EST notre PaginationStateSchema (Zod généré).
const PaginationApi = {name: 'Pagination', schema: PaginationStateSchema} satisfies ComponentApi;

@Component({
  selector: 'a2ui-pagination',
  template: `<pagination
    [page]="page()"
    [totalPages]="totalPages()"
    (select)="selectPage($event)"
  />`,
})
class PaginationComponent extends CatalogComponent<typeof PaginationApi> {
  // CatalogComponent n'expose pas la surface ; un composant custom injecte le service pour dispatcher.
  private readonly renderer = inject(A2uiRendererService);

  // props() livre chaque champ en BoundProperty ; on lit la valeur résolue par clé.
  protected readonly page = computed(() => this.props()['page']?.value());
  protected readonly totalPages = computed(() => this.props()['totalPages']?.value());

  selectPage(page: number) {
    const action: PaginationAction = {event: {name: 'selectPage', context: {page}}};
    this.renderer.surfaceGroup
      .getSurface(this.surfaceId())
      ?.dispatchAction(action, this.componentId());
  }
}

// provideA2Ui livre l'action brute { name, surfaceId, sourceComponentId, context } ;
// on l'enveloppe dans { userAction } pour session.dispatchAction.
provideA2Ui({
  catalogs: [thermidorCatalog],
  actionHandler: (action) => session.dispatchAction({userAction: action}),
});
```

**Vue** (`@copilotkit/vue`) — le composant s'enregistre par `createVueComponent` ; ses `props` sont résolues, et l'action est typée par `PaginationAction` — typage que **nous** appliquons, le renderer ne l'impose pas. Le pont vers le cœur est le handler du `MessageProcessor`, monté via `<A2uiSurface>` :

```vue
<script setup lang="ts">
import {PaginationStateSchema} from '@coveo/thermidor-schema';
import type {PaginationAction} from '@coveo/thermidor-schema';
import {ComponentApi, MessageProcessor} from '@a2ui/web_core/v0_9';
import {createVueComponent, A2uiSurface} from '@copilotkit/vue';
import {h} from 'vue';

const PaginationApi = {name: 'Pagination', schema: PaginationStateSchema} satisfies ComponentApi;

// props expose les champs de PaginationState déjà résolus (via le GenericBinder) ; on les lit directement.
const Pagination = createVueComponent(PaginationApi, ({props, context}) => {
  const page = props.page ?? 0;
  const selectPage = (next: number) => {
    // Le renderer livre un dispatch en `any` ; on applique NOTRE type volontairement (rien ne l'impose).
    const action: PaginationAction = {event: {name: 'selectPage', context: {page: next}}};
    context.dispatchAction(action);
  };
  return h('pagination', {page, onSelect: (e: number) => selectPage(e)});
});

// Le pont vers le cœur, une fois : le handler du MessageProcessor relaie vers la session.
const processor = new MessageProcessor([thermidorCatalog], (action) =>
  session.dispatchAction({userAction: action})
);
</script>

<template>
  <A2uiSurface :surface="processor.model.getSurface(surfaceId)" />
</template>
```

Mêmes types (`PaginationState`, `PaginationAction`) sur les trois frameworks, et l'action aboutit toujours à `session.dispatchAction` — le pont agnostic vers l'agent. Seule la mécanique du framework diffère : props plates + `dispatch` en React, `BoundProperty.value()` + dispatch via le service en Angular, `props` résolues + `ComponentContext` en Vue ; et l'enveloppe `{ userAction }`, faite par le provider en React, et faite dans le handler du `MessageProcessor` en Angular comme en Vue. La forme de l'action — `{ event: { name, context } }` — est celle que nos schémas génèrent et que le renderer attend : vérifié dans le code (`resolveAction` la produit, `SurfaceModel.dispatchAction` la consomme).

### Comparaison

| Option                         | Résolution des `{path}`                                           | Contrat de consommation                        | Renderer tiers ?    | Agnostic ?                                |
| ------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------- | ------------------- | ----------------------------------------- |
| **A** — view tree résolu       | **Thermidor** (moteur interne : `web_core` recommandé, ou maison) | données (arbre résolu observable)              | **aucun (exposé)**  | total                                     |
| **B** — headless engine        | Thermidor                                                         | moteur (`registerRenderer` + montage)          | non (on le devient) | non (le montage est framework-spécifique) |
| **C** — contrats de types purs | renderer tiers (au choix du consommateur)                         | **types seulement** (`XxxState` / `XxxAction`) | oui, au choix       | types oui ; forme du dernier mètre non    |
| statu quo                      | renderer tiers                                                    | helpers renderer-shaped (React)                | oui, imposé de fait | non                                       |

Le statu quo expose des helpers taillés sur le renderer React (`children(id) => ReactNode`, `dispatch` façon React) : lié à un framework de fait, c'est exactement ce qu'on cherche à dépasser. B recouple au framework par le montage. Restent les deux finalistes, **A et C** : A élimine le dernier mètre en livrant l'état résolu ; C le type, mais le renderer reste.

## Approfondir A : qui résout, et la question Zod

A résout **en interne** ; le consommateur ne voit que l'arbre résolu, sans jamais rencontrer web_core, Preact ou Zod. Deux façons d'alimenter cette résolution :

- **Un résolveur maison.**
- **`@a2ui/web_core` en interne.** Le paquet est framework-agnostic (aucune peerDep React/Angular/Vue) et expose exactement les briques utiles sans montage DOM : un `DataModel` (`set` / `get` / `subscribe` — le résolveur de `{path}`, absolus et relatifs), le `GenericBinder` (résolution et classement des props), le `MessageProcessor` (`processMessages`, parsing du wire), et `SurfaceModel` / `SurfaceGroupModel` (surfaces + `onAction`). Ses dépendances : `@preact/signals-core` (réactivité) et `zod@3`.

**La portée des `{path}` détermine la lourdeur.** Le standard A2-UI permet une portée large : des chemins absolus (résolus depuis la racine du data-model de la surface, donc potentiellement cross-node) et des chemins relatifs (résolus dans un scope de collection quand un container itère un `ChildList` en mode template). Résoudre le standard complet implique un data-model global par surface + la gestion des scopes de collection et des templates — c'est le moteur complet, ce que fait `web_core`.

Mais notre modèle inline-state est strictement **node-local** : tous les `{path}` émis par le transport Thermidor sont construits par `statePath(id)` / `stateFieldPath(id, field)` = `/state/<id>` ou `/state/<id>/<field>`. Aucun cross-node, aucun scope de collection, aucun template. C'est une invariante testée : le property test `thermidor-mock.property.test.ts` (`targetsPresentStatePath`) vérifie que chaque op cible `statePath(id)` ou un sous-chemin, pour un `id` présent. Et les listes (ProductList, ProductCarousel) sont des tableaux DANS le `state`, pas des templates A2-UI. Un résolveur maison node-local est donc trivial ; `web_core` n'est nécessaire que pour la portée standard complète.

**L'axe qui tranche est la dette de conformité au standard**, car le standard bouge (v0.9.1 courant, v1.0 candidate) :

- **Résolveur maison** : zéro dépendance, léger tant qu'on reste node-local. Mais chaque évolution du standard (nouveau binding, nouvelle sémantique de scope, nouveau `ChildList`) devient notre dette de migration — on ré-implémente, on devient une implémentation A2-UI partielle à maintenir.
- **`web_core` en interne** : la conformité est déléguée. Quand A2-UI évolue, on bump la dépendance et on reste conforme sans migrer notre code. Le prix : `@preact/signals-core` + `zod@3`, confinés dans le core, invisibles du consommateur.

**Ce qui résout S1.** Zod 4 est **notre** choix (le générateur de `@coveo/thermidor-schema` émet du Zod 4), pas une contrainte externe. Si A utilise `web_core` en interne, la rencontre Zod se fait désormais entre nos propres paquets (`@coveo/thermidor-schema` ↔ le core ↔ `web_core`), pas avec le consommateur. Aligner `@coveo/thermidor-schema` sur **Zod 3** — la langue de `web_core` — devient alors un choix interne cohérent, qui **dissout S1 à la racine** : plus de mismatch Zod 4 → Zod 3, plus de shim `toBinderProps`.

**Réserve honnête.** Dire « S1 disparaît » suppose que l'arbre résolu porte AUSSI la composition (slots / `children`) extraite, de sorte qu'on ne passe plus rien au binder. Si A résout l'état mais laisse la composition au binder, un résidu subsiste sur la composition. À valider.

## Approfondir C : le repli agnostic par les types

C est prouvé faisable pour React, Angular et Vue. Le chemin d'action vérifié plus haut montre que les trois renderers acceptent un payload `{ name, context }` fabriqué par le composant — nos `XxxAction` le typent dans les trois cas. Côté état : React reçoit `props: PaginationState` (typé via le générique `RendererProps<T>`), Angular lit ses props via un type dérivé de `ComponentApiToProps<typeof XxxApi>`, `Api` pouvant être construit à partir de nos schémas. Donc `XxxState` type l'état et `XxxAction` type l'action, indépendamment du framework.

Sa limite : C rend le typage **disponible et correct, mais ne l'impose pas** — le dispatch / payload est `any` au niveau renderer, donc le consommateur applique nos types volontairement. C'est « typage sûr si utilisé », pas « typage forcé ».

Concrètement, C est proche de l'état actuel : il suffirait de n'exporter que les données (`XxxState` / `XxxAction`) et d'arrêter d'exposer les helpers renderer-shaped React (`LeafRendererProps` / `ContainerRendererProps`, taillés React).

Note transverse : si un shim reste nécessaire (renderer figé Zod 3), il doit vivre dans NOS packages, jamais chez le consommateur — même principe que P3 (le core possède l'adaptateur d'action) et Y2 (le package possède la composition). Le shim est de la plomberie « renderer figé », donc notre responsabilité.

## Recommandation

**Exposer A au consommateur** (resolved view tree agnostic), avec **`@a2ui/web_core` comme moteur de résolution interne**, et **aligner `@coveo/thermidor-schema` sur Zod 3**. La rencontre Zod devient interne entre nos paquets et S1 se dissout. On combine ainsi l'agnosticisme du contrat (le consommateur ne voit qu'un arbre résolu) ET la conformité au standard déléguée (on ne poursuit jamais le standard nous-mêmes).

**Repli : C** (types purs), si l'on refuse d'exposer un contrat de données et qu'on préfère laisser le consommateur brancher son renderer.

**Alternative au moteur : un résolveur maison node-local**, si l'on refuse les dépendances Preact / Zod 3 dans le core — au prix de porter soi-même la dette de conformité au standard.

Dans tous les cas, l'option A implique de **porter la résolution dans le cœur** — non seulement l'état (déjà résolu sur AG-UI), mais aussi l'arbre de composition (slots, child-refs), aujourd'hui résolu par le renderer tiers. C'est le vrai coût de A : Thermidor devient l'endroit qui résout la composition, pas seulement l'endroit qui expose des types.

## Ce que ça implique côté spike

Cette direction prolonge **P5** (le contrat de consommation devient agnostic, pas seulement l'injection des contrats), s'appuie sur **Y2** (la composition vit sur le contrat), rejoint la remédiation structurelle de **S3** (rendre explicite le résolu / non-résolu dans les types), et se place comme point intermédiaire dans l'analyse d'options, entre « garder le renderer figé » et « own renderer ».

## Prochaines étapes

- **Trancher le moteur et la portée.** Moteur : `web_core` interne (recommandé, conformité déléguée) vs résolveur maison. Portée : node-local (suffit à 100 % de notre modèle inline-state actuel) vs standard complète (utile seulement si Thermidor devait un jour consommer des bindings cross-node / collection). Si `web_core`, confirmer l'alignement Zod 3 de `@coveo/thermidor-schema`.
- **Esquisser la forme concrète du resolved view tree** : types et observabilité.
- **Confirmer la réserve A** : l'arbre résolu peut-il porter la composition entièrement extraite, retirant tout point de contact avec le binder Zod 3 ?

Le contrat composant Angular est déjà confirmé (trois renderers web sur `web_core` ; `@a2ui/angular` via `provideA2Ui` / `actionHandler`). Reste anecdotique : savoir si `@copilotkit/angular` réutilise `@a2ui/angular` à la lettre — sans impact sur l'analyse.
