import {
  QueryError,
  QueryErrorState,
  buildQueryError,
} from '@coveo/headless/insight';
import {Component, h, State} from '@stencil/core';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {QueryErrorContainer} from '../../common/query-error/container';
import {QueryErrorDescription} from '../../common/query-error/description';
import {QueryErrorDetails} from '../../common/query-error/details';
import {QueryErrorGuard} from '../../common/query-error/guard';
import {QueryErrorIcon} from '../../common/query-error/icon';
import {QueryErrorLink} from '../../common/query-error/link';
import {QueryErrorShowMore} from '../../common/query-error/show-more';
import {QueryErrorTitle} from '../../common/query-error/title';
import {getAriaMessageFromErrorType} from '../../common/query-error/utils';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

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
            configuration: {organizationId, platformUrl},
          },
        },
      },
    } = this;
    if (hasError) {
      this.ariaMessage = getAriaMessageFromErrorType(
        i18n,
        organizationId,
        platformUrl,
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
            url={platformUrl}
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
