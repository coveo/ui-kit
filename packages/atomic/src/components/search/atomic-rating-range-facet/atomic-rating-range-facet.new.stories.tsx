import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {buildSearchResponseWithResults} from '@/storybook-utils/api/search/search-response-mocks';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';
import '@/src/components/search/atomic-rating-range-facet/atomic-rating-range-facet.js';

const mockSearchApi = new MockSearchApi();

const ratingRangeFacetValues = [
  {
    start: 4,
    end: 5,
    endInclusive: true,
    state: 'idle',
    numberOfResults: 57,
  },
  {
    start: 3,
    end: 4,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 36,
  },
  {
    start: 2,
    end: 3,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 19,
  },
  {
    start: 1,
    end: 2,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 8,
  },
];

const mockRatingRangeFacetResponseWithResults = (totalCount: number) => {
  mockSearchApi.searchEndpoint.mockOnce((response) => {
    const responseWithResults =
      buildSearchResponseWithResults(totalCount)(response);
    if ('facets' in responseWithResults) {
      return {
        ...responseWithResults,
        facets: [
          ...(responseWithResults.facets || []),
          {
            facetId: 'snrating',
            field: 'snrating',
            moreValuesAvailable: false,
            values: ratingRangeFacetValues,
            indexScore: 0.23,
            domain: {start: 1, end: 5},
          },
        ],
      };
    }
    return responseWithResults;
  });
};

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-rating-range-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-rating-range-facet',
  title: 'Search/RatingRangeFacet',
  id: 'atomic-rating-range-facet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockSearchApi.handlers]},
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
  beforeEach: async () => {
    mockSearchApi.clearAll();
  },
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
  name: 'atomic-rating-range-facet',
  args: {
    field: 'snrating',
  },
  decorators: [facetDecorator],
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  args: {
    field: 'snrating',
    label: 'Rating',
  },
  decorators: [
    facetDecorator,
    (story) => html`<atomic-query-summary></atomic-query-summary>${story()}`,
  ],
  beforeEach: () => {
    mockRatingRangeFacetResponseWithResults(120);
    mockRatingRangeFacetResponseWithResults(42);
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const buttons = await canvas.findAllByShadowLabelText(
          /Inclusion filter on/,
          {exact: false}
        );
        buttons[0].click();
      },
      expectedText: 'Results loaded. Results 1-10 of 42',
      timeout: 5000,
    });
  },
};
