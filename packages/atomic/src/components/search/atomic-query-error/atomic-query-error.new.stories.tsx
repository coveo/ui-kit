import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface({
  config: {
    accessToken: 'invalidtoken',
  },
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-query-error',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-query-error',
  title: 'Search/QueryError',
  id: 'atomic-query-error',

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
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-query-error',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockErrorOnce();
  },
};

export const With419Error: Story = {
  name: 'With 419 error',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(
      () => ({
        ok: false,
        status: 419,
        message: 'Expired token',
        statusCode: 419,
        type: 'ExpiredTokenException',
      }),
      {status: 419}
    );
  },
};
