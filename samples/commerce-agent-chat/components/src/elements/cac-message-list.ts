import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {when} from 'lit/directives/when.js';
import {extractProductsBySurface} from '@coveo/commerce-agent-chat-core/lib/commerceExtractor';
import {renderMarkdown} from '@coveo/commerce-agent-chat-core/lib/markdown';
import type {Message} from '@coveo/commerce-agent-chat-core/types/agent';
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

    .agent-progress__steps {
      margin: 0.5rem 0 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .agent-progress__step {
      font-size: 0.8rem;
      color: var(--accent);
      opacity: 0.5;
    }

    .agent-progress__step--active {
      opacity: 1;
      font-weight: 500;
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
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
    const isActiveAssistantActivity = this.isActiveAssistantActivity(
      message,
      lastAssistantId
    );

    return html`
      <article class=${`message message-${message.role}`}>
        <p class="message-role">
          ${message.role === 'user' ? 'You' : 'Zane (Agent)'}
        </p>
        ${this.renderMessageBody(message, isActiveAssistantActivity)}
        ${this.renderProgressSteps(isActiveAssistantActivity)}
      </article>
      ${this.renderActivities(message, isActiveAssistantActivity)}
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
      () =>
        when(
          Boolean(content),
          () =>
            html`<div class="message-content message-content--markdown">
              ${unsafeHTML(renderMarkdown(content))}
            </div>`
        )
    );
  }

  private renderProgressSteps(isActiveAssistantActivity: boolean) {
    const hasProgressSteps =
      isActiveAssistantActivity && this.progressSteps.length > 0;

    return when(
      hasProgressSteps,
      () => html`
        <ul class="agent-progress__steps">
          ${map(
            this.progressSteps,
            (step, index) =>
              html`<li
                class=${`agent-progress__step${index === this.progressSteps.length - 1 ? ' agent-progress__step--active' : ''}`}
              >
                ${step}
              </li>`
          )}
        </ul>
      `
    );
  }

  private renderActivities(
    message: Message,
    isActiveAssistantActivity: boolean
  ) {
    const activities = message.activities ?? [];
    const bundleProducts = this.buildBundleProducts(activities);

    return map(
      activities,
      (activity) => html`
        <cac-activity-renderer
          .activity=${activity}
          .isLoading=${isActiveAssistantActivity}
          .bundleProducts=${bundleProducts}
        ></cac-activity-renderer>
      `
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

  private isActiveAssistantActivity(
    message: Message,
    lastAssistantId?: string
  ) {
    return (
      this.isLoading &&
      message.role === 'assistant' &&
      message.id === lastAssistantId
    );
  }

  private getMessageContent(
    message: Message,
    isActiveAssistantActivity: boolean
  ) {
    return message.content || (isActiveAssistantActivity ? '' : '...');
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
