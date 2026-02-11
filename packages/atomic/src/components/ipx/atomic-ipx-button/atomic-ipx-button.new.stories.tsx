import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-ipx-button',
  {excludeCategories: ['methods']}
);

async function initializeInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = canvasElement.querySelector(
    'atomic-search-interface'
  );
  await searchInterface!.initialize(getSampleSearchEngineConfiguration());
}

const meta: Meta = {
  component: 'atomic-ipx-button',
  title: 'IPX/IpxButton',
  id: 'atomic-ipx-button',
  render: (args) => html`
    <style>
      atomic-ipx-button::part(ipx-button) {
        position: relative;
        right: auto;
        bottom: auto;
      }
    </style>
    <atomic-search-interface>
      <atomic-ipx-modal>
        <div slot="body">
          <p>IPX Modal Content</p>
        </div>
      </atomic-ipx-modal>
      ${template(args)}
    </atomic-search-interface>
  `,
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    label: 'Help',
  },
  argTypes,
  play: async (context) => {
    await initializeInterface(context.canvasElement);
  },
};

export default meta;

export const Default: Story = {
  name: 'Default',
};

export const WithLabel: Story = {
  name: 'With label',
  args: {
    label: 'Need Help?',
  },
};

export const WithoutLabel: Story = {
  name: 'Without label',
  args: {
    label: undefined,
  },
};
