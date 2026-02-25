import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  facetDecorator,
  withBreadboxDecorator,
  withRegularFacet,
} from '@/storybook-utils/common/facets-decorator';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockInsightApi = new MockInsightApi();

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

mockInsightApi.searchEndpoint.mock((response) => ({
  ...response,
  facets: [
    createDateFacetResponse(baseDateFacetValues),
    createDateFacetResponse(baseDateFacetValues, {
      facetId: 'date_input_range',
    }),
  ],
}));

const mockDefaultFacetResponse = () => {
  mockInsightApi.searchEndpoint.mockOnce((response) => ({
    ...response,
    facets: [
      createDateFacetResponse(baseDateFacetValues),
      createDateFacetResponse(baseDateFacetValues, {
        facetId: 'date_input_range',
      }),
    ],
  }));
};

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-timeframe-facet',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-timeframe-facet',
  title: 'Insight/Facet (Timeframe)',
  id: 'atomic-insight-timeframe-facet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockInsightApi.handlers]},
  },
  argTypes: {
    ...argTypes,
    'depends-on': {
      control: {type: 'object'},
    },
  },
  beforeEach: () => {
    mockInsightApi.searchEndpoint.clear();
  },
  play,
  args: {
    ...args,
    'depends-on': '{}',
  },
};

export default meta;

export const Default: Story = {
  decorators: [facetDecorator],
  args: {
    field: 'date',
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
    mockDefaultFacetResponse();
  },
};

export const WithSelectedValue: Story = {
  name: 'With Selected Value',
  tags: ['test'],
  decorators: [facetDecorator],
  args: {
    field: 'date',
    label: 'Date',
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
    mockInsightApi.searchEndpoint.mockOnce((response) => ({
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
  tags: ['test'],
  decorators: [facetDecorator, withBreadboxDecorator('before')],
  args: {
    field: 'date',
    label: 'Date',
    'with-date-picker': true,
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
    mockDefaultFacetResponse();
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
    field: 'date',
    label: 'Timeframe (Dependent facet)',
    'with-date-picker': true,
    'depends-on-filetype': 'YouTubeVideo',
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
    mockInsightApi.searchEndpoint.mock((response) => ({
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
    await customElements.whenDefined('atomic-insight-facet');
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
  decorators: [facetDecorator],
  args: {
    field: 'date',
    label: 'Date',
    'is-collapsed': true,
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
    mockDefaultFacetResponse();
  },
};
