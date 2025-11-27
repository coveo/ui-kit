import type {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {type RefOrCallback, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import ArrowBottomIcon from '@/src/images/arrow-bottom-rounded.svg';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {renderButton} from '../button';

export const POPOVER_ID = 'atomic-tab-popover';

export interface TabPopoverProps {
  i18n: i18n;
  isOpen: boolean;
  show: boolean;
  onToggle: () => void;
  buttonRef?: RefOrCallback;
  popupRef?: RefOrCallback;
}

const renderDropdownButton = ({
  i18n,
  isOpen,
  onToggle,
  buttonRef,
}: Pick<TabPopoverProps, 'i18n' | 'isOpen' | 'onToggle' | 'buttonRef'>) => {
  const label = i18n.t('more');
  const ariaLabel = i18n.t('tab-popover', {label});

  const arrowClasses = tw({
    'rotate-180': isOpen,
  });

  return renderButton({
    props: {
      style: 'text-transparent',
      onClick: onToggle,
      part: 'popover-button',
      ariaExpanded: isOpen ? 'true' : 'false',
      ariaLabel,
      ariaControls: POPOVER_ID,
      class: 'relative pb-1 mt-1 group mr-6 font-semibold',
      ref: buttonRef,
    },
  })(html`
    <span
      title=${label}
      part="value-label"
      class="group-hover:text-primary-light group-focus:text-primary mr-1.5 truncate"
    >
      ${label}
    </span>
    <atomic-icon
      part="arrow-icon"
      class="group-hover:text-primary-light group-focus:text-primary ml-auto w-2 ${multiClassMap(arrowClasses)}"
      icon=${ArrowBottomIcon}
    ></atomic-icon>
  `);
};

const renderBackdrop = (onToggle: () => void) => {
  return html`
    <div
      part="backdrop"
      class="fixed top-0 right-0 bottom-0 left-0 z-9998 cursor-pointer bg-transparent"
      @click=${onToggle}
    ></div>
  `;
};

/**
 * Renders a tab popover component that displays overflowing tabs in a dropdown.
 *
 * @param props - The popover configuration
 * @param props.i18n - The i18n instance for translations
 * @param props.isOpen - Whether the popover is currently open
 * @param props.show - Whether the popover button should be visible
 * @param props.onToggle - Callback to toggle the popover open/closed state
 * @param props.buttonRef - Optional ref callback for the trigger button element
 * @param props.popupRef - Optional ref callback for the popup container element
 * @returns A function that accepts children (the overflow tabs) and returns the complete popover template
 */
export const renderTabPopover: FunctionalComponentWithChildren<
  TabPopoverProps
> =
  ({props}) =>
  (children) => {
    const {i18n, isOpen, show, onToggle, buttonRef, popupRef} = props;

    const containerClasses = tw({
      'z-9999': isOpen,
    });

    const popoverClasses = tw({
      flex: isOpen,
      hidden: !isOpen,
    });

    const hostClasses = tw({
      'visibility-hidden': !show,
    });

    return html`
      <div
        class="absolute ${multiClassMap(hostClasses)}"
        aria-hidden=${!show}
        @focusout=${(event: FocusEvent) => {
          // Close popover when focus leaves unless moving to slotted content
          const slot = (event.currentTarget as HTMLElement).querySelector(
            'slot'
          );
          if (!slot) return;

          const assignedElements = (slot as HTMLSlotElement).assignedElements();
          const isMovingToSlottedElement = assignedElements.some(
            (element) =>
              element === event.relatedTarget ||
              element.contains(event.relatedTarget as Node)
          );

          if (isMovingToSlottedElement) return;

          const popupElement = (
            event.currentTarget as HTMLElement
          ).querySelector(`#${POPOVER_ID}`);
          if (!popupElement?.contains(event.relatedTarget as Node)) {
            if (isOpen) {
              onToggle();
            }
          }
        }}
        @keydown=${(e: KeyboardEvent) => {
          if (!isOpen) return;

          if (e.key === 'Escape') {
            onToggle();
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            navigatePopover(e.key, e.currentTarget as HTMLElement);
          }
        }}
      >
        <div class="relative ${multiClassMap(containerClasses)}">
          ${renderDropdownButton({i18n, isOpen, onToggle, buttonRef})}
          <ul
            id=${POPOVER_ID}
            ${popupRef ? ref(popupRef) : nothing}
            part="overflow-tabs"
            class="bg-background border-neutral absolute rounded-lg border py-2 shadow-lg flex-col max-w-[150px] ${multiClassMap(popoverClasses)}"
          >
            <slot></slot>
            ${children}
          </ul>
        </div>
        ${when(isOpen, () => renderBackdrop(onToggle))}
      </div>
    `;
  };

function navigatePopover(key: string, container: HTMLElement): void {
  const slot = container.querySelector('slot');
  if (!slot) return;

  const tabButtons = Array.from((slot as HTMLSlotElement).assignedElements())
    .map((el) => (el as HTMLElement).querySelector('button'))
    .filter((el): el is HTMLButtonElement => el !== null);

  if (!tabButtons.length) return;

  const currentIndex = getCurrentTabIndex(tabButtons);
  const startIndex = currentIndex > -1 ? currentIndex : -1;

  let nextIndex: number;
  if (currentIndex === -1) {
    nextIndex = key === 'ArrowDown' ? 0 : tabButtons.length - 1;
  } else {
    nextIndex =
      key === 'ArrowDown'
        ? (startIndex + 1) % tabButtons.length
        : (startIndex - 1 + tabButtons.length) % tabButtons.length;
  }

  tabButtons[nextIndex]?.focus();
}

function getCurrentTabIndex(elements: HTMLButtonElement[]): number {
  const MAX_SHADOW_DEPTH = 3;
  let currentElement = document.activeElement;
  let depth = 0;

  while (currentElement?.shadowRoot && depth < MAX_SHADOW_DEPTH) {
    currentElement = currentElement.shadowRoot.activeElement;
    depth++;
  }

  if (!(currentElement instanceof HTMLButtonElement)) {
    return -1;
  }

  return elements.indexOf(currentElement);
}
