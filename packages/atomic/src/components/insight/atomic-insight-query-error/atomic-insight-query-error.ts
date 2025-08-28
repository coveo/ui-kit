import {
  buildQueryError,
  getOrganizationEndpoint,
  type QueryError,
  type QueryErrorState,
} from '@coveo/headless/insight';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {bindStateToController} from '../../../decorators/bind-state';
import {bindings} from '../../../decorators/bindings.js';
import type {InitializableComponent} from '../../../decorators/types';
import {withTailwindStyles} from '../../../decorators/with-tailwind-styles.js';
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
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@customElement('atomic-insight-query-error')
@bindings()
@withTailwindStyles
export class AtomicInsightQueryError
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state()
  bindings!: InsightBindings;

  public queryError!: QueryError;

  @bindStateToController('queryError')
  @state()
  private queryErrorState!: QueryErrorState;

  @state() public error!: Error;
  @state() showMoreInfo = false;

  protected ariaLiveRegion = new AriaLiveRegionController(this, 'query-error');

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
      this.ariaLiveRegion.message = getAriaMessageFromErrorType(
        i18n,
        organizationId,
        url,
        error?.type
      );
    }
    return html`${renderQueryErrorGuard(
      {hasError},
      () => html`
        ${renderQueryErrorContainer()(html`
          ${renderQueryErrorIcon({props: {errorType: error?.type}})}
          ${renderQueryErrorTitle({props: {i18n, organizationId, errorType: error?.type}})}
          ${renderQueryErrorDescription({
            props: {i18n, organizationId, url, errorType: error?.type},
          })}
          ${renderQueryErrorShowMore({
            props: {
              link: renderQueryErrorLink({
                props: {i18n, errorType: error?.type},
              }),
              onShowMore: () => {
                this.showMoreInfo = !this.showMoreInfo;
              },
              i18n,
            },
          })}
          ${renderQueryErrorDetails({props: {error, show: this.showMoreInfo}})}
        `)}
      `
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-query-error': AtomicInsightQueryError;
  }
}
