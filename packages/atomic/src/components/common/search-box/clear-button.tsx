import {FunctionalComponent, h} from '@stencil/core';
import ClearIcon from '../../../images/clear.svg';
import {Button, ButtonProps} from '../button';
import {AnyBindings} from '../interface/bindings';

interface Props extends Partial<ButtonProps> {
  bindings: AnyBindings;
  inputRef: HTMLInputElement | null;
}

export const ClearButton: FunctionalComponent<Props> = ({
  inputRef,
  bindings,
  onClick,
  ...defaultButtonProps
}) => (
  <Button
    style="text-transparent"
    part="clear-button"
    class="w-8 h-8 mr-1.5 text-neutral-dark"
    onClick={() => {
      onClick?.();
      inputRef?.focus();
    }}
    ariaLabel={bindings.i18n.t('clear')}
    {...defaultButtonProps}
  >
    <atomic-icon
      part="clear-icon"
      icon={ClearIcon}
      class="w-3 h-3"
    ></atomic-icon>
  </Button>
);
