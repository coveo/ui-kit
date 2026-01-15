# Interface Templates

Pre-built interface patterns for common use cases. Use these as starting points and customize based on user requirements.

## Search Domain Templates

### Simple Search

Minimal search interface with search box and results.

**Use when:** Basic documentation search, simple site search

```html
<atomic-search-interface>
  <div style="margin: 20px;">
    <atomic-search-box></atomic-search-box>
    <atomic-query-summary></atomic-query-summary>
    <atomic-result-list></atomic-result-list>
    <atomic-pager></atomic-pager>
  </div>
</atomic-search-interface>
```

### Faceted Search (Full Layout)

Complete search with sidebar facets, sorting, and pagination.

**Use when:** Knowledge base, documentation with categories, content search with filters

```html
<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="search">
      <atomic-search-box>
        <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
        <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
      </atomic-search-box>
    </atomic-layout-section>
    
    <atomic-layout-section section="facets">
      <atomic-facet-manager>
        <!-- Add facets based on available fields -->
        <atomic-facet field="source" label="Source"></atomic-facet>
        <atomic-facet field="author" label="Author"></atomic-facet>
        <atomic-timeframe-facet label="Date"></atomic-timeframe-facet>
      </atomic-facet-manager>
    </atomic-layout-section>
    
    <atomic-layout-section section="main">
      <atomic-layout-section section="status">
        <atomic-breadbox></atomic-breadbox>
        <atomic-query-summary></atomic-query-summary>
        <atomic-sort-dropdown>
          <atomic-sort-expression label="Relevance" expression="relevancy"></atomic-sort-expression>
          <atomic-sort-expression label="Most Recent" expression="date descending"></atomic-sort-expression>
        </atomic-sort-dropdown>
        <atomic-refine-toggle></atomic-refine-toggle>
      </atomic-layout-section>
      
      <atomic-layout-section section="results">
        <atomic-result-list>
          <atomic-result-template>
            <template>
              <atomic-result-section-visual>
                <atomic-result-icon></atomic-result-icon>
              </atomic-result-section-visual>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
              <atomic-result-section-bottom-metadata>
                <atomic-result-date field="date"></atomic-result-date>
              </atomic-result-section-bottom-metadata>
            </template>
          </atomic-result-template>
        </atomic-result-list>
      </atomic-layout-section>
      
      <atomic-layout-section section="pagination">
        <atomic-pager></atomic-pager>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
  
  <atomic-refine-modal></atomic-refine-modal>
</atomic-search-interface>
```

### AI-Powered Search

Search with generated answers and smart snippets.

**Use when:** Help center, FAQ, support documentation

```html
<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="search">
      <atomic-search-box>
        <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
      </atomic-search-box>
    </atomic-layout-section>
    
    <atomic-layout-section section="main">
      <atomic-layout-section section="status">
        <atomic-query-summary></atomic-query-summary>
      </atomic-layout-section>
      
      <!-- AI-generated answer appears first -->
      <atomic-generated-answer></atomic-generated-answer>
      
      <!-- Smart snippets for direct answers -->
      <atomic-smart-snippet></atomic-smart-snippet>
      <atomic-smart-snippet-suggestions></atomic-smart-snippet-suggestions>
      
      <atomic-layout-section section="results">
        <atomic-result-list></atomic-result-list>
      </atomic-layout-section>
      
      <atomic-layout-section section="pagination">
        <atomic-pager></atomic-pager>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
```

### Tabbed Search

Search with content type tabs.

**Use when:** Multi-source search, mixed content types

```html
<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="search">
      <atomic-search-box></atomic-search-box>
    </atomic-layout-section>
    
    <atomic-layout-section section="main">
      <atomic-tab-manager>
        <atomic-tab label="All" expression=""></atomic-tab>
        <atomic-tab label="Documentation" expression="@source==Documentation"></atomic-tab>
        <atomic-tab label="Blog" expression="@source==Blog"></atomic-tab>
        <atomic-tab label="Community" expression="@source==Community"></atomic-tab>
      </atomic-tab-manager>
      
      <atomic-layout-section section="status">
        <atomic-query-summary></atomic-query-summary>
      </atomic-layout-section>
      
      <atomic-layout-section section="results">
        <atomic-result-list></atomic-result-list>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
```

## Commerce Domain Templates

### Product Catalog

E-commerce product listing with commerce-specific features.

**Use when:** Product search, shopping experience

```html
<atomic-commerce-interface>
  <atomic-commerce-layout>
    <atomic-layout-section section="search">
      <atomic-commerce-search-box>
        <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
        <atomic-commerce-search-box-instant-products></atomic-commerce-search-box-instant-products>
      </atomic-commerce-search-box>
    </atomic-layout-section>
    
    <atomic-layout-section section="facets">
      <atomic-commerce-facets collapse-facets-after="4"></atomic-commerce-facets>
    </atomic-layout-section>
    
    <atomic-layout-section section="main">
      <atomic-layout-section section="status">
        <atomic-commerce-breadbox></atomic-commerce-breadbox>
        <atomic-commerce-query-summary></atomic-commerce-query-summary>
        <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
        <atomic-commerce-refine-toggle></atomic-commerce-refine-toggle>
      </atomic-layout-section>
      
      <atomic-layout-section section="products">
        <atomic-commerce-product-list display="grid" density="normal" image-size="large">
          <atomic-product-template>
            <template>
              <atomic-product-section-visual>
                <atomic-product-image field="ec_images"></atomic-product-image>
              </atomic-product-section-visual>
              <atomic-product-section-name>
                <atomic-product-link></atomic-product-link>
              </atomic-product-section-name>
              <atomic-product-section-metadata>
                <atomic-product-rating field="ec_rating"></atomic-product-rating>
              </atomic-product-section-metadata>
              <atomic-product-section-emphasized>
                <atomic-product-price></atomic-product-price>
              </atomic-product-section-emphasized>
              <atomic-product-section-description>
                <atomic-product-description></atomic-product-description>
              </atomic-product-section-description>
            </template>
          </atomic-product-template>
        </atomic-commerce-product-list>
      </atomic-layout-section>
      
      <atomic-layout-section section="pagination">
        <atomic-commerce-pager></atomic-commerce-pager>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-commerce-layout>
  
  <atomic-commerce-refine-modal></atomic-commerce-refine-modal>
</atomic-commerce-interface>
```

### Product Catalog with Manual Facets

When you need specific facets rather than auto-generated ones.

**Use when:** Controlled filtering experience, specific field requirements

```html
<atomic-commerce-interface>
  <atomic-commerce-layout>
    <atomic-layout-section section="search">
      <atomic-commerce-search-box></atomic-commerce-search-box>
    </atomic-layout-section>
    
    <atomic-layout-section section="facets">
      <atomic-commerce-category-facet field="ec_category"></atomic-commerce-category-facet>
      <atomic-commerce-numeric-facet field="ec_price"></atomic-commerce-numeric-facet>
      <atomic-commerce-facet field="ec_brand"></atomic-commerce-facet>
    </atomic-layout-section>
    
    <atomic-layout-section section="main">
      <atomic-layout-section section="products">
        <atomic-commerce-product-list display="grid"></atomic-commerce-product-list>
      </atomic-layout-section>
      <atomic-commerce-pager></atomic-commerce-pager>
    </atomic-layout-section>
  </atomic-commerce-layout>
</atomic-commerce-interface>
```

## Recommendations Domain Templates

### Recommendation Carousel

AI-powered product/content recommendations.

**Use when:** "You might also like", related products, personalized suggestions

```html
<atomic-recs-interface>
  <atomic-recs-list 
    label="Recommended for you" 
    display="grid" 
    number-of-recommendations="8"
  >
    <atomic-recs-result-template>
      <template>
        <atomic-result-section-visual>
          <atomic-result-image field="ec_images"></atomic-result-image>
        </atomic-result-section-visual>
        <atomic-result-section-title>
          <atomic-result-link></atomic-result-link>
        </atomic-result-section-title>
        <atomic-result-section-bottom-metadata>
          <atomic-result-number field="ec_price">
            <atomic-format-currency currency="USD"></atomic-format-currency>
          </atomic-result-number>
        </atomic-result-section-bottom-metadata>
      </template>
    </atomic-recs-result-template>
  </atomic-recs-list>
</atomic-recs-interface>
```

### Commerce Recommendations

Product recommendations within a commerce context.

**Use when:** Cross-sell, upsell in shopping experience

```html
<atomic-commerce-recommendation-interface>
  <atomic-commerce-recommendation-list 
    slot-id="recommendation-slot-id"
    products-per-page="6"
  >
    <atomic-product-template>
      <template>
        <atomic-product-section-visual>
          <atomic-product-image></atomic-product-image>
        </atomic-product-section-visual>
        <atomic-product-section-name>
          <atomic-product-link></atomic-product-link>
        </atomic-product-section-name>
        <atomic-product-section-emphasized>
          <atomic-product-price></atomic-product-price>
        </atomic-product-section-emphasized>
      </template>
    </atomic-product-template>
  </atomic-commerce-recommendation-list>
</atomic-commerce-recommendation-interface>
```

## Insight Domain Templates

### Agent Assist Panel

Knowledge search for support agents.

**Use when:** Contact center, agent desktop, case management

```html
<atomic-insight-interface>
  <atomic-insight-layout>
    <atomic-insight-tabs>
      <atomic-insight-tab label="All"></atomic-insight-tab>
      <atomic-insight-tab label="Articles" expression="@source==KnowledgeBase"></atomic-insight-tab>
      <atomic-insight-tab label="Cases" expression="@source==Cases"></atomic-insight-tab>
    </atomic-insight-tabs>
    
    <atomic-search-box></atomic-search-box>
    
    <atomic-insight-query-summary></atomic-insight-query-summary>
    
    <atomic-insight-generate-answer-button></atomic-insight-generate-answer-button>
    
    <atomic-result-list>
      <atomic-insight-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
        </template>
      </atomic-insight-result-template>
    </atomic-result-list>
    
    <atomic-insight-pager></atomic-insight-pager>
  </atomic-insight-layout>
</atomic-insight-interface>
```

## Common Field Mappings

### Search/Documentation Fields
- `title` - Document title
- `excerpt` - Content excerpt
- `date` - Publication date
- `author` - Content author
- `source` - Content source/type
- `filetype` - File type

### Commerce/Product Fields
- `ec_name` - Product name
- `ec_description` - Product description
- `ec_price` - Product price
- `ec_images` - Product images
- `ec_category` - Product category (hierarchical)
- `ec_brand` - Product brand
- `ec_rating` - Product rating
- `ec_in_stock` - Availability

## Customization Guidelines

### Changing Display Mode
```html
<!-- List view -->
<atomic-result-list display="list"></atomic-result-list>

<!-- Grid view -->
<atomic-result-list display="grid"></atomic-result-list>

<!-- Table view -->
<atomic-result-list display="table"></atomic-result-list>
```

### Adjusting Density
```html
<!-- More spacing -->
<atomic-result-list density="comfortable"></atomic-result-list>

<!-- Default -->
<atomic-result-list density="normal"></atomic-result-list>

<!-- Less spacing -->
<atomic-result-list density="compact"></atomic-result-list>
```

### Image Sizes
```html
<atomic-result-list image-size="icon"></atomic-result-list>
<atomic-result-list image-size="small"></atomic-result-list>
<atomic-result-list image-size="large"></atomic-result-list>
```
