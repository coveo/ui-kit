import {ArrayValue, NumberValue, Schema, StringValue} from '@coveo/bueno';
import {
  buildFoldedResultList,
  buildInteractiveResult,
  buildResultsPerPage,
  buildTabManager,
  type FoldedCollection,
  type FoldedResultList,
  type FoldedResultListState,
  type ResultListProps,
  type ResultsPerPage,
  type ResultsPerPageState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {renderItemPlaceholders} from '@/src/components/common/atomic-result-placeholder/item-placeholders';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {renderDisplayWrapper} from '@/src/components/common/item-list/display-wrapper';
import {renderItemList} from '@/src/components/common/item-list/item-list';
import {
  ItemListCommon,
  type ItemRenderingFunction,
} from '@/src/components/common/item-list/item-list-common';
import {ResultTemplateProvider} from '@/src/components/common/item-list/result-template-provider';
import listDisplayStyles from '@/src/components/common/item-list/styles/list-display.tw.css';
import placeholderStyles from '@/src/components/common/item-list/styles/placeholders.tw.css';
import {extractUnfoldedItem} from '@/src/components/common/item-list/unfolded-item';
import {
  getItemListDisplayClasses,
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
  type ItemDisplayLayout,
} from '@/src/components/common/layout/item-layout-utils';
import {renderTabWrapper} from '@/src/components/common/tabs/tab-wrapper';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {arrayConverter} from '@/src/converters/array-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {randomID} from '@/src/utils/utils';
import '@/src/components/search/atomic-result/atomic-result';
import '@/src/components/search/atomic-result-template/atomic-result-template';
import type {FoldedItemListContextEvent} from '@/src/components/common/item-list/context/folded-item-list-context-controller';

/**
 * The `atomic-folded-result-list` component is responsible for displaying folded query results, by applying one or more result templates for up to three layers (that is, to the result, child, and grandchild).
 *
 * @slot default - The default slot where the result templates are inserted.
 * @part result-list - The element containing every result of a result list
 * @part outline - The element displaying an outline or a divider around a result
 */
@customElement('atomic-folded-result-list')
@bindings()
@withTailwindStyles
export class AtomicFoldedResultList
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup = [placeholderStyles, listDisplayStyles];

  public foldedResultList!: FoldedResultList;
  public resultsPerPage!: ResultsPerPage;
  public tabManager!: TabManager;

  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstResultLoaded-');
  private nextNewResultTarget?: FocusTargetController;
  private resultListCommon!: ItemListCommon;
  private resultTemplateProvider!: ResultTemplateProvider;
  private readonly display: ItemDisplayLayout = 'list';

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @property({reflect: true, type: String})
  public density: ItemDisplayDensity = 'normal';

  /**
   * The expected size of the image displayed in the results.
   */
  @property({reflect: true, attribute: 'image-size', type: String})
  public imageSize: ItemDisplayImageSize = 'icon';

  /**
   * The tabs on which the folded result list can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-folded-result-list tabs-included='["tabIDA", "tabIDB"]'></atomic-folded-result-list>
   * ```
   * If you don't set this property, the folded result list can be displayed on any tab. Otherwise, the folded result list can only be displayed on the specified tabs.
   */
  @property({
    attribute: 'tabs-included',
    converter: arrayConverter,
    type: Array,
  })
  public tabsIncluded: string[] = [];

  /**
   * The tabs on which this folded result list must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-folded-result-list tabs-excluded='["tabIDA", "tabIDB"]'></atomic-folded-result-list>
   * ```
   * If you don't set this property, the folded result list can be displayed on any tab. Otherwise, the folded result list won't be displayed on any of the specified tabs.
   */
  @property({
    attribute: 'tabs-excluded',
    converter: arrayConverter,
    type: Array,
  })
  public tabsExcluded: string[] = [];

  /**
   * The name of the field on which to do the folding. The folded result list component will use the values of this field to resolve the collections of result items.
   *
   * @defaultValue `foldingcollection`
   */
  @property({reflect: true, attribute: 'collection-field', type: String})
  public collectionField?: string;

  /**
   * The name of the field that determines whether a certain result is a top result containing other child results within a collection.
   *
   * @defaultValue `foldingparent`
   */
  @property({reflect: true, attribute: 'parent-field', type: String})
  public parentField?: string;

  /**
   * The name of the field that uniquely identifies a result within a collection.
   *
   * @defaultValue `foldingchild`
   */
  @property({reflect: true, attribute: 'child-field', type: String})
  public childField?: string;

  /**
   * The initial number of child results to request for each folded collection, before expansion.
   *
   * @defaultValue `2`
   *
   * @example For an email thread with a total of 20 messages, using the default value of `2` will request the top two child messages, based on the current sort criteria and query, to be returned as children of the parent message.
   * The user can then click to expand the collection and see the remaining messages that match the current query (that is, not necessarily all remaining 18 messages). Those messages will be sorted based on the current sort criteria (that is, not necessarily by date).
   * For more info on Result Folding, see [Result Folding](https://docs.coveo.com/en/1884).
   */
  @property({
    reflect: true,
    attribute: 'number-of-folded-results',
    type: Number,
  })
  public numberOfFoldedResults = 2;

  @state()
  bindings!: Bindings;
  @state()
  error!: Error;
  @state()
  private isAppLoaded = false;
  @state()
  private isEveryResultReady = false;
  @state()
  private resultTemplateRegistered = false;
  @state()
  private templateHasError = false;

  @bindStateToController('foldedResultList')
  @state()
  private foldedResultListState!: FoldedResultListState;

  @bindStateToController('resultsPerPage')
  @state()
  private resultsPerPageState!: ResultsPerPageState;

  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        density: this.density,
        imageSize: this.imageSize,
        tabsIncluded: this.tabsIncluded,
        tabsExcluded: this.tabsExcluded,
        numberOfFoldedResults: this.numberOfFoldedResults,
      }),
      new Schema({
        density: new StringValue({
          constrainTo: ['normal', 'comfortable', 'compact'],
        }),
        imageSize: new StringValue({
          constrainTo: ['small', 'large', 'icon', 'none'],
        }),
        tabsIncluded: new ArrayValue({
          each: new StringValue({}),
        }),
        tabsExcluded: new ArrayValue({
          each: new StringValue({}),
        }),
        numberOfFoldedResults: new NumberValue({min: 0}),
      })
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'atomic/resolveFoldedResultList',
      this.handleResolveFoldedResultList as EventListener
    );
    this.removeEventListener(
      'atomic/loadCollection',
      this.handleLoadCollection as EventListener
    );
  }

  public initialize() {
    this.foldedResultList = this.initFolding();
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);

    this.initResultTemplateProvider();
    this.initResultListCommon();

    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });

    this.addEventListener(
      'atomic/resolveFoldedResultList',
      this.handleResolveFoldedResultList as EventListener
    );
    this.addEventListener(
      'atomic/loadCollection',
      this.handleLoadCollection as EventListener
    );
  }

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax such as React, Angular, or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   */
  public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = resultRenderingFunction;
  }

  willUpdate(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has('tabManagerState')) {
      const oldState = changedProperties.get(
        'tabManagerState'
      ) as TabManagerState;
      if (this.tabManagerState?.activeTab !== oldState?.activeTab) {
        this.bindings.store.unsetLoadingFlag(this.loadingFlag);
      }
    }

    if (changedProperties.has('foldedResultListState')) {
      const oldState = changedProperties.get(
        'foldedResultListState'
      ) as FoldedResultListState;
      if (this.foldedResultListState.firstSearchExecuted) {
        this.bindings.store.unsetLoadingFlag(this.loadingFlag);
      }
      if (!oldState?.isLoading && this.foldedResultListState.isLoading) {
        this.isEveryResultReady = false;
      }
    }

    this.updateResultReadyState();
  }

  private async updateResultReadyState() {
    if (
      this.isAppLoaded &&
      !this.isEveryResultReady &&
      this.foldedResultListState?.firstSearchExecuted &&
      this.foldedResultListState?.results?.length > 0
    ) {
      await this.getUpdateComplete();
      this.isEveryResultReady = true;
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${renderTabWrapper({
      props: {
        tabsIncluded: this.tabsIncluded,
        tabsExcluded: this.tabsExcluded,
        activeTab: this.tabManagerState?.activeTab,
      },
    })(
      renderItemList({
        props: {
          hasError: this.foldedResultListState.hasError,
          hasItems: this.foldedResultListState.hasResults,
          hasTemplate: this.resultTemplateRegistered,
          firstRequestExecuted: this.foldedResultListState.firstSearchExecuted,
          templateHasError: this.templateHasError,
        },
      })(
        html`${when(
          this.templateHasError,
          () => html`<slot></slot>`,
          () => {
            const listClasses = this.computeListDisplayClasses();
            const resultClasses = `${listClasses} ${!this.isEveryResultReady && 'hidden'}`;

            return html`
              ${when(this.isAppLoaded, () =>
                renderDisplayWrapper({
                  props: {
                    listClasses: resultClasses,
                    display: this.display,
                  },
                })(html`${this.renderList()}`)
              )}
              ${when(!this.isEveryResultReady, () =>
                renderDisplayWrapper({
                  props: {listClasses, display: this.display},
                })(
                  renderItemPlaceholders({
                    props: {
                      density: this.density,
                      display: this.display,
                      imageSize: this.imageSize,
                      numberOfPlaceholders:
                        this.resultsPerPageState.numberOfResults || 10,
                    },
                  })
                )
              )}
            `;
          }
        )}`
      )
    )}`;
  }

  private handleResolveFoldedResultList = (
    event: FoldedItemListContextEvent<FoldedResultList>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.foldedResultList);
  };

  private handleLoadCollection = (event: CustomEvent<FoldedCollection>) => {
    event.preventDefault();
    event.stopPropagation();
    this.foldedResultList.loadCollection(event.detail);
  };

  private initFolding(
    props: ResultListProps = {options: {}}
  ): FoldedResultList {
    return buildFoldedResultList(this.bindings.engine, {
      options: {
        ...props.options,
        folding: {
          collectionField: this.collectionField,
          parentField: this.parentField,
          childField: this.childField,
          numberOfFoldedResults: this.numberOfFoldedResults,
        },
      },
    });
  }

  private initResultTemplateProvider() {
    this.resultTemplateProvider = new ResultTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.querySelectorAll('atomic-result-template')
      ),
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

  private initResultListCommon() {
    this.resultListCommon = new ItemListCommon({
      engineSubscribe: this.bindings.engine.subscribe,
      getCurrentNumberOfItems: () => this.foldedResultListState.results.length,
      getIsLoading: () => this.foldedResultListState.isLoading,
      host: this,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !(this.isAppLoaded && this.isEveryResultReady);

    return getItemListDisplayClasses(
      this.display,
      this.density,
      this.imageSize,
      this.foldedResultListState?.isLoading,
      displayPlaceholders
    );
  }

  private renderList() {
    return html`${map(
      this.foldedResultListState.results,
      (collection, index) => {
        return html`${keyed(
          this.getResultId(collection),
          html`<atomic-result
            part="outline"
            ${ref(
              (element) =>
                element instanceof HTMLElement &&
                this.resultListCommon.setNewResultRef(element, index)
            )}
            .content=${this.getContent(collection)}
            .density=${this.density}
            .display=${this.display}
            .imageSize=${this.imageSize}
            .interactiveResult=${this.getInteractiveResult(collection)}
            .loadingFlag=${this.loadingFlag}
            .result=${collection}
            .renderingFunction=${this.itemRenderingFunction}
            .store=${this.bindings.store as never}
          ></atomic-result>`
        )}`;
      }
    )}`;
  }

  private get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this, this.bindings);
    }
    return this.nextNewResultTarget;
  }

  private getContent(collection: FoldedCollection) {
    const result = extractUnfoldedItem(collection);
    return this.resultTemplateProvider.getTemplateContent(result);
  }

  private getInteractiveResult(collection: FoldedCollection) {
    const result = extractUnfoldedItem(collection);
    return buildInteractiveResult(this.bindings.engine, {
      options: {result},
    });
  }

  private getResultId(collection: FoldedCollection) {
    const result = extractUnfoldedItem(collection);
    return this.resultListCommon.getResultId(
      result.uniqueId,
      this.foldedResultListState.searchResponseId,
      this.density,
      this.imageSize
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-folded-result-list': AtomicFoldedResultList;
  }
}
