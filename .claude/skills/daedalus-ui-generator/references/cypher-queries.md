# Cypher Queries for Component Discovery

Common graph queries for finding and validating Atomic components.

## Component Discovery

### Find All Components by Domain

```cypher
// Search domain components
MATCH (c:Component)
WHERE c.file CONTAINS '/search/'
RETURN c.tag, c.file
ORDER BY c.tag

// Commerce domain components
MATCH (c:Component)
WHERE c.file CONTAINS '/commerce/'
RETURN c.tag, c.file
ORDER BY c.tag

// Recommendations domain components
MATCH (c:Component)
WHERE c.file CONTAINS '/recommendations/'
RETURN c.tag, c.file
ORDER BY c.tag

// Insight domain components
MATCH (c:Component)
WHERE c.file CONTAINS '/insight/'
RETURN c.tag, c.file
ORDER BY c.tag
```

### Find Components by Semantic Purpose

```cypher
// Text input components
MATCH (c:Component)
WHERE c.tag CONTAINS 'search-box' OR c.tag CONTAINS 'input'
RETURN c.tag, c.file

// Filtering components
MATCH (c:Component)
WHERE c.tag CONTAINS 'facet'
RETURN c.tag, c.file

// Result display components
MATCH (c:Component)
WHERE c.tag CONTAINS 'result-list' OR c.tag CONTAINS 'product-list'
RETURN c.tag, c.file

// Pagination components
MATCH (c:Component)
WHERE c.tag CONTAINS 'pager' OR c.tag CONTAINS 'load-more'
RETURN c.tag, c.file

// Sorting components
MATCH (c:Component)
WHERE c.tag CONTAINS 'sort'
RETURN c.tag, c.file

// AI/Generated answer components
MATCH (c:Component)
WHERE c.tag CONTAINS 'generated-answer' OR c.tag CONTAINS 'smart-snippet'
RETURN c.tag, c.file
```

### Find Components That Have a Specific Property

```cypher
// Components with 'field' property (filterable)
MATCH (c:Component)-[:HAS_PROPERTY]->(p:Property {name: 'field'})
RETURN c.tag, p.name, p.type

// Components with 'display' property (configurable display)
MATCH (c:Component)-[:HAS_PROPERTY]->(p:Property {name: 'display'})
RETURN c.tag, p.name, p.default
```

## Controller & Action Discovery

### Find Controllers a Component Uses

```cypher
// What controllers does atomic-search-box consume?
MATCH (c:Component {tag: 'atomic-search-box'})-[:CONSUMES]->(ctrl:Controller)
RETURN ctrl.name, ctrl.file

// What controllers does atomic-facet consume?
MATCH (c:Component {tag: 'atomic-facet'})-[:CONSUMES]->(ctrl:Controller)
RETURN ctrl.name, ctrl.file
```

### Find Components That Use a Specific Controller

```cypher
// Which components use the SearchBox controller?
MATCH (c:Component)-[:CONSUMES]->(ctrl:Controller {name: 'SearchBox'})
RETURN c.tag, c.file

// Which components use the Facet controller?
MATCH (c:Component)-[:CONSUMES]->(ctrl:Controller {name: 'Facet'})
RETURN c.tag, c.file

// Which components use the Recommendations controller?
MATCH (c:Component)-[:CONSUMES]->(ctrl:Controller {name: 'Recommendations'})
RETURN c.tag, c.file
```

### Trace Component to Actions

```cypher
// Full action trace for search-box
MATCH (c:Component {tag: 'atomic-search-box'})-[:CONSUMES]->(ctrl:Controller)-[:DISPATCHES]->(a:Action)
RETURN c.tag, ctrl.name, collect(a.name) as actions

// What actions does the facet trigger?
MATCH (c:Component {tag: 'atomic-facet'})-[:CONSUMES]->(ctrl:Controller)-[:DISPATCHES]->(a:Action)
RETURN c.tag, ctrl.name, collect(DISTINCT a.name) as actions
```

### Find Action Handlers

```cypher
// Which reducers handle search actions?
MATCH (r:Reducer)-[:HANDLES]->(a:Action)
WHERE a.name CONTAINS 'search'
RETURN r.name, collect(a.name) as actions

// Which reducers handle facet actions?
MATCH (r:Reducer)-[:HANDLES]->(a:Action)
WHERE a.name CONTAINS 'facet'
RETURN r.name, collect(a.name) as actions
```

## Property Discovery

### Get All Properties for a Component

```cypher
// Properties of atomic-result-list
MATCH (c:Component {tag: 'atomic-result-list'})-[:HAS_PROPERTY]->(p:Property)
RETURN p.name, p.attribute, p.type, p.default

// Properties of atomic-facet
MATCH (c:Component {tag: 'atomic-facet'})-[:HAS_PROPERTY]->(p:Property)
RETURN p.name, p.attribute, p.type, p.default
```

### Find Components with Similar Properties

```cypher
// All components with 'display' property
MATCH (c:Component)-[:HAS_PROPERTY]->(p:Property {name: 'display'})
RETURN c.tag, p.type, p.default

// All components with 'density' property
MATCH (c:Component)-[:HAS_PROPERTY]->(p:Property {name: 'density'})
RETURN c.tag, p.type, p.default
```

## Compatibility Validation

### Verify Interface Compatibility

```cypher
// Check if components are in the same domain
MATCH (c1:Component {tag: 'atomic-search-box'})
MATCH (c2:Component {tag: 'atomic-facet'})
WHERE c1.file CONTAINS '/search/' AND c2.file CONTAINS '/search/'
RETURN c1.tag, c2.tag, 'compatible' as status

// Find mismatched domain components
MATCH (c:Component)
WHERE c.file CONTAINS '/commerce/' AND c.tag CONTAINS 'atomic-search-box'
RETURN c.tag, 'use atomic-commerce-search-box instead' as note
```

### Find Related Components

```cypher
// Components that share controllers with atomic-facet
MATCH (c1:Component {tag: 'atomic-facet'})-[:CONSUMES]->(ctrl:Controller)<-[:CONSUMES]-(c2:Component)
WHERE c1 <> c2
RETURN DISTINCT c2.tag, ctrl.name

// Components in the same package
MATCH (p:Package)-[:CONTAINS]->(c:Component)
WHERE p.name = '@coveo/atomic'
RETURN c.tag
LIMIT 50
```

## Statistics & Overview

### Component Count by Domain

```cypher
MATCH (c:Component)
WITH c,
  CASE
    WHEN c.file CONTAINS '/search/' THEN 'search'
    WHEN c.file CONTAINS '/commerce/' THEN 'commerce'
    WHEN c.file CONTAINS '/recommendations/' THEN 'recommendations'
    WHEN c.file CONTAINS '/insight/' THEN 'insight'
    WHEN c.file CONTAINS '/common/' THEN 'common'
    ELSE 'other'
  END AS domain
RETURN domain, count(c) as count
ORDER BY count DESC
```

### Controller Usage Stats

```cypher
// Most used controllers
MATCH (c:Component)-[:CONSUMES]->(ctrl:Controller)
RETURN ctrl.name, count(c) as usageCount
ORDER BY usageCount DESC
LIMIT 20
```

### Schema Overview

```cypher
// Get node types and counts
CALL db.labels() YIELD label
RETURN label
ORDER BY label

// Get relationship types
CALL db.relationshipTypes() YIELD relationshipType
RETURN relationshipType
ORDER BY relationshipType
```

## MCP Tool Equivalents

When using the uikit-graph MCP, these Cypher queries can be accessed via:

| Query Purpose | MCP Tool |
|---------------|----------|
| Find component by tag | `uikit-graph_find_component` |
| Get component properties | `uikit-graph_find_component_properties` |
| Find controller | `uikit-graph_find_controller` |
| Trace to actions | `uikit-graph_trace_component_to_actions` |
| Find action handlers | `uikit-graph_find_action_handlers` |
| Custom Cypher | `uikit-graph_run_cypher` |
| Graph schema | `uikit-graph_get_graph_schema` |
