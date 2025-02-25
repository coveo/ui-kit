import {
  QueryError,
  QueryErrorState,
  buildQueryError,
  getOrganizationEndpoint,
} from '@coveo/headless';
import {Component, h, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AriaLiveRegion} from '../../../utils/stencil-accessibility-utils';
import {QueryErrorContainer} from '../../common/query-error/container';
import {QueryErrorDescription} from '../../common/query-error/description';
import {QueryErrorDetails} from '../../common/query-error/details';
import {QueryErrorGuard} from '../../common/query-error/guard';
import {QueryErrorIcon} from '../../common/query-error/icon';
import {QueryErrorLink} from '../../common/query-error/link';
import {QueryErrorShowMore} from '../../common/query-error/show-more';
import {QueryErrorTitle} from '../../common/query-error/title';
import {getAriaMessageFromErrorType} from '../../common/query-error/utils';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-query-error` component handles fatal errors when performing a query on the index or Search API. When the error is known, it displays a link to relevant documentation link for debugging purposes. When the error is unknown, it displays a small text area with the JSON content of the error.
 *
 * @part icon - The svg related to the error.
 * @part title - The title of the error.
 * @part description - A description of the error.
 * @part doc-link - A link to the relevant documentation.
 * @part more-info-btn - A button to request additional error information.
 * @part error-info - Additional error information.
 */
@Component({
  tag: 'atomic-query-error',
  styleUrl: 'atomic-query-error.pcss',
  shadow: true,
})
export class AtomicQueryError implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
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
          <QueryErrorTitle
            errorType={error?.type}
            i18n={i18n}
            organizationId={organizationId}
          />
          <QueryErrorDescription
            i18n={i18n}
            organizationId={organizationId}
            url={url}
            errorType={error?.type}
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
