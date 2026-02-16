import {
  buildRecommendationList,
  getOrganizationEndpoint,
  type RecommendationList,
  type RecommendationListState,
} from '@coveo/headless/recommendation';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
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
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import type {RecsBindings} from '../atomic-recs-interface/atomic-recs-interface';

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
@customElement('atomic-recs-error')
@bindings()
@withTailwindStyles
export class AtomicRecsError
  extends LitElement
  implements InitializableComponent<RecsBindings>
{
  @bindStateToController('recommendationList')
  @state()
  private recommendationListState!: RecommendationListState;

  protected ariaMessage = new AriaLiveRegionController(this, 'recs-error');

  @state() public bindings!: RecsBindings;
  public recommendationList!: RecommendationList;
  @state() public error!: Error;
  @state() public showMoreInfo = false;

  public initialize() {
    this.recommendationList = buildRecommendationList(this.bindings.engine);
  }

  @errorGuard()
  @bindingGuard()
  render() {
    const {error} = this.recommendationListState;
    const hasError = error !== null && error !== undefined;
    const i18n = this.bindings.i18n;
    const {organizationId, environment} =
      this.bindings.engine.state.configuration;
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
    'atomic-recs-error': AtomicRecsError;
  }
}
