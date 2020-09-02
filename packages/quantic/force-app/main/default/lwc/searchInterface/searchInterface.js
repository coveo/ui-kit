// @ts-check
import {LightningElement, api} from 'lwc';
import HeadlessPath from '@salesforce/resourceUrl/coveoheadless';
// @ts-ignore
import {loadScript} from 'lightning/platformResourceLoader';

export default class SearchInterface extends LightningElement {
  /** @type {any} */
  @api flexipageRegionWidth;

  /** @type {import("coveo").HeadlessEngine<any>} */
  engine;

  /** @type {string} */
  @api organizationId;
  /** @type {string} */
  @api accessToken;
  /** @type {boolean} */
  @api sample = false;
  /** @type {() => Promise<string>} */
  @api renewAccessToken;

  /** @type {boolean} */
  initialized = false;

  hangingComponents = [];

  connectedCallback() {
    if (this.initialized) {
      return;
    }

    /**
     * @param {any} e
     */
    loadScript(this, HeadlessPath + '/browser/headless.js')
      .then(() => this.initialize())
      .catch((e) => {
        console.error(e);
      });
  }

  initialize() {
    this.initialized = true;
    this.engine = new CoveoHeadless.HeadlessEngine({
      configuration: this.configuration,
      reducers: CoveoHeadless.searchPageReducers,
    });
    this.initializeComponents();

    this.engine.dispatch(
      CoveoHeadless.SearchActions.executeSearch(
        CoveoHeadless.AnalyticsActions.logInterfaceLoad()
      )
    );
  }

  get configuration() {
    if (this.sample) {
      if (this.organizationId || this.accessToken) {
        console.warn(
          'You have a conflicting configuration on the Search Interface component.',
          'When the sample prop is defined, the access-token and organization-id should not be defined and will be ignored.'
        );
      }
      return CoveoHeadless.HeadlessEngine.getSampleConfiguration();
    }

    return {
      accessToken: this.accessToken,
      organizationId: this.organizationId,
      renewAccessToken: this.renewAccessToken,
    };
  }

  initializeComponents() {
    this.hangingComponents.forEach((component) =>
      component.initialize(this.engine)
    );
    this.hangingComponents = [];
  }

  handleInitialization(event) {
    event.stopPropagation();

    if (this.engine) {
      event.detail.initialize(this.engine);
      return;
    }

    this.hangingComponents.push(event.detail);
  }
}
