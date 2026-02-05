import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-ipx-modal',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-ipx-modal',
  title: 'IPX/Modal',
  id: 'atomic-ipx-modal',
  render: (args) => template(args),
  decorators: [
    decorator,
    (story) => html`
      <style>
        atomic-ipx-modal {
          position: relative !important;
          inset: auto !important;
        }
      </style>
      ${story()}
    `,
  ],
  parameters: {
    ...commonParameters,
    layout: 'fullscreen',
    docs: {
      ...commonParameters.docs,
      story: {
        ...commonParameters.docs?.story,
        height: '800px',
      },
    },
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'is-open': true,
    'header-slot': `<h2>Modal Header</h2>
      <button style="margin-bottom: 0.5rem;" onclick="this.closest('atomic-ipx-modal').isOpen = false">Close</button>`,
    'body-slot': `<p>This is the modal body content.</p>
      <p>The modal provides a way to display In-Product Experience content in a focused overlay.</p>`,
    'footer-slot': `<button>Action Button</button>`,
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
  args: {
    'header-slot': `<h2>Modal Without Footer</h2>
      <button style="margin-bottom: 0.5rem;" onclick="this.closest('atomic-ipx-modal').isOpen = false">Close</button>`,
    'body-slot': `<p>This modal does not have a footer slot.</p>
      <p>The footer will be automatically hidden.</p>`,
    'footer-slot': '',
  },
};

export const Closed: Story = {
  name: 'Closed (not visible)',
  args: {
    'is-open': false,
    'header-slot': `<h2>The modal is now open</h2>
      <button style="margin-bottom: 0.5rem;" onclick="this.closest('atomic-ipx-modal').isOpen = false">Close</button>`,
    'body-slot': `<p>You are now seeing this because the modal is no longer closed.</p>`,
    'footer-slot': '',
  },
  render: (args) =>
    html`${template(args)}
      <div style="padding: 2rem;">
        <p>
          The modal is present in the DOM but not visible. Set
          <code>is-open="true"</code> to display it.
        </p>
        <button
          onclick="this.closest('atomic-search-interface').querySelector('atomic-ipx-modal').isOpen = true"
        >
          Open Modal
        </button>
      </div>`,
};
