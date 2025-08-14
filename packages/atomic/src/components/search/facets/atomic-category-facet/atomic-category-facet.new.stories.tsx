import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-category-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-category-facet',
  title: 'Atomic/CategoryFacet',
  id: 'atomic-category-facet',
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
  name: 'atomic-category-facet',
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true,
    'number-of-values': 5,
    'sort-criteria': 'occurrences',
  },
};

export const LowFacetValues: Story = {
  tags: ['test'],
  args: {
    field: 'geographicalhierarchy',
    'number-of-values': 2,
    'with-search': true,
  },
};
