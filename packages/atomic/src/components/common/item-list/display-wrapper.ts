import {html} from 'lit';
import type {ItemDisplayLayout} from '@/src/components';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface DisplayWrapperProps {
  display: ItemDisplayLayout;
  listClasses: string;
}

export const renderDisplayWrapper: FunctionalComponentWithChildren<
  DisplayWrapperProps
> = ({props}) => {
  const {display, listClasses} = props;

  if (display === 'table') {
    return (children) => renderListWrapper({props})(children);
  }

  return (children) =>
    renderListWrapper({props: {listClasses}})(
      renderListRoot({props: {listClasses}})(children)
    );
};

const renderListWrapper: FunctionalComponentWithChildren<
  Pick<DisplayWrapperProps, 'listClasses'>
> = ({props}) => {
  const {listClasses} = props;

  return (children) =>
    html`<div class="list-wrapper ${listClasses}">${children}</div>`;
};

const renderListRoot: FunctionalComponentWithChildren<
  Pick<DisplayWrapperProps, 'listClasses'>
> = ({props}) => {
  const {listClasses} = props;

  return (children) =>
    html`<div class="list-root ${listClasses}" part="result-list">
      ${children}
    </div>`;
};
