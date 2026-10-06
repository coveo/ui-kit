import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {LitElementWithError} from '@/src/decorators/types';
import {buildCustomEvent} from '@/src/utils/event-utils';

const interactiveItemContextEventName = 'atomic/resolveInteractiveResult';

/**
 * A reactive controller that manages interactive item context data from parent components.
 * Handles fetching interactive item data via custom events.
 */
export class InteractiveItemContextController<T> implements ReactiveController {
  private host: ReactiveControllerHost & LitElementWithError;
  private _interactiveItem: T | null = null;
  private eventName: string;

  constructor(
    host: ReactiveControllerHost & LitElementWithError,
    options: {eventName?: string} = {}
  ) {
    this.host = host;
    this.eventName = options.eventName ?? interactiveItemContextEventName;
    host.addController(this);
  }

  get interactiveItem(): T | null {
    return this._interactiveItem;
  }

  hostConnected(): void {
    this._resolveInteractiveItemContext();
  }

  private _resolveInteractiveItemContext(): void {
    const event = buildCustomEvent(this.eventName, (item: T) => {
      this._interactiveItem = item;
      this.host.requestUpdate();
    });

    this.host.dispatchEvent(event);
  }
}

export type InteractiveItemContextEvent<T> = CustomEvent<(interactiveItem: T) => void>;
