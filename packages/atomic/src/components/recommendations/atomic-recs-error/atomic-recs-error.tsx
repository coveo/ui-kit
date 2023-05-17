import {
  buildRecommendationList,
  RecommendationList,
  RecommendationListState,
} from '@coveo/headless/recommendation';
import {Component, h, State} from '@stencil/core';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {QueryErrorCommon} from '../../common/query-error/query-error-common';
import {RecsBindings} from '../atomic-recs-interface/atomic-recs-interface';

/**
 * The `atomic-recs-error` component handles fatal errors when performing a recommendations request on the index or Search API. When the error is known, it displays a link to relevant documentation link for debugging purposes. When the error is unknown, it displays a small text area with the JSON content of the error.
 *
 * @part icon - The svg related to the error.
 * @part title - The title of the error.
 * @part description - A description of the error.
 * @part doc-link - A link to the relevant documentation.
 * @part more-info-btn - A button to request additional error information.
 * @part error-info - Additional error information.
 */
@Component({
  tag: 'atomic-recs-error',
  styleUrl: 'atomic-recs-error.pcss',
  shadow: true,
})
export class AtomicRecsError implements InitializableComponent<RecsBindings> {
  @InitializeBindings() public bindings!: RecsBindings;
  public recommendationList!: RecommendationList;

  @BindStateToController('recommendationList')
  @State()
  public recommendationListState!: RecommendationListState;
  @State() public error!: Error;
  @State() showMoreInfo = false;

  @AriaLiveRegion('recs-error')
  protected ariaMessage!: string;

  public initialize() {
    this.recommendationList = buildRecommendationList(this.bindings.engine);
  }

  public render() {
    return (
      <QueryErrorCommon
        bindings={this.bindings}
        onShowMoreInfo={() => true}
        queryErrorState={{
          error: this.recommendationListState.error,
          hasError: !!this.recommendationListState.error,
        }}
        setAriaLive={(msg) => (this.ariaMessage = msg)}
        showMoreInfo={this.showMoreInfo}
      />
    );
  }
}
