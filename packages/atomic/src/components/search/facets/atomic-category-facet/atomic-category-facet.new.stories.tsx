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
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
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
