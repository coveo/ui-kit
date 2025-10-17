import {FunctionalComponent, h} from '@stencil/core';
import ClearSlim from '../../../images/clear-slim.svg';
import {AnyBindings} from '../interface/bindings';
import {Button, StencilButtonProps} from '../stencil-button';

interface Props extends Partial<StencilButtonProps> {
  bindings: AnyBindings;
  inputRef: HTMLInputElement | HTMLTextAreaElement | null;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const TextAreaClearButton: FunctionalComponent<Props> = ({
  inputRef,
  bindings,
  onClick,
  ...defaultButtonProps
}) => (
  <div
    part="clear-button-wrapper"
    class="ml-2 flex items-center justify-center py-2"
  >
    <Button
      style="text-transparent"
      part="clear-button"
      class="text-neutral-dark flex h-8 w-8 shrink-0 items-center justify-center"
      onClick={() => {
        onClick?.();
        inputRef?.focus();
      }}
      ariaLabel={bindings.i18n.t('clear-searchbox')}
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
