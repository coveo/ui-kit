---
name: analyzing-architecture
description: Analyzes ui-kit architecture using the knowledge graph MCP. Use for impact analysis before breaking changes, dependency chain exploration, finding shared controllers/components, or understanding Component-Controller-Action-Reducer flows.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
  package: all
---

# Analyzing Architecture

This skill leverages the `uikit-graph` MCP to answer architectural questions that would require multiple file reads and grep operations.

## When to Use This Skill

- **Before breaking changes**: Assess impact across packages and samples
- **Deprecation planning**: Find all consumers of an export
- **Architecture audits**: Identify shared controllers, complex reducers, unused exports
- **Onboarding**: Trace data flow from Component → Controller → Action → Reducer
- **Refactoring scope**: Understand what's affected by changes to a controller or action

## Available Queries

### 1. Impact Analysis for Breaking Changes

Find all packages that depend on a package (direct and transitive):

```cypher
MATCH path = (source:Package {name: '@coveo/headless'})<-[:DEPENDS_ON*1..3]-(dependent:Package)
WHERE dependent.name STARTS WITH '@coveo' OR dependent.name STARTS WITH '@samples'
RETURN source.name as source, [node IN nodes(path) | node.name] as dependencyChain
ORDER BY length(path) DESC
```

### 2. Export Usage Analysis

Find which packages import a specific export:

```cypher
MATCH (p:Package)-[:EXPORTS]->(e:Export {name: 'defineRecommendations'})
RETURN p.name as package, e.file as file, e.kind as kind
```

Use the `find_export_usage` tool for a simpler approach:
```
uikit-graph_find_export_usage(export_name: "defineRecommendations")
```

### 3. Shared Controller Analysis

Find controllers used by multiple components (refactoring risk):

```cypher
MATCH (c:Component)-[:CONSUMES]->(ctrl:Controller)
WITH ctrl.name as controllerName, collect(DISTINCT c.tag) as components, count(c) as componentCount
WHERE componentCount > 1
RETURN controllerName, components, componentCount
ORDER BY componentCount DESC
LIMIT 10
```

### 4. Component → Action → Reducer Trace

Trace the full data flow for a component:

```cypher
MATCH (c:Component)-[:CONSUMES]->(ctrl:Controller)-[:DISPATCHES]->(a:Action)<-[:HANDLES]-(r:Reducer)
WHERE c.tag = 'atomic-search-box'
RETURN DISTINCT c.tag as component, ctrl.name as controller, a.type as action, r.name as reducer
```

### 5. Reducer Complexity Audit

Find reducers that handle many actions (potential refactoring candidates):

```cypher
MATCH (r:Reducer)-[:HANDLES]->(a:Action)
WITH r.name as reducer, count(DISTINCT a.type) as actionCount
RETURN reducer, actionCount
ORDER BY actionCount DESC
LIMIT 15
```

### 6. Property Consistency Check

Find components with a specific property to ensure consistency:

```cypher
MATCH (c:Component)-[:HAS_PROPERTY]->(p:Property)
WHERE p.name = 'productId' OR p.attribute = 'product-id'
RETURN c.tag as component, p.name as property, p.type as type, p.default as defaultValue
```

### 7. API Surface Inventory

List all SSR definers for documentation:

```cypher
MATCH (p:Package)-[:EXPORTS]->(e:Export)
WHERE e.name STARTS WITH 'define' AND e.kind = 'function'
RETURN e.name as definer, e.file as file
ORDER BY e.name
```

### 8. Unique Controller Usage

Find controllers only used by one component (safe to modify):

```cypher
MATCH (c:Component)-[:CONSUMES]->(ctrl:Controller)
WHERE NOT EXISTS {
  MATCH (c2:Component)-[:CONSUMES]->(ctrl)
  WHERE c2 <> c
}
RETURN ctrl.name as uniqueController, c.tag as onlyUsedBy
ORDER BY ctrl.name
```

## Process

### Step 1: Identify the Question Type

| Question Type | Recommended Approach |
|---------------|---------------------|
| "What uses X?" | `find_export_usage` or `find_component` |
| "What does X dispatch?" | `trace_component_to_actions` |
| "What's the impact of changing X?" | Cypher with dependency traversal |
| "Show me architecture of X" | Combine multiple queries |

### Step 2: Run the Query

Use the appropriate uikit-graph tool:

| Tool | Best For |
|------|----------|
| `find_export` | Locating where something is defined |
| `find_export_usage` | Finding all importers of an export |
| `find_component` | Getting component details |
| `find_controller` | Getting controller details and actions |
| `trace_component_to_actions` | Full component → action trace |
| `find_action_handlers` | Finding reducers for an action |
| `analyze_property_impact` | Property change impact |
| `run_cypher` | Complex multi-hop queries |

### Step 3: Interpret Results

- **High component count** on a controller = high refactoring risk
- **Deep dependency chains** = wide blast radius for breaking changes
- **Many actions per reducer** = complex state management, test carefully
- **Duplicate exports** across packages = potential API inconsistency

## Graph Schema Reference

```
Node Types:
  - Package (49 nodes)
  - Component (162 nodes)
  - Controller (192 nodes)
  - Action (590 nodes)
  - Reducer (79 nodes)
  - Property (480 nodes)
  - Export (5115 nodes)

Relationships:
  - DEPENDS_ON: Package → Package
  - EXPORTS: Package → Export
  - IMPORTS: Package → Export
  - CONSUMES: Component → Controller
  - DISPATCHES: Controller → Action
  - HANDLES: Reducer → Action
  - HAS_PROPERTY: Component → Property
```

## Example Workflows

### Pre-PR Impact Check

Before submitting a breaking change:

1. Run `find_export_usage` on the changed export
2. Run dependency chain query to find affected packages
3. Document all affected consumers in PR description

### Deprecation Planning

When deprecating an API:

1. Find all exports with the name pattern
2. Find all packages importing those exports
3. Create migration plan based on consumer count

### Architecture Documentation

When onboarding or documenting:

1. Use `trace_component_to_actions` for key components
2. Query shared controllers to understand component relationships
3. Generate dependency diagrams from package relationships

## Validation Checklist

Before completing analysis, verify:
- [ ] Query returns expected node types
- [ ] Results are interpreted in context (counts, relationships)
- [ ] Impact assessment includes transitive dependencies
- [ ] Recommendations are actionable
