import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {ItemTemplateProvider} from '@/src/components/common/item-list/item-template-provider';
import type {LitElementWithError} from '@/src/decorators/types';
import {buildCustomEvent} from '@/src/utils/event-utils';

const childTemplatesContextEventName = 'atomic/resolveChildTemplates';

/**
 * A reactive controller that manages child template context data from parent components.
 * Handles fetching ItemTemplateProvider via custom events and manages the template provider state.
 */
export class ChildTemplatesContextController implements ReactiveController {
  private host: ReactiveControllerHost & LitElementWithError;
  private _itemTemplateProvider: ItemTemplateProvider | null = null;

  constructor(host: ReactiveControllerHost & LitElementWithError) {
    this.host = host;
    host.addController(this);
  }

  get itemTemplateProvider(): ItemTemplateProvider | null {
    return this._itemTemplateProvider;
  }

  hostConnected(): void {
    this._resolveChildTemplatesContext();
  }

  hostUpdated(): void {
    if (!this._itemTemplateProvider) {
      this._resolveChildTemplatesContext();
    }
  }

  private _resolveChildTemplatesContext(): void {
    const event = buildCustomEvent(
      childTemplatesContextEventName,
      (itemTemplateProvider?: ItemTemplateProvider) => {
        if (this._itemTemplateProvider) {
          return;
        }

        this._itemTemplateProvider = itemTemplateProvider || null;
        this.host.requestUpdate();
      }
    );

    const canceled = this.host.dispatchEvent(event);
    if (canceled) {
      this._itemTemplateProvider = null;
      this.host.requestUpdate();
    }
  }
}

type ChildTemplatesContextEventHandler = (
  itemTemplateProvider?: ItemTemplateProvider
) => void;
export type ChildTemplatesContextEvent =
  CustomEvent<ChildTemplatesContextEventHandler>;
