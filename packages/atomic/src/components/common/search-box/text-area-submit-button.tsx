import {FunctionalComponent, h} from '@stencil/core';
import SearchSlimIcon from '../../../images/search-slim.svg';
import {Button, ButtonProps} from '../button';
import {AnyBindings} from '../interface/bindings';

interface Props extends Partial<ButtonProps> {
  bindings: AnyBindings;
}

export const TextAreaSubmitButton: FunctionalComponent<Props> = ({
  bindings,
  onClick,
  ...defaultButtonProps
}) => (
  <div
    part="submit-button-wrapper"
    class="py-2 flex items-start justify-center items-center mr-2"
  >
    <Button
      style="text-primary"
      class="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
      part="submit-button"
      ariaLabel={bindings.i18n.t('search')}
      onClick={() => {
        onClick?.();
      }}
      {...defaultButtonProps}
    >
      <atomic-icon
        part="submit-icon"
        icon={SearchSlimIcon}
        class="w-4 h-4"
      ></atomic-icon>
    </Button>
  </div>
);
