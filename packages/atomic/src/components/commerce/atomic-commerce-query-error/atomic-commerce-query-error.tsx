import {isNullOrUndefined} from '@coveo/bueno';
import {
  Search,
  ProductListing,
  SearchState,
  ProductListingState,
  buildProductListing,
  buildSearch,
  getCommerceApiBaseUrl,
} from '@coveo/headless/commerce';
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
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-query-error` component handles fatal errors when performing a query on the Commerce API. When the error is known, it displays a link to relevant documentation for debugging purposes. When the error is unknown, it displays a small text area with the JSON content of the error.
 *
 * @part icon - The SVG related to the error.
 * @part title - The title of the error.
 * @part description - A description of the error.
 * @part doc-link - A link to the relevant documentation.
 * @part more-info-btn - A button to request additional error information.
 * @part error-info - Additional error information.
 *
 * @alpha
 */
@Component({
  tag: 'atomic-commerce-query-error',
  styleUrl: 'atomic-commerce-query-error.pcss',
  shadow: true,
})
export class AtomicQueryError
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  public searchOrListing!: Search | ProductListing;

  @BindStateToController('searchOrListing')
  @State()
  private searchOrListingState!: SearchState | ProductListingState;
  @State() public error!: Error;
  @State() showMoreInfo = false;

  @AriaLiveRegion('commerce-query-error')
  protected ariaMessage!: string;

  public initialize() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.searchOrListing = buildProductListing(this.bindings.engine);
    } else {
      this.searchOrListing = buildSearch(this.bindings.engine);
    }
  }

  public render() {
    const {error} = this.searchOrListingState;

    const {
      bindings: {
        i18n,
        engine: {
          configuration: {organizationId, environment, commerce},
        },
      },
    } = this;

    const url =
      commerce.apiBaseUrl ?? getCommerceApiBaseUrl(organizationId, environment);

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
