import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {testCheckboxA11y} from '@/storybook-utils/a11y/checkbox.js';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {MockSearchApi} from '@coveo/platform-mock-api/search/mock';
import {buildSearchResponseWithResults} from '@coveo/platform-mock-api/search/search-response-mocks';
import {
  searchFacetTransformer,
  searchFacetSearchTransformer,
} from '@coveo/platform-mock-api/search/facet-transformer';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-rating-facet/atomic-rating-facet.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';

const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint.addRequestTransformer(searchFacetTransformer);
searchApiHarness.facetSearchEndpoint.addRequestTransformer(searchFacetSearchTransformer);

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-rating-facet', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-rating-facet',
  title: 'Search/RatingFacet',
  id: 'atomic-rating-facet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
    actions: {
      handles: events,
    },
  },
  argTypes: {
    ...argTypes,
    'tabs-included': {
      control: {type: 'object'},
    },
    'tabs-excluded': {
      control: {type: 'object'},
    },
    'depends-on': {
      control: {type: 'object'},
    },
    'allowed-values': {
      control: {type: 'object'},
    },
  },

  play,
  args: {
    ...args,
    'number-of-values': 8,
    'tabs-included': '[]',
    'tabs-excluded': '[]',
    'allowed-values': '[]',
    'depends-on': '{}',
  },
};

export default meta;

export const Default: Story = {
  args: {
    field: 'snrating',
  },
  decorators: [facetDecorator],
};

export const DisplayAsLink: Story = {
  name: 'With display as link',
  tags: ['test'],
  args: {
    'display-values-as': 'link',
    field: 'snrating',
  },
  decorators: [facetDecorator],
};

export const A11yCheckbox: Story = {
  tags: ['a11y', 'test', '!dev'],
  args: {
    field: 'snrating',
  },
  decorators: [facetDecorator],
  play: async (context) => {
    await play(context);
    await testCheckboxA11y(context);
  },
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  args: {
    field: 'snrating',
  },
  decorators: [
    facetDecorator,
    (story) => html`<atomic-query-summary></atomic-query-summary>${story()}`,
  ],
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce(buildSearchResponseWithResults(120));
    searchApiHarness.searchEndpoint.mockOnce(buildSearchResponseWithResults(42));
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const [checkbox] = await within(context.canvasElement).findAllByShadowLabelText(
          'Inclusion filter on',
          {exact: false}
        );
        checkbox.click();
      },
      expectedText: 'Results loaded. Results 1-10 of 42',
      timeout: 5000,
    });
  },
};
