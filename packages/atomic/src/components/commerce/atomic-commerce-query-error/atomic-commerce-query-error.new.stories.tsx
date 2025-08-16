import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
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

  afterEach: play,
};

export default meta;

export const Default: Story = {};
