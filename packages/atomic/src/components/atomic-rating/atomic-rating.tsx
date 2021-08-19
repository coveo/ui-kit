import {FunctionalComponent, h, VNode} from '@stencil/core';

interface RatingProps {
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
        class={`flex-shrink-0 ${active ? 'icon-active' : 'icon-inactive'}`}
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
    <div class="inline-block relative left-0 top-0" part="value-rating">
      <div class="relative left-0 top-0 z-0 flex items-center gap-0.5 pt-0.5 pb-0.5">
        {emptyIconDisplay()}
      </div>
      <div
        class="absolute left-0 top-0 z-1 flex items-center gap-0.5 pt-0.5 pb-0.5 overflow-hidden"
        style={{width}}
      >
        {filledIconDisplay()}
      </div>
    </div>
  );
};
