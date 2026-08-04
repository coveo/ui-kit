# Unified Sort Controller with Domain-Level Criterion Types

**Status**: `🟡 Proposed`  
**Related docs**: [ADR-000](./ADR-000-architecture-decision-charter.md), [ADR-001](./ADR-001-anti-corruption-layer.md), [ADR-005](./ADR-005-public-facing-abstractions.md)

## 1. Context

Headless implements sorting as two separate controllers:

- **`buildSort` (Search)**: criterion is a discriminated union built via helpers. State exposes the raw REST string (`"@price descending"`). Client-managed — no sort data in the response.
- **`buildCoreSort` (Commerce)**: criterion is `{ sortCriteria: SortBy, fields: [...] }`. State is `{ appliedSort, availableSorts }`. Response-driven.

Problems: consumers must choose the right controller, sort UI components aren't portable, and both APIs leak REST syntax into the public surface.

- **Business drivers**: Coveo is converging search/commerce APIs. Non-leakage policy (ADR-000/001) prohibits REST syntax in the public surface.
- **Technical constraints**: Search API has no `availableSorts` in responses; Commerce/Generative APIs do. TypeScript generics enable per-interface type narrowing at zero runtime cost.
- **Assumptions**: Search supports relevance, date, field, QRE, nosort, and compound sorts. Commerce supports relevance and field. These cover all current needs.

## 2. Decision Statement

Thermidor exposes a single `buildSortController` for all interface types. The criterion is a **domain-level discriminated union** expressing intent (`{ by: 'field', field: 'price', direction: 'descending' }`) rather than transport syntax. The type **narrows per interface** via generics — search gets the full set, commerce gets its subset. This is type-level only (zero runtime cost).

`sortBy` accepts a single criterion or an array (compound sorts). `isSortedBy` uses structural equality, excluding presentational properties (`displayName`).

No `initialState` prop — initial sort is set via `loadSortActions().sortBy()` or hydrated from response/snapshot. An internal translation layer converts between domain types and API formats.

The controller state shape is uniform across interface types: `{ appliedSort, availableSorts }`. For search interfaces, `availableSorts` is always an empty array (the Search API does not return available sorts — sort options are client-defined). This keeps the API surface simple and consistent rather than conditionally narrowing the state shape per interface type.

## 3. Requirements & Considerations Mapping

- **Requirement**: Full use-case support
  - **How satisfied**: One controller, all interface types. Per-interface narrowing ensures only valid options are exposed.

- **Requirement**: Public API independence
  - **How satisfied**: Domain-level types only. No REST strings, no transport DTOs. Translation layer (ADR-001) absorbs backend changes.

- **Requirement**: First-class SSR
  - **How satisfied**: Stateless factory, snapshot hydration via translation layer, no constructor side effects.

- **Consideration**: Tree-shaking efficiency
  - **How addressed**: Generics erased at compile time. Translation functions live in facade resolvers, tree-shaken per ADR-004.

- **Consideration**: Migration simplicity
  - **Impact**: Negative — breaking change from both headless controllers.
  - **How addressed**: The break is mechanical (1:1 mapping: `buildRelevanceSortCriterion()` → `{ by: 'relevance' }`). The non-leakage requirement makes it unavoidable regardless of unification. Charter §7 prioritizes tree-shaking over migration simplicity.

- **Consideration**: External contribution readiness
  - **How addressed**: One controller, one pattern. The discriminated union is self-documenting.

## 4. Options Considered

### Option A (Selected): Unified controller with domain-level discriminated union

**Public types:**

```typescript
type SortDirection = 'ascending' | 'descending';

type SortByRelevance = {by: 'relevance'};
type SortByDate = {by: 'date'; direction: SortDirection};
type SortByField = {by: 'field'; field: string; direction: SortDirection; displayName?: string};
type SortByQRE = {by: 'qre'};
type SortByNoSort = {by: 'nosort'};

type SearchSortCriterion = SortByRelevance | SortByDate | SortByField | SortByQRE | SortByNoSort;
type CommerceSortCriterion = SortByRelevance | SortByField;

type SortCriterionFor<T> = T extends CommerceInterface
  ? CommerceSortCriterion
  : T extends SearchInterface
    ? SearchSortCriterion
    : SearchSortCriterion | CommerceSortCriterion;
```

**Consumer experience:**

```typescript
// Search
const sort = buildSortController({interface: searchInterface});
sort.sortBy({by: 'field', field: 'price', direction: 'ascending'});
sort.sortBy([
  {by: 'field', field: 'price', direction: 'ascending'},
  {by: 'field', field: 'name', direction: 'ascending'},
]);

// Commerce — type error on search-only modes
const sort = buildSortController({interface: commerceInterface});
sort.sortBy({by: 'field', field: 'price', direction: 'descending'});
sort.sortBy({by: 'qre'}); // ✗ type error
```

**Internal translation (anti-corruption layer):**

```typescript
function toSearchApiSort(criterion: SearchSortCriterion): string {
  switch (criterion.by) {
    case 'relevance':
      return 'relevancy';
    case 'date':
      return `date ${criterion.direction}`;
    case 'field':
      return `@${criterion.field} ${criterion.direction}`;
    case 'qre':
      return 'qre';
    case 'nosort':
      return 'nosort';
  }
}

function fromCommerceApiSort(raw: APIPayload): CommerceSortCriterion {
  if (raw.sortCriteria === 'relevance') return {by: 'relevance'};
  return {
    by: 'field',
    field: raw.fields![0].field,
    direction: raw.fields![0].direction!,
    displayName: raw.fields![0].displayName,
  };
}
```

**Type narrowing via `InterfaceTypeBrand`:**

`SortCriterionFor<T>` uses a conditional type to narrow the criterion union per interface. However, `SearchInterface` and `CommerceInterface` share identical facades (`'search' | 'suggestions'`), making them structurally identical to TypeScript. A nominal brand resolves this:

```typescript
declare const InterfaceTypeBrand: unique symbol;

interface SearchInterface extends Supports<Facades['search']> {
  readonly [InterfaceTypeBrand]: 'search';
}

interface CommerceInterface extends Supports<Facades['commerce']> {
  readonly [InterfaceTypeBrand]: 'commerce';
}
```

The brand is `declare`-only (never exists at runtime) — zero cost. `BaseInterface<T>` satisfies it via `declare readonly [InterfaceTypeBrand]: T`. This allows the conditional type to discriminate:

```typescript
type SortCriterionFor<T> = T extends CommerceInterface
  ? CommerceSortCriterion
  : T extends SearchInterface
    ? SearchSortCriterion
    : SearchSortCriterion | CommerceSortCriterion;
```

Without the brand, both interfaces resolve to the same structural type and the conditional collapses. The exhaustive `switch` in `toCommerceApiSort` (no `default` case) relies on this narrowing — TypeScript enforces that only valid `CommerceSortCriterion` variants reach the function.

- **Pros**: No leakage, full autocomplete, compile-time validation, portable UI components, zero runtime cost, tree-shakeable translation layer
- **Cons**: Adds a generic to the public API; translation layer to maintain
- **Risks**: New sort modes require a union member + translation case (additive, non-breaking)

### Option B: Opaque `{ sortCriteria: string }`

- **Summary**: One controller, raw string criterion.
- **Pros**: Simplest implementation
- **Cons**: Leaks REST syntax (violates ADR-000/001), no discoverability, no validation, no narrowing, backend changes break consumers
- **Risks**: API syntax changes propagate directly to consumer code

### Option C: Separate controllers per interface type

- **Summary**: `buildSearchSortController` + `buildCommerceSortController`.
- **Pros**: Tailored per API, no translation ambiguity
- **Cons**: Non-portable UI, two APIs to maintain, composed interfaces ambiguous, long-term divergence
- **Risks**: Maintenance tax, dead code when APIs converge

### Option D: Unified with `initialState` prop

- **Summary**: Option A + constructor dispatches initial criterion.
- **Pros**: One-step setup
- **Cons**: Constructor side effects, hydration race condition, breaks ADR-005 "pure factory" invariant
- **Risks**: Hydration/initialState race is a real bug vector

## 5. Decision Rationale

Option A satisfies the non-leakage policy, provides autocomplete-driven discoverability, catches invalid sorts at compile time, and keeps sort UI portable — at zero runtime cost.

- **B rejected**: leaks REST syntax (non-leakage violation).
- **C rejected**: fragments the API, makes UI non-portable, long-term maintenance burden.
- **D rejected**: constructor side effects and hydration race conditions outweigh the one-line ergonomic gain.

## 6. Public API and Contract Impact

- **Public API changes**: Yes — defines Thermidor's sort controller API.
- **Backward compatibility**: N/A (new package).
- **Type stability**: Discriminated union is the stable contract. New sort modes are additive. Backend changes absorbed by translation layer.
- **Non-leakage check**: **Pass**. `by`, `field`, `direction`, `displayName` are domain-level. No REST syntax or Redux types exposed.

## 7. Operational and Runtime Impact

- **Performance**: Negligible (trivial `switch` for translation, generics erased).
- **Reliability**: Positive (compile-time validation, no race conditions).
- **SSR**: Positive (snapshot hydration via translation, no constructor side effects).
- **Security/Observability**: Neutral.

## 8. Migration and Rollout Plan

| Current Headless (Search)                               | Thermidor                                                 |
| ------------------------------------------------------- | --------------------------------------------------------- |
| `buildRelevanceSortCriterion()`                         | `{ by: 'relevance' }`                                     |
| `buildDateSortCriterion(SortOrder.Descending)`          | `{ by: 'date', direction: 'descending' }`                 |
| `buildFieldSortCriterion('price', SortOrder.Ascending)` | `{ by: 'field', field: 'price', direction: 'ascending' }` |
| `sort.state.sortCriteria` (raw string)                  | `controller.state.appliedSort` (domain object)            |

| Current Headless (Commerce)                                     | Thermidor                                      |
| --------------------------------------------------------------- | ---------------------------------------------- |
| `{ sortCriteria: SortBy.Fields, fields: [{field, direction}] }` | `{ by: 'field', field, direction }`            |
| `sort.state.appliedSort` (API DTO)                              | `controller.state.appliedSort` (domain object) |
| `sort.isAvailable(criterion)`                                   | `controller.state.availableSorts.some(...)`    |

- **Rollout**: Part of Thermidor's initial release.
- **Rollback**: Consumers stay on headless until adoption.
- **Communication**: Migration guide with before/after tables.
