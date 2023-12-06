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
          'w-4 p-1 rounded bg-neutral order-last hover:bg-error hover:fill-white invisible group-hover:visible'
        }
        icon={Tick}
      ></atomic-icon>
    </button>
  );
};
