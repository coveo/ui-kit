import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../stencil-button';

interface RefineToggleButtonProps {
  i18n: i18n;
  onClick: () => void;
  setRef: (button: HTMLButtonElement) => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const RefineToggleButton: FunctionalComponent<
  RefineToggleButtonProps
> = ({i18n, onClick, setRef}) => {
  return (
    <Button
      style="outline-primary"
      class="w-full p-3"
      onClick={onClick}
      text={i18n.t('sort-and-filter')}
      ref={setRef}
      part="button"
    ></Button>
  );
};
