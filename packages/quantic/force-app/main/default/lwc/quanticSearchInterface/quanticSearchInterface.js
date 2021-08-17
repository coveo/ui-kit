import {LightningElement, api} from 'lwc';
import {loadDependencies, setEngineOptions, setInitializedCallback} from 'c/quanticHeadlessLoader';
// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';
// @ts-ignore
import { STANDALONE_SEARCH_BOX_STORAGE_KEY } from 'c/quanticUtils';

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
    window.removeEventListener('hashchange', this.onHashChange);
  }
 
  /**
   * @param {import("coveo").SearchEngine} engine
  */
  initialize = (engine) => {
    if (!this.disableStateInUrl) {
      this.initUrlManager(engine);
    }
    
    const data = window.localStorage.getItem(STANDALONE_SEARCH_BOX_STORAGE_KEY);
    if(data) {
      window.localStorage.removeItem(STANDALONE_SEARCH_BOX_STORAGE_KEY);
      const {analytics} = JSON.parse(data);
      engine.executeFirstSearchAfterStandaloneSearchBoxRedirect(analytics);
    } else {
      engine.executeFirstSearch();
    }
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

  onHashChange = () => {
    this.urlManager.synchronize(this.fragment);
  }
}