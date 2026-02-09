import {html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import styles from './atomic-answers-thread-item.tw.css';

export interface AnswersThreadItemToggleEventDetail {
  expanded: boolean;
}

/**
 * @internal
 * The `atomic-answers-thread-item` component renders a single generated answer item
 * in a thread view, including timeline visuals and collapsible content.
 *
 * @slot (default) - The generated answer content for this thread item.
 *
 * @part item - The root container for the thread item.
 * @part timeline - The timeline column containing the dot and line.
 * @part timeline-dot - The dot representing the thread item on the timeline.
 * @part timeline-line - The vertical line connecting thread items.
 * @part header - The header row containing the title.
 * @part title - The static title text when the item is not collapsible.
 * @part title-button - The title button when the item is collapsible.
 * @part content - The container for the slotted content.
 *
 * @event toggle - Emitted when the item is expanded or collapsed.
 */
@customElement('atomic-answers-thread-item')
@withTailwindStyles
export class AtomicAnswersThreadItem extends LitElement {
  private static instanceCounter = 0;
  static styles = [styles];

  private readonly contentId =
    `atomic-answers-thread-item-content-${AtomicAnswersThreadItem.instanceCounter++}`;

  /**
   * The title displayed for the thread item.
   */
  @property({type: String}) title = '';

  /**
   * Whether the thread item can be expanded or collapsed.
   */
  @property({
    type: Boolean,
    attribute: 'is-collapsible',
    converter: booleanConverter,
  })
  isCollapsible = false;

  /**
   * Whether the timeline line should be hidden (e.g., for the last item).
   */
  @property({
    type: Boolean,
    attribute: 'hide-line',
    converter: booleanConverter,
  })
  hideLine = false;

  /**
   * Whether the thread item is currently expanded.
   */
  @property({
    type: Boolean,
    attribute: 'is-expanded',
    reflect: true,
    converter: booleanConverter,
  })
  isExpanded = false;

  private onToggle = () => {
    if (!this.isCollapsible) {
      return;
    }

    this.isExpanded = !this.isExpanded;
    this.dispatchEvent(
      new CustomEvent<AnswersThreadItemToggleEventDetail>('toggle', {
        detail: {expanded: this.isExpanded},
        bubbles: true,
        composed: true,
      })
    );
  };

  private renderTitle() {
    if (!this.isCollapsible) {
      return html`<span part="title">${this.title}</span>`;
    }

    return html`<button
      part="title-button"
      type="button"
      aria-expanded=${String(this.isExpanded)}
      aria-controls=${this.contentId}
      class=${classMap({
        'item-title': true,
        hoverable: this.isCollapsible,
      })}
      @click=${this.onToggle}
    >
      ${this.title}
    </button>`;
  }

  updated() {
    if (!this.isCollapsible && !this.isExpanded) {
      this.isExpanded = true;
    }
  }

  render() {
    return html`
      <div part="item">
        <div part="header" class="item-header">
          <div part="timeline" class="dot-container">
            <span part="timeline-dot" class="dot"></span>
          </div>
          ${this.renderTitle()}
        </div>
        <div class="item-body">
          <div class="line-container">
            ${
              this.hideLine
                ? nothing
                : html`<span part="timeline-line" class="line"></span>`
            }
          </div>
          <div id=${this.contentId} part="content" class="item-content">
            ${this.isExpanded ? html`<slot></slot>` : nothing}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-answers-thread-item': AtomicAnswersThreadItem;
  }
}
