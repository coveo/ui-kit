import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {testInteractiveA11y} from '@/storybook-utils/a11y/';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-tab-manager',
  {
    excludeCategories: ['methods'],
  }
);

const widthDecorator: Decorator = (story) =>
  html`<div style="min-width: 350px;">${story()}</div> `;

const meta: Meta = {
  component: 'atomic-tab-manager',
  title: 'Search/Tab Manager',
  id: 'atomic-tab-manager',
  render: (args) => template(args),
  decorators: [widthDecorator, decorator],
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
    'default-slot': `
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
          ></atomic-tab>`,
  },
  play,
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
  },
};

export default meta;

export const Default: Story = {};

export const A11yInteraction: Story = {
  tags: ['!dev'],
  parameters: {
    a11y: {
      config: {
        // Pre-existing: active tab color #399ffe on white has 2.77:1
        // contrast ratio (needs 4.5:1).
        rules: [{id: 'color-contrast', enabled: false}],
      },
    },
  },
  play: async (context) => {
    await play(context);
    await testInteractiveA11y(context, {
      selectionControl: false,
      activatableButtons: [{name: /Documentation/i}],
    });
  },
};
