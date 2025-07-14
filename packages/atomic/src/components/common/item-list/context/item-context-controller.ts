import type {LitElement, ReactiveController, ReactiveControllerHost} from 'lit';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {buildCustomEvent} from '@/src/utils/event-utils';

type LitElementWithError = Omit<
  Pick<InitializableComponent, 'error'>,
  'error'
> &
  LitElement & {
    error: Error | null;
  };

const itemContextEventName = 'atomic/resolveResult';

export class MissingParentError extends Error {
  constructor(elementName: string, parentName: string) {
    super(
      `The "${elementName}" element must be the child of an "${parentName}" element.`
    );
  }
}

function extractFolded<T = Record<string, unknown>>(
  item: Record<string, unknown>,
  returnFolded: boolean
): T {
  if (returnFolded) {
    if ('children' in item) {
      return item as T;
    } else {
      return {children: [], result: item} as T;
    }
  }

  if ('children' in item && 'result' in item) {
    return item.result as T;
  }
  return item as T;
}

/**
 * A reactive controller that manages item context data from parent components.
 * Handles fetching item data via custom events and manages error states.
 */
export class ItemContextController<T = Record<string, unknown>>
  implements ReactiveController
{
  private host: ReactiveControllerHost & LitElementWithError;
  private parentName: string;
  private folded: boolean;
  private _item: T | null = null;
  private _error: MissingParentError | null = null;

  constructor(
    host: ReactiveControllerHost & LitElementWithError,
    options: {parentName?: string; folded?: boolean} = {}
  ) {
    this.host = host;
    this.parentName = options.parentName ?? 'atomic-result';
    this.folded = options.folded ?? false;
    host.addController(this);
  }

  get item(): T | null {
    return this._error ? null : this._item;
  }

  get error(): MissingParentError | null {
    return this._error;
  }

  get hasError(): boolean {
    return this._error !== null;
  }

  hostConnected(): void {
    this._resolveItemContext();
  }

  private _resolveItemContext(): void {
    const event = buildCustomEvent(
      itemContextEventName,
      (item: Record<string, unknown>) => {
        this._item = extractFolded<T>(item, this.folded);
        this._error = null;
        this.host.error = null;
        this.host.requestUpdate();
      }
    );

    const canceled = this.host.dispatchEvent(event);
    if (canceled) {
      const elementName = (this.host as Element).nodeName.toLowerCase();
      this._error = new MissingParentError(elementName, this.parentName);
      this._item = null;
      this.host.error = this._error;
      this.host.requestUpdate();
    }
  }
}

type ItemContextEventHandler<T> = (item: T) => void;
export type ItemContextEvent<T> = CustomEvent<ItemContextEventHandler<T>>;
