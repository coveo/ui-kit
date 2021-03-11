import {Component, h, State} from '@stencil/core';
import {QueryError, QueryErrorState, buildQueryError} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

/**
 * The QueryError component takes care of handling fatal error when doing a query on the index / Search API.
 *
 * When the error is known, it displays a relevant documentation link for debugging purposes. When the error is unknown,
 * it displays a small text area with the JSON content of the error.
 *
 * @part title - The title of the error.
 * @part description - A description of the error.
 * @part doc-link - A relevant documentation link.
 * @part more-info-btn - The button allowing to display error information.
 * @part error-info - The additional error information.
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
    noEndpoints: () => this.bindings.i18n.t('noEndpoints'),
    invalidToken: () => this.bindings.i18n.t('invalidToken'),
    addSources: () => this.bindings.i18n.t('addSources'),
    coveoOnlineHelp: () => this.bindings.i18n.t('coveoOnlineHelp'),
    cannotAccess: () => this.bindings.i18n.t('cannotAccess'),
    somethingWentWrong: () => this.bindings.i18n.t('somethingWentWrong'),
    ifProblemPersists: () => this.bindings.i18n.t('ifProblemPersists'),
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

  public render() {
    if (!this.queryErrorState.hasError) {
      return;
    }

    let title = this.strings.somethingWentWrong();
    let description = this.strings.ifProblemPersists();
    let link: string | undefined;
    let showMoreInfo = true;

    const errorType = this.queryErrorState.error!.type;
    if (errorType === 'NoEndpointsException') {
      title = this.strings.noEndpoints();
      description = this.strings.addSources();
      link = 'https://docs.coveo.com/'; // TODO: update link
      showMoreInfo = false;
    }
    if (errorType === 'InvalidTokenException') {
      title = this.strings.cannotAccess();
      description = this.strings.invalidToken();
      link = 'https://docs.coveo.com/'; // TODO: update link
      showMoreInfo = false;
    }

    return (
      <div class="text-center">
        <h3 part="title" class="text-2xl text-secondary my-4">
          {title}
        </h3>
        <p part="description" class="text-xl text-secondary my-4">
          {description}
        </p>
        {link && (
          <a
            href={link}
            part="doc-link"
            class="text-primary hover:underline visited:text-visited"
          >
            {this.strings.coveoOnlineHelp()}
          </a>
        )}
        {showMoreInfo && this.renderShowMoreInfo()}
      </div>
    );
  }
}
