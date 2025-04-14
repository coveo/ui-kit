import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

export interface DisplayWrapperProps {
  listClasses: string;
}

export const ListWrapper: FunctionalComponentWithChildren<
  DisplayWrapperProps
> = ({props}) => {
  const {listClasses} = props;

  return (children) =>
    html`<div class="list-wrapper ${listClasses}">${children}</div>`;
};

export const ListWrapperForGridOrListDisplay: FunctionalComponentWithChildren<
  DisplayWrapperProps
> = ({props}) => {
  const {listClasses} = props;

  return (children) =>
    html`${ListWrapper({
      props: {listClasses},
    })(
      html`<div class="list-root ${listClasses}" part="result-list">
        ${children}
      </div>`
    )}`;
};
