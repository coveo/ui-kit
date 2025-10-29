import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {HttpResponse, http} from 'msw';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

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

  play,
};

export default meta;

export const Default: Story = {};

export const WithInvalidToken: Story = {
  name: 'With Invalid Token Error',
  parameters: {
    msw: {
      handlers: [
        http.post('**/search/v2', () => {
          return HttpResponse.json(
            {
              message: 'Token is invalid or expired',
              statusCode: 401,
              type: 'InvalidTokenException',
            },
            {status: 401}
          );
        }),
      ],
    },
  },
  play,
};

export const WithDisconnected: Story = {
  name: 'With Disconnected Error',
  parameters: {
    msw: {
      handlers: [
        http.post('**/search/v2', () => {
          return HttpResponse.json(
            {
              message: 'Network connection failed',
              statusCode: 0,
              type: 'Disconnected',
            },
            {status: 500}
          );
        }),
      ],
    },
  },
  play,
};

export const WithNoEndpoints: Story = {
  name: 'With No Endpoints Error',
  parameters: {
    msw: {
      handlers: [
        http.post('**/search/v2', () => {
          return HttpResponse.json(
            {
              message: 'No content sources available',
              statusCode: 404,
              type: 'NoEndpointsException',
            },
            {status: 404}
          );
        }),
      ],
    },
  },
  play,
};

export const WithOrganizationPaused: Story = {
  name: 'With Organization Paused Error',
  parameters: {
    msw: {
      handlers: [
        http.post('**/search/v2', () => {
          return HttpResponse.json(
            {
              message: 'Organization is paused due to inactivity',
              statusCode: 503,
              type: 'OrganizationIsPausedException',
            },
            {status: 503}
          );
        }),
      ],
    },
  },
  play,
};
