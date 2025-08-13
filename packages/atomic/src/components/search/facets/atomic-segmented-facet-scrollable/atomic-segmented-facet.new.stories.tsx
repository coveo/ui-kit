import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-segmented-facet-scrollable',
  title: 'Search/SegmentedFacet/SegmentedFacetScrollable',
  id: 'atomic-segmented-facet-scrollable',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-segmented-facet-scrollable',
  args: {
    'slots-default': `
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
