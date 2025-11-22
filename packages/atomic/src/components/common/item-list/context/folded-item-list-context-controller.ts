import type {FoldedResultList, FoldedResultListState} from '@coveo/headless';
import type {LitElement, ReactiveController, ReactiveControllerHost} from 'lit';
import {buildCustomEvent} from '@/src/utils/event-utils';

const foldedItemListContextEventName = 'atomic/resolveFoldedResultList';

/**
 * A reactive controller that manages folded item list context from parent components.
 * Handles fetching FoldedResultList via custom events.
 */
export class FoldedItemListContextController implements ReactiveController {
  private host: ReactiveControllerHost & LitElement;
  private _foldedItemList: FoldedResultList | null = null;
  private _unsubscribe: (() => void) | null = null;

  constructor(host: ReactiveControllerHost & LitElement) {
    this.host = host;
    host.addController(this);
  }

  get foldedItemList(): FoldedResultList | null {
    return this._foldedItemList;
  }

  get state(): FoldedResultListState | null {
    return this._foldedItemList?.state ?? null;
  }

  hostConnected(): void {
    this._resolveFoldedItemListContext();
  }

  hostDisconnected(): void {
    this._unsubscribe?.();
    this._unsubscribe = null;
  }

  private _resolveFoldedItemListContext(): void {
    const event = buildCustomEvent(
      foldedItemListContextEventName,
      (foldedItemList: FoldedResultList) => {
        this._foldedItemList = foldedItemList;
        this._unsubscribe = foldedItemList.subscribe(() => {
          this.host.requestUpdate();
        });
        this.host.requestUpdate();
      }
    );

    const canceled = this.host.dispatchEvent(event);
    if (canceled) {
      this._foldedItemList = null;
    }
  }
}

type FoldedItemListContextEventHandler = (
  foldedItemList: FoldedResultList
) => void;
export type FoldedItemListContextEvent =
  CustomEvent<FoldedItemListContextEventHandler>;
