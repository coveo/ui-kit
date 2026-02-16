import {ComponentInterface, getElement} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';

type FoldedItemListContextEventHandler = (foldedItemList: unknown) => void;
export type FoldedItemListContextEvent =
  CustomEvent<FoldedItemListContextEventHandler>;
const foldedItemListContextEventName = 'atomic/resolveFoldedResultList';

/**
 * A [StencilJS property decorator](https://stenciljs.com/) to be used for elements nested within a folded item list.
 * This allows the Stencil component to modify the folded item list rendered levels.
 */
export function FoldedItemListContext() {
  return (component: ComponentInterface, foldedList: string) => {
    const {componentWillRender} = component;
    component.componentWillRender = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        foldedItemListContextEventName,
        (foldedItemList: unknown) => {
          this[foldedList] = foldedItemList;
        }
      );

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        return;
      }
      return componentWillRender && componentWillRender.call(this);
    };
  };
}

type FoldedItemListStateContextEventHandler = (foldedItemList: unknown) => void;
export type FoldedItemListStateContextEvent =
  CustomEvent<FoldedItemListStateContextEventHandler>;
const foldedItemListStateContextEventName = 'atomic/resolveFoldedResultList';

/**
 * A [StencilJS property decorator](https://stenciljs.com/) to be used for elements nested within a folded item list.
 * This allows the Stencil component to modify the folded item list rendered levels.
 * @deprecated use FoldedItemListContextController instead.
 */
export function FoldedItemListStateContext() {
  return (component: ComponentInterface, foldedListState: string) => {
    const {componentWillRender} = component;
    component.componentWillRender = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        foldedItemListStateContextEventName,
        (foldedItemList: {
          subscribe: (callback: () => void) => unknown;
          state: unknown;
        }) => {
          foldedItemList?.subscribe(() => {
            this[foldedListState] = foldedItemList.state;
          });
        }
      );

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        return;
      }
      return componentWillRender && componentWillRender.call(this);
    };
  };
}
