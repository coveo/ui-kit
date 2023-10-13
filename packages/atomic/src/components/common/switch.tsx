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
    'w-16',
    'h-8',
    props.checked ? 'p-1.5' : 'p-2',
    'rounded-full',
    props.checked ? 'bg-primary' : 'bg-neutral',
  ].join(' ');

  const handleClasses = [
    props.checked ? 'w-5' : 'w-4',
    props.checked ? 'h-5' : 'h-4',
    'rounded-full',
    'bg-background',
    props.checked ? 'ml-8' : '',
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
