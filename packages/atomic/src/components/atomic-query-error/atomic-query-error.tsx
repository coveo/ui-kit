import {Component, h, State} from '@stencil/core';
import {QueryError, QueryErrorState, buildQueryError} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

// TODO: Get type from Headless once the API provides more streamlined errors.
const noEndpointsException = 'NoEndpointsException';
const invalidTokenException = 'InvalidTokenException';

/**
 * The `atomic-query-error` component handles fatal errors when performing a query on the index or Search API. When the error is known, it displays a link to relevant documentation link for debugging purposes. When the error is unknown, it displays a small text area with the JSON content of the error.
 *
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

  @BindStateToI18n()
  @State()
  private strings = {
    noEndpointsTitle: () => this.bindings.i18n.t('noEndpoints'),
    noEndpointsDesc: () => this.bindings.i18n.t('addSources'),
    invalidTokenTitle: () => this.bindings.i18n.t('cannotAccess'),
    invalidTokenDesc: () => this.bindings.i18n.t('invalidToken'),
    genericErrorTitle: () => this.bindings.i18n.t('somethingWentWrong'),
    genericErrorDesc: () => this.bindings.i18n.t('ifProblemPersists'),
    helpLink: () => this.bindings.i18n.t('coveoOnlineHelp'),
    moreInfo: () => this.bindings.i18n.t('moreInfo'),
  };
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
        <button
          part="more-info-btn"
          class="text-primary"
          onClick={() => (this.showMoreInfo = true)}
        >
          {this.strings.moreInfo()}
        </button>
      );
    }

    return (
      <pre
        part="error-info"
        class="text-left border border-divider bg-background-variant p-3 rounded my-4 whitespace-pre-wrap"
      >
        <code>{JSON.stringify(this.queryErrorState.error, null, 2)}</code>
      </pre>
    );
  }

  private get title() {
    switch (this.queryErrorState.error!.type) {
      case noEndpointsException:
        return this.strings.noEndpointsTitle();
      case invalidTokenException:
        return this.strings.invalidTokenTitle();
      default:
        return this.strings.genericErrorTitle();
    }
  }

  private get description() {
    switch (this.queryErrorState.error!.type) {
      case noEndpointsException:
        return this.strings.noEndpointsDesc();
      case invalidTokenException:
        return this.strings.invalidTokenDesc();
      default:
        return this.strings.genericErrorDesc();
    }
  }

  private get link() {
    switch (this.queryErrorState.error!.type) {
      case noEndpointsException:
        return 'https://docs.coveo.com/'; // TODO: update link
      case invalidTokenException:
        return 'https://docs.coveo.com/'; // TODO: update link
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
        <h3 part="title" class="text-2xl text-secondary my-4">
          {this.title}
        </h3>
        <p part="description" class="text-xl text-secondary my-4">
          {this.description}
        </p>
        {this.link ? (
          <a
            href={this.link}
            part="doc-link"
            class="text-primary hover:underline visited:text-visited"
          >
            {this.strings.helpLink()}
          </a>
        ) : (
          this.renderShowMoreInfo()
        )}
      </div>
    );
  }
}
