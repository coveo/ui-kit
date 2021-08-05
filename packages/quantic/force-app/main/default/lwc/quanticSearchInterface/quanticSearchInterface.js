import {LightningElement, api} from 'lwc';
import {loadDependencies, setEngineOptions, setInitializedCallback} from 'c/quanticHeadlessLoader';
// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';

export default class QuanticSearchInterface extends LightningElement {
  /** @type {any} */
  @api flexipageRegionWidth;

  /** @type {string} */
  @api searchHub = 'default';

  /** @type {string} */
  @api pipeline = 'default';

  /** @type {boolean} */
  @api disableStateInUrl = false;

  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").SearchEngineOptions} */
  engineOptions;

  /** @type {import("coveo").UrlManager} */
  urlManager;

  /** @type {import("coveo").Unsubscribe} */
  unsubscribeUrlManager;

  connectedCallback() {
    loadDependencies(this).then((CoveoHeadless) => {
      getHeadlessConfiguration().then((data) => {
        if (data) {
          this.engineOptions = {
            configuration: {
              ...JSON.parse(data),
              search: {
                searchHub: this.searchHub,
                pipeline: this.pipeline
              }
            }
          };
          setEngineOptions(this.engineOptions, CoveoHeadless.buildSearchEngine, this.engineId, this);
          setInitializedCallback(this.initialize, this.engineId);
        }
      });
    });
  }

  disconnectedCallback() {
    if (this.unsubscribeUrlManager) {
      this.unsubscribeUrlManager();
    }
  }
 
  initialize = (engine) => {
    if (!this.disableStateInUrl) {
      this.initUrlManager(engine);
    }
    engine.executeFirstSearch();
  }

  get fragment() {
    return window.location.hash.slice(1);
  }

  initUrlManager(engine) {
    this.urlManager = CoveoHeadless.buildUrlManager(engine, {initialState: {fragment: this.fragment}});
    this.unsubscribeUrlManager = this.urlManager.subscribe(() => this.updateHash());
    window.addEventListener('hashchange', this.onHashChange);
  }

  updateHash() {
    window.history.pushState(
      null,
      document.title,
      `#${this.urlManager.state.fragment}`
    );
  }

  onHashChange() {
    this.urlManager.synchronize(this.fragment);
  }
}