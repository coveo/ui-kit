import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockMachineLearningApi} from '@/storybook-utils/api/machinelearning/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockMachineLearningApi = new MockMachineLearningApi();

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-user-actions-toggle',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-user-actions-toggle',
  title: 'Insight/User Actions Toggle',
  id: 'atomic-insight-user-actions-toggle',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockMachineLearningApi.handlers]},
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};
