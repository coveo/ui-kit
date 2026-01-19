---
name: querying-knowledge-graph
description: Query the ui-kit knowledge graph MCP server to analyze component architecture, dependencies, and relationships. Use when analyzing components, controllers, actions, reducers, tracing dependencies, or when users ask "what uses X" or "what depends on Y".
metadata:
  author: Coveo
  version: 1.0.0
  category: analysis
---

# Querying the Knowledge Graph

The knowledge graph indexes components, controllers, actions, reducers, engines, tests, and their relationships across the monorepo. This guide provides query patterns and workflows for effective architectural analysis using the MCP server.

## Critical Constraints

### 1. Component Naming
**⚠️ ALWAYS use PascalCase class names**, not kebab-case tag names:
- ✅ `AtomicFacet`, `AtomicSearchBox`  
- ❌ `atomic-facet`, `atomic-search-box`

### 2. Sequential Queries Required
**MCP server has stricter variable scoping than direct Cypher.** For chains with 3+ hops or WHERE clauses on distant nodes:
1. Query immediate relationships
2. Use results in next query's WHERE clause  
3. Repeat until chain complete

**Example:** Component→Action→Reducer requires 2-3 separate queries (see [queries.md](./references/queries.md#sequential-patterns))

### 3. MCP Limitations
- ❌ Multiple MATCH blocks with dependent variables
- ❌ WITH clauses  
- ❌ WHERE on nodes 3+ hops away
- ✅ Simple MATCH with WHERE on same node
- ✅ OPTIONAL MATCH, collect(), DISTINCT

## Query Patterns

**Common analysis patterns:**
- **Component dependencies** - Which controllers/engines does component use?
- **Action flow** - Which actions does component dispatch?
- **Reducer handling** - Which reducers handle actions? (requires sequential queries)
- **Test coverage** - Which tests cover component?

**Full Cypher examples:** See [queries.md](./references/queries.md)

## Workflows

Common analysis workflows:
- **Page/component analysis** - Aggregate controllers, trace action flows
- **Debugging behavior** - Component→controllers→actions→reducers chain
- **Migration planning** - Find Stencil components, check test coverage, assess dependencies

**Detailed workflows with examples:** See [workflows.md](./references/workflows.md)

## Best Practices

- Use `collect()` for aggregating relationships
- Use `OPTIONAL MATCH` when relationships may not exist  
- Prefer specific MCP tools (`get_component_dependencies`) over generic query tool
- Validate results against source code when uncertain

## References

- **[schema.md](./references/schema.md)** - Node types, relationships, graph statistics
- **[queries.md](./references/queries.md)** - Cypher examples and sequential patterns  
- **[workflows.md](./references/workflows.md)** - Common analysis workflows with examples
- **[analyzing-page-architecture.md](./references/analyzing-page-architecture.md)** - Real Next.js page walkthrough
