import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockAnswerApi} from '@/storybook-utils/api/answer/mock';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockedAnswerApi = new MockAnswerApi();
const mockedInsightApi = new MockInsightApi();
mockedInsightApi.searchEndpoint.mock((response) => ({
  ...response,
  extendedResults: {
    generativeQuestionAnsweringId: 'fbc64016-5f04-4a47-aad1-0bccaa2c0616',
  },
}));

const {args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-generated-answer',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-generated-answer',
  title: 'Insight/Generated Answer',
  id: 'atomic-insight-generated-answer',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockedInsightApi.handlers, ...mockedAnswerApi.handlers],
    },
  },
  args: {
    ...args,
    'answer-configuration-id': 'fc581be0-6e61-4039-ab26-a3f2f52f308f',
  },
  argTypes,
  play,
  tags: ['!dev'],
};

export default meta;

export const Default: Story = {};

export const DisableCitationAnchoring: Story = {
  name: 'Citation anchoring disabled',
  args: {
    'disable-citation-anchoring': true,
  },
};
