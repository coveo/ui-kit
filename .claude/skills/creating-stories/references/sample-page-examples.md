# Sample Page Story Examples

This document provides comprehensive examples for creating full sample page stories.

## Search Sample Pages

### Basic Search Page

```typescript
import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/search/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

async function initializeSearchInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = canvasElement.querySelector(
    'atomic-search-interface'
  );
  await searchInterface!.initialize(getSampleSearchEngineConfiguration());
}

const mockSearchApi = new MockSearchApi();

const meta: Meta = {
  component: 'search-page',
  title: 'Search/Example Pages',
  id: 'search-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mockSearchApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
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
            <atomic-facet field="source" label="Source"></atomic-facet>
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
    const searchInterface = context.canvasElement.querySelector(
      'atomic-search-interface'
    );
    await searchInterface!.executeFirstSearch();
  },
};

export default meta;

export const Default: Story = {
  name: 'Search Page',
};
```

### Advanced Search Page with All Features

```typescript
const meta: Meta = {
  // ... same as basic, but with more components in render
  render: () => html`
    <atomic-search-interface language-assets-path="./lang" icon-assets-path="./assets">
      <atomic-search-layout>
        <atomic-layout-section section="search">
          <atomic-search-box>
            <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
            <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
            <atomic-search-box-instant-results image-size="small"></atomic-search-box-instant-results>
          </atomic-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet-manager>
            <atomic-automatic-facet-generator desired-count="3"></atomic-automatic-facet-generator>
            <atomic-category-facet
              field="geographicalhierarchy"
              label="World Atlas"
              with-search
            ></atomic-category-facet>
            <atomic-facet field="author" label="Authors"></atomic-facet>
            <atomic-facet field="source" label="Source" display-values-as="link"></atomic-facet>
            <atomic-facet field="filetype" label="File Type" display-values-as="box"></atomic-facet>
            <atomic-numeric-facet
              field="ytviewcount"
              label="YouTube Views"
              with-input="integer"
            ></atomic-numeric-facet>
            <atomic-timeframe-facet label="Timeframe" with-date-picker>
              <atomic-timeframe unit="day"></atomic-timeframe>
              <atomic-timeframe unit="week"></atomic-timeframe>
              <atomic-timeframe unit="month"></atomic-timeframe>
            </atomic-timeframe-facet>
            <atomic-rating-facet
              field="snrating"
              label="Rating"
              number-of-intervals="5"
            ></atomic-rating-facet>
            <atomic-color-facet
              field="filetype"
              label="Files"
              number-of-values="6"
            ></atomic-color-facet>
          </atomic-facet-manager>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="horizontal-facets">
            <atomic-segmented-facet-scrollable>
              <atomic-segmented-facet field="objecttype" label="Object Type"></atomic-segmented-facet>
            </atomic-segmented-facet-scrollable>
          </atomic-layout-section>
          <atomic-layout-section section="status">
            <atomic-breadbox></atomic-breadbox>
            <atomic-query-summary></atomic-query-summary>
            <atomic-refine-toggle></atomic-refine-toggle>
            <atomic-sort-dropdown>
              <atomic-sort-expression label="Relevance" expression="relevancy"></atomic-sort-expression>
              <atomic-sort-expression label="Most Recent" expression="date descending"></atomic-sort-expression>
            </atomic-sort-dropdown>
            <atomic-did-you-mean></atomic-did-you-mean>
            <atomic-notifications></atomic-notifications>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-smart-snippet></atomic-smart-snippet>
            <atomic-smart-snippet-suggestions></atomic-smart-snippet-suggestions>
            <atomic-result-list display="list" density="normal" image-size="small">
              <atomic-result-template>
                <template>
                  <atomic-result-section-actions>
                    <atomic-quickview></atomic-quickview>
                  </atomic-result-section-actions>
                  <atomic-result-section-badges>
                    <atomic-result-badge icon="language-icon.svg">
                      <atomic-result-multi-value-text field="language"></atomic-result-multi-value-text>
                    </atomic-result-badge>
                  </atomic-result-section-badges>
                  <atomic-result-section-visual>
                    <atomic-result-image field="ytthumbnailurl"></atomic-result-image>
                  </atomic-result-section-visual>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-title-metadata>
                    <atomic-result-printable-uri></atomic-result-printable-uri>
                  </atomic-result-section-title-metadata>
                  <atomic-result-section-excerpt>
                    <atomic-result-text field="excerpt"></atomic-result-text>
                  </atomic-result-section-excerpt>
                  <atomic-result-section-bottom-metadata>
                    <atomic-result-fields-list>
                      <atomic-field-condition if-defined="author">
                        <atomic-result-multi-value-text field="author"></atomic-result-multi-value-text>
                      </atomic-field-condition>
                      <atomic-result-date format="ddd MMM D YYYY"></atomic-result-date>
                    </atomic-result-fields-list>
                  </atomic-result-section-bottom-metadata>
                </template>
              </atomic-result-template>
            </atomic-result-list>
            <atomic-query-error></atomic-query-error>
            <atomic-no-results></atomic-no-results>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-pager></atomic-pager>
            <atomic-results-per-page></atomic-results-per-page>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-search-layout>
    </atomic-search-interface>
  `,
};
```

## Commerce Sample Pages

### Commerce Search Page

```typescript
import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock.js';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/commerce/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

const mockCommerceApi = new MockCommerceApi();

async function initializeCommerceInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-commerce-interface');
  const commerceInterface = canvasElement.querySelector(
    'atomic-commerce-interface'
  );
  await commerceInterface!.initialize(getSampleCommerceEngineConfiguration());
}

const meta: Meta = {
  component: 'commerce-search-page',
  title: 'Commerce/Example Pages',
  id: 'commerce-search-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mockCommerceApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mockCommerceApi.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
  render: () => html`
    <atomic-commerce-interface type="search" language-assets-path="./lang" icon-assets-path="./assets">
      <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box>
            <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
            <atomic-commerce-search-box-instant-products image-size="small">
              <atomic-product-template>
                <template>
                  <atomic-product-section-name>
                    <atomic-product-link></atomic-product-link>
                  </atomic-product-section-name>
                  <atomic-product-section-visual>
                    <atomic-product-image field="ec_thumbnails"></atomic-product-image>
                  </atomic-product-section-visual>
                  <atomic-product-section-emphasized>
                    <atomic-product-price></atomic-product-price>
                  </atomic-product-section-emphasized>
                </template>
              </atomic-product-template>
            </atomic-commerce-search-box-instant-products>
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
            <atomic-commerce-refine-toggle></atomic-commerce-refine-toggle>
          </atomic-layout-section>
          <atomic-layout-section section="products">
            <atomic-commerce-product-list display="grid" density="compact" image-size="small">
              <atomic-product-template>
                <template>
                  <atomic-product-section-name>
                    <atomic-product-link></atomic-product-link>
                  </atomic-product-section-name>
                  <atomic-product-section-visual>
                    <atomic-product-image field="ec_thumbnails"></atomic-product-image>
                  </atomic-product-section-visual>
                  <atomic-product-section-metadata>
                    <atomic-product-text field="ec_brand"></atomic-product-text>
                    <atomic-product-rating field="ec_rating"></atomic-product-rating>
                  </atomic-product-section-metadata>
                  <atomic-product-section-emphasized>
                    <atomic-product-price currency="USD"></atomic-product-price>
                  </atomic-product-section-emphasized>
                  <atomic-product-section-children>
                    <atomic-product-children></atomic-product-children>
                  </atomic-product-section-children>
                </template>
              </atomic-product-template>
            </atomic-commerce-product-list>
            <atomic-commerce-query-error></atomic-commerce-query-error>
            <atomic-commerce-no-products></atomic-commerce-no-products>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-commerce-load-more-products></atomic-commerce-load-more-products>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    </atomic-commerce-interface>
  `,
  play: async (context) => {
    await initializeCommerceInterface(context.canvasElement);
    const commerceInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    await commerceInterface!.executeFirstRequest();
  },
};

export default meta;

export const Default: Story = {
  name: 'Commerce Search Page',
};
```

### Commerce Product Listing Page

```typescript
import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock.js';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/commerce/product-listing-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

const mockCommerceApi = new MockCommerceApi();

async function initializeCommerceInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-commerce-interface');
  const commerceInterface = canvasElement.querySelector(
    'atomic-commerce-interface'
  );
  await commerceInterface!.initialize({
    ...getSampleCommerceEngineConfiguration(),
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {
        url: 'https://example.com/category/electronics',
      },
    },
  });
}

const meta: Meta = {
  component: 'product-listing-page',
  title: 'Commerce/Example Pages',
  id: 'product-listing-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mockCommerceApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mockCommerceApi.productListingEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
  render: () => html`
    <atomic-commerce-interface type="product-listing" language-assets-path="./lang" icon-assets-path="./assets">
      <atomic-commerce-layout>
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
            <atomic-commerce-product-list display="grid">
              <atomic-product-template>
                <template>
                  <atomic-product-section-name>
                    <atomic-product-link></atomic-product-link>
                  </atomic-product-section-name>
                  <atomic-product-section-visual>
                    <atomic-product-image field="ec_thumbnails"></atomic-product-image>
                  </atomic-product-section-visual>
                  <atomic-product-section-emphasized>
                    <atomic-product-price></atomic-product-price>
                  </atomic-product-section-emphasized>
                </template>
              </atomic-product-template>
            </atomic-commerce-product-list>
            <atomic-commerce-no-products></atomic-commerce-no-products>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-commerce-load-more-products></atomic-commerce-load-more-products>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    </atomic-commerce-interface>
  `,
  play: async (context) => {
    await initializeCommerceInterface(context.canvasElement);
    const commerceInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    await commerceInterface!.executeFirstRequest();
  },
};

export default meta;

export const Default: Story = {
  name: 'Product Listing Page',
};
```

## Insight Sample Pages

```typescript
import {getSampleInsightEngineConfiguration} from '@coveo/headless/insight';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock.js';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/insight/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

async function initializeInsightInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-insight-interface');
  const insightInterface = canvasElement.querySelector(
    'atomic-insight-interface'
  );
  await insightInterface!.initialize(getSampleInsightEngineConfiguration());
}

const mockInsightApi = new MockInsightApi();

const meta: Meta = {
  component: 'insight-page',
  title: 'Insight/Example Pages',
  id: 'insight-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mockInsightApi.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
  render: () => html`
    <style>
      atomic-insight-interface:not([widget='false']) {
        width: 500px;
        height: 1000px;
        margin: auto;
        box-shadow: 0px 3px 24px 0px #0000001a;
      }
    </style>
    <atomic-insight-interface language-assets-path="./lang" icon-assets-path="./assets">
      <atomic-insight-full-search-button slot="full-search"></atomic-insight-full-search-button>
      <atomic-insight-layout>
        <atomic-layout-section section="search">
          <atomic-insight-search-box></atomic-insight-search-box>
          <atomic-insight-tabs>
            <atomic-insight-tab label="All" expression="" active></atomic-insight-tab>
            <atomic-insight-tab label="PDF" expression="@filetype==pdf"></atomic-insight-tab>
          </atomic-insight-tabs>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet-manager>
            <atomic-insight-facet field="source" label="Source"></atomic-insight-facet>
            <atomic-insight-facet field="filetype" label="File Type"></atomic-insight-facet>
          </atomic-facet-manager>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-insight-query-summary></atomic-insight-query-summary>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-insight-result-list>
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
            </atomic-insight-result-list>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-insight-layout>
    </atomic-insight-interface>
  `,
  play: async (context) => {
    await initializeInsightInterface(context.canvasElement);
    const insightInterface = context.canvasElement.querySelector(
      'atomic-insight-interface'
    );
    await insightInterface!.executeFirstSearch();
  },
};

export default meta;

export const Default: Story = {
  name: 'Insight Page',
};
```

## Recommendations Sample Pages

```typescript
import {getSampleRecommendationEngineConfiguration} from '@coveo/headless/recommendation';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockRecommendationApi} from '@/storybook-utils/api/recommendation/mock.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

async function initializeRecsInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-recs-interface');
  const recsInterface = canvasElement.querySelector('atomic-recs-interface');
  await recsInterface!.initialize(getSampleRecommendationEngineConfiguration());
}

const mockRecommendationApi = new MockRecommendationApi();

const meta: Meta = {
  component: 'recs-page',
  title: 'Recommendations/Example Pages',
  id: 'recs-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mockRecommendationApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  render: () => html`
    <style>
      .recs-layout {
        padding: 20px;
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 30px;
      }
      .recs-tiles {
        --atomic-recs-number-of-columns: 4;
      }
    </style>
    <div class="recs-layout">
      <atomic-recs-interface
        class="recs-tiles"
        language-assets-path="./lang"
        icon-assets-path="./assets"
      >
        <atomic-recs-list label="Recommended for you" display="grid" number-of-recommendations="8">
          <atomic-recs-result-template>
            <template>
              <atomic-result-section-visual>
                <atomic-result-image field="ec_thumbnails"></atomic-result-image>
              </atomic-result-section-visual>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
            </template>
          </atomic-recs-result-template>
        </atomic-recs-list>
      </atomic-recs-interface>
    </div>
  `,
  play: async (context) => {
    await initializeRecsInterface(context.canvasElement);
    const recsInterface = context.canvasElement.querySelector(
      'atomic-recs-interface'
    );
    await recsInterface!.getRecommendations();
  },
};

export default meta;

export const Default: Story = {
  name: 'Recommendations Page',
};
```

## Common Sample Page Patterns

### Custom Styling in Sample Pages

Add `<style>` tags within the render function for page-specific styling:

```typescript
render: () => html`
  <style>
    .custom-layout {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    atomic-search-interface::part(container) {
      background-color: #f5f5f5;
    }
  </style>
  <div class="custom-layout">
    <atomic-search-interface>
      <!-- Components here -->
    </atomic-search-interface>
  </div>
`,
```

### Multiple Story Variants for Sample Pages

```typescript
export const Default: Story = {
  name: 'Full Page',
};

export const Minimal: Story = {
  name: 'Minimal Page',
  render: () => html`
    <!-- Simplified version with fewer components -->
  `,
};

export const NoResults: Story = {
  name: 'Empty State Page',
  beforeEach: () => {
    mockSearchApi.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
    }));
  },
};
```

### Integration Configuration Variations

```typescript
export const CustomConfiguration: Story = {
  name: 'With Custom Configuration',
  play: async (context) => {
    await customElements.whenDefined('atomic-search-interface');
    const searchInterface = context.canvasElement.querySelector(
      'atomic-search-interface'
    );
    await searchInterface!.initialize({
      ...getSampleSearchEngineConfiguration(),
      preprocessRequest: (request) => {
        // Custom preprocessing
        return request;
      },
    });
    await searchInterface!.executeFirstSearch();
  },
};
```

## Tips for Sample Pages

1. **Always use `layout: 'fullscreen'`** in parameters for sample pages
2. **Enable Chromatic snapshots** with `chromatic: {disableSnapshot: false}`
3. **Use rich responses** for realistic data: `richResponse as unknown as typeof baseResponse`
4. **Initialize interfaces properly** in `play` function
5. **Include error states** with `<atomic-query-error>` or `<atomic-no-results>`
6. **Style widget-style interfaces** when needed (e.g., Insight pages)
7. **Test multiple layouts** (grid, list, custom) in different stories
