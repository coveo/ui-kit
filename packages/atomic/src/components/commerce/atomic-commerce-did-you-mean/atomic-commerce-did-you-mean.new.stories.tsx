import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-did-you-mean/atomic-commerce-did-you-mean.js';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';

const commerceApiHarness = new MockCommerceApi();

commerceApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  queryCorrection: {
    originalQuery: 'runing shoes',
    correctedQuery: 'running shoes',
    corrections: [],
  },
}));

const {decorator, play} = wrapInCommerceInterface({
  engineConfig: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.query = 'runing shoes';
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
});

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-did-you-mean',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-did-you-mean',
  title: 'Commerce/Did You Mean',
  id: 'atomic-commerce-did-you-mean',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {handlers: [...commerceApiHarness.handlers]},
    chromatic: {disableSnapshot: true},
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
  beforeEach: () => {
    commerceApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {};
