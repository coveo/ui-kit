import {h, FunctionalComponent} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../button';

export interface BreadcrumbShowLessProps {
  onShowLess: () => void;
  setRef: (el: HTMLButtonElement) => void;
  isCollapsed: boolean;
  i18n: i18n;
}

export const BreadcrumbShowLess: FunctionalComponent<
  BreadcrumbShowLessProps
> = (props) => {
  if (props.isCollapsed) {
    return;
  }

  return (
    <li key="show-less">
      <Button
        ref={props.setRef}
        part="show-less"
        style="outline-primary"
        text={props.i18n.t('show-less')}
        class="p-2 btn-pill"
        onClick={props.onShowLess}
      ></Button>
    </li>
  );
};
