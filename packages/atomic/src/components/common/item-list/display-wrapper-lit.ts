import {ItemDisplayLayout} from '@/src/components';
import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

export interface DisplayWrapperProps {
  display: ItemDisplayLayout;
  listClasses: string;
}

export const displayWrapper: FunctionalComponentWithChildren<
  DisplayWrapperProps
> = ({props, children}) => {
  const {display, listClasses} = props;

  if (display === 'table') {
    return html`${listWrapper({props: {listClasses}, children})}`;
  }

  return html`${listWrapper({
    props: {listClasses},
    children: html`<div class="list-root ${listClasses}" part="result-list">
      ${children}
    </div>`,
  })}`;
};

const listWrapper: FunctionalComponentWithChildren<
  Pick<DisplayWrapperProps, 'listClasses'>
> = ({props, children}) => {
  const {listClasses} = props;

  return html`<div class="list-wrapper ${listClasses}">${children}</div>`;
};
