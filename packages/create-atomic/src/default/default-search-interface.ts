export default `<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="search">
      <atomic-search-box></atomic-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="facets">
      <atomic-facet-manager>
        <atomic-facet field="filetype" label="Filetype"></atomic-facet>
        <atomic-facet field="source" label="Source"></atomic-facet>
      </atomic-facet-manager>
    </atomic-layout-section>
    <atomic-layout-section section="main">
      <atomic-layout-section section="status">
        <atomic-breadbox></atomic-breadbox>
        <atomic-query-summary></atomic-query-summary>
        <atomic-refine-toggle></atomic-refine-toggle>
        <atomic-sort-dropdown>
          <atomic-sort-expression
            label="relevance"
            expression="relevancy"
          ></atomic-sort-expression>
          <atomic-sort-expression
            label="most-recent"
            expression="date descending"
          ></atomic-sort-expression>
        </atomic-sort-dropdown>
        <atomic-did-you-mean></atomic-did-you-mean>
      </atomic-layout-section>
      <atomic-layout-section section="results">
        <results-manager></results-manager>
        <atomic-query-error></atomic-query-error>
        <atomic-no-results></atomic-no-results>
      </atomic-layout-section>
      <atomic-layout-section section="pagination">
        <atomic-load-more-results></atomic-load-more-results>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>`;
