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

Initialize it with `initialize({organizationId, accessToken, analytics: {trackingId}, context: {language, country, currency, view: {url}}})` and run `executeFirstRequest()`; `trackingId` is required, it names the commerce configuration that receives the analytics. The `view.url` identifies the page to the platform: the commerce search page, or the listing to load. Product fields start with `ec_` (`ec_name`, `ec_brand`, `ec_price`, `ec_thumbnails`, `ec_rating`). Product recommendations go in a separate `atomic-commerce-recommendation-interface`, which has no `initialize`: build a commerce engine with Headless and pass it to `initializeWithEngine(engine)`. Each `atomic-commerce-recommendation-list` inside it then fetches its slot.

```html
<atomic-commerce-recommendation-interface>
  <atomic-commerce-recommendation-list
    slot-id="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
    products-per-page="4"
  >
    <atomic-product-template>
      <template>
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

```js
// From npm: import {buildCommerceEngine} from '@coveo/headless/commerce';
import {buildCommerceEngine} from 'https://static.cloud.coveo.com/headless/v3/commerce/headless.esm.js';

const engine = buildCommerceEngine({
  configuration: {
    organizationId: 'my-org-id',
    accessToken: 'my-access-token',
    analytics: {trackingId: 'my-tracking-id'},
    context: {language: 'en', country: 'US', currency: 'USD', view: {url: 'https://example.com/'}},
  },
});
await customElements.whenDefined('atomic-commerce-recommendation-interface');
await document
  .querySelector('atomic-commerce-recommendation-interface')
  .initializeWithEngine(engine);
```
