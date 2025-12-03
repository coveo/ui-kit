import {
  buildInteractiveResult,
  type FoldedResult,
  type FoldedResultList,
  type FoldedResultListState,
} from '@coveo/headless';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import {
  ChildTemplatesContextController,
  type ChildTemplatesContextEvent,
} from '@/src/components/common/item-list/context/child-templates-context-controller';
import {FoldedItemListContextController} from '@/src/components/common/item-list/context/folded-item-list-context-controller';
import {
  type DisplayConfig,
  ItemDisplayConfigContextController,
} from '@/src/components/common/item-list/context/item-display-config-context-controller';
import {ResultTemplateProvider} from '@/src/components/common/item-list/result-template-provider';
import {extractUnfoldedItem} from '@/src/components/common/item-list/unfolded-item';
import type {ItemDisplayImageSize} from '@/src/components/common/layout/item-layout-utils';
import {renderChildrenWrapper} from '@/src/components/common/result-children/children-wrapper';
import {renderCollectionGuard} from '@/src/components/common/result-children/collection-guard';
import {renderResultChildrenGuard} from '@/src/components/common/result-children/guard';
import {renderShowHideButton} from '@/src/components/common/result-children/show-hide-button';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {elementHasAncestorTag} from '@/src/utils/utils';
import '@/src/components/search/atomic-result/atomic-result';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';

const childTemplateComponent = 'atomic-result-children-template';
const componentTag = 'atomic-result-children';

/**
 * The `atomic-result-children` component is responsible for displaying child results by applying one or more child result templates.
 * Includes two slots, "before-children" and "after-children", which allow for rendering content before and after the list of children,
 * only when children exist.
 * @part children-root - The wrapper for the message when there are child results
 * @part no-result-root - The wrapper for the message when there are no results.
 * @part show-hide-button - The button that allows to collapse or show all child results.
 * @slot before-children - Slot that allows rendering content before the list of children, only when children exist.
 * @slot after-children - Slot that allows rendering content after the list of children, only when children exist.
 */
@customElement('atomic-result-children')
@withTailwindStyles
@bindings()
export class AtomicResultChildren
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles = css`
@reference '../../../utils/tailwind-utilities/set-font-size.css';

.show-hide-button {
  @apply set-font-size-sm;
}

.no-result-root {
  @apply text-neutral-dark;
}
  `;

  /**
   * Whether to inherit templates defined in a parent atomic-result-children. Only works for the second level of child nesting.
   */
  @property({type: Boolean, attribute: 'inherit-templates'})
  inheritTemplates = false;

  /**
   * The expected size of the image displayed in the children results.
   */
  @property({reflect: true, attribute: 'image-size'})
  imageSize?: ItemDisplayImageSize;

  /**
   * The non-localized copy for an empty result state. An empty string will result in the component being hidden.
   */
  @property({attribute: 'no-result-text'})
  noResultText = 'no-documents-related';

  @state() public bindings!: Bindings;
  @state() public error!: Error;
  @state() private resultTemplateRegistered = false;
  @state() private templateHasError = false;
  @state() private showInitialChildren = true;
  @state() private loadedFullCollection = false;
  @state() private foldedResultListState!: FoldedResultListState;

  private foldedItemListContextController!: FoldedItemListContextController<FoldedResultList>;
  private childTemplatesContextController!: ChildTemplatesContextController;
  private displayConfigContextController!: ItemDisplayConfigContextController;
  private resultContextController!: ReturnType<
    typeof createResultContextController
  >;
  private itemTemplateProvider?: ResultTemplateProvider;
  private initialChildren!: FoldedResult[];
  private foldedResultListUnsubscriber?: () => void;

  constructor() {
    super();
    this.foldedItemListContextController = new FoldedItemListContextController(
      this
    );
    this.childTemplatesContextController = new ChildTemplatesContextController(
      this
    );
    this.displayConfigContextController =
      new ItemDisplayConfigContextController(this);
    this.resultContextController = createResultContextController(this, {
      folded: true,
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'atomic/resolveChildTemplates',
      this.resolveChildTemplates as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'atomic/resolveChildTemplates',
      this.resolveChildTemplates as EventListener
    );
    this.foldedResultListUnsubscriber?.();
  }

  public initialize() {
    if (this.inheritTemplates) {
      return;
    }

    const childrenTemplates = Array.from(
      this.querySelectorAll(childTemplateComponent)
    ).filter(
      (template) => !elementHasAncestorTag(template, childTemplateComponent)
    );

    if (!childrenTemplates.length) {
      this.error = new Error(
        `The "${componentTag}" component requires at least one "${childTemplateComponent}" component.`
      );
      return;
    }

    this.itemTemplateProvider = new ResultTemplateProvider({
      includeDefaultTemplate: false,
      templateElements: childrenTemplates,
      getResultTemplateRegistered: () => this.resultTemplateRegistered,
      getTemplateHasError: () => this.templateHasError,
      setResultTemplateRegistered: (value: boolean) => {
        this.resultTemplateRegistered = value;
      },
      setTemplateHasError: (value: boolean) => {
        this.templateHasError = value;
      },
      bindings: this.bindings,
    });
  }

  private resolveChildTemplates = (event: ChildTemplatesContextEvent) => {
    event.preventDefault();
    const provider =
      this.itemTemplateProvider ||
      this.childTemplatesContextController.itemTemplateProvider;
    event.detail(provider ?? undefined);
  };

  private get foldedResultList(): FoldedResultList | null {
    return this.foldedItemListContextController.foldedItemList;
  }

  private get result(): FoldedResult | null {
    return this.resultContextController.item as FoldedResult | null;
  }

  private get displayConfig(): DisplayConfig | null {
    return this.displayConfigContextController.config;
  }

  private get effectiveItemTemplateProvider(): ResultTemplateProvider | null {
    return (
      this.itemTemplateProvider ||
      this.childTemplatesContextController.itemTemplateProvider
    );
  }

  private get collection() {
    if (!this.foldedResultListState || !this.result) {
      return undefined;
    }
    return this.foldedResultListState.results.find((r) => {
      return r.result.uniqueId === this.result?.result.uniqueId;
    });
  }

  willUpdate() {
    if (this.foldedResultList && !this.foldedResultListUnsubscriber) {
      this.foldedResultListUnsubscriber = this.foldedResultList.subscribe(
        () => {
          this.foldedResultListState = this.foldedResultList!.state;
          if (!this.initialChildren && this.collection) {
            this.initialChildren = this.collection.children;
          }
        }
      );
      this.foldedResultListState = this.foldedResultList.state;
    }

    if (!this.initialChildren && this.collection) {
      this.initialChildren = this.collection.children;
    }
  }

  private loadFullCollection() {
    this.loadedFullCollection = true;
    this.dispatchEvent(
      buildCustomEvent('atomic/loadCollection', this.collection)
    );
  }

  private toggleShowInitialChildren = () => {
    if (!this.foldedResultList || !this.result) {
      return;
    }

    if (this.showInitialChildren) {
      this.foldedResultList.logShowMoreFoldedResults(this.result.result);
    } else {
      this.foldedResultList.logShowLessFoldedResults();
    }

    this.showInitialChildren = !this.showInitialChildren;
  };

  private renderChild(child: FoldedResult, isLast: boolean) {
    const content = this.effectiveItemTemplateProvider?.getTemplateContent(
      child.result
    );

    if (!content) {
      return nothing;
    }

    const key =
      child.result.uniqueId +
      child.children.map((c) => c.result.uniqueId).join(',');

    return html`<atomic-result
      .key=${key}
      .content=${content}
      .result=${child}
      .interactiveResult=${buildInteractiveResult(this.bindings.engine, {
        options: {result: extractUnfoldedItem(child)},
      })}
      .store=${this.bindings.store}
      density=${this.displayConfig?.density ?? 'normal'}
      image-size=${this.imageSize || this.displayConfig?.imageSize || 'icon'}
      classes=${`child-result ${isLast ? 'last-child' : ''}`.trim()}
    ></atomic-result>`;
  }

  private renderChildren(children: FoldedResult[]) {
    if (children.length === 0) {
      return nothing;
    }

    return renderChildrenWrapper()(
      html`${map(children, (child, i) =>
        this.renderChild(child, i === children.length - 1)
      )}`
    );
  }

  private renderCollection() {
    const collection = this.collection!;

    const children = this.showInitialChildren
      ? this.initialChildren
      : collection.children;

    const showShouldButtons =
      this.loadedFullCollection || collection.moreResultsAvailable;

    const showHideButton = showShouldButtons
      ? renderShowHideButton({
          props: {
            moreResultsAvailable: collection.moreResultsAvailable,
            loadFullCollection: () => this.loadFullCollection(),
            showInitialChildren: this.showInitialChildren,
            toggleShowInitialChildren: this.toggleShowInitialChildren,
            loadAllResults: this.bindings.i18n.t('load-all-results'),
            collapseResults: this.bindings.i18n.t('collapse-results'),
          },
        })
      : nothing;

    const guard = renderCollectionGuard({
      props: {
        isLoadingMoreResults: collection.isLoadingMoreResults,
        moreResultsAvailable: collection.moreResultsAvailable,
        numberOfChildren: collection.children.length,
        density: this.displayConfig?.density ?? 'normal',
        imageSize: this.imageSize || this.displayConfig?.imageSize || 'icon',
        noResultText: this.bindings.i18n.t(this.noResultText),
      },
    });

    return html`${showHideButton}${guard(this.renderChildren(children))}`;
  }

  private renderFoldedResult() {
    if (!this.result || this.result.children.length === 0) {
      return nothing;
    }

    return this.renderChildren(this.result.children);
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`${when(
      this.bindings && (this.displayConfig || this.inheritTemplates),
      () =>
        renderResultChildrenGuard({
          props: {
            inheritTemplates: this.inheritTemplates,
            resultTemplateRegistered: this.resultTemplateRegistered,
            templateHasError: this.templateHasError,
          },
        })(
          this.collection ? this.renderCollection() : this.renderFoldedResult()
        )
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-children': AtomicResultChildren;
  }
}
