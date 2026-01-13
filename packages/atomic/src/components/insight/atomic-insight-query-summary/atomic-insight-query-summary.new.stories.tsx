import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-query-summary',
  {excludeCategories: ['methods']}
);

const mockInsightApi = new MockInsightApi();

const meta: Meta = {
  component: 'atomic-insight-query-summary',
  title: 'Insight/Query Summary',
  id: 'atomic-insight-query-summary',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};
