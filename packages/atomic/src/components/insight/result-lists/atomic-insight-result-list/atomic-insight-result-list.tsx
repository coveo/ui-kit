import {Component, h, Element, State, Prop, Method} from '@stencil/core';
import {
  InsightResultList,
  InsightResultListState,
  buildInsightResultList,
  InsightResult,
  buildInsightInteractiveResult,
  buildInsightResultsPerPage,
  InsightResultsPerPage,
  InsightResultsPerPageState,
} from '../..';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {randomID} from '../../../../utils/utils';
import {ResultsPlaceholdersGuard} from '../../../common/atomic-result-placeholder/placeholders';
import {
  getResultListDisplayClasses,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../../common/layout/display-options';
import {DisplayWrapper} from '../../../common/result-list/display-wrapper';
import {ItemDisplayGuard} from '../../../common/result-list/item-display-guard';
import {ItemListGuard} from '../../../common/result-list/item-list-guard';
import {
  ResultListCommon,
  ResultRenderingFunction,
} from '../../../common/result-list/result-list-common';
import {ResultTemplateProvider} from '../../../common/result-list/result-template-provider';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result-list',
  styleUrl: 'atomic-insight-result-list.pcss',
  shadow: true,
})
export class AtomicInsightResultList
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public resultList!: InsightResultList;
  public resultsPerPage!: InsightResultsPerPage;
  private loadingFlag = randomID('firstInsightResultLoaded-');
  private resultRenderingFunction: ResultRenderingFunction;
  private resultTemplateProvider!: ResultTemplateProvider;
  private nextNewResultTarget?: FocusTargetController;
  private display: ResultDisplayLayout = 'list';
  private resultListCommon!: ResultListCommon;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: InsightResultsPerPageState;
  @BindStateToController('resultList')
  @State()
  public resultListState!: InsightResultListState;
  @State() private templateHasError = false;
  @State() private resultTemplateRegistered = false;
  @State() public error!: Error;

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize: ResultDisplayImageSize = 'icon';
  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  @Method() public async setRenderFunction(
    resultRenderingFunction: ResultRenderingFunction
  ) {
    this.resultRenderingFunction = resultRenderingFunction;
  }

  public initialize() {
    this.resultList = buildInsightResultList(this.bindings.engine, {
      options: {
        fieldsToInclude: this.bindings.store.state.fieldsToInclude || undefined,
      },
    });
    this.resultsPerPage = buildInsightResultsPerPage(this.bindings.engine);

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
      getCurrentNumberOfResults: () => this.resultListState.results.length,
      getIsLoading: () => this.resultListState.isLoading,
      host: this.host,
      loadingFlag: this.loadingFlag,
      nextNewResultTarget: this.focusTarget,
      store: this.bindings.store,
    });
  }

  public get focusTarget(): FocusTargetController {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
    }
    return this.nextNewResultTarget;
  }

  public render() {
    this.resultListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    return (
      <ItemListGuard
        {...this.resultListState}
        hasTemplate={this.resultTemplateRegistered}
        templateHasError={this.resultTemplateProvider.hasError}
        firstRequestExecuted={this.resultListState.firstSearchExecuted}
        hasItems={this.resultListState.hasResults}
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
            {...this.resultListState}
            {...this}
            listClasses={listClasses}
            display={this.display}
          >
            {this.resultListState.results.map((result, i) => {
              const atomicInsightResultProps =
                this.getPropsForAtomicInsightResult(result);
              return (
                <atomic-insight-result
                  {...this}
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
      this.resultListState.firstSearchExecuted &&
        this.resultListState.isLoading,
      displayPlaceholders
    );
  }

  private getPropsForAtomicInsightResult(result: InsightResult) {
    return {
      interactiveResult: buildInsightInteractiveResult(this.bindings.engine, {
        options: {result},
      }),
      result,
      renderingFunction: this.resultRenderingFunction,
      loadingFlag: this.loadingFlag,
      key: this.resultListCommon.getResultId(
        result.uniqueId,
        this.resultListState.searchResponseId,
        this.density,
        this.imageSize
      ),
      content: this.resultTemplateProvider.getTemplateContent(result),
      store: this.bindings.store,
    };
  }
}
