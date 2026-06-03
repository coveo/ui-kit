import {isNullOrUndefined} from '@coveo/bueno';
import {
  buildProductListing,
  buildSearch,
  getCommerceApiBaseUrl,
  type ProductListing,
  type ProductListingState,
  type Search,
  type SearchState,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import type {CommerceBindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {renderQueryErrorContainer} from '@/src/components/common/query-error/container';
import {renderQueryErrorDescription} from '@/src/components/common/query-error/description';
import {renderQueryErrorDetails} from '@/src/components/common/query-error/details';
import {renderQueryErrorIcon} from '@/src/components/common/query-error/icon';
import {renderQueryErrorLink} from '@/src/components/common/query-error/link';
import {renderQueryErrorShowMore} from '@/src/components/common/query-error/show-more';
import {renderQueryErrorTitle} from '@/src/components/common/query-error/title';
import {getAriaMessageFromErrorType} from '@/src/components/common/query-error/utils';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';

/**
 * The `atomic-commerce-query-error` component handles fatal errors when performing a query on the Commerce API. When the error is known, it displays a link to relevant documentation for debugging purposes. When the error is unknown, it displays a small text area with the JSON content of the error.
 *
 * @part icon - The SVG related to the error.
 * @part title - The title of the error.
 * @part description - A description of the error.
 * @part doc-link - A link to the relevant documentation.
 * @part more-info-btn - A button to request additional error information.
 * @part error-info - Additional error information.
 */
@customElement('atomic-commerce-query-error')
@bindings()
@withTailwindStyles
export class AtomicCommerceQueryError
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;

  public searchOrListing!: Search | ProductListing;

  @bindStateToController('searchOrListing')
  @state()
  private searchOrListingState!: SearchState | ProductListingState;

  @state() public error!: Error;
  @state() showMoreInfo = false;

  protected ariaMessage = new AriaLiveRegionController(
    this,
    'commerce-query-error'
  );

  public initialize() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.searchOrListing = buildProductListing(this.bindings.engine);
    } else {
      this.searchOrListing = buildSearch(this.bindings.engine);
    }
  }

  @errorGuard()
  @bindingGuard()
  render() {
    const {error} = this.searchOrListingState;

    const i18n = this.bindings.i18n;
    const {organizationId, environment, commerce} =
      this.bindings.engine.configuration;

    const url =
      commerce.apiBaseUrl ?? getCommerceApiBaseUrl(organizationId, environment);

    const hasError = !isNullOrUndefined(error);
    if (hasError) {
      this.ariaMessage.message = getAriaMessageFromErrorType(
        i18n,
        organizationId,
        url,
        error?.type
      );
    }

    const linkResult = renderQueryErrorLink({
      props: {i18n, errorType: error?.type},
    });

    return html`${when(
      hasError,
      () => html`
        ${renderQueryErrorContainer()(html`
          ${renderQueryErrorIcon({props: {errorType: error?.type}})}
          ${renderQueryErrorTitle({
            props: {
              errorType: error?.type,
              i18n,
              organizationId,
            },
          })}
          ${renderQueryErrorDescription({
            props: {
              i18n,
              organizationId,
              url,
              errorType: error?.type,
            },
          })}
          ${renderQueryErrorShowMore({
            props: {
              link: linkResult,
              onShowMore: () => {
                this.showMoreInfo = !this.showMoreInfo;
              },
              i18n,
            },
          })}
          ${renderQueryErrorDetails({
            props: {error, show: this.showMoreInfo},
          })}
        `)}
      `
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-query-error': AtomicCommerceQueryError;
  }
}
