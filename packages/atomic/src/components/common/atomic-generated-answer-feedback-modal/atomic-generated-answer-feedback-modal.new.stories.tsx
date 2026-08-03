import type {GeneratedAnswer} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';
import {testDialogA11y} from '@/storybook-utils/a11y/dialog.js';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/common/atomic-generated-answer-feedback-modal/atomic-generated-answer-feedback-modal.js';

const generatedAnswer = {
  openFeedbackModal: () => {},
  closeFeedbackModal: () => {},
  sendFeedback: () => {},
} as unknown as GeneratedAnswer;

const {decorator, play} = wrapInSearchInterface({skipFirstSearch: true});

async function playAfterModalAnimation(context: Parameters<typeof play>[0]) {
  await play(context);
  await waitForModalAnimationEnd(context.canvasElement);
}

async function waitForModalAnimationEnd(canvasElement: HTMLElement) {
  const feedbackModal = canvasElement.querySelector('atomic-generated-answer-feedback-modal');

  let container: Element | null | undefined = null;
  await waitFor(() => {
    const modal = feedbackModal?.shadowRoot?.querySelector('atomic-modal');
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

const meta: Meta = {
  component: 'atomic-generated-answer-feedback-modal',
  title: 'Common/Generated Answer Feedback Modal',
  id: 'atomic-generated-answer-feedback-modal',
  render: () => html`
    <atomic-generated-answer-feedback-modal
      .generatedAnswer=${generatedAnswer}
      is-open
    ></atomic-generated-answer-feedback-modal>
  `,
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
  },
  play: playAfterModalAnimation,
};

export default meta;

export const Default: Story = {};

export const A11yDialog: Story = {
  name: 'A11y Dialog',
  tags: ['a11y', 'test', '!dev'],
  render: () => html`
    <div>
      <button
        @click=${(e: Event) => {
          const modal = (e.target as HTMLElement)
            .closest('div')
            ?.querySelector('atomic-generated-answer-feedback-modal');
          if (modal) {
            modal.isOpen = true;
          }
        }}
      >
        Open Feedback Modal
      </button>
      <atomic-generated-answer-feedback-modal
        .generatedAnswer=${generatedAnswer}
      ></atomic-generated-answer-feedback-modal>
    </div>
  `,
  play: async (context) => {
    await play(context);
    await testDialogA11y(context, {triggerLabel: 'Open Feedback Modal'});
  },
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  play: async (context) => {
    await playAfterModalAnimation(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const yesOptions = await canvas.findAllByShadowRole('radio', {
          name: 'Yes',
        });
        for (const option of yesOptions) {
          await userEvent.click(option);
        }
        const submitButton = await canvas.findByShadowRole('button', {
          name: 'Send feedback',
        });
        await userEvent.click(submitButton);
      },
      expectedText: 'Thank you! Your feedback will help us improve the answers generated.',
      timeout: 5000,
    });
  },
};
