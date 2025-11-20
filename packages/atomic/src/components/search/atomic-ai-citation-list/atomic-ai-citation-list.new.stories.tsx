import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-ai-citation-list',
  {
    excludeCategories: ['methods'],
  }
);

const meta: Meta = {
  component: 'atomic-ai-citation-list',
  title: 'Search/AICitationList',
  id: 'atomic-ai-citation-list',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
  },
  argTypes,
  // play,
  play: async (storyContext) => {
    await play(storyContext);
  },
};

export default meta;

export const Default: Story = {
  args: {},
};
