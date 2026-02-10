import {html, nothing} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {when} from 'lit/directives/when.js';
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
 * @part header - The header row containing the title.
 * @part title - The static title text when the item is not collapsible.
 * @part title-button - The title button when the item is collapsible.
 * @part content - The container for the slotted content.
 */
export const renderAnswersThreadItem: FunctionalComponentWithOptionalChildren<
  RenderAnswersThreadItemProps
> =
  ({props}) =>
  (children = nothing) => {
    const {title, isCollapsible, hideLine, isExpanded, onToggle} = props;

    const contentId = `answers-thread-item-content-${instanceCounter++}`;
    const expanded = isCollapsible ? isExpanded : true;

    const toggle = () => {
      if (!isCollapsible) {
        return;
      }

      onToggle?.(!isExpanded);
    };

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
            isCollapsible,
            () =>
              html`<button
                part="title-button"
                type="button"
                aria-expanded=${expanded ? 'true' : 'false'}
                aria-controls=${contentId}
                class=${titleButtonClasses}
                @click=${toggle}
              >
                ${title}
              </button>`,
            () =>
              html`<span part="title" class=${titleTextClasses}
                >${title}</span
              >`
          )}
        </div>
        <div class="flex justify-center">
          ${when(
            !hideLine,
            () =>
              html`<span
                part="timeline-line"
                class="w-px bg-neutral-lighter mt-[-6px]"
              ></span>`,
            () => nothing
          )}
        </div>
        <div
          id=${contentId}
          part="content"
          class="pl-2 py-2 ml-1"
          ?hidden=${!expanded}
          aria-hidden=${expanded ? 'false' : 'true'}
        >
          ${children}
        </div>
      </div>
    `;
  };
