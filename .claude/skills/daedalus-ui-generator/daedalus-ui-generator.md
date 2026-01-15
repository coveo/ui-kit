# Daedalus UI Generator

## Overview

Daedalus is a "Generative UI" system that assembles Atomic component interfaces from natural language prompts. It uses the ui-kit knowledge graph to understand component relationships, controllers, and compatibility rules.

## Process

### Step 1: Understand the Request

Parse the user's prompt to identify:

1. **Domain**: Which interface type (search, commerce, recommendations, insight)?
2. **Features**: What capabilities are needed (filtering, AI answers, pagination)?
3. **Layout**: How should results be displayed (grid, list, compact)?
4. **Field mappings**: What data fields to use for filters/display?

**Example prompt analysis:**
```
"Show me a search interface for shoes, filtering by price and color, with a grid layout"

Domain: commerce (product search)
Features: filtering (price=numeric, color=visual)
Layout: grid display
```

### Step 2: Query the Knowledge Graph

Use the uikit-graph MCP tools to find compatible components:

```
# Find components for text input
uikit-graph_find_component: "search-box"

# Find filtering components
uikit-graph_find_component: "facet"

# Trace component to actions (verify it works for the use case)
uikit-graph_trace_component_to_actions: "atomic-search-box"

# Check controller compatibility
uikit-graph_find_controller: "Facet"
```

### Step 3: Select Components

Use the taxonomy to map user intent to components:

| User Intent | Semantic Category | Component Selection |
|-------------|-------------------|---------------------|
| "search box" | textInput | atomic-search-box / atomic-commerce-search-box |
| "filter by price" | filtering.numeric | atomic-numeric-facet / atomic-commerce-numeric-facet |
| "filter by color" | filtering.color | atomic-color-facet |
| "grid layout" | resultDisplay.grid | atomic-result-list display="grid" |
| "AI answers" | aiAnswers | atomic-generated-answer |

### Step 4: Validate Compatibility

Before generating, verify:

1. **Interface compatibility**: All components work with chosen interface
2. **Parent-child relationships**: Nested components are properly structured
3. **Controller availability**: Required controllers exist for the engine type
4. **Property validity**: Field names and configuration are valid

Use Cypher queries for validation:
```cypher
// Check if component consumes required controller
MATCH (c:Component {tag: 'atomic-facet'})-[:CONSUMES]->(ctrl:Controller)
RETURN ctrl.name
```

### Step 5: Generate Interface Code

Output format is HTML that can be directly used:

```html
<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="search">
      <atomic-search-box></atomic-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="facets">
      <atomic-facet-manager>
        <atomic-numeric-facet field="price" label="Price"></atomic-numeric-facet>
        <atomic-color-facet field="color" label="Color"></atomic-color-facet>
      </atomic-facet-manager>
    </atomic-layout-section>
    <atomic-layout-section section="main">
      <atomic-layout-section section="status">
        <atomic-breadbox></atomic-breadbox>
        <atomic-query-summary></atomic-query-summary>
        <atomic-sort-dropdown>
          <atomic-sort-expression label="Relevance" expression="relevancy"></atomic-sort-expression>
          <atomic-sort-expression label="Price (low to high)" expression="price ascending"></atomic-sort-expression>
        </atomic-sort-dropdown>
      </atomic-layout-section>
      <atomic-layout-section section="results">
        <atomic-result-list display="grid" density="normal"></atomic-result-list>
      </atomic-layout-section>
      <atomic-layout-section section="pagination">
        <atomic-pager></atomic-pager>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
```

## Reference Files

| Reference | Purpose |
|-----------|---------|
| [component-taxonomy.json](references/component-taxonomy.json) | Semantic categories and component mappings |
| [interface-templates.md](references/interface-templates.md) | Pre-built interface patterns |
| [cypher-queries.md](references/cypher-queries.md) | Common graph queries for component discovery |

## Graph Query Patterns

### Find Components by Semantic Purpose

```cypher
// Find all filtering components
MATCH (c:Component)
WHERE c.tag CONTAINS 'facet'
RETURN c.tag, c.file

// Find components that consume a specific controller
MATCH (c:Component)-[:CONSUMES]->(ctrl:Controller {name: 'SearchBox'})
RETURN c.tag

// Find all components for a domain
MATCH (c:Component)
WHERE c.file CONTAINS '/search/'
RETURN c.tag
```

### Validate Component Compatibility

```cypher
// Check what controllers a component needs
MATCH (c:Component {tag: 'atomic-result-list'})-[:CONSUMES]->(ctrl:Controller)
RETURN ctrl.name, ctrl.file

// Find what actions a component triggers
MATCH (c:Component {tag: 'atomic-search-box'})-[:CONSUMES]->(ctrl:Controller)-[:DISPATCHES]->(a:Action)
RETURN c.tag, ctrl.name, collect(a.name) as actions
```

### Discover Component Properties

```cypher
// Get all properties for a component
MATCH (c:Component {tag: 'atomic-result-list'})-[:HAS_PROPERTY]->(p:Property)
RETURN p.name, p.attribute, p.type, p.default
```

## Domain-Specific Patterns

### Search Domain
- Interface: `atomic-search-interface`
- Layout: `atomic-search-layout`
- Controllers: SearchBox, Facet, ResultList, Pager, Sort

### Commerce Domain
- Interface: `atomic-commerce-interface`
- Layout: `atomic-commerce-layout`
- Controllers: ProductListing, Search, Context, Cart

### Recommendations Domain
- Interface: `atomic-recs-interface`
- Controllers: Recommendations

### Insight Domain
- Interface: `atomic-insight-interface`
- Layout: `atomic-insight-layout`
- Controllers: InsightEngine-specific controllers

## Output Validation Checklist

Before returning generated code:

- [ ] Interface wrapper is correct for domain
- [ ] Layout sections are properly nested
- [ ] All child components have valid parents
- [ ] Field properties reference valid field names
- [ ] Required components are included (interface, result display)
- [ ] Optional components enhance the experience
- [ ] Code is properly formatted and indented
