import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic-storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-category-facet',
  title: 'Atomic/CategoryFacet',
  id: 'atomic-category-facet',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  argTypes: {
    'attributes-number-of-values': {
      name: 'number-of-values',
      control: {type: 'number', min: 1},
    },
  },
  args: {
    'attributes-number-of-values': 8,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-category-facet',
  args: {
    'attributes-field': 'geographicalhierarchy',
    'attributes-label': 'Geographical Hierarchy',
    'attributes-with-search': true,
    'attributes-number-of-values': 5,
    'attributes-sort-criteria': 'occurrences',
  },
};

export const LowFacetValues: Story = {
  tags: ['test'],
  args: {
    'attributes-field': 'geographicalhierarchy',
    'attributes-number-of-values': 2,
    'attributes-with-search': true,
  },
};
