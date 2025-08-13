import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface({
  accessToken: 'invalidtoken',
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-query-error',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-query-error',
  title: 'Atomic/QueryError',
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

  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-query-error',
};
