import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {FieldValueIsNaNError} from '../commerce/product-template-component-utils/error';

interface RatingProps {
  i18n: i18n;
  numberOfTotalIcons: number;
  numberOfActiveIcons: number;
  icon: string;
  iconSize?: number;
}

export type {RatingProps};

export const renderRating: FunctionalComponent<RatingProps> = ({props}) => {
  const width =
    ((props.numberOfActiveIcons / props.numberOfTotalIcons) * 100).toString() +
    '%';
  const iconSize = `${props.iconSize ?? 0.75}rem`;

  const renderIcon = (active: boolean) => {
    return html`<atomic-icon
      icon=${props.icon}
      class=${`shrink-0 ${active ? 'icon-active' : 'icon-inactive'}`}
      style=${{width: iconSize, height: iconSize}}
      part="value-rating-icon"
    ></atomic-icon>`;
  };

  const emptyIconDisplay = () => {
    const emptyIcons = [];
    for (let i = 0; i < props.numberOfTotalIcons; i++) {
      emptyIcons.push(renderIcon(false));
    }
    return emptyIcons;
  };

  const filledIconDisplay = () => {
    const filledIcons = [];
    for (let i = 0; i < props.numberOfTotalIcons; i++) {
      filledIcons.push(renderIcon(true));
    }
    return filledIcons;
  };

  return html`<div
    class="relative w-max"
    part="value-rating"
    role="img"
    aria-label=${props.i18n.t('stars', {
      count: props.numberOfActiveIcons,
      max: props.numberOfTotalIcons,
    })}
  >
    <div class="z-0 flex gap-0.5">${emptyIconDisplay()}</div>
    <div
      class="absolute top-0 left-0 z-1 flex gap-0.5 overflow-hidden"
      style=${{width}}
    >
      ${filledIconDisplay()}
    </div>
  </div>`;
};

export const computeNumberOfStars = (
  value: unknown,
  field: string
): number | null => {
  if (value === null) {
    return null;
  }
  const valueAsNumber = parseFloat(`${value}`);
  if (Number.isNaN(valueAsNumber)) {
    throw new FieldValueIsNaNError(field, value);
  }
  return valueAsNumber;
};
