import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {events, args, argTypes} = getStorybookHelpers('atomic-ipx-body', {
  excludeCategories: ['methods'],
});

async function initializeInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = canvasElement.querySelector(
    'atomic-search-interface'
  );
  await searchInterface!.initialize(getSampleSearchEngineConfiguration());
}

const meta: Meta = {
  component: 'atomic-ipx-body',
  title: 'IPX/IpxBody',
  id: 'atomic-ipx-body',
  render: (args) => {
    const {children, isOpen, displayFooterSlot} = args;
    return html`
      <style>
        atomic-ipx-body {
          display: block;
          width: 600px;
          height: 400px;
        }
      </style>
      <atomic-search-interface>
        <atomic-ipx-body
          .isOpen=${isOpen}
          .displayFooterSlot=${displayFooterSlot ?? true}
        >
          ${children}
        </atomic-ipx-body>
      </atomic-search-interface>
    `;
  },
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
  },
  argTypes,
  play: async (context) => {
    await initializeInterface(context.canvasElement);
  },
};

export default meta;

export const Default: Story = {
  name: 'Default',
  args: {
    children: html`
      <div slot="header">
        <h2>Header Content</h2>
      </div>
      <div slot="body">
        <p>This is the main body content of the IPX interface.</p>
        <p>It can contain any content and will be scrollable if needed.</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
      <div slot="footer">
        <button type="button">Action Button</button>
      </div>
    `,
  },
};

export const EmbeddedMode: Story = {
  name: 'Embedded Mode (isOpen undefined)',
  args: {
    children: html`
      <div slot="header">
        <h2>Embedded View</h2>
      </div>
      <div slot="body">
        <p>In embedded mode, the component doesn't apply visibility classes.</p>
        <p>This is useful for permanently visible IPX interfaces.</p>
      </div>
      <div slot="footer">
        <button type="button">Close</button>
      </div>
    `,
  },
};

export const ModalOpenMode: Story = {
  name: 'Modal Mode (isOpen true)',
  args: {
    isOpen: true,
    children: html`
      <div slot="header">
        <h2>Modal Open</h2>
      </div>
      <div slot="body">
        <p>When isOpen is true, the container has the 'visible' class.</p>
        <p>This allows for animation effects when showing the modal.</p>
      </div>
      <div slot="footer">
        <button type="button">Close Modal</button>
      </div>
    `,
  },
};

export const ModalClosedMode: Story = {
  name: 'Modal Mode (isOpen false)',
  args: {
    isOpen: false,
    children: html`
      <div slot="header">
        <h2>Modal Closed</h2>
      </div>
      <div slot="body">
        <p>When isOpen is false, the container has the 'invisible' class.</p>
        <p>This allows for animation effects when hiding the modal.</p>
      </div>
      <div slot="footer">
        <button type="button">Open Modal</button>
      </div>
    `,
  },
};

export const WithoutFooter: Story = {
  name: 'Without Footer',
  args: {
    displayFooterSlot: false,
    children: html`
      <div slot="header">
        <h2>No Footer</h2>
      </div>
      <div slot="body">
        <p>
          When displayFooterSlot is false, the footer slot is not rendered.
        </p>
        <p>This is useful for interfaces that don't need footer actions.</p>
      </div>
    `,
  },
};

export const LongScrollableContent: Story = {
  name: 'Long Scrollable Content',
  args: {
    children: html`
      <div slot="header">
        <h2>Scrollable Body</h2>
      </div>
      <div slot="body">
        <h3>Section 1</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <h3>Section 2</h3>
        <p>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat.
        </p>
        <h3>Section 3</h3>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur.
        </p>
        <h3>Section 4</h3>
        <p>
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
          officia deserunt mollit anim id est laborum.
        </p>
        <h3>Section 5</h3>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium.
        </p>
        <h3>Section 6</h3>
        <p>
          Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
          quasi architecto beatae vitae dicta sunt explicabo.
        </p>
      </div>
      <div slot="footer">
        <button type="button">Continue</button>
      </div>
    `,
  },
};

export const MinimalContent: Story = {
  name: 'Minimal Content',
  args: {
    children: html`
      <div slot="header">
        <h2>Title</h2>
      </div>
      <div slot="body">
        <p>Short content.</p>
      </div>
      <div slot="footer">
        <button type="button">OK</button>
      </div>
    `,
  },
};
