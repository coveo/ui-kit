import {
  buildRecommendationList,
  RecommendationList,
  RecommendationListState,
  Result,
} from '@coveo/headless/recommendation';
import {Component, State, Element, Prop, Method, h} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {RecsBindings} from '../atomic-recs-interface/atomic-recs-interface';
import {randomID} from '../../../utils/utils';
import {ResultListCommon} from '../../common/result-list/result-list-common';
import {ResultTemplateProvider} from '../../common/result-list/result-template-provider';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayBasicLayout,
} from '../../common/layout/display-options';
import {
  ResultListCommonState,
  ResultRenderingFunction,
} from '../../common/result-list/result-list-common-interface';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../utils/accessibility-utils';
import {Heading} from '../../common/heading';

/**
 * @internal
 * The `atomic-recs-list` component is responsible for displaying recommendations by applying one or more result templates.
 *
 * @part result-list - The element containing every result of the list of results.
 * @part result-list-grid-clickable-container - The parent of the result & the clickable link encompassing it.
 * @part result-list-grid-clickable - The clickable link encompassing the result.
 * @part label - The label of the list of results.
 */
@Component({
  tag: 'atomic-recs-list',
  styleUrl: 'atomic-recs-list.pcss',
  shadow: true,
})
export class AtomicRecsList implements InitializableComponent<RecsBindings> {
  @InitializeBindings() public bindings!: RecsBindings;
  public recommendationList!: RecommendationList;
  private resultListCommon!: ResultListCommon;
  private loadingFlag = randomID('firstRecommendationLoaded-');
  private resultRenderingFunction: ResultRenderingFunction;

  @Element() public host!: HTMLDivElement;

  @State() public error!: Error;
  @State() private resultTemplateRegistered = false;
  @State() private templateHasError = false;
  @BindStateToController('recommendationList')
  @State()
  public recommendationListState!: RecommendationListState;

  @FocusTarget()
  private nextNewResultTarget!: FocusTargetController;

  /**
   * How children results should be displayed. This does not affect the display of the list itself.
   * To change the number of recommendations per column, change the -atomic-recs-number-of-columns CSS variable.
   */
  @Prop({reflect: true}) public display: ResultDisplayBasicLayout = 'list';
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) public density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true})
  public imageSize: ResultDisplayImageSize = 'small';

  /**
   * The number of recommendations to be fetched and displayed.
   * This does not affect the number of recommendations per column. To do so, change the -atomic-recs-number-of-columns CSS variable.
   */
  @Prop({reflect: true}) public numberOfRecommendations = 10;

  /**
   * The non-localized label for the list of recommendations.
   */
  @Prop({reflect: true}) public label?: string;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading label, from 1 to 6.
   */
  @Prop({reflect: true}) public headingLevel = 0;

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
    this.recommendationList = buildRecommendationList(this.bindings.engine, {
      options: {numberOfRecommendations: this.numberOfRecommendations},
    });

    const resultTemplateProvider = new ResultTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.host.querySelectorAll('atomic-recs-result-template')
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
      resultTemplateProvider,
      getNumberOfPlaceholders: () => this.numberOfRecommendations,
      host: this.host,
      bindings: this.bindings,
      getDensity: () => this.density,
      getLayoutDisplay: () => 'grid',
      getResultDisplay: () => this.display,
      getImageSize: () => this.imageSize,
      nextNewResultTarget: this.nextNewResultTarget,
      loadingFlag: this.loadingFlag,
      getResultListState: () => this.resultListCommonState,
      getResultRenderingFunction: () => this.resultRenderingFunction,
      renderResult: (props) => (
        <atomic-recs-result {...props}></atomic-recs-result>
      ),
    });

    this.recommendationList.refresh();
  }

  private get resultListCommonState(): ResultListCommonState<Result> {
    return {
      firstSearchExecuted: this.recommendationListState.searchResponseId !== '',
      isLoading: this.recommendationListState.isLoading,
      hasError: this.recommendationListState.error !== null,
      hasResults: this.recommendationListState.recommendations.length !== 0,
      results: this.recommendationListState.recommendations,
      searchResponseId: this.recommendationListState.searchResponseId,
    };
  }

  public render() {
    return [
      this.label && (
        <Heading level={this.headingLevel} part="label">
          {this.bindings.i18n.t(this.label)}
        </Heading>
      ),
      this.resultListCommon.render(),
    ];
  }
}
