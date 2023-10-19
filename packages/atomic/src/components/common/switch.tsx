import {FunctionalComponent, h} from '@stencil/core';

export interface SwitchProps {
  checked?: boolean;
  onToggle?(checked: boolean): void;
  ariaLabel?: string;
  part?: string;
  tabIndex?: number;
  title?: string;
}

export const Switch: FunctionalComponent<SwitchProps> = (props) => {
  const attributes = {
    onClick: () => props.onToggle?.(!props.checked),
    'arial-label': props.ariaLabel,
    'aria-checked': props.checked,
    part: props.part,
    tabIndex: props.tabIndex,
    title: props.title,
  };

  const containerClasses = [
    'w-12',
    'h-6',
    'p-1',
    'rounded-full',
    props.checked ? 'bg-primary' : 'bg-neutral',
  ].join(' ');

  const handleClasses = [
    'w-4',
    'h-4',
    'rounded-full',
    'bg-background',
    props.checked ? 'ml-6' : '',
  ].join(' ');

  return (
    <button
      role="switch"
      {...attributes}
      class="rounded-full btn-outline-neutral"
    >
      <div class={containerClasses}>
        <div class={handleClasses}></div>
      </div>
    </button>
  );
};
