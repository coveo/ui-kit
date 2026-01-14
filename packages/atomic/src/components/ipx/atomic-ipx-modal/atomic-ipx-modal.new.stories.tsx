import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, styleTemplate} = getStorybookHelpers(
  'atomic-ipx-modal',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-ipx-modal',
  title: 'Atomic/IPX/IPX Modal',
  id: 'atomic-ipx-modal',
  render: (args) =>
    html`${styleTemplate(args)}
      <atomic-ipx-modal is-open="true">
        <div slot="header">
          <h2>Modal Header</h2>
          <button onclick="this.closest('atomic-ipx-modal').isOpen = false">
            Close
          </button>
        </div>
        <div slot="body">
          <p>This is the modal body content.</p>
          <p>
            The modal provides a way to display In-Product Experience content in
            a focused overlay.
          </p>
        </div>
        <div slot="footer">
          <button>Action Button</button>
        </div>
      </atomic-ipx-modal>`,
  decorators: [decorator],
  parameters: {
    ...commonParameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
  },
  argTypes: {
    ...argTypes,
    source: {
      ...argTypes.source,
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
    container: {
      ...argTypes.container,
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
  },
  globals: {
    layout: 'fullscreen',
    docs: {
      ...commonParameters.docs,
      story: {
        ...commonParameters.docs?.story,
        height: '800px',
      },
    },
  },
  play: async (context) => {
    await play(context);
  },
};

export default meta;

export const Default: Story = {
  name: 'Default',
};

export const WithoutFooter: Story = {
  name: 'Without Footer',
  render: (args) =>
    html`${styleTemplate(args)}
      <atomic-ipx-modal is-open="true">
        <div slot="header">
          <h2>Modal Without Footer</h2>
          <button onclick="this.closest('atomic-ipx-modal').isOpen = false">
            Close
          </button>
        </div>
        <div slot="body">
          <p>This modal does not have a footer slot.</p>
          <p>The footer will be automatically hidden.</p>
        </div>
      </atomic-ipx-modal>`,
};

export const Closed: Story = {
  name: 'Closed (not visible)',
  render: (args) =>
    html`${styleTemplate(args)}
      <atomic-ipx-modal is-open="false">
        <div slot="header">
          <h2>This modal is closed</h2>
        </div>
        <div slot="body">
          <p>You won't see this because the modal is closed.</p>
        </div>
      </atomic-ipx-modal>
      <div style="padding: 2rem;">
        <p>
          The modal is present in the DOM but not visible. Set
          <code>is-open="true"</code> to display it.
        </p>
        <button
          onclick="document.querySelector('atomic-ipx-modal').isOpen = true"
        >
          Open Modal
        </button>
      </div>`,
};
