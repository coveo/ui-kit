# Common Analysis Workflows

Detailed workflows for architectural analysis using the knowledge graph.

---

## Analyzing a Page/Component

**Goal:** Understand all headless dependencies for a page or feature.

**Steps:**
1. Find all components rendered on page (grep/search source files)
2. For each component, query controllers used
3. Aggregate unique controllers across page
4. Trace action flow for key components
5. Check which reducers are loaded by default vs lazy-loaded

**Example - Next.js search page:**
```
Found 14 atomic components → 22 unique controllers
AtomicTimeframeFacet → 10 actions → 7 reducers
Only searchReducer loaded by default (6 others lazy-loaded)
```

**Key queries:**
- Component dependencies: See [queries.md](./queries.md#component-dependencies)
- Action dispatch: See [queries.md](./queries.md#action-flow)
- Reducer handling: Requires sequential queries (see [queries.md](./queries.md#sequential-patterns))

---

## Debugging Component Behavior

**Goal:** Understand state management flow for a component.

**Sequential query workflow:**

1. **Query component's controllers:**
   ```cypher
   MATCH (c:Component {name: "ComponentName"})-[:USES_CONTROLLER]->(ctrl:Controller)
   RETURN collect(ctrl.name) as controllers
   ```

2. **Query actions dispatched:**
   ```cypher
   MATCH (c:Component {name: "ComponentName"})-[:DISPATCHES]->(a:Action)
   RETURN collect(a.name) as actions
   ```

3. **Query reducers handling those actions:**
   ```cypher
   MATCH (a:Action)-[:HANDLED_BY]->(r:Reducer)
   WHERE a.name IN ['action1', 'action2', ...]
   RETURN collect(DISTINCT r.name) as reducers
   ```

4. **Check engine loading strategy:**
   ```cypher
   MATCH (e:Engine {name: "SearchEngine"})-[:LOADS_BY_DEFAULT]->(r:Reducer)
   WHERE r.name IN ['reducer1', 'reducer2', ...]
   RETURN r.name as defaultLoaded
   ```

**Insight:** Reveals lazy-loading patterns and modular state dependencies.

---

## Migration Planning

**Goal:** Identify Stencil components ready for Lit migration.

**Steps:**

1. **Find all Stencil components:**
   ```cypher
   MATCH (c:Component {framework: "stencil"})
   RETURN c.name, c.type
   ```

2. **Check test coverage:**
   ```cypher
   MATCH (c:Component {framework: "stencil"})
   OPTIONAL MATCH (t:Test)-[:TESTS]->(c)
   RETURN c.name, count(t) as testCount
   ORDER BY testCount ASC
   ```

3. **Find dependencies:**
   ```cypher
   MATCH (c:Component {name: "ComponentName"})
   OPTIONAL MATCH (c)-[:USES_CONTROLLER]->(ctrl:Controller)
   OPTIONAL MATCH (c)-[:USES_ENGINE]->(eng:Engine)
   RETURN c.name, 
          collect(DISTINCT ctrl.name) as controllers,
          collect(DISTINCT eng.name) as engines
   ```

4. **Prioritize candidates:** Components with:
   - Existing test coverage
   - Simple dependencies (few controllers)
   - No engine usage (simpler state management)

---

## Test Coverage Analysis

**Goal:** Find untested components or identify missing test types.

**Find untested components:**
```cypher
MATCH (c:Component)
WHERE NOT (c)<-[:TESTS]-(:Test)
RETURN c.name, c.framework, c.type
```

**Find components with specific test coverage:**
```cypher
MATCH (t:Test)-[:TESTS]->(c:Component {name: "ComponentName"})
RETURN t.name, t.framework, t.path
```

**Aggregate test coverage by framework:**
```cypher
MATCH (c:Component)
OPTIONAL MATCH (t:Test)-[:TESTS]->(c)
RETURN c.framework, count(DISTINCT c) as components, count(t) as tests
```

---

## Dependency Impact Analysis

**Goal:** Find what depends on a controller/action/reducer before refactoring.

**Find components using a controller:**
```cypher
MATCH (c:Component)-[:USES_CONTROLLER]->(ctrl:Controller {name: "ControllerName"})
RETURN c.name, c.framework
```

**Find components dispatching an action:**
```cypher
MATCH (c:Component)-[:DISPATCHES]->(a:Action {name: "actionName"})
RETURN c.name
```

**Find what loads a reducer:**
```cypher
MATCH (e:Engine)-[:LOADS_BY_DEFAULT]->(r:Reducer {name: "reducerName"})
RETURN e.name
```

**Use case:** Before deprecating a controller, find all dependent components and assess migration effort.
