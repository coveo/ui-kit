import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {LitElementWithError} from '@/src/decorators/types';
import {buildCustomEvent} from '@/src/utils/event-utils';

const foldedItemListContextEventName = 'atomic/resolveFoldedResultList';

type SubscribableState<T> = {
  subscribe: (callback: () => void) => (() => void) | undefined;
  state: T;
};

/**
 * A reactive controller that manages folded item list context data from parent components.
 * Handles fetching folded item list controller and/or state via custom events.
 */
export class FoldedItemListContextController<
  TController = unknown,
  TState = unknown,
> implements ReactiveController
{
  private host: ReactiveControllerHost & LitElementWithError;
  private _foldedItemList: TController | null = null;
  private _foldedItemListState: TState | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(host: ReactiveControllerHost & LitElementWithError) {
    this.host = host;
    host.addController(this);
  }

  get foldedItemList(): TController | null {
    return this._foldedItemList;
  }

  get foldedItemListState(): TState | null {
    return this._foldedItemListState;
  }

  hostConnected(): void {
    this._resolveFoldedItemListContext();
  }

  hostDisconnected(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private _resolveFoldedItemListContext(): void {
    const event = buildCustomEvent(
      foldedItemListContextEventName,
      (
        foldedItemList:
          | TController
          | SubscribableState<TState>
          | {controller: TController; state: SubscribableState<TState>}
      ) => {
        // Handle the case where both controller and state are provided
        if (
          foldedItemList &&
          typeof foldedItemList === 'object' &&
          'controller' in foldedItemList &&
          'state' in foldedItemList
        ) {
          this._foldedItemList = foldedItemList.controller;
          this._setupStateSubscription(foldedItemList.state);
        }
        // Handle the case where only state is provided (with subscribe method)
        else if (
          foldedItemList &&
          typeof foldedItemList === 'object' &&
          'subscribe' in foldedItemList &&
          'state' in foldedItemList
        ) {
          this._setupStateSubscription(
            foldedItemList as SubscribableState<TState>
          );
        }
        // Handle the case where only the controller is provided
        else {
          this._foldedItemList = foldedItemList as TController;
          this.host.requestUpdate();
        }
      }
    );

    this.host.dispatchEvent(event);
  }

  private _setupStateSubscription(
    subscribableState: SubscribableState<TState>
  ): void {
    this._foldedItemListState = subscribableState.state;

    const callback = subscribableState.subscribe(() => {
      this._foldedItemListState = subscribableState.state;
      this.host.requestUpdate();
    });

    if (callback) {
      this.unsubscribe = callback;
    }

    this.host.requestUpdate();
  }
}

type FoldedItemListContextEventHandler<TController, TState> = (
  foldedItemList:
    | TController
    | SubscribableState<TState>
    | {controller: TController; state: SubscribableState<TState>}
) => void;

export type FoldedItemListContextEvent<TController, TState> = CustomEvent<
  FoldedItemListContextEventHandler<TController, TState>
>;
