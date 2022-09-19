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
import {RecsBindings} from '../atomic-recs-interface/atomic-recs-interface';
import {randomID} from '../../../utils/utils';
import {ResultListCommon} from '../../common/result-list/result-list-common';

/**
 * @internal
 */
@Component({
  tag: 'atomic-recs-list',
  shadow: true,
})
export class AtomicRecsList {
  @InitializeBindings() public bindings!: RecsBindings;
  public recommendationList!: RecommendationList;
  @Element() public host!: HTMLDivElement;

  @State() public error!: Error;
  @State() public ready = false;
  @State() public templateHasError = false;
  @BindStateToController('recommendationList')
  @State()
  public recommendationListState!: RecommendationListState;
  public resultListCommon?: ResultListCommon<RecsBindings>;
  private loadingFlag = randomID('firstRecommendationLoaded-');

  public async initialize() {
    this.recommendationList = buildRecommendationList(this.bindings.engine);

    this.resultListCommon = new ResultListCommon({
      host: this.host,
      bindings: this.bindings,
      templateElements: this.host.querySelectorAll('atomic-result-template'),
      onReady: () => {
        this.ready = true;
      },
      onError: () => {
        this.templateHasError = true;
      },
      loadingFlag: this.loadingFlag,
    });

    await this.recommendationList.refresh();
  }

  public getContentOfResultTemplate(
    result: Result
  ): HTMLElement | DocumentFragment {
    return this.resultListCommon!.getContentOfResultTemplate(result);
  }

  render() {
    return this.resultListCommon?.renderList({
      ready: this.ready,
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
