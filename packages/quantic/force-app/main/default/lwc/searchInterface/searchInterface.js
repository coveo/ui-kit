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

  /** @type {boolean} */
  @api sample = false;

  /** @type {string} */
  @api searchHub = 'default';

  /** @type {string} */
  @api pipeline = 'default';

  /** @type {boolean} */
  headlessLoaded = false;
  
  /** @type {any[]} */
  hangingComponents = [];

  /** @type {import("coveo").HeadlessConfigurationOptions} */
  config;

  connectedCallback() {
    if (this.config) {
      return;
    }

    /**
     * @param {any} e
     */
    loadScript(this, HeadlessPath + '/browser/headless.js')
      .then(() => this.loadHeadless())
      .catch((e) => {
        console.error(e);
      });
  }

  loadHeadless() {
    this.headlessLoaded = true;

    if (this.sample) {
      this.config = CoveoHeadless.HeadlessEngine.getSampleConfiguration();
    }

    this.config && this.initEngine();
  }

  /**
   * @param {import("coveo").HeadlessConfigurationOptions} options
   */
  @api initialize(options) {
    if (this.config || this.sample) {
      console.error('The Quantic search interface has already been initialized', this);
      return;
    }

    this.config = {
      ...options,
      search: {
        searchHub: this.searchHub,
        pipeline: this.pipeline,
      },
    };

    this.headlessLoaded && this.initEngine();
  }

  initEngine() {
    this.engine = new CoveoHeadless.HeadlessEngine({
      configuration: this.config,
      reducers: CoveoHeadless.searchPageReducers,
    });

    this.hangingComponents.forEach((component) =>
      component.initialize(this.engine)
    );
    this.hangingComponents = [];

    this.engine.dispatch(
      CoveoHeadless.SearchActions.executeSearch(
        CoveoHeadless.AnalyticsActions.logInterfaceLoad()
      )
    );
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
