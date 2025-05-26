import {multiClassMap} from '@/src/directives/multi-class-map';
import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {ref, RefOrCallback} from 'lit/directives/ref.js';
import Tick from '../../../../images/clear.svg';
import '../../atomic-icon/atomic-icon';

export interface ExcludeProps {
  onClick(): void;
  key?: string | number;
  class?: string;
  text?: string;
  ariaLabel?: string;
  ref?: RefOrCallback;
  onMouseEnter?(evt: MouseEvent): void;
}

export const renderFacetValueExclude: FunctionalComponent<ExcludeProps> = ({
  props,
}) => {
  const baseClassNames = 'value-exclude-button peer order-last flex ml-auto';

  const classNames = {
    [baseClassNames]: true,
    [props.class ?? '']: Boolean(props.class),
  };

  return html`<button
    class=${multiClassMap(classNames)}
    part="value-exclude-button"
    ${ref(props.ref)}
    .key=${props.key}
    aria-label=${ifDefined(props.ariaLabel ?? props.text)}
    value=${ifDefined(props.text)}
    @click=${() => props.onClick?.()}
    @mouseenter=${(e: MouseEvent) => props.onMouseEnter?.(e)}
  >
    <atomic-icon
      class="bg-neutral hover:bg-error invisible order-last w-4 rounded p-1 group-hover:visible hover:fill-white"
      icon=${Tick}
    ></atomic-icon>
  </button>`;
};
