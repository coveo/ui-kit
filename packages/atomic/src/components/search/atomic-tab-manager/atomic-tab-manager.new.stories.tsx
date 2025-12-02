import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();

const {events, argTypes} = getStorybookHelpers('atomic-tab-manager', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-tab-manager',
  title: 'Search/Tab Manager',
  id: 'atomic-tab-manager',
  render: () => html`<atomic-tab-manager>
          <atomic-tab
            label="All"
            name="all"
          ></atomic-tab>
          <atomic-tab
            label="Documentation"
            name="documentation"
          ></atomic-tab>
          <atomic-tab
            label="Articles"
            name="articles"
          ></atomic-tab>
        </atomic-tab-manager>`,
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  argTypes,
  play,
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
  },
};

export default meta;

export const Default: Story = {};
