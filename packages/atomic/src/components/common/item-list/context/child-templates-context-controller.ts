import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {ResultTemplateProvider} from '@/src/components/common/item-list/result-template-provider';
import type {LitElementWithError} from '@/src/decorators/types';
import {buildCustomEvent} from '@/src/utils/event-utils';

const childTemplatesContextEventName = 'atomic/resolveChildTemplates';

/**
 * A reactive controller that manages child template context data from parent components.
 * Handles fetching ResultTemplateProvider via custom events and manages the template provider state.
 */
export class ChildTemplatesContextController implements ReactiveController {
  private host: ReactiveControllerHost & LitElementWithError;
  private _itemTemplateProvider: ResultTemplateProvider | null = null;

  constructor(host: ReactiveControllerHost & LitElementWithError) {
    this.host = host;
    host.addController(this);
  }

  get itemTemplateProvider(): ResultTemplateProvider | null {
    return this._itemTemplateProvider;
  }

  hostConnected(): void {
    this._resolveChildTemplatesContext();
  }

  private _resolveChildTemplatesContext(): void {
    const event = buildCustomEvent(
      childTemplatesContextEventName,
      (itemTemplateProvider?: ResultTemplateProvider) => {
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
  itemTemplateProvider?: ResultTemplateProvider
) => void;
export type ChildTemplatesContextEvent =
  CustomEvent<ChildTemplatesContextEventHandler>;
