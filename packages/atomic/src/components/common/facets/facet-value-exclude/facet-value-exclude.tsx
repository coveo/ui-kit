import {FunctionalComponent, h} from '@stencil/core';
import Tick from '../../../../images/clear.svg';

export interface ExcludeProps {
  onClick(): void;
  key?: string | number;
  id?: string;
  class?: string;
  text?: string;
  part?: string;
  iconPart?: string;
  ariaLabel?: string;
  ariaCurrent?: string;
  ref?(element?: HTMLElement): void;
  onMouseEnter?(evt: MouseEvent): void;
}

export const FacetValueExclude: FunctionalComponent<ExcludeProps> = (props) => {
  const partName = props.part ?? 'checkbox';
  const parts = [partName];
  const classNames = [
    'peer',
    'order-last',
    'ml-auto',
    'group-hover:visible',
    'invisible',
  ];
  if (props.class) {
    classNames.push(props.class);
  }

  const attributes = {
    class: classNames.join(' '),
    part: parts.join(' '),
    ref: props.ref,
  };

  return (
    <button
      {...attributes}
      onClick={() => props.onClick?.()}
      onMouseEnter={(e) => props.onMouseEnter?.(e)}
    >
      <atomic-icon
        class={
          'w-4 p-1 rounded bg-neutral order-last hover:bg-error hover:fill-white'
        }
        icon={Tick}
        part="value-exclude-button"
      ></atomic-icon>
    </button>
  );
};
