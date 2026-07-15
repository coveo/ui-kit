import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@coveo/platform-mock-api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-notifications/atomic-notifications.js';

const searchApiHarness = new MockSearchApi();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-notifications',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-notifications',
  title: 'Search/Notifications',
  id: 'atomic-notifications',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.clear();
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      triggers: [
        {
          type: 'notify',
          content:
            'This is a demo notification. It contains text that may span over a different number of lines depending on your screen width. Notifications are returned by the Coveo Search API.',
        },
        {
          type: 'notify',
          content:
            'This is a different notification. Any number of notifications can be returned by the Coveo Search API.',
        },
      ],
    }));
  },
  play,
};

export default meta;

export const Default: Story = {};

export const CustomIcon: Story = {
  name: 'With a custom icon',
  args: {
    icon: 'https://raw.githubusercontent.com/coveo/ui-kit/main/packages/atomic/src/images/arrow-top-rounded.svg',
  },
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        // Notifications are rendered on first search via the mock trigger.
      },
      expectedText: /notification/i,
      timeout: 10000,
    });
  },
};
