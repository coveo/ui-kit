import {FunctionalComponent, h} from '@stencil/core';
import SearchSlimIcon from '../../../images/search-slim.svg';
import {AnyBindings} from '../interface/bindings';
import {Button} from '../stencil-button';

interface Props {
  bindings: AnyBindings;
  disabled: boolean;
  onClick: () => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const SubmitButton: FunctionalComponent<Props> = ({
  bindings,
  disabled,
  onClick,
}) => (
  <div
    part="submit-button-wrapper"
    class="mr-2 flex items-center justify-center py-2"
  >
    <Button
      style="text-primary"
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      part="submit-button"
      ariaLabel={bindings.i18n.t('search')}
      onClick={() => {
        onClick?.();
      }}
      disabled={disabled}
    >
      <atomic-icon
        part="submit-icon"
        icon={SearchSlimIcon}
        class="h-4 w-4"
      ></atomic-icon>
    </Button>
  </div>
);
