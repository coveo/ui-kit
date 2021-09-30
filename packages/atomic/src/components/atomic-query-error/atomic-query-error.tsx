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

const disconnectedException = 'Disconnected';
const noEndpointsException = 'NoEndpointsException';
const invalidTokenException = 'InvalidTokenException';
const organizationIsPausedException = 'OrganizationIsPausedException';

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

  private get errorType() {
    return this.queryErrorState.error!.type;
  }

  private get icon() {
    switch (this.errorType) {
      case disconnectedException:
        return NoConnection;
      case noEndpointsException:
        return Indexing;
      case invalidTokenException:
        return CannotAccess;
      case organizationIsPausedException:
        return SearchInactive;
      default:
        return SomethingWrong;
    }
  }

  private get title() {
    switch (this.errorType) {
      case disconnectedException:
        return this.bindings.i18n.t('disconnected');
      case noEndpointsException:
        return this.bindings.i18n.t('no-endpoints', {org: this.org});
      case invalidTokenException:
        return this.bindings.i18n.t('cannot-access', {org: this.org});
      case organizationIsPausedException:
        return this.bindings.i18n.t('organization-is-paused', {org: this.org});
      default:
        return this.bindings.i18n.t('something-went-wrong');
    }
  }

  private get description() {
    switch (this.errorType) {
      case disconnectedException:
        return this.bindings.i18n.t('check-your-connection');
      case noEndpointsException:
        return this.bindings.i18n.t('add-sources');
      case invalidTokenException:
        return this.bindings.i18n.t('invalid-token');
      case organizationIsPausedException:
        return this.bindings.i18n.t('organization-will-resume', {
          org: this.org,
        });
      default:
        return this.bindings.i18n.t('if-problem-persists');
    }
  }

  private get link() {
    switch (this.errorType) {
      case noEndpointsException:
        return 'https://docs.coveo.com/'; // TODO: KIT-1061 update link
      case invalidTokenException:
        return 'https://docs.coveo.com/'; // TODO: KIT-1061 update link
      case organizationIsPausedException:
        return 'https://docs.coveo.com/l6af0467';
      default:
        return null;
    }
  }

  public render() {
    if (!this.queryErrorState.hasError) {
      return;
    }

    return (
      <div class="text-center">
        <atomic-icon
          part="icon"
          icon={this.icon}
          class="w-1/2 mt-8"
        ></atomic-icon>
        <h3 part="title" class="text-2xl text-on-background mt-8">
          {this.title}
        </h3>
        <p part="description" class="text-lg text-neutral-dark mt-2.5">
          {this.description}
        </p>
        {this.link ? (
          <a
            href={this.link}
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
