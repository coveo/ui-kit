import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
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
