A search page wraps everything in `atomic-search-interface` and lays it out with `atomic-search-layout` and `atomic-layout-section`. Facets go in the `facets` section, the result list in `main` > `results`, with `status` above it and `pagination` below.

```html
<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="search">
      <atomic-search-box>
        <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
        <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
      </atomic-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="facets">
      <atomic-facet-manager>
        <atomic-facet field="author" label="Authors"></atomic-facet>
        <atomic-facet field="filetype" label="File type"></atomic-facet>
      </atomic-facet-manager>
    </atomic-layout-section>
    <atomic-layout-section section="main">
      <atomic-layout-section section="status">
        <atomic-breadbox></atomic-breadbox>
        <atomic-query-summary></atomic-query-summary>
        <atomic-sort-dropdown>
          <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression>
          <atomic-sort-expression
            label="most-recent"
            expression="date descending"
          ></atomic-sort-expression>
        </atomic-sort-dropdown>
        <atomic-did-you-mean></atomic-did-you-mean>
      </atomic-layout-section>
      <atomic-layout-section section="results">
        <atomic-result-list>
          <atomic-result-template>
            <template>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
            </template>
          </atomic-result-template>
        </atomic-result-list>
      </atomic-layout-section>
      <atomic-layout-section section="pagination">
        <atomic-pager></atomic-pager>
        <atomic-results-per-page></atomic-results-per-page>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
```

Initialize it with `initialize({organizationId, accessToken})` and run `executeFirstSearch()`. Field names such as `author`, `filetype`, `excerpt` and `date` are standard Coveo fields; custom fields must exist in the index and, for facets, be marked as facetable.
