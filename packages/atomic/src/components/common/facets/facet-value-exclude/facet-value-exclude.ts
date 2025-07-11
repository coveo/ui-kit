import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import Tick from '../../../../images/clear.svg';
import '../../atomic-icon/atomic-icon';

export interface ExcludeProps {
  onClick(): void;
  ariaLabel?: string;
}

export const renderFacetValueExclude: FunctionalComponent<ExcludeProps> = ({
  props,
}) => {
  return html`<button
    class="value-exclude-button peer invisible absolute right-2 z-1 order-last ml-auto flex group-hover:visible"
    part="value-exclude-button"
    aria-label=${ifDefined(props.ariaLabel)}
    @click=${() => props.onClick?.()}
  >
    <atomic-icon
      class="bg-neutral hover:bg-error order-last w-4 rounded p-1 hover:fill-white"
      icon=${Tick}
    ></atomic-icon>
  </button> `;
};
