import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {expect, waitFor} from 'storybook/test';
import {testDialogA11y} from '@/storybook-utils/a11y/dialog.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/common/atomic-modal/atomic-modal.js';

const {decorator, play} = wrapInSearchInterface({skipFirstSearch: true});

const OPEN_BUTTON_LABEL = 'Open modal';

async function waitForModalAnimationEnd(canvasElement: HTMLElement) {
  let container: Element | null | undefined = null;

  await waitFor(() => {
    const modal = canvasElement.querySelector('atomic-modal');
    expect(modal).toBeTruthy();
    container = modal?.shadowRoot?.querySelector('[part="container"]');
    expect(container).toBeTruthy();
  });

  if (!container) {
    return;
  }

  const animations = (container as Element).getAnimations();
  await Promise.all(animations.map((animation) => animation.finished));
}

/**
 * Wires the trigger to the modal the way a consumer would: the button both opens
 * the modal and is handed to `source`, which is what the modal returns focus to.
 */
function renderModalWithTrigger({fullscreen, isOpen}: {fullscreen?: boolean; isOpen?: boolean}) {
  return html`
    <div>
      <button
        type="button"
        @click=${(event: Event) => {
          const trigger = event.currentTarget as HTMLButtonElement;
          const modal = trigger.parentElement?.querySelector('atomic-modal');
          if (modal) {
            modal.source = trigger;
            modal.isOpen = true;
          }
        }}
      >
        ${OPEN_BUTTON_LABEL}
      </button>
      <atomic-modal ?fullscreen=${fullscreen} ?is-open=${isOpen}>
        <div slot="header">This is a title</div>
        <div slot="body">This is the body</div>
        <div slot="footer">
          <button
            type="button"
            @click=${(event: Event) => {
              const modal = (event.currentTarget as HTMLButtonElement).closest('atomic-modal');
              if (modal) {
                modal.isOpen = false;
              }
            }}
          >
            Done
          </button>
        </div>
      </atomic-modal>
    </div>
  `;
}

const meta: Meta = {
  component: 'atomic-modal',
  title: 'Common/Modal',
  id: 'atomic-modal',
  render: () => renderModalWithTrigger({isOpen: true}),
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
  },
  play: async (context) => {
    await play(context);
    await waitForModalAnimationEnd(context.canvasElement);
  },
};

export default meta;

export const Default: Story = {};

export const Fullscreen: Story = {
  render: () => renderModalWithTrigger({fullscreen: true, isOpen: true}),
};

export const Closed: Story = {
  name: 'Closed with a trigger',
  render: () => renderModalWithTrigger({}),
  play: async (context) => {
    await play(context);
  },
};

export const A11yDialog: Story = {
  name: 'A11y Dialog',
  tags: ['a11y', 'test', '!dev'],
  render: () => renderModalWithTrigger({}),
  play: async (context) => {
    await play(context);
    await testDialogA11y(context, {triggerLabel: OPEN_BUTTON_LABEL});
  },
};
