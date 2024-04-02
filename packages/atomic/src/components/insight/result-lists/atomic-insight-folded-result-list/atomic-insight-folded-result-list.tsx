import {
  Component,
  Element,
  State,
  Prop,
  Listen,
  Method,
  h,
} from '@stencil/core';
import {
  InsightResultsPerPageState,
  InsightResultsPerPage,
  buildInsightFoldedResultList,
  InsightFoldedResultList,
  InsightFoldedResultListState,
  buildInsightResultsPerPage,
  InsightFoldedCollection,
  buildInsightInteractiveResult,
} from '../..';
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
import {DisplayWrapper} from '../../../common/result-list/display-wrapper';
import {ItemDisplayGuard} from '../../../common/result-list/item-display-guard';
import {ItemListGuard} from '../../../common/result-list/item-list-guard';
import {
  ResultListCommon,
  ResultRenderingFunction,
} from '../../../common/result-list/result-list-common';
import {FoldedResultListStateContextEvent} from '../../../common/result-list/result-list-decorators';
import {ResultTemplateProvider} from '../../../common/result-list/result-template-provider';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-folded-result-list',
  styleUrl: 'atomic-insight-folded-result-list.pcss',
  shadow: true,
})
export class AtomicInsightFoldedResultList
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public foldedResultList!: InsightFoldedResultList;
  public resultsPerPage!: InsightResultsPerPage;
  private resultRenderingFunction: ResultRenderingFunction;
  private loadingFlag = randomID('firstResultLoaded-');
  private resultTemplateProvider!: ResultTemplateProvider;
  private nextNewResultTarget?: FocusTargetController;
  private display: ResultDisplayLayout = 'list';
  private resultListCommon!: ResultListCommon;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('foldedResultList')
  @State()
  public foldedResultListState!: InsightFoldedResultListState;
  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: InsightResultsPerPageState;
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
  loadCollection(event: CustomEvent<InsightFoldedCollection>) {
    event.preventDefault();
    event.stopPropagation();
    this.foldedResultList.loadCollection(event.detail);
  }

  public initialize() {
    try {
      this.foldedResultList = this.initFolding();
      this.resultsPerPage = buildInsightResultsPerPage(this.bindings.engine);
    } catch (e) {
      this.error = e as Error;
    }

    this.resultTemplateProvider = new ResultTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.host.querySelectorAll('atomic-insight-result-template')
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

  private get focusTarget(): FocusTargetController {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
    }
    return this.nextNewResultTarget;
  }

  private initFolding(props = {options: {}}): InsightFoldedResultList {
    return buildInsightFoldedResultList(this.bindings.engine, {
      options: {
        ...props.options,
        folding: {
          collectionField: this.collectionField,
          parentField: this.parentField,
          childField: this.childField,
        },
      },
    });
  }

  public render() {
    this.resultListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    return (
      <ItemListGuard
        firstRequestExecuted={this.foldedResultListState.firstSearchExecuted}
        hasItems={this.foldedResultListState.hasResults}
        hasTemplate={this.resultTemplateRegistered}
        templateHasError={this.resultTemplateProvider.hasError}
        hasError={this.foldedResultListState.hasError}
      >
        <DisplayWrapper listClasses={listClasses} display={this.display}>
          <ResultsPlaceholdersGuard
            displayPlaceholders={!this.bindings.store.isAppLoaded()}
            numberOfPlaceholders={this.resultsPerPageState.numberOfResults}
            display={this.display}
            density={this.density}
            imageSize={this.imageSize}
          ></ResultsPlaceholdersGuard>
          <ItemDisplayGuard
            firstRequestExecuted={
              this.foldedResultListState.firstSearchExecuted
            }
            hasItems={this.foldedResultListState.hasResults}
          >
            {this.foldedResultListState.results.map((collection, i) => {
              const atomicInsightResultProps =
                this.getPropsForAtomicInsightResult(collection);
              return (
                <atomic-insight-result
                  {...atomicInsightResultProps}
                  part="outline"
                  ref={(element) =>
                    element && this.resultListCommon.setNewResultRef(element, i)
                  }
                ></atomic-insight-result>
              );
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

  private getPropsForAtomicInsightResult(collection: InsightFoldedCollection) {
    const result = extractUnfoldedResult(collection);

    return {
      interactiveResult: buildInsightInteractiveResult(this.bindings.engine, {
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
      density: this.density,
      display: this.display,
      imageSize: this.imageSize,
    };
  }
}
