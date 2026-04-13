import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import type {ActivityMessage} from '@coveo/commerce-agent-chat-core/types/agent';
import type {
  A2UISurfaceContent,
  Product,
} from '@coveo/commerce-agent-chat-core/types/commerce';
import './cac-commerce-catalog-view.js';

/**
 * The `cac-activity-renderer` component renders an agent activity payload.
 */
@customElement('cac-activity-renderer')
export class CacActivityRenderer extends LitElement {
  static override styles = css`
    .activity-renderer {
      border: 2px solid rgba(0, 212, 255, 0.2);
      border-radius: 12px;
      background: rgba(22, 45, 66, 0.4);
      padding: 0.85rem;
      align-self: flex-start;
      max-width: min(100%, 680px);
      backdrop-filter: blur(8px);
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.05);
    }

    .activity-type {
      margin: 0 0 0.35rem;
      color: var(--ink-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .activity-content {
      margin: 0;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
    }
  `;

  /** The activity payload to render. */
  @property({attribute: false})
  public activity: ActivityMessage = {
    id: '',
    activityType: '',
    content: {},
  };

  /** Whether loading placeholders should be shown for supported commerce content. */
  @property({type: Boolean, attribute: 'is-loading'})
  public isLoading = false;

  /** Accumulated products from all activities in the same message, used to resolve bundle surface references. */
  @property({attribute: false})
  public bundleProducts: Map<string, Product[]> = new Map();

  override render() {
    return html`
      <article class="activity-renderer" aria-label="Agent activity">
        ${when(
          this.isA2UIActivity(),
          () => this.renderA2UIContent(),
          () => this.renderRawActivity()
        )}
      </article>
    `;
  }

  private isA2UIActivity() {
    return this.activity.activityType === 'a2ui-surface';
  }

  private renderA2UIContent() {
    return html`
      <cac-commerce-catalog-view
        .content=${this.activity.content as unknown as A2UISurfaceContent}
        .isLoading=${this.isLoading}
        .bundleProducts=${this.bundleProducts}
      ></cac-commerce-catalog-view>
    `;
  }

  private renderRawActivity() {
    return html`
      <p class="activity-type">${this.activity.activityType}</p>
      <pre class="activity-content">
${JSON.stringify(this.activity.content, null, 2)}</pre
      >
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-activity-renderer': CacActivityRenderer;
  }
}
