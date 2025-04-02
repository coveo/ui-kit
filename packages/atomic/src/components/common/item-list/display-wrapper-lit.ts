import {ItemDisplayLayout} from '@/src/components';
import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html, TemplateResult} from 'lit';

export interface DisplayWrapperProps {
  display: ItemDisplayLayout;
  listClasses: string;
}

export const ListWrapper: FunctionalComponentWithChildren<
  Pick<DisplayWrapperProps, 'listClasses'>
> = ({props}) => {
  const {listClasses} = props;

  return (children: TemplateResult) =>
    html`<div class="list-wrapper ${listClasses}">${children}</div>`;
};

export const ListWrapperForGridOrListDisplay: FunctionalComponentWithChildren<
  Pick<DisplayWrapperProps, 'listClasses'>
> = ({props}) => {
  const {listClasses} = props;

  return (children: TemplateResult) =>
    html`${ListWrapper({
      props: {listClasses},
    })(
      html`<div class="list-root ${listClasses}" part="result-list">
        ${children}
      </div>`
    )}`;
};
