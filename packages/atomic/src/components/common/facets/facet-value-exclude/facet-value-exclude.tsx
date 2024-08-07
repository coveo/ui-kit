import {FunctionalComponent, h} from '@stencil/core';
import Tick from '../../../../images/clear.svg';

export interface ExcludeProps {
  onClick(): void;
  key?: string | number;
  class?: string;
  text?: string;
  ariaLabel?: string;
  ref?(element?: HTMLElement): void;
  onMouseEnter?(evt: MouseEvent): void;
}

export const FacetValueExclude: FunctionalComponent<ExcludeProps> = (props) => {
  const classNames = [
    'value-exclude-button',
    'peer',
    'order-last',
    'flex',
    'ml-auto',
  ];
  if (props.class) {
    classNames.push(props.class);
  }

  const attributes = {
    class: classNames.join(' '),
    part: 'value-exclude-button',
    ref: props.ref,
    key: props.key,
    'aria-label': props.ariaLabel ?? props.text,
    value: props.text,
  };

  return (
    <button
      {...attributes}
      onClick={() => props.onClick?.()}
      onMouseEnter={(e) => props.onMouseEnter?.(e)}
    >
      <atomic-icon
        class={
          'bg-neutral hover:bg-error invisible order-last w-4 rounded p-1 hover:fill-white group-hover:visible'
        }
        icon={Tick}
      ></atomic-icon>
    </button>
  );
};
