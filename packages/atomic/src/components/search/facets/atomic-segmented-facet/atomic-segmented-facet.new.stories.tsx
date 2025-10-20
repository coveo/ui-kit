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
  component: 'atomic-segmented-facet',
  title: 'Search/SegmentedFacet',
  id: 'atomic-segmented-facet',
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
    'number-of-values': 8,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-segmented-facet',
  args: {
    field: 'objecttype',
    label: 'Object Type',
  },
};
