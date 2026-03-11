# Sample Page Story Examples

Essential patterns for creating full sample page stories. All pages follow similar structure - only unique differences are shown.

## Standard Sample Page Pattern

Complete example showing all required parts:

```typescript
import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {richResponse, type baseResponse} from '@/storybook-utils/api/search/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

async function initializeSearchInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = canvasElement.querySelector('atomic-search-interface');
  await searchInterface!.initialize(getSampleSearchEngineConfiguration());
}

const mockSearchApi = new MockSearchApi();

const meta: Meta = {
  component: 'search-page',
  title: 'Search/Example Pages',
  parameters: {
    ...parameters,
    layout: 'fullscreen',  // Required for sample pages
    msw: {handlers: [...mockSearchApi.handlers]},
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mock(() => richResponse as unknown as typeof baseResponse);
  },
  render: () => html`
    <atomic-search-interface language-assets-path="./lang" icon-assets-path="./assets">
      <atomic-search-layout>
        <atomic-layout-section section="search">
          <atomic-search-box></atomic-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet-manager>
            <atomic-facet field="author" label="Authors"></atomic-facet>
          </atomic-facet-manager>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-query-summary></atomic-query-summary>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-result-list display="list">
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
            <atomic-query-error></atomic-query-error>
            <atomic-no-results></atomic-no-results>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-pager></atomic-pager>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-search-layout>
    </atomic-search-interface>
  `,
  play: async (context) => {
    await initializeSearchInterface(context.canvasElement);
    const searchInterface = context.canvasElement.querySelector('atomic-search-interface');
    await searchInterface!.executeFirstSearch();
  },
};

export default meta;

export const Default: Story = {
  name: 'Search Page',
};
```

## Commerce Pages

**Key differences:** Different interface type, configuration, and components.

```typescript
import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock.js';
import {richResponse, type baseResponse} from '@/storybook-utils/api/commerce/search-response';

const mockCommerceApi = new MockCommerceApi();

const meta: Meta = {
  // ... standard config with mockCommerceApi.handlers
  render: () => html`
    <atomic-commerce-interface type="search">
      <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-commerce-facets></atomic-commerce-facets>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="products">
            <atomic-commerce-product-list display="grid">
              <atomic-product-template>
                <template>
                  <atomic-product-link></atomic-product-link>
                  <atomic-product-image field="ec_thumbnails"></atomic-product-image>
                  <atomic-product-price></atomic-product-price>
                </template>
              </atomic-product-template>
            </atomic-commerce-product-list>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    </atomic-commerce-interface>
  `,
  play: async (context) => {
    const commerceInterface = context.canvasElement.querySelector('atomic-commerce-interface');
    await commerceInterface!.executeFirstRequest();  // Note: executeFirstRequest, not executeFirstSearch
  },
};
```

**Product Listing:** Set `type="product-listing"` and use `productListingEndpoint`. No search box.

## Insight Pages

**Key differences:** Widget-style dimensions and `atomic-insight-*` prefixed components.

```typescript
import {getSampleInsightEngineConfiguration} from '@coveo/headless/insight';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock.js';

const meta: Meta = {
  render: () => html`
    <style>
      atomic-insight-interface:not([widget='false']) {
        width: 500px;
        height: 1000px;
        margin: auto;
        box-shadow: 0px 3px 24px 0px #0000001a;
      }
    </style>
    <atomic-insight-interface>
      <atomic-insight-layout>
        <!-- Use atomic-insight-* prefixed components -->
      </atomic-insight-layout>
    </atomic-insight-interface>
  `,
};
```

## Recommendations Pages

**Key differences:** Uses `getRecommendations()` instead of `executeFirstSearch()`.

```typescript
import {getSampleRecommendationEngineConfiguration} from '@coveo/headless/recommendation';
import {MockRecommendationApi} from '@/storybook-utils/api/recommendation/mock.js';

const meta: Meta = {
  render: () => html`
    <atomic-recs-interface>
      <atomic-recs-list label="Recommended" display="grid">
        <atomic-recs-result-template>
          <template>
            <!-- Result template -->
          </template>
        </atomic-recs-result-template>
      </atomic-recs-list>
    </atomic-recs-interface>
  `,
  play: async (context) => {
    const recsInterface = context.canvasElement.querySelector('atomic-recs-interface');
    await recsInterface!.getRecommendations();
  },
};
```

## Common Patterns

### Custom Styling

```typescript
render: () => html`
  <style>
    .custom-layout { max-width: 1200px; margin: 0 auto; }
  </style>
  <div class="custom-layout">
    <!-- Interface here -->
  </div>
`,
```

### Empty State

```typescript
export const NoResults: Story = {
  beforeEach: () => {
    mockSearchApi.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
    }));
  },
};
```

## Checklist

- [ ] `layout: 'fullscreen'` in parameters
- [ ] `chromatic: {disableSnapshot: false}`
- [ ] Use rich responses
- [ ] Initialize interface in `play`
- [ ] Include error/empty states