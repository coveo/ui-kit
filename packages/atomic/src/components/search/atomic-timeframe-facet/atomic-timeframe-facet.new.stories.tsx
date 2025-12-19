import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html, unsafeStatic} from 'lit/static-html.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  facetDecorator,
  withBreadboxDecorator,
  withFacetContainer,
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
  {moreValuesAvailable = false}: {moreValuesAvailable?: boolean} = {}
) => ({
  facetId: 'date',
  field: 'date',
  moreValuesAvailable,
  values,
  label: 'Date',
});

const mockDefaultDateFacetResponse = () => {
  searchApiHarness.searchEndpoint.mockOnce((response) => {
    if ('facets' in response) {
      return {
        ...response,
        facets: [
          ...(response.facets || []),
          createDateFacetResponse(baseDateFacetValues),
        ],
      };
    }
    return response;
  });
};

const {decorator, play} = wrapInSearchInterface();

const {events, args, argTypes} = getStorybookHelpers('atomic-timeframe-facet', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-timeframe-facet',
  title: 'Search/TimeframeFacet',
  id: 'atomic-timeframe-facet',
  render: (args) => {
    const {'default-slot': slot, ...props} = args;

    // Build attribute string from props
    const attributes = Object.entries(props)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? key : '';
        }
        return `${key}="${value}"`;
      })
      .filter(Boolean)
      .join(' ');

    const tag = unsafeStatic(`atomic-timeframe-facet ${attributes}`);
    return html`<${tag}>${slot}</${unsafeStatic('atomic-timeframe-facet')}>`;
  },
  decorators: [facetDecorator, withFacetContainer, decorator],
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
  name: 'atomic-timeframe-facet',
  args: {
    'default-slot': html`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `,
  },
  beforeEach: () => {
    mockDefaultDateFacetResponse();
  },
};

export const WithSelectedValue: Story = {
  name: 'With Selected Value',
  beforeEach: () => {
    const selectedValues = baseDateFacetValues.map((v) =>
      v.start === 'past-1-month' ? {...v, state: 'selected'} : v
    );
    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if ('facets' in response) {
        return {
          ...response,
          facets: [
            ...(response.facets || []),
            createDateFacetResponse(selectedValues),
          ],
        };
      }
      return response;
    });
  },
};

export const WithDatePicker: Story = {
  name: 'With Date Picker',
  args: {
    'with-date-picker': true,
  },
  beforeEach: () => {
    mockDefaultDateFacetResponse();
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
    label: 'Timeframe (Dependent facet)',
    'with-date-picker': true,
    'depends-on-filetype': 'YouTubeVideo',
  },
  beforeEach: () => {
    mockDefaultDateFacetResponse();
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
    'is-collapsed': true,
  },
  beforeEach: () => {
    mockDefaultDateFacetResponse();
  },
};

export const NoResults: Story = {
  name: 'No Results',
  beforeEach: () => {
    const noResultValues = baseDateFacetValues.map((v) => ({
      ...v,
      numberOfResults: 0,
      state: 'idle',
    }));
    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if ('facets' in response) {
        return {
          ...response,
          facets: [
            ...(response.facets || []),
            createDateFacetResponse(noResultValues),
          ],
        };
      }
      return response;
    });
  },
};
