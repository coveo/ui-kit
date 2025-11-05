import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {HttpResponse, http} from 'msw';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const sharedHandlers = [
  http.post('**/search/v2', async ({request}) => {
    const url = new URL(request.url);
    console.log('Search API URL:', url.href);
    console.log('Search API pathname:', url.pathname);

    const orgIdMatch = url.pathname.match(/\/organizations\/([^/]+)\//);
    let orgId = orgIdMatch ? orgIdMatch[1] : null;

    if (!orgId) {
      orgId = url.searchParams.get('organizationId');
    }

    if (!orgId) {
      try {
        const body = await request.json();
        if (typeof body === 'object' && body !== null) {
          orgId = (body as Record<string, unknown>).organizationId as string;
        }
      } catch {}
    }

    console.log('Extracted orgId:', orgId);

    if (orgId === 'invalid-token-org') {
      return HttpResponse.json(
        {
          message: 'Token is invalid or expired',
          statusCode: 401,
          type: 'InvalidTokenException',
        },
        {status: 401}
      );
    }

    if (orgId === 'disconnected-org') {
      return HttpResponse.json(
        {
          message: 'Network connection failed',
          statusCode: 0,
          type: 'Disconnected',
        },
        {status: 500}
      );
    }

    if (orgId === 'no-endpoints-org') {
      return HttpResponse.json(
        {
          message: 'No content sources available',
          statusCode: 404,
          type: 'NoEndpointsException',
        },
        {status: 404}
      );
    }

    if (orgId === 'paused-org') {
      return HttpResponse.json(
        {
          message: 'Organization is paused due to inactivity',
          statusCode: 503,
          type: 'OrganizationIsPausedException',
        },
        {status: 503}
      );
    }

    return HttpResponse.json(
      {
        message: 'An unknown error occurred',
        statusCode: 500,
        type: 'UnknownError',
      },
      {status: 500}
    );
  }),
];

const {decorator: defaultDecorator, play: defaultPlay} = wrapInSearchInterface({
  config: {
    accessToken: 'invalidtoken',
    organizationId: 'default-org',
  },
});

const {decorator: invalidTokenDecorator, play: invalidTokenPlay} =
  wrapInSearchInterface({
    config: {
      accessToken: 'invalidtoken',
      organizationId: 'invalid-token-org',
    },
  });

const {decorator: disconnectedDecorator, play: disconnectedPlay} =
  wrapInSearchInterface({
    config: {
      accessToken: 'invalidtoken',
      organizationId: 'disconnected-org',
    },
  });

const {decorator: noEndpointsDecorator, play: noEndpointsPlay} =
  wrapInSearchInterface({
    config: {
      accessToken: 'invalidtoken',
      organizationId: 'no-endpoints-org',
    },
  });

const {decorator: pausedDecorator, play: pausedPlay} = wrapInSearchInterface({
  config: {
    accessToken: 'invalidtoken',
    organizationId: 'paused-org',
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
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: sharedHandlers,
    },
  },
  args,
  argTypes,

  play: defaultPlay,
};

export default meta;

export const Default: Story = {
  decorators: [defaultDecorator],
  play: defaultPlay,
};

export const WithInvalidToken: Story = {
  name: 'With Invalid Token Error',
  decorators: [invalidTokenDecorator],
  play: invalidTokenPlay,
};

export const WithDisconnected: Story = {
  name: 'With Disconnected Error',
  decorators: [disconnectedDecorator],
  play: disconnectedPlay,
};

export const WithNoEndpoints: Story = {
  name: 'With No Endpoints Error',
  decorators: [noEndpointsDecorator],
  play: noEndpointsPlay,
};

export const WithOrganizationPaused: Story = {
  name: 'With Organization Paused Error',
  decorators: [pausedDecorator],
  play: pausedPlay,
};
