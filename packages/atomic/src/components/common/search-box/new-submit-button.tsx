import {FunctionalComponent, h} from '@stencil/core';
import SearchSlimIcon from '../../../images/search-slim.svg';
import {Button, ButtonProps} from '../button';
import {AnyBindings} from '../interface/bindings';

interface Props extends Partial<ButtonProps> {
  bindings: AnyBindings;
}

export const NewSubmitButton: FunctionalComponent<Props> = ({
  bindings,
  onClick,
  ...defaultButtonProps
}) => (
  <div class="searchbox-button-wrapper flex items-center justify-center mr-2">
    <Button
      style="text-primary"
      class="flex items-center justify-center h-8 w-8 rounded-full shrink-0"
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
