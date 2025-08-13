import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-facet', {
  excludeCategories: ['methods'],
});

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
  argTypes,

  play,
  args: {
    ...args,
    numberOfValues: 8,
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
    numberOfValues: 2,
  },
  decorators: [facetDecorator],
};

export const monthFacet: Story = {
  tags: ['test'],
  args: {
    field: 'month',
    label: 'Month',
    numberOfValues: 2,
  },
  decorators: [facetDecorator],
};

export const CustomSort: Story = {
  tags: ['test'],
  args: {
    field: 'cat_available_sizes',
    customSort: '["XL", "L", "M", "S"]',
    sortCriteria: 'alphanumeric',
    numberOfValues: 4,
  },
  decorators: [
    facetDecorator,
    (_Story, context) => {
      return html`<atomic-facet
        field=${context.args['field']}
        custom-sort=${context.args['customSort']}
        sort-criteria=${context.args['sortCriteria']}
        number-of-values=${context.args['numberOfValues']}
      ></atomic-facet>`;
    },
  ],
};
