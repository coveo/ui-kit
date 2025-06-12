import {AnyItem} from '@/src/components/common/interface/item.js';
import {LitElementWithError} from '@/src/decorators/types';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {ReactiveController, ReactiveControllerHost} from 'lit';

const interactiveItemContextEventName = 'atomic/resolveInteractiveResult';

/**
 * A reactive controller that manages interactive item context data from parent components.
 * Handles fetching interactive item data via custom events.
 */
export class InteractiveItemContextController<T extends AnyItem = AnyItem>
  implements ReactiveController
{
  private host: ReactiveControllerHost & LitElementWithError;
  private _interactiveItem: T | null = null;

  constructor(host: ReactiveControllerHost & LitElementWithError) {
    this.host = host;
    host.addController(this);
  }

  get interactiveItem(): T | null {
    return this._interactiveItem;
  }

  hostConnected(): void {
    this._resolveInteractiveItemContext();
  }

  private _resolveInteractiveItemContext(): void {
    const event = buildCustomEvent(
      interactiveItemContextEventName,
      (item: AnyItem) => {
        this._interactiveItem = item as T;
        this.host.requestUpdate();
      }
    );

    this.host.dispatchEvent(event);
  }
}

export type InteractiveItemContextEvent<T extends AnyItem = AnyItem> =
  CustomEvent<(interactiveItem: T) => void>;
