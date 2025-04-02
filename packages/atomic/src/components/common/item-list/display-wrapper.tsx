import {FunctionalComponent, h} from '@stencil/core';
import {ItemDisplayLayout} from '../layout/display-options';

export interface DisplayWrapperProps {
  display: ItemDisplayLayout;
  listClasses: string;
}

export const DisplayWrapper: FunctionalComponent<DisplayWrapperProps> = (
  {display, listClasses},
  children
) => {
  if (display === 'table') {
    return <ListWrapper listClasses={listClasses}>{...children}</ListWrapper>;
  }

  return (
    <ListWrapper listClasses={listClasses}>
      <div class={`list-root ${listClasses}`} part="result-list">
        {children}
      </div>
    </ListWrapper>
  );
};

const ListWrapper: FunctionalComponent<
  Pick<DisplayWrapperProps, 'listClasses'>
> = ({listClasses}, children) => {
  return <div class={`list-wrapper ${listClasses}`}>{...children}</div>;
};
