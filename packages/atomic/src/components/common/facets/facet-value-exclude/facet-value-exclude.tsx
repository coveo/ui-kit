import {FunctionalComponent, h} from '@stencil/core';
import Tick from '../../../../images/clear.svg';

export interface ExcludeProps {
  // checked: boolean;
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
  const classNames = [];
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
        class={'w-4 p-1 rounded bg-neutral'}
        icon={Tick}
        part="icon"
      ></atomic-icon>
    </button>
  );
};
