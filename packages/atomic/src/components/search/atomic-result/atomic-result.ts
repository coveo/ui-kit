import {Schema, StringValue} from '@coveo/bueno';
import type {FoldedResult, InteractiveResult, Result} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ref} from 'lit/directives/ref.js';
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
  ItemDisplayLayout,
} from '@/src/components/common/layout/item-layout-utils';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {SearchStore} from '@/src/components/search/atomic-search-interface/store';
import type {
  InteractiveResultContextEvent,
  ResultContextEvent,
} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {parentNodeToString} from '@/src/utils/dom-utils';
import '../atomic-result-text/atomic-result-text';
/**
 * The `atomic-result` component is used internally by the `atomic-result-list` and `atomic-folded-result-list` components.
 */
@customElement('atomic-result')
@withTailwindStyles
export class AtomicResult extends ChildrenUpdateCompleteMixin(LitElement) {
  private resultRootRef?: HTMLElement;
  private linkContainerRef?: HTMLElement;
  private itemLayoutController!: ItemLayoutController;

  static styles: CSSResultGroup = css`
@import "../../common/template-system/template-system.css";

:host {
  @apply atomic-template-system;
}
`;

  @state()
  error!: Error;

  /**
   * Whether `atomic-result-link` components nested in the `atomic-result` should stop click event propagation.
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
  @property({type: Object}) result!: Result | FoldedResult;

  /**
   * The InteractiveResult item.
   */
  @property({type: Object, attribute: 'interactive-result'})
  interactiveResult!: InteractiveResult;

  /**
   * Global Atomic state.
   */
  @property({type: Object}) store?: SearchStore;

  /**
   * The result content to display.
   */
  @property({type: Object}) content?: ParentNode;

  /**
   * The result link to use when the result is clicked in a grid layout.
   *
   * @default - An `atomic-result-link` without any customization.
   */
  @property({type: Object, attribute: 'link-content'}) linkContent: ParentNode =
    new DocumentFragment();

  /**
   * How results should be displayed.
   */
  @property({reflect: true, type: String}) display: ItemDisplayLayout = 'list';

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
        display: this.display,
        density: this.density,
        imageSize: this.imageSize,
      }),
      new Schema({
        display: new StringValue({constrainTo: ['grid', 'list', 'table']}),
        density: new StringValue({
          constrainTo: ['normal', 'comfortable', 'compact'],
        }),
        imageSize: new StringValue({
          constrainTo: ['small', 'large', 'icon', 'none'],
        }),
      })
    );
  }

  public resolveResult = (event: ResultContextEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  };

  public resolveInteractiveResult = (event: InteractiveResultContextEvent) => {
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
    event: ResultContextEvent<DisplayConfig>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.detail({
      density: this.density,
      imageSize: this.imageSize!,
    });
  };

  public handleClick = (event: MouseEvent) => {
    if (this.stopPropagation) {
      event.stopPropagation();
    }
    if (this.display === 'grid') {
      this.clickLinkContainer();
    }
  };

  public clickLinkContainer = () => {
    this.shadowRoot
      ?.querySelector<HTMLAnchorElement>(
        '.link-container > atomic-result-link a:not([slot])'
      )
      ?.click();
  };

  public async connectedCallback() {
    super.connectedCallback();

    new CustomRenderController(this, {
      renderingFunction: () => this.renderingFunction,
      itemData: () => this.result,
      rootElementRef: () => this.resultRootRef,
      linkContainerRef: () => this.linkContainerRef,
      onRenderComplete: (element, output) => {
        this.itemLayoutController.applyLayoutClassesToElement(element, output);
      },
    });

    this.itemLayoutController = new ItemLayoutController(this, {
      elementPrefix: 'atomic-result',
      renderingFunction: () => this.renderingFunction,
      content: () => this.content,
      layoutConfig: () => ({
        display: this.display,
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
    this.addEventListener('click', this.handleClick);

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
    this.removeEventListener('click', this.handleClick);
  }

  private getContentHTML() {
    if (!this.content) {
      console.warn(
        'atomic-result: content property is undefined. Cannot get content HTML.',
        this
      );
      return '';
    }
    return parentNodeToString(this.content);
  }

  private getLinkHTML() {
    return parentNodeToString(this.linkContent ?? new HTMLElement());
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
          <div
            class="link-container"
            ${ref((el) => {
              this.linkContainerRef = el as HTMLElement;
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
          class="result-root ${this.itemLayoutController.getCombinedClasses().join(' ')}"
          .innerHTML=${this.getContentHTML()}
        ></div>
        <div class="link-container" .innerHTML=${this.getLinkHTML()}></div>
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
    'atomic-result': AtomicResult;
  }
}
