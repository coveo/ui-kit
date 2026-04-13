import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {when} from 'lit/directives/when.js';
import {isType} from '@coveo/commerce-agent-chat-core/lib/commerceHelpers';
import {extractProductsBySurface} from '@coveo/commerce-agent-chat-core/lib/commerceExtractor';
import {renderMarkdown} from '@coveo/commerce-agent-chat-core/lib/markdown';
import type {
  ActivityMessage,
  Message,
} from '@coveo/commerce-agent-chat-core/types/agent';
import type {
  A2UISurfaceContent,
  Product,
} from '@coveo/commerce-agent-chat-core/types/commerce';
import './cac-activity-renderer.js';

/**
 * The `cac-message-list` component renders conversation messages and activities.
 */
@customElement('cac-message-list')
export class CacMessageList extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      width: 100%;
      min-width: 0;
      min-height: 0;
      flex: 1;
    }

    .message-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      padding: 1rem 1.25rem;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 212, 255, 0.55) rgba(13, 27, 42, 0.7);
    }

    .message-list::-webkit-scrollbar {
      width: 10px;
    }

    .message-list::-webkit-scrollbar-track {
      background: rgba(13, 27, 42, 0.7);
      border-radius: 999px;
      border: 1px solid rgba(0, 212, 255, 0.12);
    }

    .message-list::-webkit-scrollbar-thumb {
      background: linear-gradient(
        180deg,
        rgba(0, 212, 255, 0.55) 0%,
        rgba(0, 168, 204, 0.8) 100%
      );
      border-radius: 999px;
      border: 1px solid rgba(0, 212, 255, 0.35);
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.25);
    }

    .message-list::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(
        180deg,
        rgba(0, 255, 212, 0.8) 0%,
        rgba(0, 212, 255, 0.9) 100%
      );
    }

    .message {
      width: fit-content;
      max-width: min(80ch, 88%);
      padding: 0.9rem 1.1rem;
      border-radius: 14px;
      border: 1px solid transparent;
      backdrop-filter: blur(8px);
      overflow-wrap: anywhere;
      text-align: left;
    }

    .message-user {
      align-self: flex-end;
      background: linear-gradient(
        135deg,
        rgba(0, 168, 204, 0.2) 0%,
        rgba(0, 212, 255, 0.15) 100%
      );
      border-color: rgba(0, 212, 255, 0.5);
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
    }

    .message-assistant {
      align-self: flex-start;
      background: linear-gradient(
        135deg,
        rgba(22, 45, 66, 0.6) 0%,
        rgba(26, 58, 82, 0.4) 100%
      );
      border-color: rgba(0, 212, 255, 0.3);
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.1);
    }

    .message-role {
      margin: 0 0 0.25rem;
      font-size: 0.75rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--ink-muted);
      text-align: left;
    }

    .message-content {
      margin: 0;
      line-height: 1.5;
      text-align: left;
    }

    .message-content--plain {
      white-space: pre-line;
    }

    .message-loading {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--ink-muted);
      font-size: 0.9rem;
    }

    .message-loading__dots {
      display: inline-flex;
      gap: 0.25rem;
    }

    .message-loading__dot {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background: var(--accent);
      opacity: 0.25;
      animation: loadingPulse 1.1s ease-in-out infinite;
    }

    .message-loading__dot:nth-child(2) {
      animation-delay: 0.15s;
    }

    .message-loading__dot:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes loadingPulse {
      0%,
      100% {
        transform: translateY(0);
        opacity: 0.25;
      }
      50% {
        transform: translateY(-2px);
        opacity: 1;
      }
    }

    .agent-progress {
      margin: 0.5rem 0 0;
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 10px;
      padding: 0.55rem 0.65rem;
      background: rgba(15, 36, 56, 0.35);
    }

    .agent-progress__current {
      margin: 0;
      font-size: 0.82rem;
      color: var(--accent);
      font-weight: 600;
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.35);
    }

    .agent-progress__details {
      margin-top: 0.45rem;
    }

    .agent-progress__summary {
      cursor: pointer;
      color: var(--ink-muted);
      font-size: 0.78rem;
    }

    .agent-progress__steps {
      margin: 0.45rem 0 0;
      padding: 0 0 0 1rem;
      list-style: decimal;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .agent-progress__details[open] .agent-progress__summary {
      color: var(--accent);
    }

    .agent-progress__step--current {
      opacity: 1;
      font-weight: 600;
    }

    .agent-progress__step {
      font-size: 0.8rem;
      color: var(--accent);
      opacity: 0.65;
    }

    .agent-progress__step--active {
      opacity: 1;
      font-weight: 500;
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
    }

    .agent-progress__step--complete {
      color: #7ce7ff;
      opacity: 0.95;
    }

    .agent-progress__step--failed {
      color: var(--danger-ink);
      padding: 0;
      opacity: 1;
    }

    .empty-state {
      flex: 1;
      display: grid;
      place-items: center;
      margin: 0;
      text-align: center;
      color: var(--ink-muted);
    }

    @media (max-width: 720px) {
      .message {
        max-width: 94%;
      }
    }
  `;

  /** The chat messages to render. */
  @property({attribute: false})
  public messages: Message[] = [];

  /** Whether the assistant is currently streaming a response. */
  @property({type: Boolean, attribute: 'is-loading'})
  public isLoading = false;

  /** The in-progress status steps for the latest assistant response. */
  @property({attribute: false})
  public progressSteps: string[] = [];

  override render() {
    const lastAssistantId = this.getLastAssistantId();

    return html`
      <section
        class="message-list"
        aria-live="polite"
        aria-label="Conversation messages"
      >
        ${when(
          this.messages.length === 0,
          () =>
            html`<p class="empty-state">
              🏄 Start a conversation with Zane 🤙
            </p>`
        )}
        ${this.renderMessages(lastAssistantId)}
      </section>
    `;
  }

  private renderMessages(lastAssistantId?: string) {
    return map(this.messages, (message) =>
      this.renderMessage(message, lastAssistantId)
    );
  }

  private renderMessage(message: Message, lastAssistantId?: string) {
    const isLatestAssistantMessage =
      message.role === 'assistant' && message.id === lastAssistantId;
    const isActiveAssistantActivity =
      this.isLoading && Boolean(isLatestAssistantMessage);
    const allActivities = message.activities ?? [];
    const activeActivityId = isActiveAssistantActivity
      ? allActivities[allActivities.length - 1]?.id
      : undefined;

    const messageTemplate = html`
      <article class=${`message message-${message.role}`}>
        <p class="message-role">
          ${message.role === 'user' ? 'You' : 'Zane (Agent)'}
        </p>
        ${this.renderMessageBody(message, isActiveAssistantActivity)}
        ${this.renderProgressSteps(isLatestAssistantMessage)}
      </article>
    `;

    if (message.role === 'assistant' && allActivities.length > 0) {
      const leadingActivities = allActivities.filter(
        (activity) => !this.activityContainsNextActions(activity)
      );
      const trailingActivities = allActivities.filter((activity) =>
        this.activityContainsNextActions(activity)
      );

      return html`
        ${this.renderActivities(
          leadingActivities,
          allActivities,
          isActiveAssistantActivity,
          activeActivityId
        )}
        ${messageTemplate}
        ${this.renderActivities(
          trailingActivities,
          allActivities,
          isActiveAssistantActivity,
          activeActivityId
        )}
      `;
    }

    return html`
      ${messageTemplate}
      ${this.renderActivities(
        allActivities,
        allActivities,
        isActiveAssistantActivity,
        activeActivityId
      )}
    `;
  }

  private renderMessageBody(
    message: Message,
    isActiveAssistantActivity: boolean
  ) {
    const content = this.getMessageContent(message, isActiveAssistantActivity);

    return when(
      message.role === 'user',
      () =>
        html`<p class="message-content message-content--plain">${content}</p>`,
      () => {
        if (!content && isActiveAssistantActivity) {
          return html`
            <p class="message-loading" aria-live="polite">
              <span class="message-loading__dots" aria-hidden="true">
                <span class="message-loading__dot"></span>
                <span class="message-loading__dot"></span>
                <span class="message-loading__dot"></span>
              </span>
            </p>
          `;
        }

        return when(
          Boolean(content),
          () =>
            html`<div class="message-content message-content--markdown">
              ${unsafeHTML(renderMarkdown(content))}
            </div>`
        );
      }
    );
  }

  private renderProgressSteps(isLatestAssistantMessage: boolean) {
    const hasProgressSteps =
      isLatestAssistantMessage && this.progressSteps.length > 0;

    const currentStep = this.progressSteps[this.progressSteps.length - 1] ?? '';

    return when(
      hasProgressSteps,
      () => html`
        <section class="agent-progress" aria-label="Agent status">
          <p class="agent-progress__current">${currentStep}</p>
          ${when(
            this.progressSteps.length > 1,
            () => html`
              <details class="agent-progress__details">
                <summary class="agent-progress__summary">
                  Show full status trace
                </summary>
                <ol class="agent-progress__steps">
                  ${map(
                    this.progressSteps,
                    (step, index) =>
                      html`<li class=${this.getProgressStepClass(step, index)}>
                        ${step}
                      </li>`
                  )}
                </ol>
              </details>
            `
          )}
        </section>
      `
    );
  }

  private renderActivities(
    activitiesToRender: NonNullable<Message['activities']>,
    allActivities: NonNullable<Message['activities']>,
    isActiveAssistantActivity: boolean,
    activeActivityId?: string
  ) {
    const bundleProducts = this.buildBundleProducts(allActivities);

    return map(
      activitiesToRender,
      (activity) => html`
        <cac-activity-renderer
          .activity=${activity}
          .isLoading=${isActiveAssistantActivity &&
          activity.id === activeActivityId}
          .bundleProducts=${bundleProducts}
          .allowNextActionsFallback=${this.activityContainsNextActions(
            activity
          )}
        ></cac-activity-renderer>
      `
    );
  }

  private activityContainsNextActions(activity: ActivityMessage) {
    if (!activity || activity.activityType !== 'a2ui-surface') {
      return false;
    }

    const operations =
      (activity.content as unknown as A2UISurfaceContent)?.operations ?? [];

    return operations.some((operation) =>
      (operation.surfaceUpdate?.components ?? []).some((component) => {
        const componentType = Object.keys(component.component ?? {})[0] ?? '';
        return isType(componentType, 'NextActionsBar');
      })
    );
  }

  private buildBundleProducts(
    activities: Message['activities']
  ): Map<string, Product[]> {
    const operations = (activities ?? [])
      .filter((a) => a.activityType === 'a2ui-surface')
      .flatMap(
        (a) => (a.content as unknown as A2UISurfaceContent).operations ?? []
      );
    return extractProductsBySurface(operations);
  }

  private getMessageContent(
    message: Message,
    isActiveAssistantActivity: boolean
  ) {
    return message.content || (isActiveAssistantActivity ? '' : '...');
  }

  private getProgressStepClass(step: string, index: number) {
    const isCurrent = index === this.progressSteps.length - 1;
    const isComplete = step === 'Response complete';
    const isFailed = step === 'Response failed';

    return [
      'agent-progress__step',
      isCurrent ? 'agent-progress__step--current' : '',
      isCurrent ? 'agent-progress__step--active' : '',
      isComplete ? 'agent-progress__step--complete' : '',
      isFailed ? 'agent-progress__step--failed' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private getLastAssistantId() {
    return [...this.messages]
      .reverse()
      .find((message) => message.role === 'assistant')?.id;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-message-list': CacMessageList;
  }
}
