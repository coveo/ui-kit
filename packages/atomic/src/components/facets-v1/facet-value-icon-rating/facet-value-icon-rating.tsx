import {FunctionalComponent, h, VNode} from '@stencil/core';
import {FacetValueIconRatingProps} from '../facet-common';

export const FacetValueIconRating: FunctionalComponent<FacetValueIconRatingProps> = (
  props
) => {
  const width =
    ((props.numberOfActiveIcons / props.numberOfTotalIcons) * 100).toString() +
    '%';

  const renderIcon = (active: boolean) => {
    return (
      <div
        innerHTML={props.icon}
        class={active ? 'icon-active' : 'icon-inactive'}
      ></div>
    );
  };

  const emptyIconDisplay = () => {
    const emptyIconDisplay: VNode[] = [];
    for (let i = 0; i < props.numberOfTotalIcons; i++) {
      emptyIconDisplay.push(renderIcon(false));
    }
    return emptyIconDisplay;
  };

  const filledIconDisplay = () => {
    const filledIconDisplay: VNode[] = [];
    for (let i = 0; i < props.numberOfTotalIcons; i++) {
      filledIconDisplay.push(renderIcon(true));
    }
    return filledIconDisplay;
  };

  return (
    <div class="relative left-0 top-0" part="value-rating">
      <div class="relative left-0 top-0 z-0 flex items-center gap-0.5 pt-0.5 pb-0.5">
        {emptyIconDisplay()}
      </div>
      <div
        class="absolute left-0 top-0 z-10 flex items-center gap-0.5 pt-0.5 pb-0.5 overflow-hidden"
        style={{width}}
      >
        {filledIconDisplay()}
      </div>
    </div>
  );
};
