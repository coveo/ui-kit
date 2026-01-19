# Example: Analyzing Next.js Page Architecture

This walkthrough demonstrates using the knowledge graph to analyze a real Next.js page from the ui-kit samples.

---

## Scenario

**User Request:** "Tell me which headless controllers are used in the search page of the Next.js sample."

**File:** `samples/headless-ssr/pages/next-app/search.tsx`

---

## Step 1: Identify Components

First, grep the page source to find atomic components:

```bash
grep -o 'Atomic[A-Za-z]*' samples/headless-ssr/pages/next-app/search.tsx | sort -u
```

**Result:** 14 atomic components found including AtomicSearchBox, AtomicFacet, AtomicResultList, etc.

---

## Step 2: Query Component Dependencies

For each component, query its controllers:

```cypher
MATCH (c:Component {name: "AtomicSearchBox"})
OPTIONAL MATCH (c)-[:USES_CONTROLLER]->(ctrl:Controller)
RETURN c.name, collect(ctrl.name) as controllers
```

**Sample Results:**
- AtomicSearchBox → SearchBoxController, QuerySummaryController
- AtomicFacet → FacetController
- AtomicResultList → ResultListController
- AtomicTimeframeFacet → TimeframeFacetController

---

## Step 3: Aggregate Unique Controllers

Across all page components, identified **22 unique controllers**:

```
SearchBoxController, FacetController, ResultListController, 
QuerySummaryController, TimeframeFacetController, PagerController,
SortController, DidYouMeanController, BreadcrumbManagerController,
CategoryFacetController, NumericFacetController, DateFacetController,
QuerySummaryController, InstantResultsController, RecentQueriesController,
AutomaticFacetGeneratorController, TabController, QueryErrorController,
FieldSuggestionsController, SearchStatusController, HistoryController,
FacetManagerController
```

---

## Step 4: Deep Dive - Action Flow

**User asked:** "What reducers handle actions from AtomicTimeframeFacet?"

### Query 1: Find Actions Dispatched

```cypher
MATCH (c:Component {name: "AtomicTimeframeFacet"})-[:DISPATCHES]->(a:Action)
RETURN collect(a.name) as actions
```

**Result:** 10 actions including:
- deselectAllDateFacetValues
- registerDateFacet
- toggleSelectDateFacetValue
- updateDateFacetSortCriterion
- etc.

### Query 2: Find Reducers Handling Actions

```cypher
MATCH (a:Action)-[:HANDLED_BY]->(r:Reducer)
WHERE a.name IN [
  'deselectAllDateFacetValues',
  'registerDateFacet',
  'toggleSelectDateFacetValue',
  'updateDateFacetSortCriterion',
  'updateFacetNumberOfValues',
  'updateFacetIsFieldExpanded',
  'updateFreezeCurrentValues',
  'enableFacet',
  'disableFacet',
  'updateFacetOptions'
]
RETURN collect(DISTINCT r.name) as reducers
```

**Result:** 7 reducers:
- dateFacetSetReducer
- facetSetReducer
- facetOptionsReducer
- facetOrderReducer
- searchReducer
- configurationReducer
- advancedSearchQueriesReducer

### Query 3: Check Default Loading

```cypher
MATCH (e:Engine {name: "SearchEngine"})-[:LOADS_BY_DEFAULT]->(r:Reducer)
WHERE r.name IN [
  'dateFacetSetReducer',
  'facetSetReducer',
  'facetOptionsReducer',
  'facetOrderReducer',
  'searchReducer',
  'configurationReducer',
  'advancedSearchQueriesReducer'
]
RETURN r.name
```

**Result:** Only `searchReducer` loaded by default!

**Insight:** 6 out of 7 reducers are lazy-loaded, demonstrating the modular architecture of the headless library.

---

## Step 5: Test Coverage Check

**Query test coverage for key component:**

```cypher
MATCH (t:Test)-[:TESTS]->(c:Component {name: "AtomicTimeframeFacet"})
RETURN t.name, t.framework
```

**Result:** Found comprehensive Vitest test coverage.

---

## Key Learnings

1. **Sequential Queries Required:** The 3-step approach (component→actions, actions→reducers, engine→reducers) was necessary because single-query attempts with WHERE on distant nodes failed with "Unbound variable" errors.

2. **MCP Scoping:** The MCP server enforces stricter variable scoping than direct Cypher queries to Memgraph.

3. **Architectural Insights:** The knowledge graph revealed lazy-loading patterns and modular reducer dependencies that aren't obvious from code inspection alone.

4. **Component Naming:** Always use PascalCase class names (AtomicTimeframeFacet) not kebab-case tag names (atomic-timeframe-facet).

---

## Workflow Summary

```
1. Identify components (grep/search)
   ↓
2. Query controllers for each component
   ↓
3. Aggregate unique controllers
   ↓
4. Deep dive on interesting patterns
   ↓
5. Use sequential queries for complex chains
   ↓
6. Validate with source code when needed
```

This pattern applies to any architectural analysis task using the knowledge graph.
