import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface({
  config: {
    accessToken: 'invalidtoken',
    organizationId: 'default-org',
  },
});

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-query-error',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-query-error',
  title: 'Search/Query Error',
  id: 'atomic-query-error',
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
  },
  play,
};

export default meta;

export const Default: Story = {
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockErrorOnce();
  },
};

export const WithInvalidToken: Story = {
  name: 'With Invalid Token Error',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(
      () => ({
        ok: false,
        status: 401,
        message: 'Token is invalid or expired',
        statusCode: 401,
        type: 'InvalidTokenException',
      }),
      {status: 401}
    );
  },
};

export const WithDisconnected: Story = {
  name: 'With Disconnected Error',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(
      () => ({
        ok: false,
        status: 0,
        message: 'Network connection failed',
        statusCode: 0,
        type: 'Disconnected',
      }),
      {status: 500}
    );
  },
};

export const WithNoEndpoints: Story = {
  name: 'With No Endpoints Error',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(
      () => ({
        ok: false,
        status: 404,
        message: 'No content sources available',
        statusCode: 404,
        type: 'NoEndpointsException',
      }),
      {status: 404}
    );
  },
};

export const WithOrganizationPaused: Story = {
  name: 'With Organization Paused Error',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(
      () => ({
        ok: false,
        status: 503,
        message: 'Organization is paused due to inactivity',
        statusCode: 503,
        type: 'OrganizationIsPausedException',
      }),
      {status: 503}
    );
  },
};
