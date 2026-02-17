import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {when} from 'lit/directives/when.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

export interface GeneratedAnswerThreadItemProps {
  /**
   * The title displayed for the thread item.
   */
  title: string;
  /**
   * Whether the thread item can be expanded or collapsed.
   */
  disableCollapse: boolean;
  /**
   * Whether the thread line should be hidden.
   */
  hideLine: boolean;
  /**
   * Whether the thread item is initially expanded.
   */
  isExpanded: boolean;
}

/**
 * The `generated-answer-thread-item` component renders a generated answer
 * thread item with timeline visuals and collapsible content.
 *
 * @internal
 *
 * @slot (default) - The content rendered when the item is expanded.
 */
@customElement('generated-answer-thread-item')
@withTailwindStyles
export class GeneratedAnswerThreadItem extends LitElement {
  private readonly contentId =
    `generated-answer-thread-item-content-${crypto.randomUUID()}`;

  /**
   * The title displayed for the thread item.
   */
  @property({type: String})
  public title = '';

  /**
   * Whether the thread item can be expanded or collapsed.
   */
  @property({type: Boolean, attribute: 'disable-collapse'})
  public disableCollapse = false;

  /**
   * Whether the timeline line should be hidden (e.g., for the last item).
   */
  @property({type: Boolean, attribute: 'hide-line'})
  public hideLine = false;

  /**
   * Whether the thread item is initially expanded.
   */
  @property({type: Boolean, attribute: 'is-expanded'})
  public isExpanded = false;

  protected willUpdate() {
    if (!this.hasUpdated) {
      this.isExpanded = !this.disableCollapse ? this.isExpanded : true;
    }
  }

  private toggle = () => {
    if (this.disableCollapse) {
      return;
    }

    this.isExpanded = !this.isExpanded;
  };

  public render() {
    const titleBaseClasses = {
      'text-on-background': true,
      'text-base': true,
      'min-w-0': true,
      'inline-flex': true,
      'text-left': true,
      'mr-auto': true,
      'px-2': true,
      'py-1.5': true,
    };
    const titleWeightClasses = {
      'font-semibold': this.isExpanded,
      'font-normal': !this.isExpanded,
    };
    const titleButtonClasses = classMap({
      ...titleBaseClasses,
      ...titleWeightClasses,
      'bg-transparent': true,
      'border-0': true,
      'appearance-none': true,
      'transition-colors': true,
      'hover:bg-neutral-light': true,
      'rounded-md': true,
      'cursor-pointer': true,
      'focus-visible:outline-none': true,
      'focus-visible:ring-2': true,
      'focus-visible:ring-primary': true,
      'focus-visible:ring-offset-2': true,
    });
    const titleTextClasses = classMap({
      ...titleBaseClasses,
      ...titleWeightClasses,
    });
    const timelineDotClasses = classMap({
      'h-2': true,
      'w-2': true,
      'rounded-full': true,
      'bg-neutral-dark': this.isExpanded,
      'bg-neutral-dim': !this.isExpanded,
    });
    const timelineBodyRowClasses = classMap({
      flex: true,
      'min-w-0': true,
      'gap-3': true,
      'min-h-3': !this.isExpanded,
    });
    const timelineConnectorClasses =
      "relative h-full w-px bg-neutral before:absolute before:left-0 before:top-[-8px] before:h-[8px] before:w-px before:bg-neutral before:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:h-[8px] after:w-px after:bg-neutral after:content-['']";

    return html`
      <li class="grid min-w-0">
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex w-[10px] shrink-0 items-center justify-center">
            <span class=${timelineDotClasses}></span>
          </div>
          <div class="flex min-w-0 flex-col">
            ${when(
              !this.disableCollapse,
              () =>
                html`<button
                  type="button"
                  aria-expanded=${this.isExpanded}
                  aria-controls=${this.contentId}
                  class=${titleButtonClasses}
                  @click=${this.toggle}
                >
                  ${this.title}
                </button>`,
              () => html`<span class=${titleTextClasses}>${this.title}</span>`
            )}
          </div>
        </div>
        <div class=${timelineBodyRowClasses}>
          <div class="flex w-[10px] shrink-0 justify-center">
            ${when(
              this.hideLine,
              () => html``,
              () => html`<span class=${timelineConnectorClasses}> </span>`
            )}
          </div>
          <div id=${this.contentId} class="pl-2 py-1.5">
            <div class="mb-2"
              ?hidden=${!this.isExpanded}
              aria-hidden=${this.isExpanded ? 'false' : 'true'}
            >
              <slot></slot>
            </div>
          </div>
        </div>
        ${when(
          this.isExpanded,
          () =>
            html`<div
              class="thread-content-divider h-px w-full bg-gradient-to-r from-transparent via-neutral to-transparent"
              aria-hidden="true"
            ></div>`
        )}
      </li>
    `;
  }
}
