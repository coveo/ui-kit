import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-pager',
  {
    excludeCategories: ['methods'],
  }
);

const mockInsightApi = new MockInsightApi();

const meta: Meta = {
  component: 'atomic-insight-pager',
  title: 'Insight/Pager',
  id: 'atomic-insight-pager',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
  },
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};
