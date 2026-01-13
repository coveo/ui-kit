import {Schema, StringValue} from '@coveo/bueno';
import type {
  FoldedResult as InsightFoldedResult,
  InteractiveResult as InsightInteractiveResult,
  Result as InsightResult,
} from '@coveo/headless/insight';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ref} from 'lit/directives/ref.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import type {DisplayConfig} from '@/src/components/common/item-list/context/item-display-config-context-controller';
import {
  type ItemRenderingFunction,
  resultComponentClass,
} from '@/src/components/common/item-list/item-list-common';
import {CustomRenderController} from '@/src/components/common/layout/custom-render-controller';
import {ItemLayoutController} from '@/src/components/common/layout/item-layout-controller';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {parentNodeToString} from '@/src/utils/dom-utils';
import type {InsightStore} from '../atomic-insight-interface/store';

export type InsightResultContextEvent<T = InsightResult | InsightFoldedResult> =
  CustomEvent<(result: T) => void>;
export type InsightInteractiveResultContextEvent<
  T extends InsightInteractiveResult = InsightInteractiveResult,
> = CustomEvent<(result: T) => void>;

/**
 * The `atomic-insight-result` component is used internally by the `atomic-insight-result-list` component.
 */
@customElement('atomic-insight-result')
@withTailwindStyles
export class AtomicInsightResult extends ChildrenUpdateCompleteMixin(
  LitElement
) {
  private resultRootRef?: HTMLElement;
  private itemLayoutController!: ItemLayoutController;

  static styles: CSSResultGroup = css`
    @import '../../common/template-system/template-system.css';

    :host {
      @apply atomic-template-system;
      @apply relative;
    }

    .with-sections:not(.child-result) {
      padding-top: var(--atomic-layout-spacing-y);
      padding-bottom: var(--atomic-layout-spacing-y);
      padding-right: var(--atomic-layout-spacing-x);
      padding-left: var(--atomic-layout-spacing-x);
    }

    :host(:hover) .with-sections {
      @apply bg-neutral-lighter;
    }

    :host(:hover) atomic-insight-result-action-bar {
      @apply visible;
    }

    :host(:first-of-type) .with-sections:not(.child-result) {
      @apply pt-8;
    }

    :host(:first-of-type) atomic-insight-result-action-bar {
      @apply top-0;
    }
  `;

  @state()
  error!: Error;

  /**
   * Whether `atomic-result-link` components nested in the `atomic-insight-result` should stop click event propagation.
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
  @property({type: Object})
  result!: InsightResult | InsightFoldedResult;

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

  /**
   * Internal function used in advanced setups, which lets you bypass the standard HTML template system.
   * Particularly useful for Atomic React.
   *
   * @internal
   */
  @property({type: Object, attribute: 'rendering-function'})
  renderingFunction: ItemRenderingFunction;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        density: this.density,
        imageSize: this.imageSize,
      }),
      new Schema({
        density: new StringValue({
          constrainTo: ['normal', 'comfortable', 'compact'],
        }),
        imageSize: new StringValue({
          constrainTo: ['small', 'large', 'icon', 'none'],
        }),
      })
    );
  }

  public resolveResult = (event: InsightResultContextEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  };

  public resolveInteractiveResult = (
    event: InsightInteractiveResultContextEvent
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
    event: InsightResultContextEvent<DisplayConfig>
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

    new CustomRenderController(this, {
      renderingFunction: () => this.renderingFunction,
      itemData: () => this.result,
      rootElementRef: () => this.resultRootRef,
      onRenderComplete: (element, output) => {
        this.itemLayoutController.applyLayoutClassesToElement(element, output);
      },
    });

    this.itemLayoutController = new ItemLayoutController(this, {
      elementPrefix: 'atomic-insight-result',
      renderingFunction: () => this.renderingFunction,
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
    if (this.renderingFunction !== undefined) {
      return html`
        <div class=${resultComponentClass}>
          <div
            class="result-root"
            ${ref((el) => {
              this.resultRootRef = el as HTMLElement;
            })}
          ></div>
        </div>
      `;
    }
    // Handle case where content is undefined and layout was not created
    if (!this.itemLayoutController.getLayout()) {
      return html`<div class=${resultComponentClass}></div>`;
    }

    return html`
      <div class=${resultComponentClass}>
        <div
          class="result-root ${this.itemLayoutController
            .getCombinedClasses()
            .join(' ')}"
        >
          ${unsafeHTML(this.getContentHTML())}
        </div>
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
