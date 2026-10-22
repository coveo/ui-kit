A commerce page wraps everything in `atomic-commerce-interface`, with `type="search"` for a search page and `type="product-listing"` for a category or listing page. Products render through `atomic-commerce-product-list` and an `atomic-product-template`; facets come from a single `atomic-commerce-facets` element, which generates them from the platform configuration.

```html
<atomic-commerce-interface type="search">
  <atomic-commerce-layout>
    <atomic-layout-section section="search">
      <atomic-commerce-search-box>
        <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
        <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      </atomic-commerce-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="facets">
      <atomic-commerce-facets></atomic-commerce-facets>
    </atomic-layout-section>
    <atomic-layout-section section="main">
      <atomic-layout-section section="status">
        <atomic-commerce-breadbox></atomic-commerce-breadbox>
        <atomic-commerce-query-summary></atomic-commerce-query-summary>
        <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
      </atomic-layout-section>
      <atomic-layout-section section="products">
        <atomic-commerce-product-list display="grid" density="compact" image-size="small">
          <atomic-product-template>
            <template>
              <atomic-product-section-visual>
                <atomic-product-field-condition if-defined="ec_thumbnails">
                  <atomic-product-image field="ec_thumbnails"></atomic-product-image>
                </atomic-product-field-condition>
              </atomic-product-section-visual>
              <atomic-product-section-name>
                <atomic-product-link></atomic-product-link>
              </atomic-product-section-name>
              <atomic-product-section-metadata>
                <atomic-product-field-condition if-defined="ec_brand">
                  <atomic-product-text field="ec_brand"></atomic-product-text>
                </atomic-product-field-condition>
                <atomic-product-rating field="ec_rating"></atomic-product-rating>
              </atomic-product-section-metadata>
              <atomic-product-section-emphasized>
                <atomic-product-price></atomic-product-price>
              </atomic-product-section-emphasized>
            </template>
          </atomic-product-template>
        </atomic-commerce-product-list>
      </atomic-layout-section>
      <atomic-layout-section section="pagination">
        <atomic-commerce-pager></atomic-commerce-pager>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-commerce-layout>
</atomic-commerce-interface>
```

Initialize it with `initialize({organizationId, accessToken, context: {language, country, currency, view: {url}}})` and run `executeFirstRequest()`. The `view.url` identifies the page to the platform: the commerce search page, or the listing to load. Product fields start with `ec_` (`ec_name`, `ec_brand`, `ec_price`, `ec_thumbnails`, `ec_rating`). Recommendations go in a separate `atomic-commerce-recommendation-interface` with one `atomic-commerce-recommendation-list` per slot.
