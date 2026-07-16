import type {FacetSortCriterion} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {userEvent} from 'storybook/test';
import {testCheckboxA11y} from '@/storybook-utils/a11y/checkbox.js';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {testDisclosureA11y} from '@/storybook-utils/a11y/disclosure.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {MockSearchApi} from '@coveo/platform-mock-api/search/mock';
import {buildSearchResponseWithResults} from '@coveo/platform-mock-api/search/search-response-mocks';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';
import {
  searchFacetTransformer,
  searchFacetSearchTransformer,
} from '@coveo/platform-mock-api/search/facet-transformer';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-facet/atomic-facet.js';

const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint.addRequestTransformer(searchFacetTransformer);
searchApiHarness.facetSearchEndpoint.addRequestTransformer(
  searchFacetSearchTransformer
);

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
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
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

export const A11yCheckbox: Story = {
  tags: ['a11y', 'test', '!dev'],
  args: {
    field: 'objecttype',
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
    field: 'objecttype',
  },
  decorators: [
    facetDecorator,
    (story) => html`<atomic-query-summary></atomic-query-summary>${story()}`,
  ],
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce(
      buildSearchResponseWithResults(120)
    );
    searchApiHarness.searchEndpoint.mockOnce(
      buildSearchResponseWithResults(42)
    );
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const [checkbox] = await within(
          context.canvasElement
        ).findAllByShadowLabelText('Inclusion filter on', {exact: false});
        checkbox.click();
      },
      expectedText: 'Results loaded. Results 1-10 of 42',
      timeout: 5000,
    });
  },
};

export const A11yDisclosure: Story = {
  tags: ['a11y', 'test', '!dev'],
  parameters: {
    a11y: {
      options: {
        rules: {'color-contrast': {enabled: false}},
      },
    },
  },
  args: {
    field: 'objecttype',
  },
  decorators: [facetDecorator],
  play: async (context) => {
    await play(context);
    await testDisclosureA11y(context, {
      trigger: {expanded: true},
    });
  },
};

export const A11yFacetSearchNoResults: Story = {
  name: 'A11y Facet Search No Results',
  tags: ['a11y', 'test', '!dev'],
  args: {
    field: 'objecttype',
    label: 'Object Type',
    decorators: [facetDecorator],
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async (canvasElement) => {
        const input = await within(canvasElement).findByShadowLabelText(
          'Search for values in',
          {exact: false}
        );
        await userEvent.type(input, 'zzz');
      },
      expectedText: '0 values found in the Object Type facet',
      timeout: 5000,
    });
  },
};
