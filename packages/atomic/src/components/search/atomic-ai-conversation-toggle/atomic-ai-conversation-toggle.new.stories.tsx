// import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
// import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
const {events, args, argTypes, template} = getStorybookHelpers('atomic-ai-conversation-toggle', {
  excludeCategories: ['methods'],
});

// Wrap it in whatever interface/component you need
const {decorator, play} = wrapInSearchInterface();
// const {decorator, play} = wrapInCommerceInterface();
// const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-ai-conversation-toggle',
  title: 'TODO/Ai Conversation Toggle',
  id: 'atomic-ai-conversation-toggle',
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

export const Default: Story = {};
