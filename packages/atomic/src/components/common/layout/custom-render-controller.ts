import type {LitElement, ReactiveController, ReactiveControllerHost} from 'lit';
import type {ItemRenderingFunction} from '@/src/components/common/item-list/item-list-common';
import type {AnyItem} from '@/src/components/common/item-list/unfolded-item';

export interface CustomRenderHost extends ReactiveControllerHost {
  shadowRoot?: ShadowRoot | null;
}

export interface CustomRenderOptions {
  renderingFunction: () => ItemRenderingFunction<AnyItem> | undefined;
  itemData: () => AnyItem | undefined;
  rootElementRef: () => HTMLElement | undefined;
  linkContainerRef?: () => HTMLElement | undefined;
  onRenderComplete?: (element: HTMLElement, output: string) => void;
}

/**
 * A reactive controller that manages custom rendering function execution for item components.
 */
export class CustomRenderController implements ReactiveController {
  private options: Required<CustomRenderOptions>;
  private hasExecutedRenderFunction = false;

  constructor(
    host: CustomRenderHost & LitElement,
    options: CustomRenderOptions
  ) {
    this.options = {
      linkContainerRef: () => undefined,
      onRenderComplete: () => {},
      ...options,
    };
    host.addController(this);
  }

  hostConnected(): void {
    this.resetRenderState();
  }

  hostUpdated(): void {
    this.executeRenderFunction();
  }

  private resetRenderState(): void {
    this.hasExecutedRenderFunction = false;
  }

  private executeRenderFunction(): void {
    const renderingFunction = this.options.renderingFunction();
    const itemData = this.options.itemData();
    const rootElementRef = this.options.rootElementRef();
    if (
      !renderingFunction ||
      !itemData ||
      !rootElementRef ||
      this.hasExecutedRenderFunction
    ) {
      return;
    }
    const customRenderOutput = renderingFunction(
      itemData,
      rootElementRef,
      this.options.linkContainerRef()
    );
    this.options.onRenderComplete(rootElementRef, customRenderOutput);
    this.hasExecutedRenderFunction = true;
  }
}
