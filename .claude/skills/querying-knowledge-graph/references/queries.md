# Example Cypher Queries for UI-Kit Knowledge Graph

This file contains useful queries for exploring and analyzing the ui-kit codebase through the knowledge graph.

## ⚠️ Important: Component Naming Convention

**Always use PascalCase class names, not kebab-case tag names:**
- ✅ Correct: `AtomicFacet`, `AtomicSearchBox`, `AtomicResultList`
- ❌ Wrong: `atomic-facet`, `atomic-search-box`, `atomic-result-list`

**Examples:**
```typescript
// Using MCP tools
find_component({ name: "AtomicSearchBox" })
get_component_dependencies({ componentName: "AtomicFacet" })

// In Cypher queries
MATCH (c:Component {name: 'AtomicFacet'})-[:USES_CONTROLLER]->(ctrl)
RETURN ctrl.name
```

## Component Queries

### Find all Lit components
```cypher
MATCH (c:LitComponent)
RETURN c.name, c.path
ORDER BY c.name;
```

### Find all Stencil components
```cypher
MATCH (c:StencilComponent)
RETURN c.name, c.path, c.tag
ORDER BY c.name;
```

### Find components with their controllers
```cypher
MATCH (c:Component)-[:USES_CONTROLLER]->(ctrl:Controller)
RETURN c.name as component, ctrl.name as controller, c.framework
ORDER BY c.name;
```

### Find all controllers used by a specific component
```cypher
MATCH (c:Component {name: 'AtomicCommerceSearchBox'})-[:USES_CONTROLLER]->(ctrl:Controller)
RETURN ctrl.name, ctrl.buildFunction, ctrl.package, ctrl.filePath
ORDER BY ctrl.name;
```

### Find most-used controllers
```cypher
MATCH (c:Component)-[:USES_CONTROLLER]->(ctrl:Controller)
WITH ctrl, count(c) as usageCount
RETURN ctrl.name, ctrl.package, usageCount
ORDER BY usageCount DESC
LIMIT 20;
```

### Find all components using a specific controller
```cypher
MATCH (c:Component)-[:USES_CONTROLLER]->(ctrl:Controller {name: 'SearchBox'})
RETURN c.name, c.framework, c.path
ORDER BY c.name;
```

### Find commerce controllers and their usage
```cypher
MATCH (c:Component)-[:USES_CONTROLLER]->(ctrl:Controller {package: 'commerce'})
RETURN ctrl.name, ctrl.buildFunction, count(c) as componentCount
ORDER BY componentCount DESC;
```

### Find controllers by build function pattern
```cypher
MATCH (ctrl:Controller)
WHERE ctrl.buildFunction STARTS WITH 'buildFacet'
RETURN ctrl.name, ctrl.buildFunction, ctrl.package
ORDER BY ctrl.name;
```

### Find components without controllers
```cypher
MATCH (c:Component)
WHERE NOT (c)-[:USES_CONTROLLER]->(:Controller)
RETURN c.name, c.framework, c.path
ORDER BY c.name;
```

### Find components without tests
```cypher
MATCH (c:Component)
WHERE NOT (c)<-[:TESTS]-(:Test)
RETURN c.name, c.path, c.framework
ORDER BY c.path;
```

### Find components with stories
```cypher
MATCH (s:Story)-[:RENDERS]->(c:Component)
WITH c.name as componentName, collect(s.path) as stories
RETURN componentName, stories
ORDER BY componentName;
```

### Migration tracking: Stencil → Lit
```cypher
MATCH (lit:LitComponent)-[:MIGRATED_FROM]->(stencil:StencilComponent)
RETURN lit.name as lit_component, 
       stencil.name as stencil_component,
       lit.path as new_path,
       stencil.path as old_path;
```

### Migration progress statistics
```cypher
MATCH (stencil:StencilComponent)
OPTIONAL MATCH (lit:LitComponent)-[:MIGRATED_FROM]->(stencil)
WITH count(stencil) as total, count(lit) as migrated
RETURN total as total_stencil_components,
       migrated as migrated_to_lit,
       total - migrated as remaining,
       toFloat(migrated) / total * 100 as percentage_complete;
```

## Package Queries

### List all packages
```cypher
MATCH (p:Package)
RETURN p.name, p.version, p.description
ORDER BY p.name;
```

### Package dependency tree
```cypher
MATCH path = (p:Package {name: '@coveo/atomic'})-[:DEPENDS_ON*]->(dep:Package)
RETURN path;
```

### Find packages with most dependencies
```cypher
MATCH (p:Package)-[:DEPENDS_ON]->(dep:Package)
WITH p, count(dep) as dep_count
RETURN p.name, dep_count
ORDER BY dep_count DESC
LIMIT 10;
```

### Find packages that depend on a specific package
```cypher
MATCH (p:Package)-[:DEPENDS_ON]->(target:Package {name: '@coveo/headless'})
RETURN p.name, p.path
ORDER BY p.name;
```

### Find circular dependencies (if any)
```cypher
MATCH path = (p:Package)-[:DEPENDS_ON*2..]->(p)
RETURN path;
```

## File Queries

### Find TypeScript files
```cypher
MATCH (f:File)
WHERE f.extension IN ['.ts', '.tsx']
RETURN f.path, f.type, f.size
ORDER BY f.size DESC
LIMIT 20;
```

### Find largest source files
```cypher
MATCH (f:SourceFile)
RETURN f.path, f.size
ORDER BY f.size DESC
LIMIT 20;
```

## Test Queries

### Test coverage by package
```cypher
MATCH (p:Package)-[:CONTAINS]->(f:File)
OPTIONAL MATCH (t:Test)-[:TESTS]->(f)
WITH p, count(f) as total_files, count(DISTINCT t) as test_files
RETURN p.name, 
       total_files, 
       test_files,
       toFloat(test_files) / total_files * 100 as coverage_percentage
ORDER BY coverage_percentage DESC;
```

### Find Vitest tests
```cypher
MATCH (t:Test {framework: 'vitest'})
RETURN t.path, t.name
ORDER BY t.path;
```

### Find E2E tests
```cypher
MATCH (t:E2ETest)
RETURN t.path, t.framework
ORDER BY t.path;
```

### Find files with multiple tests
```cypher
MATCH (f:File)<-[:TESTS]-(t:Test)
WITH f, collect(t.path) as tests
WHERE size(tests) > 1
RETURN f.path, tests;
```

## Instruction & Documentation Queries

### Find all instruction files
```cypher
MATCH (i:Instruction)
RETURN i.name, i.applyTo, i.description
ORDER BY i.name;
```

### Find instructions applicable to atomic package
```cypher
MATCH (i:Instruction)
WHERE i.applyTo CONTAINS 'packages/atomic' OR i.applyTo CONTAINS 'atomic'
RETURN i.name, i.applyTo, i.path;
```

### Find instructions for TypeScript files
```cypher
MATCH (i:Instruction)
WHERE i.applyTo CONTAINS '*.ts'
RETURN i.name, i.applyTo, i.description;
```

## Skill & Agent Queries

### List all skills
```cypher
MATCH (s:Skill)
RETURN s.name, s.description
ORDER BY s.name;
```

### List all agents
```cypher
MATCH (a:Agent)
RETURN a.name, a.description
ORDER BY a.name;
```

### List all prompts
```cypher
MATCH (p:Prompt)
RETURN p.name, p.description
ORDER BY p.name;
```

## Complex Analysis Queries

### Component complexity: dependencies + tests + stories
```cypher
MATCH (c:Component)
OPTIONAL MATCH (c)-[:USES_CONTROLLER]->(ctrl:Controller)
OPTIONAL MATCH (t:Test)-[:TESTS]->(c)
OPTIONAL MATCH (s:Story)-[:RENDERS]->(c)
WITH c, 
     count(DISTINCT ctrl) as controllers,
     count(DISTINCT t) as tests,
     count(DISTINCT s) as stories
RETURN c.name, 
       c.framework,
       controllers,
       tests,
       stories,
       controllers + tests + stories as total_complexity
ORDER BY total_complexity DESC;
```

### Package file count and size
```cypher
MATCH (p:Package)-[:CONTAINS]->(f:File)
WITH p, count(f) as file_count, sum(f.size) as total_size
RETURN p.name, 
       file_count, 
       total_size,
       total_size / 1024 / 1024 as size_mb
ORDER BY total_size DESC;
```

### Find related components (shared controllers)
```cypher
MATCH (c1:Component)-[:USES_CONTROLLER]->(ctrl:Controller)<-[:USES_CONTROLLER]-(c2:Component)
WHERE id(c1) < id(c2)
RETURN c1.name, c2.name, collect(ctrl.name) as shared_controllers
ORDER BY size(shared_controllers) DESC;
```

### Graph statistics
```cypher
MATCH (n)
WITH labels(n)[0] as label, count(n) as count
RETURN label, count
ORDER BY count DESC;
```

### Relationship statistics
```cypher
MATCH ()-[r]->()
WITH type(r) as rel_type, count(r) as count
RETURN rel_type, count
ORDER BY count DESC;
```

## Maintenance Queries

### Find orphaned nodes (no relationships)
```cypher
MATCH (n)
WHERE NOT (n)-[]-()
RETURN labels(n)[0] as type, n.name, n.path
LIMIT 20;
```

### Find nodes with most relationships
```cypher
MATCH (n)-[r]-()
WITH n, count(r) as rel_count
RETURN labels(n)[0] as type, 
       n.name, 
       n.path, 
       rel_count
ORDER BY rel_count DESC
LIMIT 20;
```

### Check data quality: files without packages
```cypher
MATCH (f:File)
WHERE NOT (:Package)-[:CONTAINS]->(f)
RETURN f.path
LIMIT 20;
```

## MCP Server Query Patterns

When querying through the MCP server, use these patterns for reliable results:

### ✅ Recommended Patterns

**Single MATCH with chained relationships:**
```cypher
MATCH (e:Engine)-[:LOADS_BY_DEFAULT]-(r:Reducer)-[:HANDLES]-(a:Action)
WHERE e.name = 'SearchEngine'
RETURN r.name, a.name;
```

**Simple patterns with filters:**
```cypher
MATCH (c:Component)-[:USES_CONTROLLER]->(ctrl:Controller)
WHERE c.framework = 'lit'
RETURN c.name, ctrl.name;
```

**Undirected relationships when direction doesn't matter:**
```cypher
MATCH (c:Component)-[:USES_CONTROLLER]-(ctrl:Controller)
RETURN c.name, ctrl.name;
```

### ❌ Patterns That May Not Work

**Multiple MATCH statements with dependent variables:**
```cypher
MATCH (e:Engine {name: 'SearchEngine'})-[:LOADS_BY_DEFAULT]->(r:Reducer)
MATCH (r)-[:HANDLES]->(a:Action)  -- May cause "Unbound variable: r" error
RETURN r.name, a.name;
```

**WITH clauses for variable passing:**
```cypher
MATCH (e:Engine)-[:LOADS_BY_DEFAULT]->(r:Reducer)
WITH r  -- May not work reliably
MATCH (r)-[:HANDLES]->(a:Action)
RETURN r.name, a.name;
```

### Best Practices for MCP Queries

1. **Chain relationships in a single MATCH** - Avoid splitting into multiple MATCH statements
2. **Use WHERE for filtering** - More reliable than inline property matching in some cases
3. **Keep patterns simple** - Complex multi-step patterns may have variable binding issues
4. **Test incrementally** - Start with simple queries and build up complexity
5. **Use undirected relationships** - When relationship direction is flexible, undirected (`-[:REL]-`) can be more reliable
6. **Break complex queries into sequential simple queries** - When filtering on nodes far from the starting point in long relationship chains, split into multiple queries

### When to Break Complex Queries into Sequential Queries

**Problem:** WHERE clauses on distant nodes in multi-hop relationship chains can cause "Unbound variable" errors.

**Example scenario:** Find which default-loaded reducers handle actions from a specific component.

❌ **Fails - Complex query with distant WHERE:**
```cypher
MATCH (e:Engine {name: 'SearchEngine'})-[:LOADS_BY_DEFAULT]-(r:Reducer)-[:HANDLES]-(a:Action)
WHERE a.name IN ['executeSearch', 'registerFacet', 'updateFacetValues']
RETURN r.name;
-- Error: Unbound variable: r
```

✅ **Works - Break into sequential queries:**
```cypher
-- Step 1: Find all reducers that handle the component's actions
MATCH (c:Component {name: 'AtomicFacet'})-[:USES_CONTROLLER]->(ctrl:Controller)-[:DISPATCHES]->(a:Action)<-[:HANDLES]-(r:Reducer)
RETURN DISTINCT r.name;
-- Returns: ['facetSetReducer', 'facetOptionsReducer', 'searchReducer', ...]

-- Step 2: Check which of those are loaded by default in the engine
MATCH (e:Engine {name: 'SearchEngine'})-[:LOADS_BY_DEFAULT]-(r:Reducer)
WHERE r.name IN ['facetSetReducer', 'facetOptionsReducer', 'searchReducer']
RETURN r.name;
-- Returns: ['searchReducer']
```

**When to use this pattern:**
- Filtering on nodes 3+ hops away in a relationship chain
- Combining WHERE clauses with multi-hop traversal
- Collecting/aggregating across long relationship paths
- When you get "Unbound variable" errors despite using proper syntax

## Performance Tips

1. **Use indexes**: The import script creates indexes on commonly queried properties
2. **Limit results**: Always use `LIMIT` for large result sets
3. **Use OPTIONAL MATCH** carefully: Can be slow if used excessively
4. **Profile queries**: Use `PROFILE` or `EXPLAIN` to understand query execution

Example with PROFILE:
```cypher
PROFILE
MATCH (c:Component)-[:USES_CONTROLLER]->(ctrl:Controller)
RETURN c.name, ctrl.name
LIMIT 10;
```
