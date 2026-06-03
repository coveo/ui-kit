import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/ipx/atomic-ipx-button/atomic-ipx-button.js';
import '@/src/components/ipx/atomic-ipx-modal/atomic-ipx-modal.js';

const searchApiHarness = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface({skipFirstSearch: true});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-ipx-button',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-ipx-button',
  title: 'IPX/Button',
  id: 'atomic-ipx-button',
  render: (args) => html`
    <style>
      atomic-ipx-button::part(ipx-button) {
        position: relative;
        right: auto;
        bottom: auto;
      }
      atomic-ipx-modal {
        position: relative;
        inset: auto;
      }
    </style>
    <atomic-ipx-modal>
      <div slot="header"><p>Header Content</p></div>
      <div slot="body"><p>Body Content</p></div>
      <div slot="footer"><p>Footer Content</p></div>
    </atomic-ipx-modal>
    ${template(args)}
  `,
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
    actions: {
      handles: events,
    },
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  args: {
    ...args,
  },
  argTypes,
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'Default',
};

export const WithLabel: Story = {
  name: 'With label',
  args: {
    label: 'Help',
  },
};
