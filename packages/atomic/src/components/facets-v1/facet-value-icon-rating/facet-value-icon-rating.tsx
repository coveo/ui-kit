import {FunctionalComponent, h, VNode} from '@stencil/core';
import {FacetValueIconRatingProps} from '../facet-common';
import FullStar from '../../../images/fully-filled-star.svg';

const createIconFilled = (active: boolean) => {
  return (
    <div
      innerHTML={FullStar}
      class={active ? 'icon-active' : 'icon-inactive'}
    ></div>
  );
};

const createIconPartiallyActive = (limit: number) => {
  const limitString = ((limit % 1) * 100).toString() + '%';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="url(#grad)"
    >
      <linearGradient id="grad" x1="0" x2="100%" y1="0" y2="0">
        <stop offset={limitString} class="icon-half-active-stop" />
        <stop offset={limitString} class="icon-half-inactive-stop" />
      </linearGradient>
      <path d="M2.12261 7.32528L0.386144 5.64869C-0.196726 5.08592 0.0965754 4.09991 0.892272 3.94721L3.52262 3.44244C3.84159 3.38123 4.11096 3.16892 4.24501 2.87309L5.08915 1.01016C5.44396 0.227133 6.55604 0.227132 6.91085 1.01016L7.75499 2.87309C7.88904 3.16892 8.15841 3.38123 8.47738 3.44244L11.1077 3.94721C11.9034 4.09991 12.1967 5.08592 11.6139 5.64869L9.87739 7.32528C9.64107 7.55345 9.53188 7.88314 9.58529 8.20726L10.0399 10.966C10.1756 11.79 9.3013 12.4076 8.57008 12.0042L6.48308 10.8527C6.18239 10.6868 5.81761 10.6868 5.51692 10.8527L3.42992 12.0042C2.6987 12.4076 1.82437 11.79 1.96014 10.966L2.41471 8.20726C2.46812 7.88314 2.35893 7.55345 2.12261 7.32528Z" />
    </svg>
  );
};

export const FacetValueIconRating: FunctionalComponent<FacetValueIconRatingProps> = (
  props
) => {
  const generateIconDisplay = () => {
    const iconDisplay: VNode[] = [];
    for (let i = 0; i < props.numberOfTotalIcons; i++) {
      if (i < props.numberOfActiveIcons) {
        if (i + 1 > props.numberOfActiveIcons) {
          iconDisplay.push(
            createIconPartiallyActive(props.numberOfActiveIcons)
          );
        } else {
          iconDisplay.push(createIconFilled(true));
        }
      } else {
        iconDisplay.push(createIconFilled(false));
      }
    }
    return iconDisplay;
  };

  return (
    <div class="flex items-center gap-0.5 pt-0.5 pb-0.5" part="value-label">
      {generateIconDisplay()}
    </div>
  );
};
