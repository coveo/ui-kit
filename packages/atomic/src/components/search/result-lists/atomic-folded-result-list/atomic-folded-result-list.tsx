import {
  ResultsPerPageState,
  ResultsPerPage,
  buildFoldedResultList,
  FoldedResultList,
  FoldedResultListState,
  buildResultsPerPage,
  ResultListProps,
  FoldedCollection,
  buildInteractiveResult,
} from '@coveo/headless';
import {
  Component,
  Element,
  State,
  Prop,
  Listen,
  Method,
  h,
} from '@stencil/core';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {randomID} from '../../../../utils/utils';
import {ResultsPlaceholdersGuard} from '../../../common/atomic-result-placeholder/placeholders';
import {extractUnfoldedResult} from '../../../common/interface/result';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
  getResultListDisplayClasses,
} from '../../../common/layout/display-options';
import {DisplayGrid} from '../../../common/result-list/display-grid';
import {
  DisplayTableData,
  DisplayTable,
  DisplayTableRow,
} from '../../../common/result-list/display-table';
import {DisplayWrapper} from '../../../common/result-list/display-wrapper';
import {ItemDisplayGuard} from '../../../common/result-list/item-display-guard';
import {ItemListGuard} from '../../../common/result-list/item-list-guard';
import {
  ResultListCommon,
  ResultRenderingFunction,
} from '../../../common/result-list/result-list-common';
import {FoldedResultListStateContextEvent} from '../../../common/result-list/result-list-decorators';
import {ResultTemplateProvider} from '../../../common/result-list/result-template-provider';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-folded-result-list` component is responsible for displaying folded query results, by applying one or more result templates for up to three layers (i.e., to the result, child and grandchild).
 *
 * @part result-list - The element containing every result of a result list
 * @part outline - The element displaying an outline or a divider around a result
 */
@Component({
  tag: 'atomic-folded-result-list',
  styleUrl: 'atomic-folded-result-list.pcss',
  shadow: true,
})
export class AtomicFoldedResultList implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public foldedResultList!: FoldedResultList;
  public resultsPerPage!: ResultsPerPage;
  private resultRenderingFunction: ResultRenderingFunction;
  private loadingFlag = randomID('firstResultLoaded-');
  private resultTemplateProvider!: ResultTemplateProvider;
  private nextNewResultTarget?: FocusTargetController;
  private resultListCommon!: ResultListCommon;
  private display: ResultDisplayLayout = 'list';

  @Element() public host!: HTMLDivElement;

  @BindStateToController('foldedResultList')
  @State()
  public foldedResultListState!: FoldedResultListState;
  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: ResultsPerPageState;
  @State() private resultTemplateRegistered = false;
  @State() public error!: Error;
  @State() private templateHasError = false;

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize: ResultDisplayImageSize = 'icon';
  /**
   * The name of the field on which to do the folding. The folded result list component will use the values of this field to resolve the collections of result items.
   *
   * @defaultValue `foldingcollection`
   */
  @Prop({reflect: true}) public collectionField?: string;
  /**
   * The name of the field that determines whether a certain result is a top result containing other child results within a collection.
   *
   * @defaultValue `foldingparent`
   */
  @Prop({reflect: true}) public parentField?: string;
  /**
   * The name of the field that uniquely identifies a result within a collection.
   *
   * @defaultValue `foldingchild`
   */
  @Prop({reflect: true}) public childField?: string;

  /**
   * The initial number of child results to request for each folded collection, before expansion.
   *
   * @defaultValue `2`
   *
   * @example For an email thread with a total of 20 messages, using the default value of `2` will request the top two child messages, based on the current sort criteria and query, to be returned as children of the parent message.
   * The user can then click to expand the collection and see the remaining messages that match the current query (i.e., not necessarily all remaining 18 messages). Those messages will be sorted based on the current sort criteria (i.e., not necessarily by date). See the `atomic-load-more-children-results` component.
   * For more info on Result Folding, see [Result Folding](https://docs.coveo.com/en/1884).
   **/
  @Prop({reflect: true}) public numberOfFoldedResults = 2;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   */
  @Method() public async setRenderFunction(
    resultRenderingFunction: ResultRenderingFunction
  ) {
    this.resultRenderingFunction = resultRenderingFunction;
  }

  @Listen('atomic/resolveFoldedResultList')
  resolveFoldedResultList(event: FoldedResultListStateContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.foldedResultList);
  }

  @Listen('atomic/loadCollection')
  loadCollection(event: CustomEvent<FoldedCollection>) {
    event.preventDefault();
    event.stopPropagation();
    this.foldedResultList.loadCollection(event.detail);
  }

  public get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
    }
    return this.nextNewResultTarget;
  }

  public initialize() {
    try {
      this.foldedResultList = this.initFolding();
      this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    } catch (e) {
      this.error = e as Error;
    }

    this.resultTemplateProvider = new ResultTemplateProvider({
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
    });

    this.resultListCommon = new ResultListCommon({
      engineSubscribe: this.bindings.engine.subscribe,
      getCurrentNumberOfResults: () =>
        this.foldedResultListState.results.length,
      getIsLoading: () => this.foldedResultListState.isLoading,
      host: this.host,
      loadingFlag: this.loadingFlag,
      nextNewResultTarget: this.focusTarget,
      store: this.bindings.store,
    });
  }

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

  public render() {
    this.resultListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    return (
      <ItemListGuard
        {...this.foldedResultListState}
        firstRequestExecuted={this.foldedResultListState.firstSearchExecuted}
        hasItems={this.foldedResultListState.hasResults}
        hasTemplate={this.resultTemplateRegistered}
        templateHasError={this.resultTemplateProvider.hasError}
      >
        <DisplayWrapper
          {...this}
          listClasses={listClasses}
          display={this.display}
        >
          <ResultsPlaceholdersGuard
            {...this}
            displayPlaceholders={!this.bindings.store.isAppLoaded()}
            numberOfPlaceholders={this.resultsPerPageState.numberOfResults}
            display={this.display}
          ></ResultsPlaceholdersGuard>
          <ItemDisplayGuard
            {...this.foldedResultListState}
            {...this}
            listClasses={listClasses}
            firstRequestExecuted={
              this.foldedResultListState.firstSearchExecuted
            }
            hasItems={this.foldedResultListState.hasResults}
            display={this.display}
          >
            {this.foldedResultListState.results.map((result, i) => {
              switch (this.display) {
                case 'grid':
                  return this.renderAsGrid(result, i);
                case 'table':
                  return this.renderAsTable(result, i);
                case 'list':
                default:
                  return this.renderAsList(result, i);
              }
            })}
          </ItemDisplayGuard>
        </DisplayWrapper>
      </ItemListGuard>
    );
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !this.bindings.store.isAppLoaded();

    return getResultListDisplayClasses(
      this.display,
      this.density,
      this.imageSize,
      this.foldedResultListState.firstSearchExecuted &&
        this.foldedResultListState.isLoading,
      displayPlaceholders
    );
  }

  private getPropsForAtomicResult(collection: FoldedCollection) {
    const result = extractUnfoldedResult(collection);

    return {
      interactiveResult: buildInteractiveResult(this.bindings.engine, {
        options: {result},
      }),
      result,
      renderingFunction: this.resultRenderingFunction,
      loadingFlag: this.loadingFlag,
      key: this.resultListCommon.getResultId(
        result.uniqueId,
        this.foldedResultListState.searchResponseId,
        this.density,
        this.imageSize
      ),
      content: this.resultTemplateProvider.getTemplateContent(result),
      store: this.bindings.store,
    };
  }

  private renderAsGrid(collection: FoldedCollection, i: number) {
    const propsForAtomicResult = this.getPropsForAtomicResult(collection);
    const result = extractUnfoldedResult(collection);
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
  }

  private renderAsTable(collection: FoldedCollection, i: number) {
    const listClasses = this.computeListDisplayClasses();
    const firstResult = extractUnfoldedResult(
      this.foldedResultListState.results[0]
    );

    const propsForTableColumns = {
      firstResult,
      templateContentForFirstResult:
        this.resultTemplateProvider.getTemplateContent(firstResult),
    };
    const propsForAtomicResult = this.getPropsForAtomicResult(collection);

    return (
      <DisplayTable
        listClasses={listClasses}
        {...this}
        {...propsForTableColumns}
        logger={this.bindings.engine.logger}
        resultRenderingFunction={this.resultRenderingFunction}
      >
        <DisplayTableRow
          {...propsForAtomicResult}
          rowIndex={i}
          setRef={(element) =>
            element && this.resultListCommon.setNewResultRef(element, i)
          }
        >
          <DisplayTableData {...propsForTableColumns} {...propsForAtomicResult}>
            <atomic-result {...this} {...propsForAtomicResult}></atomic-result>
          </DisplayTableData>
        </DisplayTableRow>
      </DisplayTable>
    );
  }

  private renderAsList(collection: FoldedCollection, i: number) {
    const propsForAtomicResult = this.getPropsForAtomicResult(collection);
    return (
      <atomic-result
        {...this}
        {...propsForAtomicResult}
        part="outline"
        ref={(element) =>
          element && this.resultListCommon.setNewResultRef(element, i)
        }
      ></atomic-result>
    );
  }
}
