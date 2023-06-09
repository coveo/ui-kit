// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';
import LOCALE from '@salesforce/i18n/locale';
import TIMEZONE from '@salesforce/i18n/timeZone';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  setInitializedCallback,
  HeadlessBundleNames
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").RecommendationEngine} RecommendationEngine */
/** @typedef {import("coveo").RecommendationEngineOptions} RecommendationEngineOptions */

export default class QuanticRecommendationInterface extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The search interface [search hub](https://docs.coveo.com/en/1342/).
   * @api
   * @type {string}
   * @defaultValue 'default'
   */
  @api searchHub = 'default';
  /**
   * The search interface [query pipeline](https://docs.coveo.com/en/180/).
   * @api
   * @type {string}
   * @defaultValue `undefined`
   */
  @api pipeline;

  /** @type {RecommendationEngineOptions} */
  engineOptions;

  /** @type {boolean} */
  initialized = false;

  /** @type {boolean} */
  hasRendered = false;

  connectedCallback() {
    loadDependencies(this, HeadlessBundleNames.recommendation).then(() => {
      if (!getHeadlessBindings(this.engineId)?.engine) {
        getHeadlessConfiguration().then((data) => {
          if (data) {
            this.engineOptions = {
              configuration: {
                ...JSON.parse(data),
                search: {
                  searchHub: this.searchHub,
                  pipeline: this.pipeline,
                  locale: LOCALE,
                  timezone: TIMEZONE,
                },
              },
            };
            setEngineOptions(
              this.engineOptions,
              CoveoHeadlessRecommendation.buildRecommendationEngine,
              this.engineId,
              this,
              CoveoHeadlessRecommendation
            );
            setInitializedCallback(this.initialize, this.engineId);
          }
        });
      } else {
        setInitializedCallback(this.initialize, this.engineId);
      }
    });
  }

  /**
   */
  initialize = (engine) => {
    if (this.initialized) {
      return;
    }
    this.actions = {
      ...CoveoHeadlessRecommendation.loadRecommendationActions(engine),
    }
    engine.dispatch(this.actions.getRecommendations());
    this.initialized = true;
  };
}
