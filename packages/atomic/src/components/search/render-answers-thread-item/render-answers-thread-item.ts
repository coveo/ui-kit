import {html, nothing, type TemplateResult} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {createRef, ref} from 'lit/directives/ref.js';
import type {FunctionalComponentWithOptionalChildren} from '@/src/utils/functional-component-utils';

let instanceCounter = 0;

export interface RenderAnswersThreadItemProps {
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
   * Whether the thread item is currently expanded.
   */
  isExpanded: boolean;
  /**
   * Optional actions content displayed on the right side of the header.
   */
  actions?: TemplateResult | typeof nothing;
  /**
   * Callback invoked when the expanded state changes.
   */
  onToggle?(expanded: boolean): void;
}

/**
 * Renders a generated answers thread item with timeline visuals and
 * collapsible content.
 *
 * @part item - The root container for the thread item.
 * @part timeline - The timeline column containing the dot and line.
 * @part timeline-dot - The dot representing the thread item on the timeline.
 * @part timeline-line - The vertical line connecting thread items.
 * @part header - The header row containing the title and actions.
 * @part title - The static title text when the item is not collapsible.
 * @part title-button - The title button when the item is collapsible.
 * @part actions - The container for the actions content.
 * @part content - The container for the slotted content.
 */
export const renderAnswersThreadItem: FunctionalComponentWithOptionalChildren<
  RenderAnswersThreadItemProps
> =
  ({props}) =>
  (children = nothing) => {
    const {
      title,
      isCollapsible,
      hideLine,
      isExpanded,
      actions = nothing,
      onToggle,
    } = props;

    const contentId = `answers-thread-item-content-${instanceCounter++}`;
    const contentRef = createRef<HTMLDivElement>();
    const buttonRef = createRef<HTMLButtonElement>();

    const initialExpanded = isCollapsible ? isExpanded : true;
    let expanded = initialExpanded;

    const toggle = () => {
      if (!isCollapsible) {
        return;
      }

      expanded = !expanded;
      if (buttonRef.value) {
        buttonRef.value.setAttribute(
          'aria-expanded',
          expanded ? 'true' : 'false'
        );
      }
      if (contentRef.value) {
        contentRef.value.toggleAttribute('hidden', !expanded);
        contentRef.value.setAttribute(
          'aria-hidden',
          expanded ? 'false' : 'true'
        );
      }
      onToggle?.(expanded);
    };

    const titleClasses = classMap({
      'text-lg font-semibold text-on-background ml-3 min-w-0': true,
      'inline-flex text-left mr-auto': true,
      'bg-transparent border-0 appearance-none px-3 py-1.5 transition-colors':
        isCollapsible,
      'hover:bg-neutral-light rounded-lg cursor-pointer': isCollapsible,
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2':
        isCollapsible,
    });

    return html`
    <div part="item">
      <div part="header" class="flex items-center gap-2">
        <div part="timeline" class="flex items-center justify-center w-[10px]">
          <span
            part="timeline-dot"
            class="h-2 w-2 rounded-full bg-[#adb5bd]"
          ></span>
        </div>
        ${
          isCollapsible
            ? html`<button
              part="title-button"
              ${ref(buttonRef)}
              type="button"
              aria-expanded=${initialExpanded ? 'true' : 'false'}
              aria-controls=${contentId}
              class=${titleClasses}
              @click=${toggle}
            >
              ${title}
            </button>`
            : html`<span part="title" class=${titleClasses}>${title}</span>`
        }
        ${
          actions !== nothing
            ? html`<div part="actions" class="ml-auto flex items-center gap-2">
              ${actions}
            </div>`
            : nothing
        }
      </div>
      <div class="flex">
        <div class="flex justify-center w-[10px] shrink-0">
          ${
            hideLine
              ? nothing
              : html`<span part="timeline-line" class="w-px bg-[#e5e5e5]"></span>`
          }
        </div>
        <div
          id=${contentId}
          part="content"
          class="ml-3 pt-2 pb-3"
          ${ref(contentRef)}
          ?hidden=${!initialExpanded}
          aria-hidden=${initialExpanded ? 'false' : 'true'}
        >
          ${children}
        </div>
      </div>
    </div>
  `;
  };
