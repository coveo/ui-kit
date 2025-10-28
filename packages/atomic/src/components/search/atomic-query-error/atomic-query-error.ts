import {
  buildQueryError,
  getOrganizationEndpoint,
  type QueryError,
  type QueryErrorState,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {AriaLiveRegionController} from '../../../utils/accessibility-utils';
import {renderQueryErrorContainer} from '../../common/query-error/container';
import {renderQueryErrorDescription} from '../../common/query-error/description';
import {renderQueryErrorDetails} from '../../common/query-error/details';
import {renderQueryErrorIcon} from '../../common/query-error/icon';
import {renderQueryErrorLink} from '../../common/query-error/link';
import {renderQueryErrorShowMore} from '../../common/query-error/show-more';
import {renderQueryErrorTitle} from '../../common/query-error/title';
import {getAriaMessageFromErrorType} from '../../common/query-error/utils';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';

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
@customElement('atomic-query-error')
@bindings()
@withTailwindStyles
export class AtomicQueryError
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @bindStateToController('queryError')
  @state()
  private queryErrorState!: QueryErrorState;

  protected ariaMessage = new AriaLiveRegionController(this, 'query-error');

  @state() public bindings!: Bindings;
  public queryError!: QueryError;
  @state() public error!: Error;
  @state() showMoreInfo = false;

  public initialize() {
    this.queryError = buildQueryError(this.bindings.engine);
  }

  @errorGuard()
  @bindingGuard()
  render() {
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
    'atomic-query-error': AtomicQueryError;
  }
}
