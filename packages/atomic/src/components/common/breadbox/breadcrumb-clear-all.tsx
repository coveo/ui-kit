import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../stencil-button';

export interface BreadcrumbClearAllProps {
  setRef: (el: HTMLButtonElement) => void;
  onClick: ((event?: MouseEvent | undefined) => void) | undefined;
  isCollapsed: boolean;
  i18n: i18n;
}

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
        class="btn-pill p-2"
        ariaLabel={props.i18n.t('clear-all-filters')}
        onClick={props.onClick}
      ></Button>
    </li>
  );
};
