import type {i18n} from 'i18next';
import {html} from 'lit';
import {styleMap} from 'lit/directives/style-map.js';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {FieldValueIsNaNError} from '../../commerce/product-template-component-utils/error';

interface RatingProps {
  i18n: i18n;
  numberOfTotalIcons: number;
  numberOfActiveIcons: number;
  icon: string;
  iconSize?: number;
}

export type {RatingProps};
/**
 * Renders a rating component.
 *
 * @part value-rating
 * @part value-rating-icon
 *
 * @cssprop --atomic-rating-icon-active-color - Color of the icon when active.
 * @cssprop --atomic-rating-icon-inactive-color - Color of the icon when inactive.
 * @cssprop --atomic-rating-icon-outline - Outline color of the icon.
 */
export const renderRating: FunctionalComponent<RatingProps> = ({props}) => {
  const width =
    ((props.numberOfActiveIcons / props.numberOfTotalIcons) * 100).toString() +
    '%';
  const iconSize = `${props.iconSize ?? 0.75}rem`;

  const renderIcon = (active: boolean) => {
    const iconClass = tw({
      'shrink-0': true,
      'text-rating-icon-active': active,
      'text-rating-icon-inactive': !active,
    });

    const iconStyle = {
      width: iconSize,
      height: iconSize,
      stroke: 'var(--atomic-rating-icon-outline)',
    };
    return html`<atomic-icon
      icon=${props.icon}
      class=${multiClassMap(iconClass)}
      style=${styleMap(iconStyle)}
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
      style=${styleMap({width})}
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
