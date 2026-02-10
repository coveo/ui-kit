import {html, LitElement, nothing, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
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
   * Whether the timeline line should be hidden (e.g., for the last item).
   */
  hideLine: boolean;
  /**
   * Whether the thread item is initially expanded.
   */
  isExpanded: boolean;
  /**
   * Callback invoked when the expanded state changes.
   */
  onToggle?(expanded: boolean): void;
}

/**
 * The `atomic-answers-thread-item` component renders a generated answers
 * thread item with timeline visuals and collapsible content.
 *
 * @part item - The root container for the thread item.
 * @part timeline - The timeline column containing the dot and line.
 * @part timeline-dot - The dot representing the thread item on the timeline.
 * @part timeline-line - The vertical line connecting thread items.
 * @part header - The header row containing the title.
 * @part title - The static title text when the item is not collapsible.
 * @part title-button - The title button when the item is collapsible.
 * @part content - The container for the slotted content.
 * @slot (default) - The content rendered when the item is expanded.
 */
@customElement('atomic-answers-thread-item')
@withTailwindStyles
export class AtomicAnswersThreadItem extends LitElement {
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

  /**
   * Callback invoked when the expanded state changes.
   */
  @property({attribute: false})
  public onToggle?: (expanded: boolean) => void;

  @state()
  private expanded = false;

  protected willUpdate(changedProperties: PropertyValues<this>) {
    if (
      !this.hasUpdated &&
      (changedProperties.has('isExpanded') ||
        changedProperties.has('isCollapsible'))
    ) {
      this.expanded = this.isCollapsible ? this.isExpanded : true;
    }
  }

  private toggle = () => {
    if (!this.isCollapsible) {
      return;
    }

    this.expanded = !this.expanded;
    this.onToggle?.(this.expanded);
  };

  public render() {
    const titleBaseClasses = {
      'text-lg font-semibold text-on-background min-w-0 inline-flex text-left mr-auto': true,
    };
    const titleButtonClasses = classMap({
      ...titleBaseClasses,
      'bg-transparent border-0 appearance-none ml-1 px-2 py-1.5 transition-colors': true,
      'hover:bg-neutral-light rounded-md cursor-pointer': true,
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2': true,
    });
    const titleTextClasses = classMap(titleBaseClasses);

    return html`
      <div part="item" class="grid grid-cols-[10px_1fr]">
        <div part="timeline" class="flex items-center justify-center">
          <span
            part="timeline-dot"
            class="h-2 w-2 rounded-full bg-neutral-dim"
          ></span>
        </div>
        <div part="header" class="flex items-center">
          ${when(
            this.isCollapsible,
            () =>
              html`<button
                part="title-button"
                type="button"
                aria-expanded=${this.expanded ? 'true' : 'false'}
                class=${titleButtonClasses}
                @click=${this.toggle}
              >
                ${this.title}
              </button>`,
            () =>
              html`<span part="title" class=${titleTextClasses}
                >${this.title}</span
              >`
          )}
        </div>
        <div class="flex justify-center">
          ${when(
            !this.hideLine,
            () =>
              html`<span
                part="timeline-line"
                class="w-px bg-neutral-lighter mt-[-6px]"
              ></span>`,
            () => nothing
          )}
        </div>
        <div
          part="content"
          class="pl-2 py-2 ml-1"
          ?hidden=${!this.expanded}
          aria-hidden=${this.expanded ? 'false' : 'true'}
        >
          <slot></slot>
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
