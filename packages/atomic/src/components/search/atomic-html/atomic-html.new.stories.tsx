import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-html', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-html',
  title: 'Search/HTML',
  id: 'atomic-html',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockSearchApi.handlers],
    },
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};
