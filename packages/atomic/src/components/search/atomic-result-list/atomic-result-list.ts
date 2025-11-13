import {ArrayValue, Schema, StringValue} from '@coveo/bueno';
import {
  buildInteractiveResult,
  buildResultList,
  buildResultsPerPage,
  buildTabManager,
  type Result,
  type ResultList,
  type ResultListState,
  type ResultsPerPage,
  type ResultsPerPageState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {type CSSResultGroup, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {renderItemPlaceholders} from '@/src/components/common/atomic-result-placeholder/item-placeholders';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {renderDisplayWrapper} from '@/src/components/common/item-list/display-wrapper';
import {renderGridLayout} from '@/src/components/common/item-list/grid-layout';
import {renderItemList} from '@/src/components/common/item-list/item-list';
import {
  ItemListCommon,
  type ItemRenderingFunction,
} from '@/src/components/common/item-list/item-list-common';
import {ResultTemplateProvider} from '@/src/components/common/item-list/result-template-provider';
import gridDisplayStyles from '@/src/components/common/item-list/styles/grid-display.tw.css';
import listDisplayStyles from '@/src/components/common/item-list/styles/list-display.tw.css';
import placeholderStyles from '@/src/components/common/item-list/styles/placeholders.tw.css';
import tableDisplayStyles from '@/src/components/common/item-list/styles/table-display.tw.css';
import {
  renderTableData,
  renderTableLayout,
  renderTableRow,
} from '@/src/components/common/item-list/table-layout';

import {renderTabWrapper} from '@/src/components/common/tabs/tab-wrapper';
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
import '../atomic-result/atomic-result';
import {
  getItemListDisplayClasses,
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
  type ItemDisplayLayout,
} from '@/src/components/common/layout/item-layout-utils';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import '@/src/components/search/atomic-result-template/atomic-result-template';

/**
 * The `atomic-result-list` component is responsible for displaying query results by applying one or more result templates.
 *
 * @slot default - The default slot where the result templates are inserted.
 * @part result-list - The element containing every result of a result list
 * @part outline - The element displaying an outline or a divider around a result
 * @part result-list-grid-clickable-container - The parent of the result and the clickable link encompassing it, when results are displayed as a grid
 * @part result-list-grid-clickable - The clickable link encompassing the result when results are displayed as a grid
 * @part result-table - The element of the result table containing a heading and a body
 * @part result-table-heading - The element containing the row of cells in the result table's heading
 * @part result-table-heading-row - The element containing cells of the result table's heading
 * @part result-table-heading-cell - The element representing a cell of the result table's heading
 * @part result-table-body - The element containing the rows of the result table's body
 * @part result-table-row - The element containing the cells of a row in the result table's body
 * @part result-table-row-odd - The element containing the cells of an odd row in the result table's body
 * @part result-table-row-even - The element containing the cells of an even row in the result table's body
 * @part result-table-cell - The element representing a cell of the result table's body
 */
@customElement('atomic-result-list')
@bindings()
@withTailwindStyles
export class AtomicResultList
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup = [
    placeholderStyles,
    tableDisplayStyles,
    listDisplayStyles,
    gridDisplayStyles,
  ];

  public resultList!: ResultList;
  public resultsPerPage!: ResultsPerPage;
  public tabManager!: TabManager;

  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstResultLoaded-');
  private nextNewResultTarget?: FocusTargetController;
  private resultListCommon!: ItemListCommon;
  private resultTemplateProvider!: ResultTemplateProvider;

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

  @bindStateToController('resultList')
  @state()
  private resultListState!: ResultListState;

  @bindStateToController('resultsPerPage')
  @state()
  private resultsPerPageState!: ResultsPerPageState;

  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @property({reflect: true, type: String})
  public density: ItemDisplayDensity = 'normal';
  /**
   * The desired layout to use when displaying results. Layouts affect how many results to display per row and how visually distinct they are from each other.
   */
  @property({reflect: true, type: String})
  public display: ItemDisplayLayout = 'list';

  /**
   * The expected size of the image displayed in the results.
   */
  @property({reflect: true, attribute: 'image-size', type: String})
  public imageSize: ItemDisplayImageSize = 'icon';

  /**
   * The tabs on which the result list can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-result-list tabs-included='["tabIDA", "tabIDB"]'></atomic-result-list snippet>
   * ```
   * If you don't set this property, the result list can be displayed on any tab. Otherwise, the result list can only be displayed on the specified tabs.
   */
  @property({
    attribute: 'tabs-included',
    converter: arrayConverter,
    type: Array,
  })
  public tabsIncluded: string[] = [];

  /**
   * The tabs on which this result list must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-result-list tabs-excluded='["tabIDA", "tabIDB"]'></atomic-result-list>
   * ```
   * If you don't set this property, the result list can be displayed on any tab. Otherwise, the result list won't be displayed on any of the specified tabs.
   */
  @property({
    attribute: 'tabs-excluded',
    converter: arrayConverter,
    type: Array,
  })
  public tabsExcluded: string[] = [];

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        density: this.density,
        display: this.display,
        imageSize: this.imageSize,
        tabsIncluded: this.tabsIncluded,
        tabsExcluded: this.tabsExcluded,
      }),
      new Schema({
        density: new StringValue({
          constrainTo: ['normal', 'comfortable', 'compact'],
        }),
        display: new StringValue({constrainTo: ['grid', 'list', 'table']}),
        imageSize: new StringValue({
          constrainTo: ['small', 'large', 'icon', 'none'],
        }),
        tabsIncluded: new ArrayValue({
          each: new StringValue({}),
          required: false,
        }),
        tabsExcluded: new ArrayValue({
          each: new StringValue({}),
          required: false,
        }),
      }),
      // TODO V4: KIT-5197 - Remove false
      false
    );
  }

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax such as React, Angular, or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = resultRenderingFunction;
  }

  public initialize() {
    if (this.innerHTML.includes('<atomic-result-children')) {
      console.warn(
        'Folded results will not render any children for the "atomic-result-list". Please use "atomic-folded-result-list" instead.'
      );
    }

    this.resultList = buildResultList(this.bindings.engine);
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);

    this.initResultTemplateProvider();

    this.initResultListCommon();

    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public async willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('tabManagerState')) {
      const oldValue = changedProperties.get('tabManagerState') as
        | TabManagerState
        | undefined;
      if (
        this.tabManagerState?.activeTab !== oldValue?.activeTab &&
        oldValue !== undefined
      ) {
        this.bindings.store.unsetLoadingFlag(this.loadingFlag);
      }
    }

    if (changedProperties.has('resultListState')) {
      const oldState = changedProperties.get(
        'resultListState'
      ) as ResultListState;
      if (this.resultListState.firstSearchExecuted) {
        this.bindings.store.unsetLoadingFlag(this.loadingFlag);
      }
      if (!oldState?.isLoading && this.resultListState.isLoading) {
        this.isEveryResultReady = false;
      }
    }

    await this.updateResultReadyState();
  }

  private async updateResultReadyState() {
    if (
      this.isAppLoaded &&
      !this.isEveryResultReady &&
      this.resultListState?.firstSearchExecuted &&
      this.resultListState?.results?.length > 0
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
          hasError: this.resultListState.hasError,
          hasItems: this.resultListState.hasResults,
          hasTemplate: this.resultTemplateRegistered,
          firstRequestExecuted: this.resultListState.firstSearchExecuted,
          templateHasError: this.templateHasError,
        },
      })(
        html`${when(
          this.templateHasError,
          () => html`<slot></slot>`,
          () => {
            const listClasses = this.computeListDisplayClasses();
            const resultClasses = `${listClasses} ${!this.isEveryResultReady && 'hidden'}`;

            // Results must be rendered immediately (though hidden) to start their initialization and loading processes.
            // If we wait to render results until placeholders are removed, the components won't begin loading until then,
            // causing a longer delay. The `isEveryResultReady` flag hides results while preserving placeholders,
            // then removes placeholders once results are fully loaded to prevent content flash.
            return html`
              ${when(this.isAppLoaded, () =>
                renderDisplayWrapper({
                  props: {
                    listClasses: resultClasses,
                    display: this.display,
                  },
                })(
                  html`${when(
                    this.display === 'grid',
                    () => this.renderGrid(),
                    () =>
                      html`${when(
                        this.display === 'table',
                        () => this.renderTable(),
                        () => this.renderList()
                      )}`
                  )}`
                )
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
      getCurrentNumberOfItems: () => this.resultListState.results.length,
      getIsLoading: () => this.resultListState.isLoading,
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
      this.resultListState?.isLoading,
      displayPlaceholders
    );
  }

  private renderGrid() {
    return html`${map(this.resultListState.results, (result, index) => {
      return renderGridLayout({
        props: {
          item: {
            ...result,
            title: result.title ?? '',
          },
          selectorForItem: 'atomic-result',
          setRef: (element) => {
            element instanceof HTMLElement &&
              this.resultListCommon.setNewResultRef(element, index);
          },
        },
      })(
        html`${keyed(
          this.getResultId(result),
          html`<atomic-result
            .content=${this.getContent(result)}
            .density=${this.density}
            .display=${this.display}
            .imageSize=${this.imageSize}
            .interactiveResult=${this.getInteractiveResult(result)}
            .linkContent=${this.getLinkContent(result)}
            .loadingFlag=${this.loadingFlag}
            .result=${result}
            .renderingFunction=${this.itemRenderingFunction}
            .store=${this.bindings.store as never}
          ></atomic-result>`
        )}`
      );
    })}`;
  }

  private renderList() {
    return html`${map(this.resultListState.results, (result, index) => {
      return html`${keyed(
        this.getResultId(result),
        html`<atomic-result
        part="outline"
         ${ref(
           (element) =>
             element instanceof HTMLElement &&
             this.resultListCommon.setNewResultRef(element, index)
         )}
            .content=${this.getContent(result)}
            .density=${this.density}
            .display=${this.display}
            .imageSize=${this.imageSize}
            .interactiveResult=${this.getInteractiveResult(result)}
            .linkContent=${this.getLinkContent(result)}
            .loadingFlag=${this.loadingFlag}
            .result=${result}
            .renderingFunction=${this.itemRenderingFunction}
            .store=${this.bindings.store as never}
          ></atomic-result>`
      )}`;
    })}`;
  }

  private renderTable() {
    return html`${when(
      this.resultListState.hasResults,
      () => {
        const firstItem = this.resultListState.results[0];
        const listClasses = this.computeListDisplayClasses();
        const templateContentForFirstItem =
          this.resultTemplateProvider.getTemplateContent(firstItem);

        return renderTableLayout({
          props: {
            firstItem,
            host: this,
            itemRenderingFunction: this.itemRenderingFunction,
            listClasses,
            logger: this.bindings.engine.logger,
            templateContentForFirstItem,
          },
        })(
          html`${map(this.resultListState.results, (result, index) => {
            return renderTableRow({
              props: {
                key: this.getResultId(result),
                rowIndex: index,
                setRef: (element) => {
                  element instanceof HTMLElement &&
                    this.resultListCommon.setNewResultRef(element, index);
                },
              },
            })(
              renderTableData({
                props: {
                  firstItem,
                  templateContentForFirstItem,
                  itemRenderingFunction: this.itemRenderingFunction,
                  key: this.getResultId(result),
                  renderItem: (content) => {
                    return html`<atomic-result
                      .content=${content}
                      .density=${this.density}
                      .display=${this.display}
                      .imageSize=${this.imageSize}
                      .interactiveResult=${this.getInteractiveResult(result)}
                       .linkContent=${this.getLinkContent(result)}
                      .loadingFlag=${this.loadingFlag}
                      .result=${result}
                      .renderingFunction=${this.itemRenderingFunction}
                      .store=${this.bindings.store as never}
                    ></atomic-result>`;
                  },
                },
              })
            );
          })}`
        );
      },
      () => nothing
    )}`;
  }

  private get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this, this.bindings);
    }
    return this.nextNewResultTarget;
  }

  private getLinkContent(result: Result) {
    return this.display === 'grid'
      ? this.resultTemplateProvider.getLinkTemplateContent(result)
      : this.resultTemplateProvider.getEmptyLinkTemplateContent();
  }

  private getContent(result: Result) {
    return this.resultTemplateProvider.getTemplateContent(result);
  }

  private getInteractiveResult(result: Result) {
    return buildInteractiveResult(this.bindings.engine, {
      options: {result},
    });
  }

  private getResultId(result: Result) {
    return this.resultListCommon.getResultId(
      result.uniqueId,
      this.resultListState.searchResponseId,
      this.density,
      this.imageSize
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-list': AtomicResultList;
  }
}
