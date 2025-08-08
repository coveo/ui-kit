import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface({
  search: {
    preprocessSearchResponseMiddleware: (response) => {
      response.body.triggers = [
        {
          type: 'notify',
          content:
            'This is a demo notification. It contains text that may span over a different number of lines depending on your screen width. Notifications are returned by the Coveo Search API.',
        },
        {
          type: 'notify',
          content:
            'This is a different notification. Any amount of notifications can be returned by the Coveo Search API.',
        },
      ];
      return response;
    },
  },
});

const meta: Meta = {
  component: 'atomic-notifications',
  title: 'Search/Notification',
  id: 'atomic-notifications',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-notifications',
};
