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
    class="-my-px -mr-px flex h-auto w-12 shrink-0 items-center justify-center rounded-l-none rounded-r-md"
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
      class="h-4 w-4"
    ></atomic-icon>
  </Button>
);
