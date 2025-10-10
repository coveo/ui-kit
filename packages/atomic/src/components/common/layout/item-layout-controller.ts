import type {LitElement, ReactiveController, ReactiveControllerHost} from 'lit';
import type {ItemRenderingFunction} from '@/src/components/common/item-list/item-list-common';
import type {AnyItem} from '@/src/components/common/item-list/unfolded-item';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from './display-options';
import {ItemLayout} from './item-layout';

export interface ItemLayoutHost extends ReactiveControllerHost {
  shadowRoot?: ShadowRoot | null;
}

export interface LayoutDisplayConfig {
  display: ItemDisplayLayout;
  density: ItemDisplayDensity;
  imageSize: ItemDisplayImageSize;
}

export interface ItemLayoutOptions {
  elementPrefix: string;
  renderingFunction: () => ItemRenderingFunction<AnyItem> | undefined;
  content: () => ParentNode | undefined;
  layoutConfig: () => LayoutDisplayConfig;
  itemClasses: () => string;
}

/**
 * A reactive controller that manages layout creation and class application for item components.
 */
export class ItemLayoutController implements ReactiveController {
  private host: ItemLayoutHost & LitElement;
  private options: Required<ItemLayoutOptions>;
  private layoutInstance: ItemLayout | null = null;

  constructor(host: ItemLayoutHost & LitElement, options: ItemLayoutOptions) {
    this.host = host;
    this.options = {
      ...options,
    };
    host.addController(this);
  }

  hostConnected(): void {
    this.createLayout();
  }

  hostUpdated(): void {
    this.applyLayoutClasses();
  }

  /**
   * Gets the current layout instance
   */
  public getLayout(): ItemLayout | null {
    return this.layoutInstance;
  }

  /**
   * Gets combined layout and extra classes
   */
  public getCombinedClasses(additionalContent?: string): string[] {
    const layout = this.getLayout();
    const layoutClasses = layout ? layout.getClasses(additionalContent) : [];
    const itemClasses = this.options
      .itemClasses()
      .split(/\s+/)
      .filter((c) => c);
    return [...layoutClasses, ...itemClasses];
  }

  /**
   * Applies layout classes to a specific element (useful for custom rendering)
   */
  public applyLayoutClassesToElement(
    element: HTMLElement,
    additionalContent?: string
  ): void {
    const layout = this.getLayout();
    if (!layout) {
      return;
    }

    const classes = this.getCombinedClasses(additionalContent);
    if (classes.length > 0) {
      element.classList.add(...classes);
    }
  }

  private applyLayoutClasses(): void {
    const layout = this.getLayout();
    if (!layout) {
      return;
    }

    const classes = this.getCombinedClasses();
    const root = this.host.shadowRoot?.querySelector('.result-root');
    if (!root || classes.length === 0) {
      return;
    }

    if (this.hasCustomRenderFunction()) {
      this.observeAndApplyClasses(root, classes);
    } else {
      this.addClassesToElements(root, classes);
    }
  }

  private createLayout(): void {
    const content = this.options.content();
    if (!content) {
      console.warn(
        `${this.options.elementPrefix}: content property is undefined. Cannot create layout.`,
        this.host
      );
      this.layoutInstance = null;
      return;
    }

    const config = this.options.layoutConfig();
    this.layoutInstance = new ItemLayout(
      content.children,
      config.display,
      config.density,
      config.imageSize
    );
  }

  private hasCustomRenderFunction(): boolean {
    return this.options.renderingFunction() !== undefined;
  }

  private addClassesToElements(root: Element, classes: string[]): void {
    if (classes.length === 0) {
      return;
    }

    const elements = root.querySelectorAll('*');
    elements.forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      if (tagName.startsWith(`${this.options.elementPrefix}-`)) {
        element.classList.add(...classes);
      }
    });
  }

  private observeAndApplyClasses(root: Element, classes: string[]): void {
    const observer = new MutationObserver((mutations) => {
      const hasNewElements = mutations.some(
        (mutation) =>
          mutation.type === 'childList' && mutation.addedNodes.length > 0
      );

      if (hasNewElements) {
        this.addClassesToElements(root, classes);
        observer.disconnect();
      }
    });

    observer.observe(root, {childList: true, subtree: true});
  }
}
