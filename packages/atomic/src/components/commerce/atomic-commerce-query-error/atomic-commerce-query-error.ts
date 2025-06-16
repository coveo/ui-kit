import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
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
import {CSSResultGroup, LitElement, html, unsafeCSS} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {InitializableComponent} from '../../../decorators/types';
import {AriaLiveRegionController} from '../../../utils/accessibility-utils';
import {renderQueryErrorContainer} from '../../common/query-error/container';
import {renderQueryErrorDescription} from '../../common/query-error/description';
import {renderQueryErrorDetails} from '../../common/query-error/details';
import {renderQueryErrorGuard} from '../../common/query-error/guard';
import {renderQueryErrorIcon} from '../../common/query-error/icon';
import {renderQueryErrorLink} from '../../common/query-error/link';
import {renderQueryErrorShowMore} from '../../common/query-error/show-more';
import {renderQueryErrorTitle} from '../../common/query-error/title';
import {getAriaMessageFromErrorType} from '../../common/query-error/utils';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import styles from './atomic-commerce-query-error.tw.css';

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
@customElement('atomic-commerce-query-error')
@bindings()
@withTailwindStyles
export class AtomicCommerceQueryError
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  public bindings!: CommerceBindings;

  static styles: CSSResultGroup = [unsafeCSS(styles)];

  public searchOrListing!: Search | ProductListing;

  @bindStateToController('searchOrListing')
  @state()
  private searchOrListingState!: SearchState | ProductListingState;

  @state() public error!: Error;
  @state() showMoreInfo = false;

  private ariaLiveRegion = new AriaLiveRegionController(
    this,
    'commerce-query-error',
    true
  );

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
      this.ariaLiveRegion.message = getAriaMessageFromErrorType(
        i18n,
        organizationId,
        url,
        error?.type
      );
    }

    return renderQueryErrorGuard({
      props: {hasError},
    })(
      renderQueryErrorContainer({props: {}})(html`
        ${renderQueryErrorIcon({
          props: {errorType: error?.type},
        })}
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
            link: (() => {
              const result = renderQueryErrorLink({
                props: {i18n, errorType: error?.type},
              });
              return typeof result === 'object' && 'values' in result
                ? result
                : undefined;
            })(),
            onShowMore: () => (this.showMoreInfo = !this.showMoreInfo),
            i18n,
          },
        })}
        ${renderQueryErrorDetails({
          props: {error, show: this.showMoreInfo},
        })}
      `)
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-query-error': AtomicCommerceQueryError;
  }
}
