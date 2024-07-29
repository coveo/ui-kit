import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../button';

export interface TabButtonProps {
  label: string | undefined;
  handleClick: () => void;
  isActive: boolean;
}

export const TabButton: FunctionalComponent<TabButtonProps> = (props) => {
  const activeTabClass = props.isActive
    ? "relative after:content-[''] after:block after:w-full after:h-1 after:absolute after:-bottom-0.5 after:bg-primary after:rounded"
    : '';
  const activeTabTextClass = props.isActive ? '' : 'text-neutral-dark';
  return (
    <div part="button-container" class={activeTabClass}>
      <Button
        style="text-transparent"
        class={`w-full px-6 pb-1 text-xl ${activeTabTextClass}`}
        text={props.label}
        part="button"
        onClick={props.handleClick}
      ></Button>
    </div>
  );
};
