import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {randomID} from '@/src/utils/utils';

export interface LayoutStylesHost extends ReactiveControllerHost {
  mobileBreakpoint: string;
  getRootNode(): Node;
  id?: string;
}

export type StylesBuilderFunction = (
  host: HTMLElement,
  mobileBreakpoint: string
) => string;

/**
 * A reactive controller that manages dynamic layout styles.
 */
export class LayoutStylesController implements ReactiveController {
  private host: LayoutStylesHost;
  private dynamicStyleSheet: CSSStyleSheet | null = null;
  private stylesBuilder: StylesBuilderFunction;
  private componentPrefix: string;

  constructor(
    host: LayoutStylesHost,
    stylesBuilder: StylesBuilderFunction,
    componentPrefix: string
  ) {
    this.host = host;
    this.stylesBuilder = stylesBuilder;
    this.componentPrefix = componentPrefix;

    this.host.addController(this);
  }

  hostConnected() {
    if (!this.host.id) {
      this.host.id = randomID(this.componentPrefix);
    }

    this.host.updateComplete.then(() => this.updateStyles());
  }

  /**
   * Updates the dynamic styles based on the current mobile breakpoint
   */
  public updateStyles() {
    const parent = this.host.getRootNode();
    const isDocumentOrShadowRoot =
      parent instanceof Document || parent instanceof ShadowRoot;

    if (!isDocumentOrShadowRoot) {
      return;
    }

    const newStylesCSS = this.stylesBuilder(
      this.host as unknown as HTMLElement,
      this.host.mobileBreakpoint
    );

    if (!this.dynamicStyleSheet) {
      this.dynamicStyleSheet = new CSSStyleSheet();
      this.dynamicStyleSheet.replaceSync(newStylesCSS);
      parent.adoptedStyleSheets = [
        ...parent.adoptedStyleSheets,
        this.dynamicStyleSheet,
      ];
      return;
    }

    this.dynamicStyleSheet.replaceSync(newStylesCSS);
  }
}
