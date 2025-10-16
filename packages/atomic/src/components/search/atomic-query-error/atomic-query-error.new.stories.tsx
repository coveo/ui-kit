import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {HttpResponse, http} from 'msw';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, afterEach} = wrapInSearchInterface({
  accessToken: 'invalidtoken',
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

  afterEach,
};

export default meta;

export const Default: Story = {
  name: 'atomic-query-error',
};

export const With419Error: Story = {
  name: 'With 419 error',
  parameters: {
    msw: {
      handlers: [
        http.post('**/search/v2', () => {
          return HttpResponse.json(
            {
              message: 'Expired token',
              statusCode: 419,
              type: 'ExpiredTokenException',
            },
            {status: 419}
          );
        }),
      ],
    },
  },
};
