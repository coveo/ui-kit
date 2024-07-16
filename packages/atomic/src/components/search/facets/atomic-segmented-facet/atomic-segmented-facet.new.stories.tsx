import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-segmented-facet',
  title: 'Atomic/SegmentedFacet',
  id: 'atomic-segmented-facet',
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
  name: 'atomic-segmented-facet',
  args: {
    'attributes-field': 'objecttype',
    'attributes-label': 'Object Type',
  },
};
