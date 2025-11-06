import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const mockCommerceApi = new MockCommerceApi();

const {decorator, play} = wrapInCommerceInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-query-error',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-query-error',
  title: 'Commerce/Query Error',
  id: 'atomic-commerce-query-error',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockCommerceApi.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockCommerceApi.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  beforeEach: async () => {
    mockCommerceApi.searchEndpoint.mockErrorOnce();
  },
};

export const With418Error: Story = {
  name: 'With 418 error',
  beforeEach: async () => {
    mockCommerceApi.searchEndpoint.mockOnce(
      () => ({
        ok: false,
        status: 418,
        statusCode: 418,
        message: 'Something very weird just happened',
        type: 'ClientError',
      }),
      {status: 418}
    );
  },
};
