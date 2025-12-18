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

const mockSearchApi = new MockSearchApi();

const numericFacetValues = [
  {
    start: 0,
    end: 880000,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 59362,
  },
  {
    start: 880000,
    end: 1760000,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 1974,
  },
  {
    start: 1760000,
    end: 2640000,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 638,
  },
  {
    start: 2640000,
    end: 3520000,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 317,
  },
  {
    start: 3520000,
    end: 4400000,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 170,
  },
  {
    start: 4400000,
    end: 6160000,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 91,
  },
  {
    start: 6160000,
    end: 11440000,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 115,
  },
  {
    start: 11440000,
    end: 70400000,
    endInclusive: true,
    state: 'idle',
    numberOfResults: 67,
  },
];

mockSearchApi.searchEndpoint.mock((response) => ({
  ...response,
  facets: [
    {
      facetId: 'ytviewcount',
      field: 'ytviewcount',
      moreValuesAvailable: false,
      values: numericFacetValues,
      indexScore: 0.23,
      domain: {start: 8, end: 70261098},
    },
    {
      facetId: 'ytviewcount_input_range',
      field: 'ytviewcount',
      moreValuesAvailable: false,
      values: [
        {
          start: 0,
          end: 100000000,
          endInclusive: true,
          state: 'idle',
          numberOfResults: 500,
        },
      ],
      indexScore: 0.23,
      domain: {start: 8, end: 70261098},
    },
    {
      facetId: 'filetype',
      field: 'filetype',
      moreValuesAvailable: true,
      values: [
        {value: 'YouTubeVideo', state: 'idle', numberOfResults: 62734},
        {value: 'pdf', state: 'idle', numberOfResults: 38398},
        {value: 'html', state: 'idle', numberOfResults: 26879},
      ],
    },
  ],
}));

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-numeric-facet',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-numeric-facet',
  title: 'Search/Facet (Numeric)',
  id: 'atomic-numeric-facet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  argTypes: {
    ...argTypes,
    'depends-on': {
      control: {type: 'object'},
    },
    'tabs-included': {
      control: {type: 'object'},
    },
    'tabs-excluded': {
      control: {type: 'object'},
    },
  },
  beforeEach: () => {
    mockSearchApi.searchEndpoint.clear();
  },
  play,
  args: {
    ...args,
    'number-of-values': 8,
    'tabs-included': '[]',
    'tabs-excluded': '[]',
    'depends-on': '{}',
  },
};

export default meta;

export const Default: Story = {
  decorators: [facetDecorator],
  args: {
    field: 'ytviewcount',
  },
};

export const WithInputInteger: Story = {
  name: 'With Input (Integer)',
  tags: ['test'],
  decorators: [facetDecorator, withBreadboxDecorator('before')],
  args: {
    label: 'YouTube View Count',
    field: 'ytviewcount',
    'with-input': 'integer',
  },
};

export const WithDependsOn: Story = {
  name: 'With Depends On',
  tags: ['test'],
  decorators: [withRegularFacet('before'), withBreadboxDecorator('before')],
  args: {
    label: 'YouTube View Count (Dependent facet)',
    field: 'ytviewcount',
    'with-input': 'integer',
    'depends-on-filetype': 'YouTubeVideo',
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

export const DisplayAsLink: Story = {
  name: 'Display As Link',
  decorators: [facetDecorator],
  args: {
    field: 'ytviewcount',
    label: 'YouTube View Count',
    'display-values-as': 'link',
  },
};

export const Collapsed: Story = {
  decorators: [facetDecorator],
  args: {
    field: 'ytviewcount',
    label: 'YouTube View Count',
    'is-collapsed': true,
  },
};

export const WithSelectedValue: Story = {
  name: 'With Selected Value',
  tags: ['test'],
  decorators: [facetDecorator],
  args: {
    field: 'ytviewcount',
    label: 'YouTube View Count',
  },
  beforeEach: () => {
    const selectedValues = numericFacetValues.map((v, i) =>
      i === 0 ? {...v, state: 'selected'} : v
    );
    mockSearchApi.searchEndpoint.mockOnce((response) => ({
      ...response,
      facets: [
        {
          facetId: 'ytviewcount',
          field: 'ytviewcount',
          moreValuesAvailable: false,
          values: selectedValues,
          indexScore: 0.23,
          domain: {start: 8, end: 70261098},
        },
      ],
    }));
  },
};
