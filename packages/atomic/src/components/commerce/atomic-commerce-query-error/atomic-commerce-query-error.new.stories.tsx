import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {HttpResponse, http} from 'msw';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const sharedHandlers = [
  http.post('**/v2/search', ({request}) => {
    const url = new URL(request.url);
    const orgIdMatch = url.pathname.match(/\/organizations\/([^/]+)\//);
    const orgId = orgIdMatch ? orgIdMatch[1] : null;

    if (orgId === 'teapot-organization-id') {
      return HttpResponse.json(
        {
          ok: false,
          status: 418,
          message: 'Something very weird just happened',
          statusCode: 418,
          type: 'Disconnected',
        },
        {status: 418}
      );
    }

    return HttpResponse.json(
      {
        ok: false,
        status: 500,
        message: 'Internal Server Error',
        statusCode: 500,
        type: 'UnknownError',
      },
      {status: 500}
    );
  }),
];

const {decorator: defaultDecorator, play: defaultPlay} =
  wrapInCommerceInterface({
    engineConfig: {organizationId: 'invalid-organization-id'},
  });

const {decorator: teapotDecorator, play: teapotPlay} = wrapInCommerceInterface({
  engineConfig: {organizationId: 'teapot-organization-id'},
});

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-query-error',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-query-error',
  title: 'Commerce/Query Error',
  id: 'atomic-commerce-query-error',
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

export const With418Error: Story = {
  name: 'With 418 error',
  decorators: [teapotDecorator],
  play: teapotPlay,
};
