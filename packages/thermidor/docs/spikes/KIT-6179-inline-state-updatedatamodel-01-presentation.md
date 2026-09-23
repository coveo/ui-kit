# KIT-6179 — Transport inline de l'état et consommation agnostic (présentation)

Public : équipe DXUI. Deux parties suivies d'une décision. Partie 1 : le transport inline de l'état via le standard A2-UI `updateDataModel` (le spike). Partie 2 : rendre la consommation de Thermidor agnostic du framework (l'annexe). Partie 3 : la prise de décision. Les documents de référence détaillés sont cités en fin.

## Partie 1 — Transport inline via `updateDataModel` (le spike)

### Le problème

L'état d'un composant transite aujourd'hui par le modèle AG-UI ad-hoc (`StateSnapshot` / `StateDelta`), et un `RemoteController` par nœud fait le pont entre un composant A2-UI et son état porté par AG-UI. Deux coûts :

- **C'est propre à Thermidor.** Thermidor n'est pas le seul consommateur du backend agentique de Coveo ; un canal d'état ad-hoc force tout autre consommateur à réimplémenter un modèle sur mesure.
- **Ça duplique l'identité.** Chaque renderer reçoit `componentId` + `componentType` en props, puis appelle `useRemoteController(componentId, componentType)` pour atteindre son état typé — une indirection par nœud.

### Comment fonctionne le modèle

On aligne l'état sur le **standard A2-UI** : le backend décrit une surface, puis pousse l'état sous `/state/<id>` via des opérations `updateDataModel` ; les propriétés d'un nœud référencent cet état par des liaisons `{ path }`. Suivant le modèle **adjacency list A2-UI v1.0**, un nœud est **plat** : identité, valeurs, liaisons et liens de composition sont portés directement au niveau supérieur du nœud (pas de wrapper `props`). Trois plans restent séparés :

- **Composition** — déclarée au niveau supérieur du nœud, typée : un slot nommé est un `ComponentId` (ex. `sidebarChild`/`mainChild`), une liste ordonnée est un `ChildList` (`children`), montée par `children(id)`.
- **Identité** — `id` + le discriminant `component`, au niveau supérieur du nœud (jamais de seconde identité `componentId`/`componentType`).
- **État** — poussé sous `/state/<id>`, référencé depuis les propriétés du nœud par `{ path }`.

Le renderer lit l'état en résolvant les `{ path }` contre le data model que `updateDataModel` peuple. La forme concrète, sur le fil :

```jsonc
// 1. createSurface — le nœud plat déclare son identité + ses liaisons { path } au top-level (aucun état inline).
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
    ]
  }
}

// 2. updateDataModel — le backend pousse l'état contre lequel les liaisons se résolvent (remplace l'objet entier)
{
  "version": "v1.0",
  "updateDataModel": {
    "surfaceId": "ui-commerce-water-sports",
    "path": "/state/pagination-2",
    "value": { "page": 0, "pageSize": 12, "totalEntries": 43, "totalPages": 4 }
  }
}

// 3. une écriture granulaire ultérieure fusionne un seul champ sans écraser les voisins
{
  "version": "v1.0",
  "updateDataModel": {
    "surfaceId": "ui-commerce-water-sports",
    "path": "/state/pagination-2/page",
    "value": 1
  }
}
```

Le backend est l'unique source de vérité : une action utilisateur part en HTTP, la réponse rediffuse l'état recalculé en ops `updateDataModel` que le cœur réapplique. Les propriétés liées sont en lecture seule côté renderer.

### Questions à traiter

Cinq questions posées, cinq réponses vérifiées contre le **standard A2-UI officiel** (a2ui.org) et le **code** (`@copilotkit/a2ui-renderer` v1.61 / `@a2ui/web_core` 0.9) — sauf Q3 (où loge la validation), une décision d'architecture Thermidor hors protocole, confirmée par le code seul :

- **Q1 — Les écritures d'état s'appliquent-elles correctement ?** — **Oui** : une op complète à `/state/<id>` remplace l'objet d'état entier du nœud, et le composant lié se re-rend.
- **Q2 — Les mises à jour partielles préservent-elles les voisins ?** — **Oui** : une op à `/state/<id>/<field>` fusionne ce seul champ sans écraser les autres.
- **Q3 — Le typage state/action survit-il au retrait du `RemoteController` ?** — **Préservé** : les types (`XxxState` / `XxxAction`) restent, et c'est la validation qui est relocalisée. Nuance : le typage de l'action, jadis **imposé** au dispatch par le `RemoteController`, devient **appliqué volontairement** par le consommateur (le renderer livre un `dispatch` en `any`).
- **Q4 — La composition standard A2-UI tient-elle avec le renderer figé ?** — **Oui** : slots `ComponentId` nommés au top-level du nœud (`sidebarChild`/`mainChild`), jamais un tableau indexé par position (constat Y2).
- **Q5 — Les cas de rejet et le pont v1.0→v0.9 tiennent-ils ?** — **Oui** pour les deux.

### Le retrait de `RemoteController` — déplacer les responsabilités

Le `RemoteController` (base KIT-6193) portait quatre responsabilités par nœud. En passant à l'inline, il disparaît en tant que couche — mais ce qu'il faisait ne disparaît pas, c'est redistribué vers une frontière mieux placée — la couche qui la porte naturellement :

**1. Lire l'état du composant.** Avant : il lisait `response.state.components[componentId]` (snapshot AG-UI). Maintenant : le renderer reçoit son état **déjà résolu** dans `props` via les liaisons `{ path }`, résolues par le binder contre le data model peuplé par `updateDataModel`. Plus de `useRemoteController`, plus d'accesseur par nœud.

**2. Valider l'état entrant (Zod).** Avant : `contract.shape.state.safeParse(rawState)` à la lecture. Maintenant : la **validation en transit sur le fold** valide chaque op `updateDataModel` avant qu'elle n'atteigne le renderer ; une op non conforme est écartée. Code : `in-transit-validation.ts` (`deriveNodeIdentityRegistry` + `validateInboundOp`), appelé depuis `fold.ts`.

**3. Valider le payload d'action sortant (Zod).** Avant : `actionEntry.shape.payload.safeParse(payload)` avant l'envoi. Maintenant : `validateActionPayload` dans le chemin de dispatch privé (`executeAction`), avant le POST. Code : `action-payload-validation.ts`, appelé depuis `create-session.ts`.

**4. Dispatcher l'action.** Avant : chaque contrôleur exposait un `dispatch(action, payload)` par nœud, **typé par le contrat** (nom d'action et payload contraints par les contrats injectés). Maintenant : un point d'entrée public unique, `Session.dispatchAction`, câblé sur le `onAction` du renderer, qui délègue au privé `executeAction`. La validation du payload reste (en interne, `executeAction`), mais le **typage à la frontière** n'est plus imposé : le renderer livre un `dispatch` en `any`, et le consommateur applique nos `XxxAction` volontairement.

Deux propriétés sont **préservées, pas déplacées** : le **typage par composant** (contrats injectés via `createSession({ contracts })`, types `XxxState` / `XxxAction` générés — la validation a bougé, pas le typage) et la **réactivité** (le binder re-résout la liaison quand l'op arrive). Le `RemoteController` mélangeait quatre préoccupations par nœud ; le nouveau modèle les sépare et place chacune là où elle est naturelle. Ce n'est pas une suppression, c'est une consolidation.

### Wiring du state et du `dispatchAction`

Concrètement, côté renderer, le virage se voit dans le même composant `Pagination`. Avant, le renderer câblait un contrôleur d'accès par nœud :

```tsx
// AVANT — le renderer câble un contrôleur d'accès à l'état par nœud
import {useRemoteController} from '../controllers.js';

export function PaginationRenderer({props}: {props: PaginationProps}) {
  const controller = useRemoteController(props.componentId, props.componentType);
  if (!controller.state) return null;
  const {page, totalPages} = controller.state; // état via le contrôleur
  const handlePageChange = (newPage: number) => controller.dispatch('selectPage', {page: newPage});
}
```

Après, l'état arrive résolu dans `props`, et `dispatch` est un simple prop typé à l'union d'action du composant :

```tsx
// APRÈS — l'état arrive résolu dans props ; dispatch typé à l'union XxxAction
export function PaginationRenderer({props, dispatch}: PaginationRendererProps) {
  const page = props.page ?? 0; // résolu depuis sa liaison { path }
  const totalPages = props.totalPages ?? 0;
  const handlePageChange = (newPage: number) =>
    dispatch?.({event: {name: 'selectPage', context: {page: newPage}}});
}
```

Le câblage du dispatch vers le cœur tient en un seul prop, sans adaptateur consommateur : le `onAction` du renderer est branché directement sur la session.

```tsx
<A2UIProvider catalog={thermidorCatalog} onAction={session.dispatchAction}>
```

`Session.dispatchAction` déballe le message A2-UI standard, récupère le discriminant du composant depuis les surfaces du tour actif, valide le payload contre le contrat Zod, et POST. Il est fire-and-forget (se résout toujours, ne lève jamais) — aucun `.catch` requis côté consommateur.

### Les découvertes

Positives (P1–P5) :

- **Typage strict préservé, duplication d'identité supprimée** — les props sont le `XxxState` résolu ; plus de `componentId`/`componentType` en props.
- **Une couche entière supprimée** — la machinerie `RemoteController` (API publique + jointure interne + hook de l'échantillon).
- **Le dispatch tient en un prop** — `onAction={session.dispatchAction}`, aucun adaptateur. Deux réserves distinctes : (1) le `dispatch` que le renderer livre au **composant** est typé `any` (le payload d'action n'est pas contraint) ; (2) ce modèle suppose que le renderer expose un **point de branchement** vers le cœur — les trois l'exposent (`onAction` en React, `actionHandler` en Angular, le handler du `MessageProcessor` monté via `A2uiSurface` en Vue), mais de façon plus ou moins déclarative. Le typage de l'action, jadis **imposé** par le `RemoteController` (agnostic, exposé par Thermidor : `dispatch<A>(action, payload)` typé par contrat), devient désormais **appliqué volontairement** par le consommateur.
- **Le cœur est découplé** (acquis de la base KIT-6193, pas un gain de ce travail) — `@coveo/thermidor` n'importe pas `@coveo/thermidor-schema` ; les contrats sont injectés via `createSession({ contracts })`, donc n'importe quel contrat A2-UI de la bonne forme pilote le même moteur.

Négatives / à gérer (S1–S6) :

- **S1 (critique) — décalage Zod 3 / Zod 4.** Le binder figé lit les internes Zod 3 ; nos schémas sont Zod 4. Un shim runtime (`toBinderProps`, en un seul point) comble l'écart. C'est le point le plus fragile ; il disparaît si le renderer passe à Zod 4 ou si nous possédons le renderer.
- **S3 (léger) — gardes défensives par convention.** Au premier rendu, une liaison non résolue est `undefined` ; les renderers se prémunissent par convention (`?? []`, `?? {}`), non par le type.
- **S4 (confirmation) — la réactivité commerce exige un aller-retour serveur**, pas un binding bidirectionnel local (le serveur recalcule résultats, facettes, pagination).
- **S6 (dette) — inventaire des shims liés au renderer figé** : la migration Zod 4→3 (S1), le pont v1.0→v0.9, les gardes de premier rendu (S3). Tous disparaîtraient avec un renderer maison.

### Bilan

Le transport inline via `updateDataModel` est **faisable et dé-risqué** — le spike l'a prouvé end-to-end. Les gains sont nets, les frictions connues et gérables. Reste alors une question que le transport ne règle pas à lui seul : comment livrer la structure et l'état de façon agnostic du framework ? C'est la partie 2.

## Partie 2 — Rendre la consommation de Thermidor agnostic (l'annexe)

### Le problème

Un composant du consommateur a deux besoins face à Thermidor. **Recevoir** (l'entrant) : sa **composition** (l'arbre, les slots) et son **état** (les valeurs résolues à afficher). **Renvoyer** (le sortant) : ses **actions**, jusqu'au cœur. Le sortant a déjà un point d'ancrage agnostic — `Session.dispatchAction`, dans le cœur. Le vrai sujet est la forme de l'entrant et du sortant à la frontière du composant, car aujourd'hui elle est déléguée au renderer tiers (`@copilotkit/a2ui-renderer` en React, `@a2ui/angular` en Angular, `@copilotkit/vue` en Vue), et cette forme change selon le framework. C'est là qu'on perd l'agnosticisme — le « dernier mètre ».

### Ce qu'on observe — l'entrant

Le wire A2-UI est standard et agnostic. Mais chaque renderer dicte ensuite la forme livrée au composant : comment l'état, la composition et le moyen d'agir lui parviennent. Et ces formes divergent :

| Ce que le composant reçoit | React (`@copilotkit/a2ui-renderer`)                                                | Angular (`@a2ui/angular`)                                                                                   | Vue (`@copilotkit/vue`)                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **État**                   | `props: T` — plat, typé par le générique (`RendererProps<PaginationState>`)        | chaque champ en `BoundProperty<T>`, lu via `props()['page']?.value()`                                       | `props` plates et résolues (`ResolveA2uiProps<...>`, via `GenericBinder`)                                      |
| **Composition**            | child refs **dans les props** ; montées via `children(id)`, fourni par le renderer | child refs **dans les props** ; montées via `<a2ui-v09-component-host>`, fourni par le renderer             | child refs **dans les props** ; montées via `buildChild(id)`, fourni par le renderer                           |
| **Moyen d'agir**           | reçu **en prop** — `dispatch?: (action: any) => void`                              | **pas** en prop — via `A2uiRendererService`, envoie l'action sur la surface : `surface.dispatchAction(...)` | reçu **en prop** — `context: ComponentContext`, envoie l'action sur la surface : `context.dispatchAction(...)` |

Constat : le générique type **l'état**, mais aucun renderer ne type **le payload de l'action** (`any` en React et en Vue via `context.dispatchAction`, non typé en Angular), et la composition est figée au framework. Nos `XxxState` peuvent typer l'état ; nos `XxxAction` sont un surcroît de typage que **nous** apportons — aucun renderer ne l'exige. Nos types sont donc utiles même sans générique renderer.

### Le chemin d'action — le sortant

Le point d'arrivée est le même partout : `session.dispatchAction`, le pont agnostic vers le cœur. Ce qui diffère, c'est la **façon d'y brancher ce pont** : un _hook_ déclaratif en React (`onAction`) et en Angular (`actionHandler`), un handler de `MessageProcessor` monté via `A2uiSurface` en Vue (un cran plus explicite). Dans tous les cas le payload est libre (`any` au niveau renderer), donc nos `XxxAction` le typent côté consommateur. On a tracé ce chemin dans le vrai code des trois.

En React, le composant reçoit `dispatch` en prop et fabrique l'action ; le renderer relaie via le `onAction` du provider :

```tsx
// Pagination React (notre sample)
dispatch?.({event: {name: 'selectPage', context: {page: newPage}}});

// Le pont vers le cœur — onAction branché direct sur la session.
<A2UIProvider catalog={thermidorCatalog} onAction={session.dispatchAction}>
```

En Angular, le composant injecte la surface et dispatche ; `provideA2Ui` relaie via son `actionHandler` :

```ts
// Équivalent Pagination Angular (@a2ui/angular)
selectPage(newPage: number) {
  this.renderer.surfaceGroup.getSurface(this.surfaceId())?.dispatchAction(
    {name: 'selectPage', context: {page: newPage}},
    this.componentId()
  );
}

// Le pont vers le cœur — l'action brute est enveloppée puis passée à la session.
provideA2Ui({
  catalogs: [thermidorCatalog],
  actionHandler: (action) => session.dispatchAction({userAction: action}),
});
```

La chaîne Angular complète : `composant → SurfaceModel.dispatchAction → actionHandler de provideA2Ui → session.dispatchAction`, exactement là où React met `onAction`. L'asymétrie réelle se réduit à peu de chose : React reçoit `dispatch` en prop (rien à injecter) ; Angular injecte le service et passe `componentId` explicitement. Du boilerplate léger, pas de la résolution de bindings.

En Vue, le composant dispatche via le `ComponentContext` reçu en prop (`context.dispatchAction`). Le pont vers le cœur est le **handler du `MessageProcessor`** — l'équivalent bas niveau de `onAction` / `actionHandler` : on construit le processor avec notre handler, puis on monte sa surface via le composant `<A2uiSurface>` exporté par `@copilotkit/vue`.

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

Les trois renderers convergent vers le même `session.dispatchAction` ; seul le mode de branchement diffère : `onAction` déclaratif en React, `actionHandler` de `provideA2Ui` en Angular, handler du `MessageProcessor` monté via `A2uiSurface` en Vue. Vue est un cran plus verbeux — on construit le processor explicitement — sans que ce soit un obstacle.

### La réponse : des types qui satisfont les deux directions — l'option C

L'entrant a des formes différentes, le sortant converge, et aucun renderer ne type l'action. La réponse directe : **Thermidor fournit les types** — `XxxState` (l'état résolu), `XxxAction` (le payload), `XxxProps` — dérivés de nos schémas. Le consommateur garde son renderer A2-UI et type son intégration contre nos types, sur les trois frameworks. C'est **l'option C**, celle qu'on a implémentée et prouvée cross-framework.

Le même composant `Pagination`, avec les mêmes types Thermidor, en React, Angular, puis Vue. En React, on affine `RendererProps` une fois pour typer l'action :

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
```

En Angular, chaque champ du state est un `BoundProperty` lu via `.value()`, et l'action est typée par `PaginationAction` avant d'être dispatchée :

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
    // On type l'action manuellement avec PaginationAction — le renderer ne fournit aucun typage ici.
    const action: PaginationAction = {event: {name: 'selectPage', context: {page}}};
    this.renderer.surfaceGroup
      .getSurface(this.surfaceId())
      ?.dispatchAction(action, this.componentId());
  }
}
```

En Vue (`@copilotkit/vue`), le composant s'enregistre via `createVueComponent` ; ses `props` sont résolues, et l'action est typée par `PaginationAction` — typage que **nous** appliquons, le renderer ne l'impose pas. Le pont vers le cœur est le handler du `MessageProcessor`, monté via `<A2uiSurface>` :

```tsx
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

// La surface est ensuite montée par le composant A2uiSurface exporté par @copilotkit/vue.
<template>
  <A2uiSurface :surface="processor.model.getSurface(surfaceId)" />
</template>
```

Mêmes types (`PaginationState`, `PaginationAction`) sur les trois frameworks ; seule la mécanique diffère (props plates + `dispatch` en React ; `BoundProperty.value()` + service en Angular ; `props` résolues + `ComponentContext` en Vue, monté via `A2uiSurface`). C'est proche de l'état actuel : le schéma n'exporte que les données (`XxxState` / `XxxAction` / `XxxProps`), nul besoin d'exposer des helpers taillés sur le renderer React. Sa limite : C rend le typage **disponible et correct, mais ne l'impose pas** — le dispatch reste `any` au niveau renderer, donc le consommateur applique nos types volontairement. Et il garde un renderer tiers, donc la friction Zod 3/4 (S1) demeure, gérable mais présente.

### Aller plus loin — l'option A

C découple les types, pas le renderer. Pour retirer la dépendance au renderer tiers lui-même — et la classe entière de frictions qui vient avec (Zod aujourd'hui, autre chose demain) — il faut que Thermidor possède la résolution et **expose un arbre résolu**. C'est l'option A.

Aujourd'hui, la résolution est partagée : le fold du cœur produit `response.state` (l'état des composants, déjà plat sur AG-UI) et `response.surfaces` (la **découverte** des surfaces, `{ surfaceId, rootComponentType }` — pas l'arbre de composition). C'est le renderer tiers qui résout l'arbre de composition. A porterait cette résolution dans le cœur et exposerait un arbre où chaque nœud est une variante typée d'une union discriminée sur `component` — `state` typé, composition typée par sa forme, une feuille ne portant ni `slots` ni `children` :

```tsx
// Généré depuis le catalogue Thermidor fermé — une variante par composant.
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

Le consommateur écrit un `switch` de montage qui narrow `state` et `slots` sans cast ; un accès de slot sur une feuille est interdit par TS. Il n'écrit ni binder, ni résolveur de `{path}`, ni réactivité A2-UI — seulement le montage de SES composants natifs :

```tsx
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
    // ... un cas par composant ; sur une feuille, node.slots n'existe pas (TS l'interdit).
  }
}
```

L'arbre `ResolvedNode` est agnostic — aucun type React/Angular/Vue, aucune fonction `children(id)` imposée. Le consommateur parcourt l'arbre et monte avec les primitives natives de son framework, dans son idiome : React `map`, Angular `@for` / `ngComponentOutlet`, Vue `<component :is>`. Plus de renderer tiers, donc plus aucune dépendance à ses choix de librairies : la friction Zod 3/4 (S1) ne disparaît pas par contournement, elle **disparaît**. Et comme Thermidor possède alors le pont d'action, il peut **réexposer un `dispatch` typé et agnostic** — la garantie que le `RemoteController` offrait (typage d'action imposé), mais sans le couplage AG-UI ni la limite React-only du hook. Le prix : posséder le moteur de résolution (maison ou sur `@a2ui/web_core`, à cadrer dans un spike dédié).

### Récapitulatif des voies

Une quatrième option existait sur le papier — **B, le moteur headless exposé** — mais elle est écartée : « monter un composant » est spécifique au framework, donc le moteur recouple au framework (ou en exige un par framework) et n'atteint pas l'agnosticisme visé.

| Option                         | Résolution des `{path}`    | Contrat de consommation           | Renderer tiers ? | Agnostic ?                         |
| ------------------------------ | -------------------------- | --------------------------------- | ---------------- | ---------------------------------- |
| **C** — contrats de types purs | renderer tiers (au choix)  | types seulement                   | oui, au choix    | types oui ; dernier mètre non      |
| **A** — view tree résolu       | Thermidor (moteur interne) | données (arbre résolu observable) | aucun (exposé)   | total                              |
| **B** — headless engine        | Thermidor                  | moteur (montage)                  | on le devient    | non (montage framework-spécifique) |

C est la solution en place ; A est l'extension qui pousse le découplage jusqu'au bout. C'est l'arbitrage de la Partie 3.

## Partie 3 — Prise de décision

### `updateDataModel` : oui ou non ?

**Recommandation : oui.** Deux arguments. **Alignement standard** : on adopte le mécanisme d'état standard A2-UI (`updateDataModel`) plutôt qu'un canal AG-UI ad-hoc propre à Thermidor. **Corrélation native** : `updateDataModel` relie l'état au composant dans le même protocole (`/state/<id>` + liaisons `{ path }`), là où le modèle AG-UI ad-hoc imposait un pont `componentId` à maintenir — une couche en moins (analyse détaillée dans le document `-04-`). Le spike vient **prouver la faisabilité et dé-risquer** la solution : les écritures complètes/granulaires fonctionnent, le typage est préservé, la composition standard tient, les cas de rejet sont couverts. Les frictions (S1/S3) sont connues et gérables.

### Si oui : option A ou C pour se rendre agnostic ?

**Recommandation de départ : C.** C'est simple, déjà en place et prouvé cross-framework (React, Angular, Vue) : le schéma fournit des types purs (`XxxProps` / `XxxAction`), le consommateur type son intégration contre eux, et le découplage du schéma vis-à-vis du renderer est fait. C'est le pas pragmatique qui livre l'essentiel du typage agnostic sans chantier.

Mais C et A ne suppriment pas les mêmes frictions, et c'est là qu'est l'arbitrage :

- **C découple les types, pas le renderer.** Le consommateur garde un renderer A2-UI tiers, donc la friction Zod 3/4 (S1) demeure. Elle est gérable — shim interne, ou downgrade de la génération Zod 4→3, voire servir les deux formats — mais le fait même qu'il faille _choisir_ comment la gérer signale la classe de risque : toute librairie du renderer tiers incompatible avec les nôtres devient un pont à construire.
- **A supprime cette classe entière.** Plus de renderer tiers, donc plus aucune dépendance à ses choix de librairies. S1 n'est pas contourné, il **disparaît**. C'est le vrai gain d'agnosticisme — au prix de posséder le moteur de résolution.

**La question ouverte pour l'équipe :** C est en place et suffit pour découpler les types. A éliminerait le renderer tiers et toute la classe de frictions de compatibilité (Zod aujourd'hui, autre chose demain), mais c'est un chantier moteur (maison ou sur `@a2ui/web_core`, à cadrer dans un spike dédié). **Veut-on inscrire A à la roadmap maintenant, ou rester sur C et réévaluer quand la friction de compatibilité devient douloureuse ?**

Objection anticipée : « et si `@copilotkit/a2ui-renderer` passe à Zod 4 ? » — alors S1 disparaît et C devient encore plus confortable. Mais la classe de friction demeure pour la prochaine librairie divergente ; A reste la seule option qui la ferme définitivement.

## Documents de référence

- **Spike** — `KIT-6179-inline-state-updatedatamodel-02-spike.md` : le transport inline `updateDataModel` en détail, les constats Q1–Q5 / P1–P5 / S1–S6 vérifiés, l'analyse d'options. Le spike décrit l'état à l'époque de son investigation (base KIT-6193) ; l'option C expose désormais `XxxProps` côté consommateur.
- **Annexe** — `KIT-6179-inline-state-updatedatamodel-03-agnostic-consumption.md` : le contrat de consommation agnostic, les options A/B/C détaillées, les snippets React, Angular et Vue, l'arbre `ResolvedNode`.
- **Aide à la décision (transport de l'état)** — `KIT-6179-inline-state-updatedatamodel-04-agui-vs-a2ui-decision.md` : pourquoi `updateDataModel` (A2-UI) plutôt qu'AG-UI pour les données de composant — l'interop écartée, le vrai critère (corrélation native vs pont `componentId`), et la question ouverte de la forme du data model (par composant vs métier).
