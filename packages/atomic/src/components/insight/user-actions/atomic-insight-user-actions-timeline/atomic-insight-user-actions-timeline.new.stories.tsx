import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {HttpResponse, http} from 'msw';
import {exampleUserActions} from '@/storybook-utils/api/contextApi';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, afterEach} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-user-actions-timeline',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-user-actions-timeline',
  title: 'Insight/UserActionsTimeline',
  id: 'atomic-insight-user-actions-timeline',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'user-id': 'exampleUserId',
    'ticket-creation-date-time': encodeURIComponent('2024-08-30'),
  },
  argTypes,
  afterEach,
};

export default meta;

export const Default: Story = {
  name: 'atomic-insight-user-actions-timeline',
  parameters: {
    msw: {
      handlers: [
        http.post('**/user/actions', () => {
          return HttpResponse.json({value: exampleUserActions}, {status: 200});
        }),
      ],
    },
  },
  afterEach,
};

export const WithNoUserActions: Story = {
  name: 'With no user actions',
  parameters: {
    msw: {
      handlers: [
        http.post('**/user/actions', () => {
          return HttpResponse.json({value: []}, {status: 200});
        }),
      ],
    },
  },
  afterEach,
};

export const WithUserActionsError: Story = {
  name: 'With user actions error',
  parameters: {
    msw: {
      handlers: [
        http.post('**/user/actions', () => {
          return HttpResponse.json(
            {
              message: 'Access is denied.',
              errorCode: 'ACCESS_DENIED',
              requestID: '1486603b-db83-4dc2-9580-5f8e81c8e00c',
            },
            {status: 403}
          );
        }),
      ],
    },
  },
  afterEach,
};
