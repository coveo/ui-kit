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
    class="ml-2 flex items-start items-center justify-center py-2"
  >
    <Button
      style="text-transparent"
      part="clear-button"
      class="text-neutral-dark flex h-8 w-8 shrink-0 items-center justify-center"
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
        class="h-4 w-4"
      ></atomic-icon>
    </Button>
  </div>
);
