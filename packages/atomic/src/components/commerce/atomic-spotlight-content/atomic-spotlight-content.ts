import type {InteractiveSpotlightContent, SpotlightContent} from '@coveo/headless/commerce';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ref} from 'lit/directives/ref.js';
import type {CommerceStore} from '@/src/components/commerce/atomic-commerce-interface/store';
import {
  interactiveSpotlightContentContextEventName,
  type InteractiveSpotlightContentContextEvent,
  spotlightContentContextEventName,
  type SpotlightContentContextEvent,
} from '@/src/components/commerce/spotlight-content-template-component-utils/context/spotlight-content-context-controller';
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
import {booleanConverter} from '@/src/converters/boolean-converter';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {parentNodeToString} from '@/src/utils/dom-utils';
import '@/src/components/commerce/atomic-spotlight-content-image/atomic-spotlight-content-image';
import '@/src/components/commerce/atomic-spotlight-content-link/atomic-spotlight-content-link';
import '@/src/components/commerce/atomic-spotlight-content-text/atomic-spotlight-content-text';

/**
 * The `atomic-spotlight-content` component is used internally by the `atomic-commerce-product-list` component to
 * render each Spotlight Content item with the matching `atomic-spotlight-content-template`.
 */
@customElement('atomic-spotlight-content')
@withTailwindStyles
export class AtomicSpotlightContent extends ChildrenUpdateCompleteMixin(LitElement) {
  static styles: CSSResultGroup = css`
    @reference '../../../utils/tailwind.global.tw.css';

    :host {
      @apply relative block h-full;
    }

    .result-root {
      @apply flex h-full flex-col gap-2;

      &.display-list {
        @apply flex-row items-center gap-4;

        atomic-spotlight-content-image {
          @apply w-1/3 max-w-60 shrink-0;
        }
      }
    }

    .spotlight-content-body {
      @apply flex flex-col gap-1;
    }

    .link-container {
      display: none;
    }
  `;

  /**
   * Whether `atomic-spotlight-content-link` components nested in the `atomic-spotlight-content` should stop click event propagation.
   */
  @property({
    attribute: 'stop-propagation',
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
  })
  stopPropagation?: boolean;

  /**
   * The Spotlight Content item.
   */
  @property({type: Object, attribute: false}) spotlightContent!: SpotlightContent;

  /**
   * The `InteractiveSpotlightContent` sub-controller used to log analytics when the Spotlight Content is selected.
   */
  @property({type: Object, attribute: false})
  interactiveSpotlightContent!: InteractiveSpotlightContent;

  /**
   * Global Atomic state.
   */
  @property({type: Object, attribute: false}) store?: CommerceStore;

  /**
   * The Spotlight Content template content to display.
   */
  @property({type: Object, attribute: false}) content?: ParentNode;

  /**
   * The link to use when the Spotlight Content is clicked in a grid layout.
   *
   * @default - An `atomic-spotlight-content-link` without any customization.
   */
  @property({type: Object, attribute: false}) linkContent: ParentNode = new DocumentFragment();

  /**
   * How Spotlight Content should be displayed.
   */
  @property({reflect: true, type: String}) display: ItemDisplayLayout = 'grid';

  /**
   * How large or small Spotlight Content should be.
   */
  @property({reflect: true, type: String}) density: ItemDisplayDensity = 'normal';

  /**
   * The size of the visual section in Spotlight Content items.
   */
  @property({reflect: true, type: String, attribute: 'image-size'})
  imageSize: ItemDisplayImageSize = 'small';

  /**
   * The classes to add to the Spotlight Content element.
   */
  @property({type: String}) classes = '';

  /**
   * A unique identifier for tracking the loading state of this component.
   * When set, the flag is removed from the global loading flags once the component finishes its initial render.
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
  @property({type: Object, attribute: false})
  renderingFunction: ItemRenderingFunction;

  private rootRef?: HTMLElement;
  private linkContainerRef?: HTMLElement;
  private itemLayoutController!: ItemLayoutController;

  public resolveSpotlightContent = (event: SpotlightContentContextEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.spotlightContent);
  };

  public resolveInteractiveSpotlightContent = (event: InteractiveSpotlightContentContextEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.interactiveSpotlightContent) {
      event.detail(this.interactiveSpotlightContent);
    }
  };

  public resolveStopPropagation = (event: CustomEvent) => {
    event.detail(this.stopPropagation);
  };

  public resolveDisplayConfig = (event: CustomEvent<(config: DisplayConfig) => void>) => {
    event.preventDefault();
    event.stopPropagation();
    event.detail({
      density: this.density,
      imageSize: this.imageSize,
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
      ?.querySelector('.link-container > atomic-spotlight-content-link')
      ?.shadowRoot?.querySelector<HTMLAnchorElement>('a')
      ?.click();
  };

  public connectedCallback() {
    super.connectedCallback();

    new CustomRenderController(this, {
      renderingFunction: () => this.renderingFunction,
      itemData: () => this.spotlightContent,
      rootElementRef: () => this.rootRef,
      linkContainerRef: () => this.linkContainerRef,
      onRenderComplete: (element, output) => {
        this.itemLayoutController.applyLayoutClassesToElement(element, output);
      },
    });

    this.itemLayoutController = new ItemLayoutController(this, {
      elementPrefix: 'atomic-spotlight-content',
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
      spotlightContentContextEventName,
      this.resolveSpotlightContent as EventListener
    );
    this.addEventListener(
      interactiveSpotlightContentContextEventName,
      this.resolveInteractiveSpotlightContent as EventListener
    );
    this.addEventListener(
      'atomic/resolveStopPropagation',
      this.resolveStopPropagation as EventListener
    );
    this.addEventListener(
      'atomic/resolveResultDisplayConfig',
      this.resolveDisplayConfig as EventListener
    );
    this.addEventListener('click', this.handleClick);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener(
      spotlightContentContextEventName,
      this.resolveSpotlightContent as EventListener
    );
    this.removeEventListener(
      interactiveSpotlightContentContextEventName,
      this.resolveInteractiveSpotlightContent as EventListener
    );
    this.removeEventListener(
      'atomic/resolveStopPropagation',
      this.resolveStopPropagation as EventListener
    );
    this.removeEventListener(
      'atomic/resolveResultDisplayConfig',
      this.resolveDisplayConfig as EventListener
    );
    this.removeEventListener('click', this.handleClick);
  }

  public render() {
    if (this.renderingFunction !== undefined) {
      return html`
        <div class=${resultComponentClass}>
          <div
            class="result-root"
            ${ref((el) => {
              this.rootRef = el as HTMLElement;
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

    if (!this.itemLayoutController.getLayout()) {
      return html`<div class=${resultComponentClass}></div>`;
    }

    return html`
      <div class=${resultComponentClass}>
        <div
          class="result-root ${this.itemLayoutController.getCombinedClasses().join(' ')}"
          .innerHTML=${this.content ? parentNodeToString(this.content) : ''}
        ></div>
        <div class="link-container" .innerHTML=${parentNodeToString(this.linkContent)}></div>
      </div>
    `;
  }

  public firstUpdated(changedProperties: Map<string, unknown>) {
    super.firstUpdated(changedProperties);
    if (this.loadingFlag && this.store) {
      this.store.unsetLoadingFlag(this.loadingFlag);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-spotlight-content': AtomicSpotlightContent;
  }
}
