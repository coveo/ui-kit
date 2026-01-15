Query 1: Full Component → API Trace
Question: "What API endpoints does atomic-search-box ultimately call?"
With grep, you'd need:
1. Find component → find controller import → find controller file → find dispatched actions → find action files → find API calls
2. That's 5-6 hops, each requiring manual inspection





## SKILL

### High-Value Query Templates
1. Impact Analysis - Find transitive dependency chains (3+ hops)
2. Export Usage - Find all consumers of an export
3. Shared Controller Analysis - Find controllers used by 40+ components
4. Component → Reducer Trace - Full data flow tracing
5. Reducer Complexity Audit - Find reducers handling 50+ actions
6. Property Consistency - Check property usage across components
7. API Surface Inventory - List all define* functions
8. Unique Controller Usage - Find safe-to-modify controllers

### When to Use
- Before breaking changes
- Deprecation planning
- Architecture audits
- Onboarding
- Refactoring scope assessment

### Graph Schema
Documents the node types (Package, Component, Controller, Action, Reducer, Property, Export) and relationships (DEPENDS_ON, EXPORTS, IMPORTS, CONSUMES, DISPATCHES, HANDLES, HAS_PROPERTY).

### Example Workflows
- Pre-PR impact check
- Deprecation planning
- Architecture documentation

