import {h, FunctionalComponent} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../stencil-button';

interface BreadcrumbShowLessProps {
  onShowLess: () => void;
  setRef: (el: HTMLButtonElement) => void;
  isCollapsed: boolean;
  i18n: i18n;
}

/**
 * @deprecated should only be used for Stencil components.
 */
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
        class="rounded-xl p-2"
        onClick={props.onShowLess}
      ></Button>
    </li>
  );
};
