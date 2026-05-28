import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import type {AtomicAriaLive} from './atomic-aria-live';
import '@/src/components/common/atomic-aria-live/atomic-aria-live.js';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-aria-live',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-aria-live',
  title: 'Common/Aria Live',
  id: 'atomic-aria-live',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {handlers: [...searchApiHarness.handlers]},
    chromatic: {disableSnapshot: true},
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

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const ariaLive = context.canvasElement.querySelector(
          'atomic-aria-live'
        ) as AtomicAriaLive;
        ariaLive.registerRegion('storybook-status', false);
        ariaLive.updateMessage(
          'storybook-status',
          'Storybook status update',
          false
        );
      },
      expectedText: 'Storybook status update',
      timeout: 5000,
    });
  },
};
