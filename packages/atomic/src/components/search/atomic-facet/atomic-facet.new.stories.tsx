import type {FacetSortCriterion} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {testInteractiveA11y} from '@/storybook-utils/a11y/';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-facet', {
  excludeCategories: ['methods'],
});

const sortCriteriaOptions: FacetSortCriterion[] = [
  'alphanumeric',
  'alphanumericDescending',
  'alphanumericNatural',
  'alphanumericNaturalDescending',
  'automatic',
  'occurrences',
  'score',
];

const meta: Meta = {
  component: 'atomic-facet',
  title: 'Search/Facet',
  id: 'atomic-facet',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
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
    'custom-sort': {
      control: {type: 'object'},
    },
    'allowed-values': {
      control: {type: 'object'},
    },
    'sort-criteria': {
      control: 'select',
      options: sortCriteriaOptions,
      type: 'string',
    },
  },

  play,
  args: {
    ...args,
    'number-of-values': 8,
    'tabs-included': '[]',
    'tabs-excluded': '[]',
    'allowed-values': '[]',
    'custom-sort': '[]',
    'depends-on': '{}',
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-facet',
  args: {
    field: 'objecttype',
  },
  decorators: [facetDecorator],
};

export const LowFacetValues: Story = {
  tags: ['test'],
  args: {
    field: 'objecttype',
    'number-of-values': 2,
  },
  decorators: [facetDecorator],
};

export const monthFacet: Story = {
  tags: ['test'],
  args: {
    field: 'month',
    label: 'Month',
    'number-of-values': 2,
  },
  decorators: [facetDecorator],
};

export const CustomSort: Story = {
  tags: ['test'],
  args: {
    field: 'cat_available_sizes',
    'custom-sort': '["XL", "L", "M", "S"]',
    'sort-criteria': 'alphanumeric',
    'number-of-values': 4,
  },
  decorators: [
    facetDecorator,
    (_Story, context) => {
      return html`<atomic-facet
        field=${context.args.field}
        custom-sort=${context.args['custom-sort']}
        sort-criteria=${context.args['sort-criteria']}
        number-of-values=${context.args['number-of-values']}
      ></atomic-facet>`;
    },
  ],
};

export const A11yInteraction: Story = {
  tags: ['!dev'],
  parameters: {msw: {handlers: [...mockSearchApi.handlers]}},
  args: {field: 'objecttype'},
  decorators: [facetDecorator],
  beforeEach: () => {
    mockSearchApi.searchEndpoint.mock((response) => ({
      ...response,
      facets: [
        ...(response.facets || []),
        {
          facetId: 'objecttype',
          field: 'objecttype',
          moreValuesAvailable: true,
          values: [
            {value: 'People', state: 'idle', numberOfResults: 126786},
            {value: 'Contact', state: 'idle', numberOfResults: 179426},
            {value: 'Variant', state: 'idle', numberOfResults: 30827},
            {value: 'Message', state: 'idle', numberOfResults: 26868},
          ],
          indexScore: 0.089,
          label: 'Object type',
        },
      ],
    }));
  },
  play: async (context) => {
    await play(context);
    await testInteractiveA11y(context, {
      expandCollapse: {role: 'button', expanded: true},
      activatableButtons: [{name: /show more/i}],
      textInput: {role: 'textbox'},
    });
  },
};
