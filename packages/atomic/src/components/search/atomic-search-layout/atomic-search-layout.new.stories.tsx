import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-layout',
  {excludeCategories: ['methods']}
);
const meta: Meta = {
  component: 'atomic-search-layout',
  title: 'Search/Search Layout',
  id: 'atomic-search-layout',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  play,
  argTypes,
  args: {
    ...args,
    'default-slot': `<span>Layout content</span>`,
  },
};

export default meta;

export const Default: Story = {};
