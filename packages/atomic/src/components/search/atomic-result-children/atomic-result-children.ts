import type {
  FoldedResult,
  FoldedResultList,
  FoldedResultListState,
} from '@coveo/headless';
import {buildInteractiveResult} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {ResultTemplateProvider} from '@/src/components/common/item-list/result-template-provider';
import type {
  ChildTemplatesContextEvent,
  DisplayConfig,
} from '@/src/components/common/item-list/stencil-item-decorators';
import {extractUnfoldedItem} from '@/src/components/common/item-list/unfolded-item';
import type {ItemDisplayImageSize} from '@/src/components/common/layout/display-options';
import {renderChildrenWrapper} from '@/src/components/common/result-children/children-wrapper';
import {renderCollectionGuard} from '@/src/components/common/result-children/collection-guard';
import {renderResultChildrenGuard} from '@/src/components/common/result-children/guard';
import {renderShowHideButton} from '@/src/components/common/result-children/show-hide-button';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {elementHasAncestorTag} from '@/src/utils/utils';
import '../atomic-result/atomic-result';

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
  @property({type: String, reflect: true, attribute: 'image-size'})
  imageSize?: ItemDisplayImageSize;

  /**
   * The non-localized copy for an empty result state. An empty string will result in the component being hidden.
   */
  @property({type: String, attribute: 'no-result-text'})
  public noResultText = 'no-documents-related';

  @state() public bindings!: Bindings;
  @state() public error!: Error;
  @state() private resultTemplateRegistered = false;
  @state() private templateHasError = false;
  @state() private foldedResultListState!: FoldedResultListState;
  @state() private showInitialChildren = false;
  @state() private loadedFullCollection = false;

  public itemTemplateProvider?: ResultTemplateProvider;
  private foldedResultList!: FoldedResultList;
  private result!: FoldedResult;
  private displayConfig!: DisplayConfig;
  private initialChildren!: FoldedResult[];

  static styles: CSSResultGroup = css`
    @import "../../../../common/result-children/result-children.pcss";
  `;

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener(
      'atomic/resolveChildTemplates',
      this.resolveChildTemplates as EventListener
    );
    this.addEventListener(
      'atomic/resolveResult',
      this.resolveResult as EventListener
    );
    this.addEventListener(
      'atomic/resolveFoldedResultList',
      this.resolveFoldedResultList as EventListener
    );
    this.addEventListener(
      'atomic/resolveResultDisplayConfig',
      this.resolveResultDisplayConfig as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener(
      'atomic/resolveChildTemplates',
      this.resolveChildTemplates as EventListener
    );
    this.removeEventListener(
      'atomic/resolveResult',
      this.resolveResult as EventListener
    );
    this.removeEventListener(
      'atomic/resolveFoldedResultList',
      this.resolveFoldedResultList as EventListener
    );
    this.removeEventListener(
      'atomic/resolveResultDisplayConfig',
      this.resolveResultDisplayConfig as EventListener
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

  public resolveChildTemplates(event: ChildTemplatesContextEvent) {
    event.preventDefault();
    event.detail(this.itemTemplateProvider);
  }

  private resolveResult = (event: CustomEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail as (result: FoldedResult) => void) {
      (event.detail as (result: FoldedResult) => void)(this.result);
    }
  };

  private resolveFoldedResultList = (event: CustomEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const detailHandler = event.detail as
      | ((foldedItemList: {
          subscribe: (callback: () => void) => unknown;
          state: FoldedResultListState;
        }) => void)
      | ((foldedItemList: FoldedResultList) => void);

    if (typeof detailHandler === 'function') {
      // Check if this is a state context event (has subscribe method)
      if (this.foldedResultList && 'subscribe' in this.foldedResultList) {
        detailHandler({
          subscribe: (callback: () => void) => {
            return this.foldedResultList.subscribe(() => {
              this.foldedResultListState = this.foldedResultList.state;
              callback();
            });
          },
          state: this.foldedResultList.state,
        });
      } else {
        detailHandler(this.foldedResultList);
      }
    }
  };

  private resolveResultDisplayConfig = (event: CustomEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail) {
      (event.detail as (config: DisplayConfig) => void)(this.displayConfig);
    }
  };

  willUpdate() {
    if (!this.result) {
      const resultEvent = buildCustomEvent(
        'atomic/resolveResult',
        (result: FoldedResult) => {
          this.result = result;
        }
      );
      this.dispatchEvent(resultEvent);
    }

    if (!this.foldedResultList) {
      const foldedListEvent = buildCustomEvent(
        'atomic/resolveFoldedResultList',
        (foldedItemList: FoldedResultList) => {
          this.foldedResultList = foldedItemList;
          if (foldedItemList && 'subscribe' in foldedItemList) {
            foldedItemList.subscribe(() => {
              this.foldedResultListState = foldedItemList.state;
              this.requestUpdate();
            });
          }
        }
      );
      this.dispatchEvent(foldedListEvent);
    }

    if (!this.displayConfig) {
      const displayConfigEvent = buildCustomEvent(
        'atomic/resolveResultDisplayConfig',
        (config: DisplayConfig) => {
          this.displayConfig = config;
        }
      );
      this.dispatchEvent(displayConfigEvent);
    }

    if (!this.initialChildren && this.collection) {
      this.initialChildren = this.collection.children;
    }
  }

  private get collection() {
    if (!this.foldedResultListState || !this.result) {
      return undefined;
    }
    return this.foldedResultListState.results.find((r) => {
      return r.result.uniqueId === this.result.result.uniqueId;
    });
  }

  private loadFullCollection() {
    this.loadedFullCollection = true;
    this.dispatchEvent(
      buildCustomEvent('atomic/loadCollection', this.collection)
    );
  }

  private toggleShowInitialChildren = () => {
    if (this.showInitialChildren) {
      this.foldedResultList.logShowMoreFoldedResults(this.result.result);
    } else {
      this.foldedResultList.logShowLessFoldedResults();
    }

    this.showInitialChildren = !this.showInitialChildren;
  };

  private renderChild(child: FoldedResult, isLast: boolean) {
    const content = this.itemTemplateProvider?.getTemplateContent(child.result);

    if (!content) {
      return nothing;
    }

    const key =
      child.result.uniqueId +
      child.children.map((child) => child.result.uniqueId).join('-');

    return html`
      <atomic-result
        key=${key}
        .content=${content}
        .result=${child}
        .interactiveResult=${buildInteractiveResult(this.bindings.engine, {
          options: {result: extractUnfoldedItem(child)},
        })}
        .store=${this.bindings.store}
        .density=${this.displayConfig.density}
        .imageSize=${this.imageSize || this.displayConfig.imageSize}
        .classes=${`child-result ${isLast ? 'last-child' : ''}`.trim()}
      ></atomic-result>
    `;
  }

  private renderCollection() {
    const collection = this.collection!;

    const children = this.showInitialChildren
      ? this.initialChildren
      : collection.children;

    const showShouldButtons =
      this.loadedFullCollection || collection.moreResultsAvailable;

    return html`
      ${when(showShouldButtons, () =>
        renderShowHideButton({
          props: {
            moreResultsAvailable: collection.moreResultsAvailable,
            loadFullCollection: () => this.loadFullCollection(),
            showInitialChildren: this.showInitialChildren,
            toggleShowInitialChildren: this.toggleShowInitialChildren,
            loadAllResults: this.bindings.i18n.t('load-all-results'),
            collapseResults: this.bindings.i18n.t('collapse-results'),
          },
        })
      )}
      ${renderCollectionGuard({
        props: {
          isLoadingMoreResults: collection.isLoadingMoreResults,
          moreResultsAvailable: collection.moreResultsAvailable,
          numberOfChildren: collection.children.length,
          density: this.displayConfig.density,
          imageSize: this.imageSize || this.displayConfig.imageSize,
          noResultText: this.bindings.i18n.t(this.noResultText),
        },
      })(
        renderChildrenWrapper()(
          html`${children.map((child, i) =>
            this.renderChild(child, i === children.length - 1)
          )}`
        )
      )}
    `;
  }

  private renderFoldedResult() {
    if (!this.result || this.result.children.length === 0) {
      return nothing;
    }

    const children = this.result.children;

    return renderChildrenWrapper()(
      html`${children.map((child, i) =>
        this.renderChild(child, i === children.length - 1)
      )}`
    );
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${renderResultChildrenGuard({
      props: {
        inheritTemplates: this.inheritTemplates,
        resultTemplateRegistered: this.resultTemplateRegistered,
        templateHasError: this.templateHasError,
      },
    })(
      html`${when(
        this.collection,
        () => this.renderCollection(),
        () => this.renderFoldedResult()
      )}`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-children': AtomicResultChildren;
  }
}
