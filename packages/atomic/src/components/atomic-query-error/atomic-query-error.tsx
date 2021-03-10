import {Component, h, State} from '@stencil/core';
import {QueryError, QueryErrorState, buildQueryError} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

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
    tryAgain: () => this.bindings.i18n.t('tryAgain'),
  };
  @BindStateToController('queryError')
  @State()
  private queryErrorState!: QueryErrorState;
  @State() public error!: Error;

  public initialize() {
    this.queryError = buildQueryError(this.bindings.engine);
  }

  private renderShowMoreInfo() {
    return <code>{JSON.stringify(this.queryErrorState.error)}</code>;
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
      link = 'https://docs.coveo.com/'; // TODO: update website
      showMoreInfo = false;
    }
    if (errorType === 'InvalidTokenException') {
      title = this.strings.cannotAccess();
      description = this.strings.invalidToken();
      link = 'https://docs.coveo.com/'; // TODO: update website
      showMoreInfo = false;
    }

    return (
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        {link && <a href={link}>{this.strings.coveoOnlineHelp()}</a>}
        {showMoreInfo && this.renderShowMoreInfo()}
      </div>
    );
  }
}
