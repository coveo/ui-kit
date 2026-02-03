import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import type {AtomicIpxBody} from './atomic-ipx-body';

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
  title: 'IPX/Body',
  id: 'atomic-ipx-body',
  render: (args) => {
    const {children, visibility, displayFooterSlot} = args;
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
          .visibility=${visibility ?? 'embedded'}
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
  name: 'Embedded Mode',
  args: {
    visibility: 'embedded',
    children: html`
      <div slot="header">
        <h2>Embedded View</h2>
      </div>
      <div slot="body">
        <p>In embedded mode, the component doesn't apply visibility classes.</p>
        <p>This is useful for permanently visible IPX interfaces.</p>
      </div>
      <div slot="footer">
        <button type="button">Apply</button>
      </div>
    `,
  },
};

export const InteractiveModal: Story = {
  name: 'Interactive Modal',
  render: () => {
    // Define a stateful wrapper component inline
    class InteractiveModalWrapper extends HTMLElement {
      private ipxBody: HTMLElement | null = null;
      private visibility: 'open' | 'closed' = 'open';

      connectedCallback() {
        this.innerHTML = `
          <style>
            atomic-ipx-body {
              display: block;
              width: 600px;
              height: 400px;
            }
            #open-modal-btn {
              margin-bottom: 16px;
              padding: 8px 16px;
              font-size: 14px;
              cursor: pointer;
            }
          </style>
          <atomic-search-interface>
            <button type="button" id="open-modal-btn" style="display: none;">Open Modal</button>
            <atomic-ipx-body>
              <div slot="header">
                <h2>Interactive Modal</h2>
              </div>
              <div slot="body">
                <p>Click the button to toggle the modal visibility.</p>
                <p>The component uses CSS classes to control visibility.</p>
              </div>
              <div slot="footer">
                <button type="button" id="close-modal-btn">Close Modal</button>
              </div>
            </atomic-ipx-body>
          </atomic-search-interface>
        `;

        this.ipxBody = this.querySelector('atomic-ipx-body');
        const openButton = this.querySelector(
          '#open-modal-btn'
        ) as HTMLButtonElement;
        const closeButton = this.querySelector(
          '#close-modal-btn'
        ) as HTMLButtonElement;

        const updateState = () => {
          (this.ipxBody as AtomicIpxBody).visibility = this.visibility;
          openButton.style.display =
            this.visibility === 'open' ? 'none' : 'inline-block';
        };

        if (this.ipxBody && openButton && closeButton) {
          // Set initial state
          updateState();

          openButton.addEventListener('click', () => {
            this.visibility = 'open';
            updateState();
          });

          closeButton.addEventListener('click', () => {
            this.visibility = 'closed';
            updateState();
          });
        }

        // Initialize the search interface
        customElements.whenDefined('atomic-search-interface').then(() => {
          const searchInterface = this.querySelector('atomic-search-interface');
          searchInterface?.initialize(getSampleSearchEngineConfiguration());
        });
      }
    }

    if (!customElements.get('interactive-modal-wrapper')) {
      customElements.define(
        'interactive-modal-wrapper',
        InteractiveModalWrapper
      );
    }

    return html`<interactive-modal-wrapper></interactive-modal-wrapper>`;
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
