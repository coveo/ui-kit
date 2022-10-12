import {Component, h, Element, State, Prop, Method} from '@stencil/core';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../common/layout/display-options';
import {
  InsightResultList,
  InsightResultListState,
  buildInsightResultList,
  InsightResult,
  buildInsightInteractiveResult,
} from '..';
import {randomID} from '../../../utils/utils';
import {
  buildResultsPerPage,
  ResultsPerPage,
  ResultsPerPageState,
} from '@coveo/headless/insight';
import {ResultTemplateProvider} from '../../common/result-list/result-template-provider';
import {ResultListCommon} from '../../common/result-list/result-list-common';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../utils/accessibility-utils';
import {ResultRenderingFunction} from '../../common/result-list/result-list-common-interface';

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
  public resultsPerPage!: ResultsPerPage;
  private resultListCommon!: ResultListCommon;
  private loadingFlag = randomID('firstInsightResultLoaded-');
  private display: ResultDisplayLayout = 'list';
  private resultRenderingFunction: ResultRenderingFunction;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: ResultsPerPageState;
  @BindStateToController('resultList')
  @State()
  public resultListState!: InsightResultListState;
  @State() private templateHasError = false;
  @State() private resultTemplateRegistered = false;
  @State() public error!: Error;

  @FocusTarget() nextNewResultTarget!: FocusTargetController;

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
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);

    const resultTemplateProvider = new ResultTemplateProvider({
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

    this.resultListCommon = new ResultListCommon<InsightResult>({
      resultTemplateProvider,
      getNumberOfPlaceholders: () => this.resultsPerPageState.numberOfResults,
      host: this.host,
      bindings: this.bindings,
      getDensity: () => this.density,
      getResultDisplay: () => this.display,
      getLayoutDisplay: () => this.display,
      getImageSize: () => this.imageSize,
      nextNewResultTarget: this.nextNewResultTarget,
      loadingFlag: this.loadingFlag,
      getResultListState: () => this.resultListState,
      getResultRenderingFunction: () => this.resultRenderingFunction,
      renderResult: (props) => (
        <atomic-insight-result {...props}></atomic-insight-result>
      ),
      getInteractiveResult: (result: InsightResult) =>
        buildInsightInteractiveResult(this.bindings.engine, {
          options: {result},
        }),
    });
  }

  public render() {
    return this.resultListCommon.render();
  }
}
