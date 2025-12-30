import type {
  FoldedResult as InsightFoldedResult,
  InteractiveResult as InsightInteractiveResult,
  Result as InsightResult,
} from '@coveo/headless/insight';
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {DisplayConfig} from '@/src/components/common/item-list/context/item-display-config-context-controller';
import {resultComponentClass} from '@/src/components/common/item-list/item-list-common';
import {ItemLayoutController} from '@/src/components/common/layout/item-layout-controller';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {parentNodeToString} from '@/src/utils/dom-utils';
import type {InsightStore} from '../atomic-insight-interface/store';
import {insightResultStyles} from './atomic-insight-result.tw.css';

/**
 * The `atomic-insight-result` component is used internally by the `atomic-insight-result-list` component.
 * @internal
 */
@customElement('atomic-insight-result')
@withTailwindStyles
export class AtomicInsightResult extends LitElement {
  private itemLayoutController!: ItemLayoutController;

  static styles: CSSResultGroup = insightResultStyles;

  @state()
  error!: Error;

  /**
   * Whether an atomic-result-link inside atomic-insight-result should stop click event propagation.
   */
  @property({
    attribute: 'stop-propagation',
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
  })
  stopPropagation?: boolean;

  /**
   * The result item.
   */
  @property({type: Object}) result!: InsightResult | InsightFoldedResult;

  /**
   * The InteractiveResult item.
   */
  @property({type: Object, attribute: 'interactive-result'})
  interactiveResult!: InsightInteractiveResult;

  /**
   * Global Atomic state.
   */
  @property({type: Object}) store?: InsightStore;

  /**
   * The result content to display.
   */
  @property({type: Object}) content?: ParentNode;

  /**
   * How large or small results should be.
   */
  @property({reflect: true, type: String}) density: ItemDisplayDensity =
    'normal';

  /**
   * The size of the visual section in result list items.
   *
   * This is overwritten by the image size defined in the result content, if it exists.
   */
  @property({reflect: true, type: String, attribute: 'image-size'})
  imageSize: ItemDisplayImageSize = 'icon';

  /**
   * The classes to add to the result element.
   */
  @property({type: String}) classes = '';

  /**
   * A unique identifier for tracking the loading state of this result component.
   * When set, this flag is added to the global loading flags array and automatically
   * removed when the component finishes its initial render. This allows the framework
   * to determine when all components have finished loading.
   *
   * @internal
   */
  @property({type: String, attribute: 'loading-flag'}) loadingFlag?: string;

  public resolveResult = (
    event: CustomEvent<(item: InsightFoldedResult | InsightResult) => void>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  };

  public resolveInteractiveResult = (
    event: CustomEvent<(item: InsightInteractiveResult) => void>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.interactiveResult) {
      event.detail(this.interactiveResult);
    }
  };

  public resolveStopPropagation = (event: CustomEvent) => {
    event.detail(this.stopPropagation);
  };

  public resolveResultDisplayConfig = (
    event: CustomEvent<(config: DisplayConfig) => void>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.detail({
      density: this.density,
      imageSize: this.imageSize!,
    });
  };

  public async connectedCallback() {
    super.connectedCallback();

    this.itemLayoutController = new ItemLayoutController(this, {
      elementPrefix: 'atomic-insight-result',
      renderingFunction: () => undefined,
      content: () => this.content,
      layoutConfig: () => ({
        display: 'list',
        density: this.density,
        imageSize: this.imageSize,
      }),
      itemClasses: () => this.classes,
    });

    this.addEventListener(
      'atomic/resolveResult',
      this.resolveResult as EventListener
    );
    this.addEventListener(
      'atomic/resolveInteractiveResult',
      this.resolveInteractiveResult as EventListener
    );
    this.addEventListener(
      'atomic/resolveStopPropagation',
      this.resolveStopPropagation as EventListener
    );
    this.addEventListener(
      'atomic/resolveResultDisplayConfig',
      this.resolveResultDisplayConfig as EventListener
    );

    await this.getUpdateComplete();
    this.classList.add('hydrated');
  }

  public disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener(
      'atomic/resolveResult',
      this.resolveResult as EventListener
    );
    this.removeEventListener(
      'atomic/resolveInteractiveResult',
      this.resolveInteractiveResult as EventListener
    );
    this.removeEventListener(
      'atomic/resolveStopPropagation',
      this.resolveStopPropagation as EventListener
    );
    this.removeEventListener(
      'atomic/resolveResultDisplayConfig',
      this.resolveResultDisplayConfig as EventListener
    );
  }

  private getContentHTML() {
    if (!this.content) {
      console.warn(
        'atomic-insight-result: content property is undefined. Cannot get content HTML.',
        this
      );
      return '';
    }
    return parentNodeToString(this.content);
  }

  public render() {
    // Handle case where content is undefined and layout was not created
    if (!this.itemLayoutController.getLayout()) {
      return html`<div class=${resultComponentClass}></div>`;
    }

    return html`
      <div class=${resultComponentClass}>
        <div
          class="result-root ${this.itemLayoutController.getCombinedClasses().join(' ')}"
          .innerHTML=${this.getContentHTML()}
        ></div>
      </div>
    `;
  }

  public firstUpdated(_changedProperties: Map<string, unknown>) {
    if (this.loadingFlag && this.store) {
      this.store.unsetLoadingFlag(this.loadingFlag);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-result': AtomicInsightResult;
  }
}
