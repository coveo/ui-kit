import {FunctionalComponent, h, VNode} from '@stencil/core';
import {FacetValueIconRatingProps} from '../facet-common';

export const FacetValueIconRating: FunctionalComponent<FacetValueIconRatingProps> = (
  props
) => {
  const createIconFilled = (active: boolean) => {
    return (
      <div
        innerHTML={props.icon}
        class={active ? 'icon-active' : 'icon-inactive'}
      ></div>
    );
  };

  const generateIconDisplay = () => {
    const emptyIconDisplay: VNode[] = [];
    const filledIconDisplay: VNode[] = [];
    for (let i = 0; i < props.numberOfTotalIcons; i++) {
      emptyIconDisplay.push(createIconFilled(false));
      filledIconDisplay.push(createIconFilled(true));
    }
    const limitString =
      (
        (props.numberOfActiveIcons / props.numberOfTotalIcons) *
        100
      ).toString() + '%';
    return (
      <div class="relative left-0 top-0" part="value-label">
        <div class="relative left-0 top-0 z-0 flex items-center gap-0.5 pt-0.5 pb-0.5">
          {emptyIconDisplay}
        </div>
        <div
          id="filledIcons"
          class="absolute left-0 top-0 z-10 flex items-center gap-0.5 pt-0.5 pb-0.5 overflow-hidden"
          style={{width: limitString}}
        >
          {filledIconDisplay}
        </div>
      </div>
    );
  };

  return generateIconDisplay();
};
