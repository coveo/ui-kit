import {FunctionalComponent, h} from '@stencil/core';
import ClearIcon from '../../../images/clear.svg';
import {AnyBindings} from '../interface/bindings';
import {Button, StencilButtonProps} from '../stencil-button';

interface Props extends Partial<StencilButtonProps> {
  bindings: AnyBindings;
  inputRef: HTMLInputElement | HTMLTextAreaElement | null;
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
    class="text-neutral-dark mr-1.5 h-8 w-8 shrink-0"
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
      class="h-3 w-3"
    ></atomic-icon>
  </Button>
);
