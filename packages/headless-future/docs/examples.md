# Usage Examples

Concrete TypeScript examples showing how you'd consume the Headless Future library. These demonstrate the **consumer's perspective** — what a developer building a UI would write.

## Setup

All examples start with creating and configuring an `Engine`:

```typescript
import {Engine} from '@coveo/headless-future';

// Create an engine (store starts empty)
const engine = new Engine();
```

The engine needs configuration (org ID, access token) before API calls work. This is done via the configuration slice — typically by a controller or during app initialization.

---

## Example 1: Basic Search with Controllers (Layer 2)

The standard way to use the library. Controllers handle slice adoption, state management, and API orchestration.

```typescript
import {
  Engine,
  buildSearchBoxController,
  buildResultListController,
} from '@coveo/headless-future';

// 1. Create the engine
const engine = new Engine();

// 2. Build controllers (each adopts its required slices automatically)
const searchBox = buildSearchBoxController(engine);
const resultList = buildResultListController(engine);

// 3. Subscribe to state changes
searchBox.subscribe(() => {
  console.log('Search box state:', searchBox.state);
  // → { query: 'laptops' }
});

resultList.subscribe(() => {
  console.log('Results:', resultList.state);
  // → { results: [{ id: '...', title: '...', uri: '...', excerpt: '...' }, ...] }
});

// 4. Interact
searchBox.updateQuery('laptops'); // Updates state: searchBox.query = 'laptops'
searchBox.submit(); // Calls Coveo Search API, populates results

// 5. Read state synchronously at any time
console.log(searchBox.query); // 'laptops'
console.log(resultList.state.results); // SearchResult[]
```

### What happens under the hood

1. `buildSearchBoxController(engine)` calls `engine.adoptSlice(searchBoxSlice)` — the searchBox reducer is injected into the store.
2. `updateQuery('laptops')` calls `engine.mutate({ type: 'searchBox/setQuery', payload: 'laptops' })`.
3. `submit()` calls `executeSearchAPI(engine)` which reads the query from state, calls the Coveo API, and writes results back to state via mutations.
4. State subscribers fire, and `resultList.state` returns the new results.

---

## Example 2: Direct State Mutations with Actions (Layer 3)

For power users who need fine-grained control without controller orchestration.

### Using `loadSearchBoxActions`

```typescript
import {Engine, loadSearchBoxActions} from '@coveo/headless-future';

const engine = new Engine();

// Load all search box actions (adopts the slice on first call)
const actions = loadSearchBoxActions(engine);

// Mutate state directly
actions.setQuery('advanced search');

// Read state manually
const query = engine.read((state) => state.searchBox?.query);
console.log(query); // 'advanced search'
```

### Using individual action functions

```typescript
import {Engine, setQuery} from '@coveo/headless-future';

const engine = new Engine();

// Get a bound setter for the query (adopts slice if needed)
const doSetQuery = setQuery(engine);

// Use it
doSetQuery('manual query');
```

### When to use Actions vs Controllers

```typescript
// ✅ Use controllers for standard workflows
const searchBox = buildSearchBoxController(engine);
searchBox.updateQuery('laptops');
searchBox.submit(); // Handles loading state, API call, error handling

// ✅ Use actions when you need custom orchestration
const actions = loadSearchBoxActions(engine);
actions.setQuery('custom workflow');
// ... do other things ...
// ... then manually trigger a search or not
```

---

## Example 3: Reactive Subscriptions

Subscribe to specific parts of state. Callbacks only fire when the selected value actually changes.

```typescript
import {Engine, buildSearchBoxController} from '@coveo/headless-future';

const engine = new Engine();
const searchBox = buildSearchBoxController(engine);

// Subscribe to the combined state object
const unsubscribe = searchBox.subscribe(() => {
  const {query} = searchBox.state;
  document.getElementById('search-input')!.value = query;
});

// Update triggers the callback
searchBox.updateQuery('React');
// → callback fires, input updates to 'React'

searchBox.updateQuery('React');
// → callback does NOT fire (value didn't change — shallow equality)

searchBox.updateQuery('Vue');
// → callback fires, input updates to 'Vue'

// Cleanup when done
unsubscribe();
```

---

## Example 4: Low-Level Engine Operations

For when you need to work with the Engine directly (e.g., writing tests, building custom abstractions).

### Reading state

```typescript
import {
  Engine,
  searchBoxSelectors,
  searchBoxMutations,
} from '@coveo/headless-future';
import {searchBoxSlice} from '@coveo/headless-future/core/internal/searchBox/slice';

const engine = new Engine();
await engine.adoptSlice(searchBoxSlice);

// Read with a pre-built selector
const query = engine.read(searchBoxSelectors.query);

// Read with an inline selector (use optional chaining!)
const queryAlt = engine.read((state) => state.searchBox?.query ?? '');
```

### Subscribing to state

```typescript
// Subscribe to a specific value
const unsubscribe = engine.subscribe(searchBoxSelectors.query, (newQuery) => {
  console.log('Query changed to:', newQuery);
});

// Trigger the change
engine.mutate(searchBoxMutations.setQuery('hello'));
// → logs: 'Query changed to: hello'

unsubscribe();
```

### Mutating state

```typescript
// Use a mutation factory (recommended)
engine.mutate(searchBoxMutations.setQuery('laptops'));

// You could also pass a raw mutation object (not recommended)
engine.mutate({type: 'searchBox/setQuery', payload: 'laptops'});
```

---

## Example 5: Multiple Controllers, One Engine

Controllers share state through a single engine. Changes from one controller are visible to others.

```typescript
import {
  Engine,
  buildSearchBoxController,
  buildResultListController,
} from '@coveo/headless-future';

const engine = new Engine();

// Both controllers share the same engine (and therefore the same state)
const searchBox = buildSearchBoxController(engine);
const resultList = buildResultListController(engine);

// When searchBox submits, resultList's state updates
resultList.subscribe(() => {
  renderResults(resultList.state.results);
});

searchBox.updateQuery('cloud computing');
searchBox.submit();
// → resultList subscriber fires when results arrive
```

---

## Example 6: Testing Pattern

How tests work in this codebase (useful if you're extending the PoC).

```typescript
import {describe, it, expect} from 'vitest';
import {createTestEngine} from '@coveo/headless-future/core/test-utils';
import {searchBoxSlice} from '@coveo/headless-future/core/internal/searchBox/slice';
import * as searchBoxMutations from '@coveo/headless-future/core/interface/search-box/mutate';
import * as searchBoxSelectors from '@coveo/headless-future/core/interface/search-box/selectors';

describe('searchBox', () => {
  it('should update the query', async () => {
    // Fresh engine per test (isolation)
    const engine = createTestEngine();
    await engine.adoptSlice(searchBoxSlice);

    // Initial state
    expect(engine.read(searchBoxSelectors.query)).toBe('');

    // Mutate
    engine.mutate(searchBoxMutations.setQuery('laptops'));

    // Verify
    expect(engine.read(searchBoxSelectors.query)).toBe('laptops');
  });

  it('should notify subscribers on change', async () => {
    const engine = createTestEngine();
    await engine.adoptSlice(searchBoxSlice);

    const values: string[] = [];
    engine.subscribe(searchBoxSelectors.query, (q) => values.push(q));

    engine.mutate(searchBoxMutations.setQuery('first'));
    engine.mutate(searchBoxMutations.setQuery('second'));

    expect(values).toEqual(['first', 'second']);
  });
});
```

**Key testing patterns**:

- `createTestEngine()` provides a fresh, isolated engine per test
- Tests manually `adoptSlice()` to set up the state they need
- Mock builders (`createMockSearchResult()`, `createMockFacetValue()`) are available from `core/test-utils.ts`

---

## Anti-Patterns

### ❌ Don't access state without adopting the slice

```typescript
const engine = new Engine();
// This will return undefined — the searchBox slice isn't registered yet!
const query = engine.read((state) => state.searchBox?.query);
```

### ❌ Don't forget optional chaining with custom selectors

```typescript
// BAD: Will throw if searchBox slice isn't adopted
const bad = engine.read((state) => state.searchBox.query);

// GOOD: Safe with optional chaining
const good = engine.read((state) => state.searchBox?.query ?? '');
```

### ❌ Don't import from `core/internal/` in consumer code

```typescript
// BAD: Bypassing the interface layer
import {searchBoxSlice} from '@coveo/headless-future/core/internal/searchBox/slice';

// GOOD: Use controllers or actions that handle adoption for you
import {buildSearchBoxController} from '@coveo/headless-future';
```

_(The internal imports in examples 4 and 6 above are for library developers/testers, not consumers.)_

### ❌ Don't mix controllers and direct mutations for the same feature

```typescript
// Confusing: some updates go through controller, some bypass it
const searchBox = buildSearchBoxController(engine);
const actions = loadSearchBoxActions(engine);

searchBox.updateQuery('via controller');
actions.setQuery('via actions'); // Works, but why use both?
```

Pick one approach per feature in your code.
