import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockInsightApi = new MockInsightApi();

const {decorator, play} = wrapInInsightInterface({
  accessToken: 'invalidtoken',
  organizationId: 'default-org',
  insightId: 'default-insight',
});

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-query-error',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-query-error',
  title: 'Insight/Query Error',
  id: 'atomic-insight-query-error',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockInsightApi.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockInsightApi.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  beforeEach: async () => {
    mockInsightApi.searchEndpoint.mockErrorOnce();
  },
};

export const WithInvalidToken: Story = {
  name: 'With Invalid Token Error',
  beforeEach: async () => {
    mockInsightApi.searchEndpoint.mockOnce(
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
    mockInsightApi.searchEndpoint.mockOnce(
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

export const WithOrganizationPaused: Story = {
  name: 'With Organization Paused Error',
  beforeEach: async () => {
    mockInsightApi.searchEndpoint.mockOnce(
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
