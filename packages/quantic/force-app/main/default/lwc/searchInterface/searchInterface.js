import {LightningElement, api} from 'lwc';
// @ts-ignore
import {getHeadlessEngine} from 'c/headlessLoader';

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
  dependenciesLoaded = false;

  /** @type {any[]} */
  hangingComponents = [];

  /** @type {import("coveo").HeadlessConfigurationOptions} */
  config;

  connectedCallback() {
    if (this.dependenciesLoaded) {
      return;
    }

    try {
      getHeadlessEngine(this).then((engine) => {
        this.engine = engine;
        this.dependenciesLoaded = Boolean(this.engine);
        this.initHangingComponents();
      });
    } catch (error) {
      console.error('Fatal error: unable to initialize interface', error);
    }
  }

  /**
   * @param {import("coveo").HeadlessConfigurationOptions} options
   */
  @api async initialize(options) {
    if (this.config || this.sample) {
      console.error(
        'The Quantic search interface has already been initialized',
        this
      );
      return;
    }

    this.config = {
      ...options,
      search: {
        searchHub: this.searchHub,
        pipeline: this.pipeline,
      },
    };

    if (!this.dependenciesLoaded) {
      try {
        this.engine = await getHeadlessEngine(this);
        this.dependenciesLoaded = Boolean(this.engine);
      } catch (error) {
        console.error('Fatal error: unable to initialize interface', error);
      }
    }

    if (this.dependenciesLoaded) {
      this.initHangingComponents();
    }
  }

  initHangingComponents() {
    this.hangingComponents.forEach((component) =>{
      component.initialize(this.engine)
    });
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
