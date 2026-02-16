import {FunctionalComponent, h} from '@stencil/core';

interface SwitchProps {
  checked?: boolean;
  onToggle?(checked: boolean): void;
  ariaLabel?: string;
  part?: string;
  tabIndex?: number;
  title?: string;
  withToggle?: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const Switch: FunctionalComponent<SwitchProps> = (props) => {
  const attributes = {
    onClick: () => props.onToggle?.(!props.checked),
    'arial-label': props.ariaLabel,
    'aria-checked': String(!!props.checked),
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
    'bg-white',
    props.checked ? 'ml-6' : '',
  ].join(' ');

  const buttonClasses = [
    'rounded-full',
    'btn-outline-neutral',
    props.withToggle ? 'flex' : 'hidden',
  ].join(' ');

  return (
    <button role="switch" {...attributes} class={buttonClasses}>
      <div class={containerClasses}>
        <div class={handleClasses}></div>
      </div>
    </button>
  );
};
