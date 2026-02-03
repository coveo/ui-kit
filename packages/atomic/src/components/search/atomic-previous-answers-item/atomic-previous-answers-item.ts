import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {when} from 'lit/directives/when.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

/**
 * The `atomic-previous-answers-item` component displays a single previous follow-up question and its expandable answer.
 *
 * This component is used internally by `atomic-previous-answers-list`.
 *
 * @internal
 *
 * @slot (default) - The expandable content for the previous answer.
 * @slot actions - Actions displayed on the right side of the header when expanded.
 *
 * @event atomic-previous-answers-item-toggle - Fired when the user requests to toggle the expanded state.
 *
 * @part previous-answer-toggle - The button toggling the answer visibility.
 * @part previous-answer-question - The question text.
 * @part previous-answer-content - The container wrapping the expandable content.
 */
@customElement('atomic-previous-answers-item')
@withTailwindStyles
export class AtomicPreviousAnswersItem extends LitElement {
  static styles = css`
    :host {
      display: block;
      --atomic-previous-answers-timeline-width: 10px;
      --atomic-previous-answers-timeline-gap: 12px;
      --atomic-previous-answers-dot-size: 8px;
    }

    .item-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      column-gap: 16px;
      min-height: 40px;
      padding-top: 8px;
    }

    .title-group {
      display: flex;
      align-items: center;
      column-gap: var(--atomic-previous-answers-timeline-gap);
      min-width: 0;
      flex: 1;
    }

    .timeline-header {
      width: var(--atomic-previous-answers-timeline-width);
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: stretch;
      align-self: stretch;
    }

    .timeline-inner {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .line-flex {
      width: 1px;
      background: var(--atomic-neutral);
    }

    .dot {
      height: var(--atomic-previous-answers-dot-size);
      width: var(--atomic-previous-answers-dot-size);
      border-radius: 9999px;
      background: var(--atomic-neutral-dim);
      flex: 0 0 auto;
    }

    .toggle {
      min-width: 0;
      border: 0;
      background: transparent;
      padding: 2px 4px;
      border-radius: 6px;
      text-align: left;
      cursor: pointer;
    }

    .toggle:focus-visible {
      outline-width: 2px;
      outline-style: solid;
      outline-offset: 2px;
    }

    .hoverable:hover {
      background: var(--atomic-neutral-light);
    }

    .question {
      margin: 0;
    }

    .actions {
      display: flex;
      align-items: center;
      height: 36px;
      flex: none;
      column-gap: 8px;
    }

    .item-body {
      display: flex;
      column-gap: var(--atomic-previous-answers-timeline-gap);
      min-height: 16px;
      padding-bottom: 8px;
    }

    .timeline-body {
      width: var(--atomic-previous-answers-timeline-width);
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-self: stretch;
    }

    .content {
      min-width: 0;
      flex: 1;
    }
  `;

  /**
   * The previous follow-up question.
   */
  @property({type: String})
  public title = '';

  /**
   * Whether to hide the vertical timeline connector.
   */
  @property({type: Boolean})
  public hideTimeline = false;

  /**
   * Whether to display the connector line above the dot.
   */
  @property({type: Boolean, attribute: 'has-previous'})
  public hasPrevious = false;

  /**
   * Whether to display the connector line below the dot.
   */
  @property({type: Boolean, attribute: 'has-next'})
  public hasNext = false;

  /**
   * Whether the item is currently expanded.
   */
  @property({type: Boolean, reflect: true})
  public expanded = false;

  /**
   * Whether the item can be collapsed.
   */
  @property({type: Boolean, attribute: 'non-collapsible'})
  public nonCollapsible = false;

  /**
   * The id of the expandable content element controlled by this item.
   */
  @property({type: String, attribute: 'content-id'})
  public contentId = '';

  private requestToggle() {
    if (this.nonCollapsible) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent('atomic-previous-answers-item-toggle', {
        detail: {expanded: !this.expanded},
        bubbles: true,
        composed: true,
      })
    );
  }

  protected updated() {
    if (this.nonCollapsible && !this.expanded) {
      this.expanded = true;
    }
  }

  render() {
    const showBottomConnector = this.hasNext && !this.hideTimeline;

    const lineClass = (isVisible: boolean) =>
      classMap({
        'line-flex': true,
        'flex-1': isVisible,
        'h-0': !isVisible,
      });

    return html`
      <div class="item-header">
        <div class="title-group">
          <div class="timeline-header" aria-hidden="true">
            <div class="timeline-inner">
              <span class=${lineClass(this.hasPrevious)}></span>
              <span class="dot"></span>
              <span class=${lineClass(showBottomConnector)}></span>
            </div>
          </div>

          <button
            class=${classMap({
              toggle: true,
              hoverable: !this.nonCollapsible,
              'outline-primary': true,
            })}
            @click=${this.requestToggle}
            aria-controls=${this.contentId || nothing}
            aria-expanded=${this.expanded ? 'true' : 'false'}
            part="previous-answer-toggle"
            type="button"
          >
            <p
              class=${classMap({
                question: true,
                'query-text': true,
                'text-base': true,
                'leading-6': true,
                'font-semibold': this.expanded,
                'font-medium': !this.expanded,
              })}
              part="previous-answer-question"
            >
              ${this.title}
            </p>
          </button>
        </div>

        ${when(
          this.expanded,
          () => html`
            <div class="actions">
              <slot name="actions"></slot>
            </div>
          `,
          () => nothing
        )}
      </div>

      <div class="item-body">
        <div class="timeline-body" aria-hidden="true">
          ${when(
            showBottomConnector,
            () => html`<span class="line-flex flex-1"></span>`,
            () => nothing
          )}
        </div>

        <div class="content">
          ${when(
            this.expanded,
            () => html`
              <div
                id=${ifDefined(this.contentId || undefined)}
                part="previous-answer-content"
              >
                <slot></slot>
              </div>
            `,
            () => nothing
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-previous-answers-item': AtomicPreviousAnswersItem;
  }
}
