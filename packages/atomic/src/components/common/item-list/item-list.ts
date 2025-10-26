import {nothing} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface ItemListProps {
  hasError: boolean;
  hasItems: boolean;
  hasTemplate: boolean;
  firstRequestExecuted: boolean;
  templateHasError: boolean;
}

export const renderItemList: FunctionalComponentWithChildren<ItemListProps> =
  ({props}) =>
  (children) => {
    const {hasError, hasItems, firstRequestExecuted, hasTemplate} = props;

    if (hasError || (firstRequestExecuted && !hasItems) || !hasTemplate) {
      return nothing;
    }

    return children;
  };
