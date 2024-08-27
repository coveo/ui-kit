import {h, FunctionalComponent} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../button';

export interface BreadcrumbShowMoreProps {
  setRef: (el: HTMLButtonElement) => void;
  onShowMore: () => void;
  numberOfCollapsedBreadcrumbs: number;
  isCollapsed: boolean;
  i18n: i18n;
}

export const BreadcrumbShowMore: FunctionalComponent<
  BreadcrumbShowMoreProps
> = (props) => {
  if (!props.isCollapsed) {
    return;
  }
  return (
    <li key="show-more">
      <Button
        ref={props.setRef}
        part="show-more"
        style="outline-primary"
        class="btn-pill whitespace-nowrap p-2"
        onClick={props.onShowMore}
        ariaLabel={props.i18n.t('show-n-more-filters', {
          value: props.numberOfCollapsedBreadcrumbs,
        })}
      ></Button>
    </li>
  );
};
