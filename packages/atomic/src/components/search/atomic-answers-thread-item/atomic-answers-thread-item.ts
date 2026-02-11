import {html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {when} from 'lit/directives/when.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

export interface AtomicAnswersThreadItemProps {
  /**
   * The title displayed for the thread item.
   */
  title: string;
  /**
   * Whether the thread item can be expanded or collapsed.
   */
  isCollapsible: boolean;
  /**
   * Whether the timeline line should be hidden.
   */
  hideLine: boolean;
  /**
   * Whether the thread item is initially expanded.
   */
  isExpanded: boolean;
}

/**
 * The `atomic-answers-thread-item` component renders a generated answers
 * thread item with timeline visuals and collapsible content.
 *
 * @internal
 *
 * @slot status - The status content (e.g., thinking/elapsed time) provided by the parent.
 * @slot (default) - The content rendered when the item is expanded.
 */
@customElement('atomic-answers-thread-item')
@withTailwindStyles
export class AtomicAnswersThreadItem extends LitElement {
  private readonly contentId = `atomic-answers-thread-item-content-${
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  }`;

  /**
   * The title displayed for the thread item.
   */
  @property({type: String})
  public title = '';

  /**
   * Whether the thread item can be expanded or collapsed.
   */
  @property({type: Boolean, attribute: 'is-collapsible'})
  public isCollapsible = false;

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
      this.isExpanded = this.isCollapsible ? this.isExpanded : true;
    }
  }

  private toggle = () => {
    if (!this.isCollapsible) {
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
    const titleButtonClasses = classMap({
      ...titleBaseClasses,
      'font-semibold': this.isExpanded,
      'font-normal': !this.isExpanded,
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
    const timelineDotClasses = classMap({
      'mt-3': true,
      'h-2': true,
      'w-2': true,
      'rounded-full': true,
      'bg-neutral-dark': this.isExpanded,
      'bg-neutral-dim': !this.isExpanded,
    });

    return html`
      <li class="grid grid-cols-[10px_1fr]">
        <div class="flex flex-col items-center row-span-2">
          <span
            class=${timelineDotClasses}
          ></span>
          ${when(
            !this.hideLine,
            () =>
              html`<span
                class="w-px bg-neutral flex-1"
              ></span>`,
            () => nothing
          )}
        </div>
        <div class="flex items-start">
          <div class="flex min-w-0 flex-col">
            ${when(
              this.isCollapsible,
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
                html`<span class=${classMap({
                  ...titleBaseClasses,
                  'font-semibold': this.isExpanded,
                  'font-normal': !this.isExpanded,
                })}>${this.title}</span>`
            )}
            ${when(
              this.isExpanded,
              () => html`
                <span class="text-sm text-neutral-dark pl-2 ml-1">
                  <slot name="status"></slot>
                </span>
              `,
              () => nothing
            )}
          </div>
        </div>
        <div
          id=${this.contentId}
          class="pl-2 py-2 ml-1"
          ?hidden=${!this.isExpanded}
          aria-hidden=${this.isExpanded ? 'false' : 'true'}
        >
          <slot></slot>
        </div>
      </li>
    `;
  }
}
