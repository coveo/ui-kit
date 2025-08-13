import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-segmented-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-segmented-facet-scrollable',
  title: 'Atomic/SegmentedFacet/SegmentedFacetScrollable',
  id: 'atomic-segmented-facet-scrollable',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

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
