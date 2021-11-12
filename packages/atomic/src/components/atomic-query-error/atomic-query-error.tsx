import {Component, h, State} from '@stencil/core';
import {QueryError, QueryErrorState, buildQueryError} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {Button} from '../common/button';
import CannotAccess from '../../images/cannot-access.svg';
import SomethingWrong from '../../images/something-wrong.svg';
import SearchInactive from '../../images/search-inactive.svg';
import NoConnection from '../../images/no-connection.svg';
import Indexing from '../../images/indexing.svg';
import {AriaRegion} from '../../utils/accessibility-utils';

const disconnectedException = 'Disconnected';
const noEndpointsException = 'NoEndpointsException';
const invalidTokenException = 'InvalidTokenException';
const organizationIsPausedException = 'OrganizationIsPausedException';

interface QueryErrorDetails {
  icon: string;
  title: string;
  description: string;
  link?: string;
}

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

  @AriaRegion('query-error')
  protected ariaMessage!: string;

  public initialize() {
    this.queryError = buildQueryError(this.bindings.engine);
  }

  private renderShowMoreInfo() {
    if (!this.showMoreInfo) {
      return (
        <Button
          part="more-info-btn"
          style="primary"
          class="p-3 mt-8"
          onClick={() => (this.showMoreInfo = true)}
          text={this.bindings.i18n.t('more-info')}
        ></Button>
      );
    }

    return (
      <pre
        part="error-info"
        class="text-left border border-neutral bg-neutral-light p-3 rounded mt-8 whitespace-pre-wrap"
      >
        <code>{JSON.stringify(this.queryErrorState.error, null, 2)}</code>
      </pre>
    );
  }

  private get org() {
    return this.bindings.engine.state.configuration.organizationId;
  }

  private get url() {
    return this.bindings.engine.state.configuration.platformUrl;
  }

  private get errorType() {
    return this.queryErrorState.error!.type;
  }

  private get details(): QueryErrorDetails {
    switch (this.errorType) {
      case disconnectedException:
        return {
          icon: NoConnection,
          title: this.bindings.i18n.t('disconnected'),
          description: this.bindings.i18n.t('check-your-connection', {
            url: this.url,
            interpolation: {escapeValue: false},
          }),
        };
      case noEndpointsException:
        return {
          icon: Indexing,
          title: this.bindings.i18n.t('no-endpoints', {org: this.org}),
          description: this.bindings.i18n.t('add-sources'),
          link: 'https://docs.coveo.com/', // TODO: KIT-1061 update link
        };
      case invalidTokenException:
        return {
          icon: CannotAccess,
          title: this.bindings.i18n.t('cannot-access', {org: this.org}),
          description: this.bindings.i18n.t('invalid-token'),
          link: 'https://docs.coveo.com/', // TODO: KIT-1061 update link
        };
      case organizationIsPausedException:
        return {
          icon: SearchInactive,
          title: this.bindings.i18n.t('organization-is-paused', {
            org: this.org,
          }),
          description: this.bindings.i18n.t('organization-will-resume', {
            org: this.org,
          }),
          link: 'https://docs.coveo.com/l6af0467',
        };
      default:
        return {
          icon: SomethingWrong,
          title: this.bindings.i18n.t('something-went-wrong'),
          description: this.bindings.i18n.t('if-problem-persists'),
        };
    }
  }

  public render() {
    if (!this.queryErrorState.hasError) {
      return;
    }

    const details = this.details;
    this.ariaMessage = `${details.title} ${details.description}`;

    return (
      <div class="text-center">
        <atomic-icon
          part="icon"
          icon={details.icon}
          class="w-1/2 mt-8"
        ></atomic-icon>
        <h3 part="title" class="text-2xl text-on-background mt-8">
          {details.title}
        </h3>
        <p part="description" class="text-lg text-neutral-dark mt-2.5">
          {details.description}
        </p>
        {details.link ? (
          <a
            href={details.link}
            part="doc-link"
            class="btn-primary p-3 mt-10 inline-block"
          >
            {this.bindings.i18n.t('coveo-online-help')}
          </a>
        ) : (
          this.renderShowMoreInfo()
        )}
      </div>
    );
  }
}
