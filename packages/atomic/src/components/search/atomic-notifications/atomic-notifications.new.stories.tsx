import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

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
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
    mockSearchApi.searchEndpoint.mockOnce((response) => ({
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
