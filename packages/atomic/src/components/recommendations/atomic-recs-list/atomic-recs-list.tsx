import {
  buildRecommendationList,
  RecommendationList,
  RecommendationListState,
  Result,
} from '@coveo/headless/recommendation';
import {Component, State, Element} from '@stencil/core';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Bindings} from '../atomic-recs-interface/atomic-recs-interface';
import {ResultListCommon} from '../../common/result-list/result-list-common';
import {randomID} from '../../../utils/utils';

/**
 * @internal
 */
@Component({
  tag: 'atomic-recs-list',
  shadow: true,
})
export class AtomicRecsList {
  @InitializeBindings() public bindings!: Bindings;
  public recommendationList!: RecommendationList;
  @State() public error!: Error;

  @State() public templateHasError = false;

  @BindStateToController('recommendationList')
  @State()
  public recommendationListState!: RecommendationListState;
  public resultListCommon!: ResultListCommon<Bindings>;
  @Element() public host!: HTMLDivElement;
  private loadingFlag = randomID('firstRecommendationLoaded-');

  public async initialize() {
    this.recommendationList = buildRecommendationList(this.bindings.engine);

    this.resultListCommon = new ResultListCommon({
      host: this.host,
      bindings: this.bindings,
      templateElements: this.host.querySelectorAll('atomic-result-template'),
      onReady: () => {
        // TODO
      },
      onError: () => {
        this.templateHasError = true;
      },
      loadingFlag: this.loadingFlag,
      //nextNewResultTarget: this.nextNewResultTarget,
    });

    await this.recommendationList.refresh();
  }

  public getContentOfResultTemplate(
    result: Result
  ): HTMLElement | DocumentFragment {
    return this.resultListCommon.getContentOfResultTemplate(result);
  }

  render() {
    return this.resultListCommon.renderList({
      host: this.host,
      display: 'list',
      density: 'normal',
      imageSize: 'none',
      templateHasError: this.templateHasError,
      resultListState: {
        firstSearchExecuted:
          !this.recommendationListState.isLoading &&
          this.recommendationListState.recommendations.length !== 0,
        isLoading: this.recommendationListState.isLoading,
        hasError: this.recommendationListState.error !== null,
        hasResults: this.recommendationListState.recommendations.length !== 0,
        results: this.recommendationListState.recommendations,
        searchResponseId: 'TODO',
      },
      numberOfResults: 5,
      setListWrapperRef: (_: HTMLDivElement) => {
        // TODO
      },
      getContentOfResultTemplate: this.getContentOfResultTemplate,
    });
  }
}
