import {FunctionalComponent, h} from '@stencil/core';
import Tick from '../../../../images/clear.svg';

interface ExcludeProps {
  onClick(): void;
  ariaLabel?: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetValueExclude: FunctionalComponent<ExcludeProps> = (props) => {
  return (
    <button
      part="value-exclude-button"
      aria-label={props.ariaLabel}
      class="value-exclude-button peer invisible absolute right-2 z-1 order-last ml-auto flex group-hover:visible"
      onClick={() => props.onClick?.()}
    >
      <atomic-icon
        class="bg-neutral hover:bg-error order-last w-4 rounded p-1 hover:fill-white"
        icon={Tick}
      ></atomic-icon>
    </button>
  );
};
