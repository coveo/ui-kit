import type {
  FoldedResult as InsightFoldedResult,
  InteractiveResult as InsightInteractiveResult,
  Result as InsightResult,
} from '@coveo/headless/insight';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindings} from '@/src/decorators/bindings.js';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import type {InteractiveItemContextEvent} from '../../common/item-list/context/interactive-item-context-controller';
import type {ItemContextEvent} from '../../common/item-list/context/item-context-controller';
import type {DisplayConfig} from '../../common/item-list/context/item-display-config-context-controller';
import {resultComponentClass} from '../../common/item-list/item-list-common';
import {
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
  ItemLayout,
} from '../../common/layout/display-options';
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import type {InsightStore} from '../atomic-insight-interface/store';

/**
 * @internal
 */
@customElement('atomic-insight-result')
@bindings()
@withTailwindStyles
export class AtomicInsightResult
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state() bindings!: InsightBindings;
  @state() error!: Error;

  private layout!: ItemLayout;

  /**
   * Whether an atomic-result-link inside atomic-insight-result should stop click event propagation.
   */
  @property({type: Boolean, attribute: 'stop-propagation'})
  stopPropagation?: boolean;

  /**
   * The result item.
   */
  @property({type: Object}) result!: InsightResult | InsightFoldedResult;

  /**
   * The InteractiveResult item.
   * @internal
   */
  @property({type: Object, attribute: 'interactive-result'})
  interactiveResult!: InsightInteractiveResult;

  /**
   * Global Atomic state.
   * @internal
   */
  @property({type: Object}) store?: InsightStore;

  /**
   * The result content to display.
   */
  @property({type: Object}) content?: ParentNode;

  /**
   * How large or small results should be.
   */
  @property({type: String}) density: ItemDisplayDensity = 'normal';

  /**
   * The size of the visual section in result list items.
   *
   * This is overwritten by the image size defined in the result content, if it exists.
   */
  @property({type: String, attribute: 'image-size'})
  imageSize: ItemDisplayImageSize = 'icon';

  /**
   * The classes to add to the result element.
   */
  @property({type: String}) classes = '';

  /**
   * @internal
   */
  @property({type: String, attribute: 'loading-flag'}) loadingFlag?: string;

  static styles: CSSResultGroup = css`
    :host {
      position: relative;
    }

    .with-sections:not(.child-result) {
      padding-top: var(--atomic-layout-spacing-y);
      padding-bottom: var(--atomic-layout-spacing-y);
      padding-right: var(--atomic-layout-spacing-x);
      padding-left: var(--atomic-layout-spacing-x);
    }

    :host(:hover) .with-sections {
      background-color: rgb(var(--atomic-neutral-lighter) / 1);
    }

    :host(:hover) atomic-insight-result-action-bar {
      visibility: visible;
    }

    :host(:first-of-type) .with-sections:not(.child-result) {
      padding-top: 2rem;
    }

    :host(:first-of-type) atomic-insight-result-action-bar {
      top: 0;
    }
  `;

  public initialize() {
    // Component initialization logic will be added here
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.content) {
      this.layout = new ItemLayout(
        this.content.children,
        'list',
        this.density,
        this.imageSize
      );
    }
  }

  firstUpdated() {
    // Set up event listeners using Lit pattern
    this.addEventListener('atomic/resolveResult', (event: Event) => {
      const customEvent = event as ItemContextEvent<
        InsightFoldedResult | InsightResult
      >;
      this.resolveResult(customEvent);
    });

    this.addEventListener('atomic/resolveInteractiveResult', (event: Event) => {
      const customEvent =
        event as InteractiveItemContextEvent<InsightInteractiveResult>;
      this.resolveInteractiveResult(customEvent);
    });

    this.addEventListener('atomic/resolveStopPropagation', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.resolveStopPropagation(customEvent);
    });

    this.addEventListener(
      'atomic/resolveResultDisplayConfig',
      (event: Event) => {
        const customEvent = event as ItemContextEvent<DisplayConfig>;
        this.resolveResultDisplayConfig(customEvent);
      }
    );
  }

  private resolveResult(
    event: ItemContextEvent<InsightFoldedResult | InsightResult>
  ) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  }

  private resolveInteractiveResult(
    event: InteractiveItemContextEvent<InsightInteractiveResult>
  ) {
    event.preventDefault();
    event.stopPropagation();
    if (this.interactiveResult) {
      event.detail(this.interactiveResult);
    }
  }

  private resolveStopPropagation(event: CustomEvent) {
    event.detail(this.stopPropagation);
  }

  private resolveResultDisplayConfig(event: ItemContextEvent<DisplayConfig>) {
    event.preventDefault();
    event.stopPropagation();
    event.detail({
      density: this.density,
      imageSize: this.imageSize!,
    });
  }

  private getContentHTML() {
    if (!this.content) return '';
    return Array.from(this.content.children)
      .map((child) => child.outerHTML)
      .join('');
  }

  updated() {
    if (this.loadingFlag && this.store) {
      this.store.unsetLoadingFlag(this.loadingFlag);
    }
  }

  render() {
    if (!this.layout) {
      return html`<div class="${resultComponentClass}"></div>`;
    }

    return html`
      <div class="${resultComponentClass}">
        <div
          class="result-root ${this.layout
            .getClasses()
            .concat(this.classes)
            .join(' ')}"
          .innerHTML="${this.getContentHTML()}"
        ></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-result': AtomicInsightResult;
  }
}
