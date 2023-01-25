import {FunctionalComponent, h, VNode} from '@stencil/core';
import {Button, ButtonProps} from './button';

export interface IconButtonProps extends ButtonProps {
  badge?: VNode;
  buttonRef?: (el?: HTMLButtonElement) => void;
  icon: string;
}

export const IconButton: FunctionalComponent<IconButtonProps> = (props) => {
  return (
    <div class="relative" part="container">
      <Button
        {...props}
        class="p-3 relative"
        part="button"
        ref={props.buttonRef}
      >
        <atomic-icon
          icon={props.icon}
          class="w-4 h-4 shrink-0"
          aria-hidden="true"
          part="icon"
        ></atomic-icon>
      </Button>
      {props.badge && (
        <span class="absolute block h-4 w-4 text-center bg-primary text-on-primary rounded-[100%] text-xs leading-4 -top-2 -right-2">
          {props.badge}
        </span>
      )}
    </div>
  );
};
