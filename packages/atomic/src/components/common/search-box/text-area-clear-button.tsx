import {FunctionalComponent, h} from '@stencil/core';
import ClearSlim from '../../../images/clear-slim.svg';
import {Button, ButtonProps} from '../button';
import {AnyBindings} from '../interface/bindings';

interface Props extends Partial<ButtonProps> {
  bindings: AnyBindings;
  inputRef: HTMLInputElement | HTMLTextAreaElement | null;
}

export const TextAreaClearButton: FunctionalComponent<Props> = ({
  inputRef,
  bindings,
  onClick,
  ...defaultButtonProps
}) => (
  <div
    part="clear-button-wrapper"
    class="py-2 flex items-start justify-center items-center ml-2"
  >
    <Button
      style="text-transparent"
      part="clear-button"
      class="flex items-center justify-center w-8 h-8 text-neutral-dark shrink-0"
      onClick={() => {
        onClick?.();
        inputRef?.focus();
      }}
      ariaLabel={bindings.i18n.t('clear')}
      {...defaultButtonProps}
    >
      <atomic-icon
        part="clear-icon"
        icon={ClearSlim}
        class="w-4 h-4"
      ></atomic-icon>
    </Button>
  </div>
);
