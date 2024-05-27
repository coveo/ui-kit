import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-segmented-facet',
  title: 'Atomic/SegmentedFacet',
  id: 'atomic-segmented-facet',

  render: renderComponent,
  decorators: [decorator],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'atomic-segmented-facet',
  args: {
    field: 'objecttype',
    label: 'Object Type',
  },
};
