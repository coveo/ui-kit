import {FunctionalComponent, h, VNode} from '@stencil/core';
import {i18n} from 'i18next';

interface RatingProps {
  i18n: i18n;
  numberOfTotalIcons: number;
  numberOfActiveIcons: number;
  icon: string;
  iconSize?: number;
}

export const Rating: FunctionalComponent<RatingProps> = (props) => {
  const width =
    ((props.numberOfActiveIcons / props.numberOfTotalIcons) * 100).toString() +
    '%';
  const iconSize = `${props.iconSize ?? 0.75}rem`;

  const renderIcon = (active: boolean) => {
    return (
      <atomic-icon
        icon={props.icon}
        class={`shrink-0 ${active ? 'icon-active' : 'icon-inactive'}`}
        style={{width: iconSize, height: iconSize}}
      ></atomic-icon>
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
    <div
      class="relative w-max"
      part="value-rating"
      role="img"
      aria-label={props.i18n.t('stars', {
        count: props.numberOfActiveIcons,
        max: props.numberOfTotalIcons,
      })}
    >
      <div class="z-0 flex gap-0.5">{emptyIconDisplay()}</div>
      <div
        class="absolute left-0 top-0 z-1 flex gap-0.5 overflow-hidden"
        style={{width}}
      >
        {filledIconDisplay()}
      </div>
    </div>
  );
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
    throw new Error(
      `Could not parse "${value}" from field "${field}" as a number.`
    );
  }
  return valueAsNumber;
};
