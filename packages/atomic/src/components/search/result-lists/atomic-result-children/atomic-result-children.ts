import {buildInteractiveResult, type FoldedResult} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ChildTemplatesContextController} from '@/src/components/common/item-list/context/child-templates-context-controller';
import {FoldedItemListContextController} from '@/src/components/common/item-list/context/folded-item-list-context-controller';
import {ItemDisplayConfigContextController} from '@/src/components/common/item-list/context/item-display-config-context-controller';
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
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {elementHasAncestorTag} from '@/src/utils/utils';
import '@/src/components/search/result-lists/atomic-result/atomic-result';

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
@bindings()
@withTailwindStyles
export class AtomicResultChildren
  extends LitElement
  implements InitializableComponent<Bindings>
{
  /**
   * Whether to inherit templates defined in a parent atomic-result-children. Only works for the second level of child nesting.
   */
  @property({type: Boolean, attribute: 'inherit-templates'})
  inheritTemplates = false;

  /**
   * The expected size of the image displayed in the children results.
   */
  @property({type: String, attribute: 'image-size', reflect: true})
  imageSize?: ItemDisplayImageSize;

  /**
   * The non-localized copy for an empty result state. An empty string will result in the component being hidden.
   */
  @property({type: String, attribute: 'no-result-text'})
  noResultText = 'no-documents-related';

  @state() public bindings!: Bindings;
  @state() public error!: Error;
  @state() private resultTemplateRegistered = false;
  @state() private templateHasError = false;
  @state() private showInitialChildren = true;
  @state() private loadedFullCollection = false;
  @state() private initialChildren: FoldedResult[] = [];

  private resultContext = createResultContextController(this, {folded: true});
  private childTemplatesContext = new ChildTemplatesContextController(this);
  private displayConfigContext = new ItemDisplayConfigContextController(this);
  private foldedItemListContext = new FoldedItemListContextController(this);
  private itemTemplateProvider?: ResultTemplateProvider;

  private get result(): FoldedResult {
    return this.resultContext.item as FoldedResult;
  }

  private get collection() {
    const state = this.foldedItemListContext.state;
    if (!state) {
      return null;
    }
    return state.results.find((r) => {
      return r.result.uniqueId === this.result.result.uniqueId;
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'atomic/resolveChildTemplates',
      this.handleResolveChildTemplates as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'atomic/resolveChildTemplates',
      this.handleResolveChildTemplates as EventListener
    );
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

  willUpdate() {
    if (!this.initialChildren.length && this.collection) {
      this.initialChildren = this.collection.children;
    }
  }

  @errorGuard()
  render() {
    return renderResultChildrenGuard({
      props: {
        inheritTemplates: this.inheritTemplates,
        resultTemplateRegistered: this.resultTemplateRegistered,
        templateHasError: this.templateHasError,
      },
    })(
      html`${this.collection ? this.renderCollection() : this.renderFoldedResult()}`
    );
  }

  private handleResolveChildTemplates(event: CustomEvent) {
    event.preventDefault();
    const provider = this.inheritTemplates
      ? this.childTemplatesContext.itemTemplateProvider
      : this.itemTemplateProvider;
    event.detail(provider);
  }

  private renderChild(child: FoldedResult, isLast: boolean) {
    const provider = this.inheritTemplates
      ? this.childTemplatesContext.itemTemplateProvider
      : this.itemTemplateProvider;

    const content = provider?.getTemplateContent(child.result);

    if (!content) {
      return nothing;
    }

    const key =
      child.result.uniqueId +
      child.children.map((child) => child.result.uniqueId);

    const displayConfig = this.displayConfigContext.config;
    if (!displayConfig) {
      return nothing;
    }

    return html`<atomic-result
      key=${key}
      .content=${content}
      .result=${child}
      .interactiveResult=${buildInteractiveResult(this.bindings.engine, {
        options: {result: extractUnfoldedItem(child)},
      })}
      .store=${this.bindings.store}
      .density=${displayConfig.density}
      .imageSize=${this.imageSize || displayConfig.imageSize}
      .classes=${`child-result ${isLast ? 'last-child' : ''}`.trim()}
    ></atomic-result>`;
  }

  private loadFullCollection() {
    this.loadedFullCollection = true;
    this.dispatchEvent(
      buildCustomEvent('atomic/loadCollection', this.collection)
    );
  }

  private toggleShowInitialChildren = () => {
    const foldedList = this.foldedItemListContext.foldedItemList;
    if (!foldedList) {
      return;
    }

    if (this.showInitialChildren) {
      foldedList.logShowMoreFoldedResults(this.result.result);
    } else {
      foldedList.logShowLessFoldedResults();
    }

    this.showInitialChildren = !this.showInitialChildren;
  };

  private renderCollection() {
    const collection = this.collection!;

    const children = this.showInitialChildren
      ? this.initialChildren
      : collection.children;

    const showShouldButtons =
      this.loadedFullCollection || collection.moreResultsAvailable;

    const displayConfig = this.displayConfigContext.config;
    if (!displayConfig) {
      return nothing;
    }

    return html`
      ${
        showShouldButtons
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
          : nothing
      }
      ${renderCollectionGuard({
        props: {
          isLoadingMoreResults: collection.isLoadingMoreResults,
          moreResultsAvailable: collection.moreResultsAvailable,
          numberOfChildren: collection.children.length,
          density: displayConfig.density,
          imageSize: this.imageSize || displayConfig.imageSize,
          noResultText: this.bindings.i18n.t(this.noResultText),
        },
      })(
        renderChildrenWrapper()(
          html`${children.map((child, i) => this.renderChild(child, i === children.length - 1))}`
        )
      )}
    `;
  }

  private renderFoldedResult() {
    if (this.result.children.length === 0) {
      return nothing;
    }

    const children = this.result.children;

    return renderChildrenWrapper()(
      html`${children.map((child, i) => this.renderChild(child, i === children.length - 1))}`
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-children': AtomicResultChildren;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-children': AtomicResultChildren;
  }
}
