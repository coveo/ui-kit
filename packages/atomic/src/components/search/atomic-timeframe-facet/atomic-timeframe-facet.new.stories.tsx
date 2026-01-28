import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  facetDecorator,
  withBreadboxDecorator,
  withRegularFacet,
} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

const baseDateFacetValues = [
  {
    start: 'past-1-hour',
    end: 'now',
    state: 'idle',
    numberOfResults: 12,
    endInclusive: false,
  },
  {
    start: 'past-1-day',
    end: 'now',
    state: 'idle',
    numberOfResults: 45,
    endInclusive: false,
  },
  {
    start: 'past-1-week',
    end: 'now',
    state: 'idle',
    numberOfResults: 87,
    endInclusive: false,
  },
  {
    start: 'past-1-month',
    end: 'now',
    state: 'idle',
    numberOfResults: 234,
    endInclusive: false,
  },
  {
    start: 'past-3-months',
    end: 'now',
    state: 'idle',
    numberOfResults: 456,
    endInclusive: false,
  },
  {
    start: 'past-1-year',
    end: 'now',
    state: 'idle',
    numberOfResults: 1234,
    endInclusive: false,
  },
];

const createDateFacetResponse = (
  values: typeof baseDateFacetValues,
  {
    moreValuesAvailable = false,
    facetId = 'date',
    field = 'date',
  }: {
    moreValuesAvailable?: boolean;
    facetId?: string;
    field?: string;
  } = {}
) => ({
  facetId,
  field,
  moreValuesAvailable,
  values,
  label: 'Date',
});

const {decorator, play} = wrapInSearchInterface();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-timeframe-facet',
  {
    excludeCategories: ['methods'],
  }
);

const meta: Meta = {
  component: 'atomic-timeframe-facet',
  title: 'Search/Facet (Timeframe)',
  id: 'atomic-timeframe-facet',
  render: (args) => template(args),
  decorators: [facetDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  args,
  argTypes,
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  args: {
    'default-slot': `
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `,
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      facets: [
        createDateFacetResponse(baseDateFacetValues),
        createDateFacetResponse(baseDateFacetValues, {
          facetId: 'date_input_range',
        }),
      ],
    }));
  },
};

export const WithSelectedValue: Story = {
  name: 'With Selected Value',
  args: {
    'default-slot': `
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `,
  },
  beforeEach: () => {
    const selectedValues = baseDateFacetValues.map((v) =>
      v.start === 'past-1-month' ? {...v, state: 'selected'} : v
    );
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      facets: [
        createDateFacetResponse(selectedValues),
        createDateFacetResponse(baseDateFacetValues, {
          facetId: 'date_input_range',
        }),
      ],
    }));
  },
};

export const WithDatePicker: Story = {
  name: 'With Date Picker',
  args: {
    'default-slot': `
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `,
    'with-date-picker': true,
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      facets: [
        createDateFacetResponse(baseDateFacetValues),
        createDateFacetResponse(baseDateFacetValues, {
          facetId: 'date_input_range',
        }),
      ],
    }));
  },
};

export const WithDependsOn: Story = {
  name: 'With Depends On',
  tags: ['test'],
  decorators: [withRegularFacet('before'), withBreadboxDecorator('before')],
  argTypes: {
    'depends-on-filetype': {
      name: 'depends-on-filetype',
      control: {type: 'text'},
    },
  },
  args: {
    'default-slot': `
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `,
    label: 'Timeframe (Dependent facet)',
    'with-date-picker': true,
    'depends-on-filetype': 'YouTubeVideo',
  },
  beforeEach: () => {
    // Pre-select YouTubeVideo in the filetype facet to trigger the dependency
    // Use .mock() instead of .mockOnce() to ensure it works in docs page
    searchApiHarness.searchEndpoint.mock((response) => ({
      ...response,
      facets: [
        createDateFacetResponse(baseDateFacetValues),
        createDateFacetResponse(baseDateFacetValues, {
          facetId: 'date_input_range',
        }),
        {
          facetId: 'filetype',
          field: 'filetype',
          moreValuesAvailable: true,
          values: [
            {value: 'YouTubeVideo', state: 'selected', numberOfResults: 62734},
            {value: 'pdf', state: 'idle', numberOfResults: 38398},
            {value: 'html', state: 'idle', numberOfResults: 26879},
          ],
        },
      ],
    }));
  },
  play: async (context) => {
    //TODO: Fix component registration race condition #6480
    await customElements.whenDefined('atomic-facet');
    await play(context);
    const {canvas, step} = context;
    await step('Select YouTubeVideo in filetype facet', async () => {
      const button = await canvas.findByShadowLabelText(
        'Inclusion filter on YouTubeVideo',
        {exact: false}
      );
      button.ariaChecked === 'false' ? button.click() : null;
    });
  },
};

export const Collapsed: Story = {
  name: 'Collapsed',
  args: {
    'default-slot': `
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `,
    'is-collapsed': true,
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      facets: [
        createDateFacetResponse(baseDateFacetValues),
        createDateFacetResponse(baseDateFacetValues, {
          facetId: 'date_input_range',
        }),
      ],
    }));
  },
};
