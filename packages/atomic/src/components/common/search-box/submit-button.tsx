import {FunctionalComponent, h} from '@stencil/core';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
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
    class="w-12 h-auto rounded-r-md rounded-l-none -my-px -mr-px"
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
