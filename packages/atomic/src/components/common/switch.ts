import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {
  createTooltipId,
  dismissTooltipOnEscape,
  hideTooltip,
  showTooltip,
} from '@/src/components/common/tooltip-utils';

export interface SwitchProps {
  checked: boolean;
  onToggle(checked: boolean): void;
  ariaLabel: string;
  part: string;
  tabIndex: number;
  title: string;
  withToggle: boolean;
}

export const renderSwitch: FunctionalComponent<SwitchProps> = ({props}) => {
  const tooltipId = createTooltipId('atomic-switch');
  const containerClasses = tw({
    'w-12 h-6 p-1 rounded-full': true,
    'bg-primary': props.checked,
    'bg-neutral': !props.checked,
  });

  const handleClasses = tw({
    'w-4 h-4 rounded-full bg-white': true,
    'ml-6': props.checked,
  });

  const buttonClasses = tw({
    'rounded-full btn-outline-neutral': true,
    flex: props.withToggle,
    hidden: !props.withToggle,
  });

  return html`<div class="relative inline-flex">
    <button
      role="switch"
      class=${multiClassMap(buttonClasses)}
      aria-label=${ifDefined(props.ariaLabel)}
      aria-checked=${props.checked ? 'true' : 'false'}
      part=${ifDefined(props.part)}
      tabindex=${ifDefined(props.tabIndex)}
      @click=${() => props.onToggle(!props.checked)}
      @focus=${(event: FocusEvent) => showTooltip(event, tooltipId)}
      @blur=${(event: FocusEvent) => hideTooltip(event, tooltipId)}
      @mouseenter=${(event: MouseEvent) => showTooltip(event, tooltipId)}
      @mouseleave=${(event: MouseEvent) => hideTooltip(event, tooltipId)}
      @keydown=${(event: KeyboardEvent) =>
        dismissTooltipOnEscape(event, tooltipId)}
    >
      <div class=${multiClassMap(containerClasses)}>
        <div class=${multiClassMap(handleClasses)}></div>
      </div>
    </button>
    ${props.title
      ? html`<span
          id=${tooltipId}
          role="tooltip"
          class="pointer-events-none bg-neutral-dark text-on-primary absolute top-full left-1/2 z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs"
          hidden
        >
          ${props.title}
        </span>`
      : null}
  </div>`;
};
