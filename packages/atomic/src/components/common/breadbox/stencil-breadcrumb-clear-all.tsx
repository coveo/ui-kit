import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../stencil-button';

interface BreadcrumbClearAllProps {
  setRef: (el: HTMLButtonElement) => void;
  onClick: ((event?: MouseEvent | undefined) => void) | undefined;
  isCollapsed: boolean;
  i18n: i18n;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const BreadcrumbClearAll: FunctionalComponent<
  BreadcrumbClearAllProps
> = (props) => {
  return (
    <li key="clear-all">
      <Button
        ref={props.setRef}
        part="clear"
        style="text-primary"
        text={props.i18n.t('clear')}
        class="rounded-xl p-2"
        ariaLabel={props.i18n.t('clear-all-filters')}
        onClick={props.onClick}
      ></Button>
    </li>
  );
};
