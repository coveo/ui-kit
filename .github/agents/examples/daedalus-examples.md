# Daedalus Test Scenarios

Test scenarios for validating the Daedalus UI Generator agent.

## Scenario 1: Simple Documentation Search (Happy Path)

**Input:**
```
Generate a simple search page for documentation with a search box and result list.
```

**Expected Behavior:**
1. Identifies domain as "search"
2. Selects minimal components: atomic-search-interface, atomic-search-box, atomic-result-list
3. Generates clean, simple interface

**Expected Output Structure:**
```html
<atomic-search-interface>
  <atomic-search-box></atomic-search-box>
  <atomic-query-summary></atomic-query-summary>
  <atomic-result-list></atomic-result-list>
  <atomic-pager></atomic-pager>
</atomic-search-interface>
```

---

## Scenario 2: Complex E-Commerce Search (Feature-Rich)

**Input:**
```
Show me a search interface for shoes, filtering by price and color, with a grid layout.
```

**Expected Behavior:**
1. Identifies domain as "commerce" (product search)
2. Queries graph for commerce components
3. Selects: atomic-commerce-interface, atomic-commerce-search-box, atomic-commerce-numeric-facet (price), atomic-color-facet, atomic-commerce-product-list with display="grid"
4. Notes that atomic-color-facet may need to be atomic-commerce-facet for commerce

**Expected Output Structure:**
```html
<atomic-commerce-interface>
  <atomic-commerce-layout>
    <atomic-layout-section section="search">
      <atomic-commerce-search-box></atomic-commerce-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="facets">
      <atomic-commerce-numeric-facet field="ec_price"></atomic-commerce-numeric-facet>
      <atomic-commerce-facet field="ec_color"></atomic-commerce-facet>
    </atomic-layout-section>
    <atomic-layout-section section="main">
      <atomic-layout-section section="products">
        <atomic-commerce-product-list display="grid"></atomic-commerce-product-list>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-commerce-layout>
</atomic-commerce-interface>
```

---

## Scenario 3: Recommendations Widget (Domain Switch)

**Input:**
```
Create a recommendation carousel showing "You might also like" products.
```

**Expected Behavior:**
1. Identifies domain as "recommendations"
2. Selects: atomic-recs-interface, atomic-recs-list, atomic-recs-result-template
3. Configures display as grid for carousel-like appearance

**Expected Output Structure:**
```html
<atomic-recs-interface>
  <atomic-recs-list 
    label="You might also like" 
    display="grid" 
    number-of-recommendations="8">
    <atomic-recs-result-template>
      <template>
        <!-- Result template -->
      </template>
    </atomic-recs-result-template>
  </atomic-recs-list>
</atomic-recs-interface>
```

---

## Scenario 4: AI-Powered Help Center (Advanced Features)

**Input:**
```
Build a help center search with AI-generated answers, smart snippets, and faceted navigation by category and date.
```

**Expected Behavior:**
1. Identifies domain as "search"
2. Includes AI components: atomic-generated-answer, atomic-smart-snippet
3. Adds facets: atomic-category-facet, atomic-timeframe-facet
4. Uses full layout structure

**Expected Output Structure:**
```html
<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="search">
      <atomic-search-box>
        <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
      </atomic-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="facets">
      <atomic-facet-manager>
        <atomic-category-facet field="category" label="Category"></atomic-category-facet>
        <atomic-timeframe-facet label="Date"></atomic-timeframe-facet>
      </atomic-facet-manager>
    </atomic-layout-section>
    <atomic-layout-section section="main">
      <atomic-generated-answer></atomic-generated-answer>
      <atomic-smart-snippet></atomic-smart-snippet>
      <atomic-layout-section section="results">
        <atomic-result-list></atomic-result-list>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
```

---

## Scenario 5: Ambiguous Request (Clarification Needed)

**Input:**
```
I need a search page with filters.
```

**Expected Behavior:**
1. Agent should ask clarifying questions:
   - "Is this for product search (commerce) or content search (search)?"
   - "What fields would you like to filter by? (e.g., category, price, date, author)"
   - "Do you prefer a grid or list layout for results?"

---

## Scenario 6: Controller Compatibility Check (Validation)

**Input:**
```
Generate a landing page for 'Documentation Search'. Use components that are compatible with the Headless Recommendation engine.
```

**Expected Behavior:**
1. Identifies the request mentions both "Documentation Search" (search domain) and "Recommendation engine"
2. Queries graph to check controller compatibility:
   ```
   uikit-graph_find_controller: "Recommendations"
   ```
3. Recognizes that search components (atomic-search-box, atomic-facet, etc.) use SearchBox/Facet controllers, NOT Recommendations controller
4. Provides appropriate response:
   - Either clarify the intent (search vs recommendations)
   - Or suggest using atomic-recs-interface for recommendations
   - Or explain that search interface components don't use the Recommendations controller

---

## Scenario 7: Invalid Component Combination (Error Handling)

**Input:**
```
Create a search page using atomic-commerce-product-list for showing results.
```

**Expected Behavior:**
1. Detects domain mismatch: search interface with commerce component
2. Warns about incompatibility
3. Suggests either:
   - Use atomic-result-list for search domain
   - Switch to atomic-commerce-interface for commerce domain

---

## Scenario 8: Insight/Agent Assist (Specialized Domain)

**Input:**
```
Create a support agent assist panel with tabs for Articles and Cases, plus an AI answer generator.
```

**Expected Behavior:**
1. Identifies domain as "insight"
2. Selects: atomic-insight-interface, atomic-insight-tabs, atomic-insight-tab, atomic-insight-generate-answer-button
3. Includes result list with atomic-insight-result-template

**Expected Output Structure:**
```html
<atomic-insight-interface>
  <atomic-insight-layout>
    <atomic-insight-tabs>
      <atomic-insight-tab label="Articles" expression="@source==Articles"></atomic-insight-tab>
      <atomic-insight-tab label="Cases" expression="@source==Cases"></atomic-insight-tab>
    </atomic-insight-tabs>
    <atomic-search-box></atomic-search-box>
    <atomic-insight-generate-answer-button></atomic-insight-generate-answer-button>
    <atomic-result-list>
      <atomic-insight-result-template>
        <template>
          <!-- Template content -->
        </template>
      </atomic-insight-result-template>
    </atomic-result-list>
  </atomic-insight-layout>
</atomic-insight-interface>
```

---

## Validation Checklist for All Scenarios

| Check | Description |
|-------|-------------|
| Domain Detection | Correctly identifies search/commerce/recs/insight |
| Component Selection | Uses appropriate components for the domain |
| Graph Queries | Uses MCP tools to verify component existence |
| Compatibility | All components work with the chosen interface |
| Layout Structure | Proper nesting of layout sections |
| Property Configuration | Field names and display options are appropriate |
| Code Quality | HTML is properly formatted and indented |
| Initialization | JavaScript initialization code is provided |
