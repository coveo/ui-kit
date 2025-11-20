import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-ai-conversation',
  {
    excludeCategories: ['methods'],
  }
);

const meta: Meta = {
  component: 'atomic-ai-conversation',
  title: 'Search/AIConversation',
  id: 'atomic-ai-conversation',

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
    console.log('Play function executed for Atomic AI Conversation story.');
    console.log('Story Context:', storyContext);
    // const input =
    //   await storyContext.canvas.findAllByShadowPlaceholderText("Type your message...");
    //   console.log("Search Box Found:", input);
    // const searchBox =
    //   await storyContext.canvas.findAllByShadowPlaceholderText("Search");
    // await storyContext.userEvent.type(
    //   searchBox[0],
    //   "how to resolve netflix connection with tivo{enter}"
    // );
  },
};

export default meta;

export const Default: Story = {
  args: {
    'answer-configuration-id': '04a30433-667b-4988-ba59-e9a585e41c0e',
  },
};
