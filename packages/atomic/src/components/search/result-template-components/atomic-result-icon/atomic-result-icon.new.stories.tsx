import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResult} from '@/storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-icon',
  {excludeCategories: ['methods']}
);

const {decorator: resultDecorator, engineConfig} = wrapInResult();
const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: engineConfig,
});

const meta: Meta = {
  component: 'atomic-result-icon',
  title: 'Search/ResultList/ResultIcon',
  id: 'atomic-result-icon',
  render: (args) => template(args),
  decorators: [resultDecorator, searchInterfaceDecorator],
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
  name: 'atomic-result-icon',
};
