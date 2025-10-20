import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {HttpResponse, http} from 'msw';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator, play} = wrapInCommerceInterface({
  engineConfig: {organizationId: 'invalid-organization-id'},
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

export const With418Error: Story = {
  name: 'With 418 error',
  parameters: {
    msw: {
      handlers: [
        http.post('**/v2/search', () => {
          return HttpResponse.json(
            {
              ok: false,
              status: 418,
              message: 'Something very weird just happened',
              statusCode: 418,
              type: 'ClientError',
            },
            {status: 418}
          );
        }),
      ],
    },
  },
  play,
};
