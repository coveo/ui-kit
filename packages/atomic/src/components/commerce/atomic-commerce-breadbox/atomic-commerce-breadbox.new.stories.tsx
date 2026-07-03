import {
  type CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-breadbox/atomic-commerce-breadbox.js';
import '@/src/components/commerce/atomic-commerce-facets/atomic-commerce-facets.js';
import {MockCommerceApi} from '@coveo/platform-mock-api/commerce/mock';
import {
  commerceFacetTransformer,
  createFacetSearchTransformer,
} from '@coveo/platform-mock-api/commerce/facet-transformer';
import {commercePaginationTransformer} from '@coveo/platform-mock-api/commerce/pagination-transformer';
import {richResponse as baseSearchResponse} from '@coveo/platform-mock-api/commerce/search-response';

const commerceApiHarness = new MockCommerceApi();
commerceApiHarness.searchEndpoint.addRequestTransformer(
  commerceFacetTransformer,
  commercePaginationTransformer
);
commerceApiHarness.productListingEndpoint.addRequestTransformer(
  commerceFacetTransformer,
  commercePaginationTransformer
);
commerceApiHarness.facetSearchEndpoint.addRequestTransformer(
  createFacetSearchTransformer(baseSearchResponse)
);

// Use shorter Brand values so breadcrumbs fit at narrow viewports (640px)
commerceApiHarness.productListingEndpoint.mock(
  (response) =>
    ({
      ...response,
      facets: response.facets.map((facet) =>
        facet.facetId === 'ec_brand'
          ? {
              ...facet,
              values: [
                {state: 'idle', numberOfResults: 14, value: 'NRS'},
                {state: 'idle', numberOfResults: 9, value: 'BRP'},
                {state: 'idle', numberOfResults: 7, value: 'Fox'},
                {
                  state: 'idle',
                  numberOfResults: 27,
                  value: 'Coast Guard and Co',
                },
                {state: 'idle', numberOfResults: 4, value: 'Wax and More'},
                {state: 'idle', numberOfResults: 1, value: 'Aqua Marina'},
                {state: 'idle', numberOfResults: 1, value: 'Lockit'},
                {state: 'idle', numberOfResults: 1, value: 'Surf and Co'},
              ],
            }
          : facet
      ),
    }) as typeof response
);

const {context, ...restOfConfiguration} =
  getSampleCommerceEngineConfiguration();

const productListingEngineConfiguration: Partial<CommerceEngineConfiguration> =
  {
    context: {
      ...context,
      country: 'US',
      currency: 'USD',
      language: 'en',
      view: {
        url: `${context.view.url}/browse/promotions/ui-kit-testing`,
      },
    },
    ...restOfConfiguration,
  };

const {decorator, play} = wrapInCommerceInterface({
  engineConfig: productListingEngineConfiguration,
  type: 'product-listing',
  includeCodeRoot: false,
});

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-breadbox',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-breadbox',
  title: 'Commerce/Breadbox',
  id: 'atomic-commerce-breadbox',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...commerceApiHarness.handlers],
    },
    chromatic: {disableSnapshot: true},
    layout: 'fullscreen',
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
  beforeEach: () => {
    commerceApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {
  decorators: [
    (story) => html`
      <div id="code-root">${story()}</div>
      <div style="margin:20px 0">
        Select facet value(s) to see the Breadbox component.
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-commerce-facets collapse-facets-after="-1">
        </atomic-commerce-facets>
      </div>
    `,
  ],
};
