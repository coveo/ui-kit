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
   * Whether the thread line over the dot should be hidden.
   */
  hideLineTop: boolean;
  /**
   * Whether the thread line under the dot should be hidden.
   */
  hideLineBottom: boolean;
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
   * Whether the timeline top line should be hidden (e.g., for the first item).
   */
  @property({type: Boolean, attribute: 'hide-line-top'})
  public hideLineTop = false;

  /**
   * Whether the timeline bottom line should be hidden (e.g., for the last item).
   */
  @property({type: Boolean, attribute: 'hide-line-bottom'})
  public hideLineBottom = false;

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
      'ml-1': true,
      'px-2': true,
      'py-1.5': true,
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
      'z-10': true,
      'bg-neutral-dark': this.isExpanded,
      'bg-neutral-dim': !this.isExpanded,
    });
    const topTrackClasses = classMap({
      relative: true,
      flex: true,
      'w-3': true,
      'shrink-0': true,
      'items-center': true,
      'justify-center': true,
      'self-stretch': true,
      "before:content-['']": !this.hideLineTop,
      'before:absolute': !this.hideLineTop,
      'before:left-1/2': !this.hideLineTop,
      'before:top-0': !this.hideLineTop,
      'before:bottom-1/2': !this.hideLineTop,
      'before:w-px': !this.hideLineTop,
      'before:-translate-x-1/2': !this.hideLineTop,
      'before:bg-neutral': !this.hideLineTop,
      "after:content-['']": !this.hideLineBottom,
      'after:absolute': !this.hideLineBottom,
      'after:left-1/2': !this.hideLineBottom,
      'after:top-1/2': !this.hideLineBottom,
      'after:bottom-0': !this.hideLineBottom,
      'after:w-px': !this.hideLineBottom,
      'after:-translate-x-1/2': !this.hideLineBottom,
      'after:bg-neutral': !this.hideLineBottom,
    });
    const bottomTrackClasses = classMap({
      relative: true,
      flex: true,
      'w-3': true,
      'shrink-0': true,
      'justify-center': true,
      'self-stretch': true,
      "before:content-['']": !this.hideLineBottom,
      'before:absolute': !this.hideLineBottom,
      'before:left-1/2': !this.hideLineBottom,
      'before:top-0': !this.hideLineBottom,
      'before:bottom-0': !this.hideLineBottom,
      'before:w-px': !this.hideLineBottom,
      'before:-translate-x-1/2': !this.hideLineBottom,
      'before:bg-neutral': !this.hideLineBottom,
    });

    return html`
      <li class="grid min-w-0">
        <div class="flex min-w-0 items-center gap-3">
          <div class=${topTrackClasses}>
            <span class=${timelineDotClasses}></span>
          </div>
          <div class="flex min-w-0 flex-col">
            ${when(
              !this.disableCollapse,
              () =>
                html`<button
                  type="button"
                  aria-expanded=${this.isExpanded ? 'true' : 'false'}
                  aria-controls=${this.contentId}
                  class=${titleButtonClasses}
                  @click=${this.toggle}
                >
                  ${this.title}
                </button>`,
              () =>
                html`<span
                  class=${titleTextClasses}
                  >${this.title}</span
                >`
            )}
          </div>
        </div>
        <div class="flex min-w-0 gap-3">
          <div class=${bottomTrackClasses}></div>
          <div
            id=${this.contentId}
            class="pl-2 py-2 ml-1"
            ?hidden=${!this.isExpanded}
            aria-hidden=${this.isExpanded ? 'false' : 'true'}
          >
            <slot></slot>
          </div>
        </div>
      </li>
    `;
  }
}
