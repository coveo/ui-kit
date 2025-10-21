import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-automatic-facet-generator',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-automatic-facet-generator',
  title: 'Search/AutomaticFacetGenerator',
  id: 'atomic-automatic-facet-generator',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  argTypes,

  play,
  args,
};

export default meta;

export const Default: Story = {
  name: 'atomic-automatic-facet-generator',
};
