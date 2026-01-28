import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-ipx-embedded',
  {
    excludeCategories: ['methods'],
  }
);

const meta: Meta = {
  component: 'atomic-ipx-embedded',
  title: 'IPX/Embedded',
  id: 'atomic-ipx-embedded',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  argTypes,
  args: {
    ...args,
    'header-slot': `<h2>Header Content</h2>`,
    'body-slot': `<p>This is the body content of the embedded IPX interface.</p>`,
    'footer-slot': `<button>Action Button</button>`,
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {};
