import {LightningElement, api} from 'lwc';

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
    console.log('connectedCallback')
  }

  /**
   * @param {import("coveo").HeadlessConfigurationOptions} options
   */
  @api initialize(options) {
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
