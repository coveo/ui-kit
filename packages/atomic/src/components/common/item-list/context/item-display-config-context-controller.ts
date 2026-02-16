import type {LitElement, ReactiveController, ReactiveControllerHost} from 'lit';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {buildCustomEvent} from '@/src/utils/event-utils';

const itemDisplayConfigContextEventName = 'atomic/resolveResultDisplayConfig';

export type DisplayConfig = {
  density: ItemDisplayDensity;
  imageSize: ItemDisplayImageSize;
};

/**
 * A reactive controller that manages display configuration context from parent components.
 * Handles fetching display config data via custom events.
 */
export class ItemDisplayConfigContextController implements ReactiveController {
  private host: ReactiveControllerHost & LitElement;
  private _config: DisplayConfig | null = null;

  constructor(host: ReactiveControllerHost & LitElement) {
    this.host = host;
    host.addController(this);
  }

  get config(): DisplayConfig | null {
    return this._config;
  }

  hostConnected(): void {
    this._resolveDisplayConfig();
  }

  private _resolveDisplayConfig(): void {
    const event = buildCustomEvent(
      itemDisplayConfigContextEventName,
      (config: DisplayConfig) => {
        this._config = config;
        this.host.requestUpdate();
      }
    );

    const canceled = this.host.dispatchEvent(event);
    if (canceled) {
      this._config = null;
    }
  }
}

type ItemDisplayConfigContextEventHandler = (config: DisplayConfig) => void;
export type ItemDisplayConfigContextEvent =
  CustomEvent<ItemDisplayConfigContextEventHandler>;
