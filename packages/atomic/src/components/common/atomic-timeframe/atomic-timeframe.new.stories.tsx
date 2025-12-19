import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface({
  includeCodeRoot: false,
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-timeframe',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-timeframe',
  title: 'Common/Timeframe',
  id: 'atomic-timeframe',

  render: (args) => html`
    <atomic-timeframe-facet id="code-root" field="date" label="Date">
      ${template(args)}
    </atomic-timeframe-facet>
  `,
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
  args: {
    ...args,
    unit: 'week',
    amount: 1,
    period: 'past',
  },
  argTypes: {
    ...argTypes,
    unit: {
      control: {type: 'select'},
      options: ['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'],
    },
    amount: {
      control: {type: 'number', min: 1},
    },
  },
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  args: {
    period: 'past',
    unit: 'week',
    amount: 1,
  },
  beforeEach: async () => {
    const now = Date.now();

    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if (!('results' in response)) return response;
      return {
        ...response,
        // biome-ignore lint/suspicious/noExplicitAny: Mock response type needs flexibility
        results: response.results.slice(0, 10).map((r: any, i: number) => ({
          ...r,
          raw: {
            ...r.raw,
            date: now - i * 24 * 60 * 60 * 1000, // Past dates: last 10 days
          },
        })),
        facets: [
          ...response.facets,
          {
            facetId: 'date',
            field: 'date',
            moreValuesAvailable: false,
            values: [
              {
                start: 'past-1-week',
                end: 'now',
                endInclusive: false,
                state: 'idle',
                numberOfResults: 7,
              },
            ],
          },
        ],
      };
    });
  },
};

export const WithPastPeriod: Story = {
  name: 'Past Timeframe',
  args: {
    period: 'past',
    unit: 'month',
    amount: 3,
  },
  beforeEach: async () => {
    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if (!('results' in response)) return response;
      return {
        ...response,
        // biome-ignore lint/suspicious/noExplicitAny: Mock response type needs flexibility
        results: response.results.slice(0, 10).map((r: any, i: number) => ({
          ...r,
          raw: {
            ...r.raw,
            date: now - i * oneMonth * 0.3, // Spread over last 3 months
          },
        })),
        facets: [
          ...response.facets,
          {
            facetId: 'date',
            field: 'date',
            moreValuesAvailable: false,
            values: [
              {
                start: 'past-3-month',
                end: 'now',
                endInclusive: false,
                state: 'idle',
                numberOfResults: 42,
              },
            ],
          },
        ],
      };
    });
  },
};

export const WithNextPeriod: Story = {
  name: 'Next Timeframe',
  args: {
    period: 'next',
    unit: 'year',
    amount: 1,
  },
  beforeEach: async () => {
    const now = Date.now();
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if (!('results' in response)) return response;
      return {
        ...response,
        // biome-ignore lint/suspicious/noExplicitAny: Mock response type needs flexibility
        results: response.results.slice(0, 10).map((r: any, i: number) => ({
          ...r,
          raw: {
            ...r.raw,
            date: now + (i + 1) * oneYear, // Future dates: 1-10 years from now
          },
        })),
        facets: [
          ...response.facets,
          {
            facetId: 'date',
            field: 'date',
            moreValuesAvailable: false,
            values: [
              {
                start: 'now',
                end: 'next-1-year',
                endInclusive: false,
                state: 'idle',
                numberOfResults: 5,
              },
            ],
          },
        ],
      };
    });
  },
};

export const WithCustomLabel: Story = {
  name: 'With Custom Label',
  args: {
    period: 'past',
    unit: 'month',
    amount: 6,
    label: 'Last Semester',
  },
  beforeEach: async () => {
    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if (!('results' in response)) return response;
      return {
        ...response,
        // biome-ignore lint/suspicious/noExplicitAny: Mock response type needs flexibility
        results: response.results.slice(0, 10).map((r: any, i: number) => ({
          ...r,
          raw: {
            ...r.raw,
            date: now - i * oneMonth * 0.6, // Spread over last 6 months
          },
        })),
        facets: [
          ...response.facets,
          {
            facetId: 'date',
            field: 'date',
            moreValuesAvailable: false,
            values: [
              {
                start: 'past-6-month',
                end: 'now',
                endInclusive: false,
                state: 'idle',
                numberOfResults: 28,
              },
            ],
          },
        ],
      };
    });
  },
};
