import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-segmented-facet-scrollable',
  title: 'Atomic/SegmentedFacet/SegmentedFacetScrollable',
  id: 'atomic-segmented-facet-scrollable',

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
  name: 'atomic-segmented-facet-scrollable',
  args: {
    default: `
    <atomic-segmented-facet
      field="source"
      label="Sources"
      number-of-values="10"
    ></atomic-segmented-facet>
    <atomic-segmented-facet
      field="filetype"
      label="File types"
      number-of-values="10"
    ></atomic-segmented-facet>`,
  },
};
