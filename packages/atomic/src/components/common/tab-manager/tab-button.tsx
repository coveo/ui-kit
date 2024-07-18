import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../button';

export interface TabButtonProps {
  label: string | undefined;
  handleClick: () => void;
  isActive: boolean;
}

export const TabButton: FunctionalComponent<TabButtonProps> = (props) => {
  const activeTabClass = props.isActive
    ? "relative after:content-[''] after:block after:w-full after:h-[5px] after:absolute after:bottom-[-2.5px] after:bg-primary after:rounded"
    : '';
  const activeTabTextClass = props.isActive ? '' : 'text-neutral-dark';
  return (
    <div class={activeTabClass}>
      <Button
        style="text-transparent"
        class={`px-6 pb-1 w-full text-xl ${activeTabTextClass}`}
        text={props.label}
        part="button"
        onClick={props.handleClick}
      ></Button>
    </div>
  );
};
