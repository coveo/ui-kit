import {
  QueryError,
  QueryErrorState,
  buildQueryError,
  getOrganizationEndpoint,
} from '@coveo/headless/insight';
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
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import {QueryErrorLink} from '../../common/query-error/stencil-link';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-query-error',
  styleUrl: 'atomic-insight-query-error.pcss',
  shadow: true,
})
export class AtomicQueryError
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public queryError!: QueryError;

  @BindStateToController('queryError')
  @State()
  private queryErrorState!: QueryErrorState;
  @State() public error!: Error;
  @State() showMoreInfo = false;

  @AriaLiveRegion('query-error')
  protected ariaMessage!: string;

  public initialize() {
    this.queryError = buildQueryError(this.bindings.engine);
  }

  public render() {
    const {hasError, error} = this.queryErrorState;
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
