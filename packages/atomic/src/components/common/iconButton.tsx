import {FunctionalComponent, h, VNode} from '@stencil/core';
import {Button, ButtonProps} from './button';

export interface IconButtonProps extends ButtonProps {
  badge?: VNode;
  buttonRef?: (el?: HTMLButtonElement) => void;
  icon: string;
  partPrefix: string;
}

export const IconButton: FunctionalComponent<IconButtonProps> = (props) => {
  return (
    <div class="relative" part={`${props.partPrefix}-container`}>
      <Button
        {...props}
        class="relative h-[2.6rem] w-[2.6rem] p-3"
        part={`${props.partPrefix}-button`}
        ref={props.buttonRef}
      >
        <atomic-icon
          icon={props.icon}
          class="h-4 w-4 shrink-0"
          part={`${props.partPrefix}-icon`}
        ></atomic-icon>
      </Button>
      {props.badge && (
        <span
          part={`${props.partPrefix}-badge`}
          class="bg-primary text-on-primary absolute -right-2 -top-2 block h-4 w-4 rounded-[100%] text-center text-xs leading-4"
        >
          {props.badge}
        </span>
      )}
    </div>
  );
};
