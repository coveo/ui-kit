import {isNullOrUndefined} from '@coveo/bueno';
import {
  buildRecommendationList,
  getOrganizationEndpoint,
  RecommendationList,
  RecommendationListState,
} from '@coveo/headless/recommendation';
import {Component, h, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AriaLiveRegion} from '../../../utils/stencil-accessibility-utils';
import {QueryErrorDetails} from '../../common/query-error/stencil-details';
import {QueryErrorIcon} from '../../common/query-error/stencil-icon';
import {QueryErrorShowMore} from '../../common/query-error/stencil-show-more';
import {QueryErrorContainer} from '../../common/query-error/stencil-container';
import {QueryErrorDescription} from '../../common/query-error/stencil-description';
import {QueryErrorGuard} from '../../common/query-error/stencil-guard';
import {QueryErrorTitle} from '../../common/query-error/stencil-title';
import {getAriaMessageFromErrorType} from '../../common/query-error/utils';
import {RecsBindings} from '../atomic-recs-interface/atomic-recs-interface';
import {QueryErrorLink} from '../../common/query-error/stencil-link';

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
    const {error} = this.recommendationListState;

    const {
      bindings: {
        i18n,
        engine: {
          state: {
            configuration: {organizationId, environment},
          },
        },
      },
    } = this;
    const url = getOrganizationEndpoint(organizationId, environment);
    const hasError = !isNullOrUndefined(error);

    if (hasError) {
      this.ariaMessage = getAriaMessageFromErrorType(
        i18n,
        organizationId,
        url,
        error?.type
      );
    }

    return (
      <QueryErrorGuard hasError={hasError}>
        <QueryErrorContainer>
          <QueryErrorIcon errorType={error?.type} />
          <QueryErrorTitle i18n={i18n} organizationId={organizationId} />
          <QueryErrorDescription
            i18n={i18n}
            organizationId={organizationId}
            url={url}
          />
          <QueryErrorShowMore
            link={<QueryErrorLink i18n={i18n} errorType={error?.type} />}
            onShowMore={() => (this.showMoreInfo = !this.showMoreInfo)}
            i18n={i18n}
          />
          <QueryErrorDetails error={error} show={this.showMoreInfo} />
        </QueryErrorContainer>
      </QueryErrorGuard>
    );
  }
}
