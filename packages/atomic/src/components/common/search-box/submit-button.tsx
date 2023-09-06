import {FunctionalComponent, h} from '@stencil/core';
import SearchIcon from '../../../images/search.svg';
import {Button, ButtonProps} from '../button';
import {AnyBindings} from '../interface/bindings';

interface Props extends Partial<ButtonProps> {
  bindings: AnyBindings;
}

export const SubmitButton: FunctionalComponent<Props> = ({
  bindings,
  onClick,
  ...defaultButtonProps
}) => (
  <Button
    style="primary"
    class="flex items-center justify-center w-12 h-auto rounded-r-md rounded-l-none -my-px -mr-px shrink-0"
    part="submit-button"
    ariaLabel={bindings.i18n.t('search')}
    onClick={() => {
      onClick?.();
    }}
    {...defaultButtonProps}
  >
    <atomic-icon
      part="submit-icon"
      icon={SearchIcon}
      class="w-4 h-4"
    ></atomic-icon>
  </Button>
);
