import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import {FunctionalComponent, h} from '@stencil/core';
import {Button, ButtonProps} from '@components/common/button';
import {AnyBindings} from '../interface/bindings';
import {SearchBox} from '@coveo/headless';

interface Props extends Partial<ButtonProps> {
  bindings: AnyBindings;
  searchBox: SearchBox;
}

export const SubmitButton: FunctionalComponent<Props> = ({
  bindings,
  searchBox,
  onClick,
  ...defaultButtonProps
}) => (
  <Button
    style="primary"
    class="w-12 h-auto rounded-r-md rounded-l-none -my-px -mr-px"
    part="submit-button"
    ariaLabel={bindings.i18n.t('search')}
    onClick={() => {
      searchBox.submit();
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
