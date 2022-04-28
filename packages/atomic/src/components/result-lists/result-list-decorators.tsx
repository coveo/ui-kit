import {FoldedResultList} from '@coveo/headless';
import {ComponentInterface, getElement} from '@stencil/core';
import {buildCustomEvent} from '../../utils/event-utils';

type FoldedResultListContextEventHandler = (
  foldedResultList: FoldedResultList
) => void;
export type FoldedResultListContextEvent =
  CustomEvent<FoldedResultListContextEventHandler>;
const foldedResultListContextEventName = 'atomic/resolveFoldedResultList';

/**
 * A [StencilJS property decorator](https://stenciljs.com/) to be used for elements nested within a folded result list.
 * This allows the Stencil component to modify the folded result list rendered levels.
 */
export function FoldedResultListContext() {
  return (component: ComponentInterface, foldedList: string) => {
    const {componentWillRender} = component;
    component.componentWillRender = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        foldedResultListContextEventName,
        (foldedResultList: FoldedResultList) => {
          this[foldedList] = foldedResultList;
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

type FoldedResultListStateContextEventHandler = (
  foldedResultList: FoldedResultList
) => void;
export type FoldedResultListStateContextEvent =
  CustomEvent<FoldedResultListStateContextEventHandler>;
const foldedResultListStateContextEventName = 'atomic/resolveFoldedResultList';

/**
 * A [StencilJS property decorator](https://stenciljs.com/) to be used for elements nested within a folded result list.
 * This allows the Stencil component to modify the folded result list rendered levels.
 */
export function FoldedResultListStateContext() {
  return (component: ComponentInterface, foldedListState: string) => {
    const {componentWillRender} = component;
    component.componentWillRender = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        foldedResultListStateContextEventName,
        (foldedResultList: FoldedResultList) => {
          foldedResultList?.subscribe(() => {
            this[foldedListState] = foldedResultList.state;
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
