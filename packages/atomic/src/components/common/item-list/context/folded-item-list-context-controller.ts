import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {LitElementWithError} from '@/src/decorators/types.js';
import {buildCustomEvent} from '@/src/utils/event-utils';

const foldedItemListContextEventName = 'atomic/resolveFoldedResultList';

export class MissingParentError extends Error {
  constructor(elementName: string) {
    super(
      `The "${elementName}" element must be the child of an "atomic-folded-result-list" or "atomic-insight-folded-result-list" element.`
    );
  }
}

/**
 * A reactive controller that manages folded item list context data from parent components.
 * Handles fetching folded item list data via custom events and manages error states.
 */
export class FoldedItemListContextController<T = unknown>
  implements ReactiveController
{
  private host: ReactiveControllerHost & LitElementWithError;
  private _foldedItemList: T | null = null;
  private _error: MissingParentError | null = null;

  constructor(host: ReactiveControllerHost & LitElementWithError) {
    this.host = host;
    host.addController(this);
  }

  get foldedItemList(): T | null {
    return this._error ? null : this._foldedItemList;
  }

  get error(): MissingParentError | null {
    return this._error;
  }

  get hasError(): boolean {
    return this._error !== null;
  }

  hostConnected(): void {
    this._resolveFoldedItemListContext();
  }

  private _resolveFoldedItemListContext(): void {
    const event = buildCustomEvent(
      foldedItemListContextEventName,
      (foldedItemList: T) => {
        this._foldedItemList = foldedItemList;
        this.host.requestUpdate();
      }
    );

    const canceled = this.host.dispatchEvent(event);
    if (canceled) {
      const elementName = (this.host as Element).nodeName.toLowerCase();
      this._error = new MissingParentError(elementName);
      this._foldedItemList = null;
      this.host.error = this._error;
      this.host.requestUpdate();
    }
  }
}

type FoldedItemListContextEventHandler<T> = (foldedItemList: T) => void;
export type FoldedItemListContextEvent<T> = CustomEvent<
  FoldedItemListContextEventHandler<T>
>;
