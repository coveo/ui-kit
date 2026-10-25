---
'@coveo/thermidor': minor
---

Name the dispatching component in an action request.

An action request (`session.request` with `kind: 'action'`) now carries `component`, the discriminant of the dispatching node, next to the action `name`. A consumer that keeps its own action lists, such as the actions that keep its surfaces usable while they run, keys them by component and action name, typed by the contracts with the new `ComponentActionNames` type:

```ts
const NON_BLOCKING_ACTIONS = {
  RegularFacet: ['search', 'clearSearch', 'showMoreSearchResults'],
} as const satisfies ComponentActionNames<typeof ComponentContractsSchema>;
```

`session.actionError` carries the same `component`, so a consumer tells which component's action failed.
