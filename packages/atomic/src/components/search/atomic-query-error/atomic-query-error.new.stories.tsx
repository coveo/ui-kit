import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-query-error/atomic-query-error.js';

const searchApiHarness = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface({
  config: {
    accessToken: 'invalidtoken',
    organizationId: 'default-org',
  },
});
const {play: playInitOnly} = wrapInSearchInterface({
  config: {
    accessToken: 'invalidtoken',
    organizationId: 'default-org',
  },
  skipFirstSearch: true,
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
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.mockErrorOnce();
  },
};

export const WithInvalidToken: Story = {
  name: 'With Invalid Token Error',
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.mockOnce(
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
    searchApiHarness.searchEndpoint.mockOnce(
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
    searchApiHarness.searchEndpoint.mockOnce(
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
    searchApiHarness.searchEndpoint.mockOnce(
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

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.mockErrorOnce();
  },
  play: async (context) => {
    await playInitOnly(context);
    await testStatusMessageA11y(context, {
      triggerAction: async (canvasElement) => {
        const searchInterface = canvasElement.querySelector(
          'atomic-search-interface'
        )!;
        await (searchInterface as any).executeFirstSearch();
      },
      expectedText:
        "No access. Your query couldn't be sent to the following URL: https://default-org.org.coveo.com. Verify your connection.",
      timeout: 5000,
    });
  },
};
