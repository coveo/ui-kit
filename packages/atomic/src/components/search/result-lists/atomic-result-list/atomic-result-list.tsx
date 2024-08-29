import {
  ResultList,
  ResultListState,
  buildResultList,
  ResultsPerPageState,
  ResultsPerPage,
  buildResultsPerPage,
  buildInteractiveResult,
  Result,
} from '@coveo/headless';
import {Component, Element, State, Prop, Method, h} from '@stencil/core';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {randomID} from '../../../../utils/utils';
import {ResultsPlaceholdersGuard} from '../../../common/atomic-result-placeholder/placeholders';
import {DisplayGrid} from '../../../common/item-list/display-grid';
import {
  DisplayTableData,
  DisplayTable,
  DisplayTableRow,
} from '../../../common/item-list/display-table';
import {DisplayWrapper} from '../../../common/item-list/display-wrapper';
import {ItemDisplayGuard} from '../../../common/item-list/item-display-guard';
import {
  ItemListCommon,
  ItemRenderingFunction,
} from '../../../common/item-list/item-list-common';
import {ItemListGuard} from '../../../common/item-list/item-list-guard';
import {ItemTemplateProvider} from '../../../common/item-list/item-template-provider';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
  ItemTarget,
  getItemListDisplayClasses,
} from '../../../common/layout/display-options';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-result-list` component is responsible for displaying query results by applying one or more result templates.
 *
 * @slot default - The default slot where the result templates are inserted.
 * @part result-list - The element containing every result of a result list
 * @part outline - The element displaying an outline or a divider around a result
 * @part result-list-grid-clickable-container - The parent of the result & the clickable link encompassing it, when results are displayed as a grid
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
@Component({
  tag: 'atomic-result-list',
  styleUrl: 'atomic-result-list.pcss',
  shadow: true,
})
export class AtomicResultList implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public resultList!: ResultList;
  public resultsPerPage!: ResultsPerPage;
  private loadingFlag = randomID('firstResultLoaded-');
  private itemRenderingFunction: ItemRenderingFunction;
  private nextNewResultTarget?: FocusTargetController;
  private itemTemplateProvider!: ItemTemplateProvider;
  private resultListCommon!: ItemListCommon;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('resultList')
  @State()
  private resultListState!: ResultListState;
  @BindStateToController('resultsPerPage')
  @State()
  private resultsPerPageState!: ResultsPerPageState;
  @State() private resultTemplateRegistered = false;
  @State() public error!: Error;
  @State() private templateHasError = false;

  /**
   * The desired layout to use when displaying results. Layouts affect how many results to display per row and how visually distinct they are from each other.
   */
  @Prop({reflect: true}) public display: ItemDisplayLayout = 'list';
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) public density: ItemDisplayDensity = 'normal';

  /**
   * The target location to open the result link (see [target](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target)).
   * This property is only leveraged when `display` is `grid`.
   * @defaultValue `_self`
   * @deprecated - Instead of using this property, provide an `atomic-result-link` in the `link` slot of the `atomic-result-template` component.
   */
  @Prop() gridCellLinkTarget: ItemTarget = '_self';

  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true, mutable: true})
  public imageSize: ItemDisplayImageSize = 'icon';

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  @Method() public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = resultRenderingFunction;
  }

  public get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
    }
    return this.nextNewResultTarget;
  }

  public initialize() {
    if (this.host.innerHTML.includes('<atomic-result-children')) {
      console.warn(
        'Folded results will not render any children for the "atomic-result-list". Please use "atomic-folded-result-list" instead.'
      );
    }
    this.resultList = buildResultList(this.bindings.engine);
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    this.itemTemplateProvider = new ItemTemplateProvider(
      {
        includeDefaultTemplate: true,
        templateElements: Array.from(
          this.host.querySelectorAll('atomic-result-template')
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
      },
      this.gridCellLinkTarget
    );

    this.resultListCommon = new ItemListCommon({
      engineSubscribe: this.bindings.engine.subscribe,
      getCurrentNumberOfItems: () => this.resultListState.results.length,
      getIsLoading: () => this.resultListState.isLoading,
      host: this.host,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });
  }

  public render() {
    this.resultListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    return (
      <ItemListGuard
        hasError={this.resultListState.hasError}
        hasTemplate={this.resultTemplateRegistered}
        templateHasError={this.itemTemplateProvider.hasError}
        firstRequestExecuted={this.resultListState.firstSearchExecuted}
        hasItems={this.resultListState.hasResults}
      >
        <DisplayWrapper display={this.display} listClasses={listClasses}>
          <ResultsPlaceholdersGuard
            density={this.density}
            display={this.display}
            imageSize={this.imageSize}
            displayPlaceholders={!this.bindings.store.isAppLoaded()}
            numberOfPlaceholders={this.resultsPerPageState.numberOfResults}
          ></ResultsPlaceholdersGuard>
          <ItemDisplayGuard
            firstRequestExecuted={this.resultListState.firstSearchExecuted}
            hasItems={this.resultListState.hasResults}
          >
            {this.display === 'table'
              ? this.renderAsTable()
              : this.display === 'grid'
                ? this.renderAsGrid()
                : this.renderAsList()}
          </ItemDisplayGuard>
        </DisplayWrapper>
      </ItemListGuard>
    );
  }

  private getPropsForAtomicResult(result: Result) {
    return {
      interactiveResult: buildInteractiveResult(this.bindings.engine, {
        options: {result},
      }),
      result,
      renderingFunction: this.itemRenderingFunction,
      loadingFlag: this.loadingFlag,
      key: this.resultListCommon.getResultId(
        result.uniqueId,
        this.resultListState.searchResponseId,
        this.density,
        this.imageSize
      ),
      content: this.itemTemplateProvider.getTemplateContent(result),
      linkContent:
        this.display === 'grid'
          ? this.itemTemplateProvider.getLinkTemplateContent(result)
          : this.itemTemplateProvider.getEmptyLinkTemplateContent(),
      store: this.bindings.store,
      density: this.density,
      imageSize: this.imageSize,
      display: this.display,
    };
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !this.bindings.store.isAppLoaded();

    return getItemListDisplayClasses(
      this.display,
      this.density,
      this.imageSize,
      this.resultListState.firstSearchExecuted &&
        this.resultListState.isLoading,
      displayPlaceholders
    );
  }

  private renderAsGrid() {
    return this.resultListState.results.map((result, i) => {
      const propsForAtomicResult = this.getPropsForAtomicResult(result);
      return (
        <DisplayGrid
          item={result}
          {...propsForAtomicResult.interactiveResult}
          setRef={(element) =>
            element && this.resultListCommon.setNewResultRef(element, i)
          }
        >
          <atomic-result {...this} {...propsForAtomicResult}></atomic-result>
        </DisplayGrid>
      );
    });
  }

  private renderAsTable() {
    if (!this.resultListState.hasResults) {
      return;
    }
    const listClasses = this.computeListDisplayClasses();
    const firstItem = this.resultListState.results[0];

    const propsForTableColumns = {
      firstItem,
      templateContentForFirstItem:
        this.itemTemplateProvider.getTemplateContent(firstItem),
    };

    return (
      <DisplayTable
        {...propsForTableColumns}
        listClasses={listClasses}
        logger={this.bindings.engine.logger}
        itemRenderingFunction={this.itemRenderingFunction}
        host={this.host}
      >
        {this.resultListState.results.map((result, i) => {
          const propsForAtomicResult = this.getPropsForAtomicResult(result);
          return (
            <DisplayTableRow
              {...propsForAtomicResult}
              rowIndex={i}
              setRef={(element) =>
                element && this.resultListCommon.setNewResultRef(element, i)
              }
            >
              <DisplayTableData
                {...propsForTableColumns}
                {...propsForAtomicResult}
                renderItem={(content) => {
                  return (
                    <atomic-result
                      {...propsForAtomicResult}
                      content={content}
                    ></atomic-result>
                  );
                }}
              ></DisplayTableData>
            </DisplayTableRow>
          );
        })}
      </DisplayTable>
    );
  }

  private renderAsList() {
    return this.resultListState.results.map((result, i) => {
      const propsForAtomicResult = this.getPropsForAtomicResult(result);
      return (
        <atomic-result
          {...propsForAtomicResult}
          ref={(element) =>
            element && this.resultListCommon.setNewResultRef(element, i)
          }
          part="outline"
        ></atomic-result>
      );
    });
  }
}
