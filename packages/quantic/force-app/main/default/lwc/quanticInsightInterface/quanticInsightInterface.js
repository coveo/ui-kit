import {LightningElement, api} from 'lwc';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  setInitializedCallback,
  HeadlessBundleNames,
} from 'c/quanticHeadlessLoader';

// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';

/** @typedef {import("coveo").InsightEngine} InsightEngine */
/** @typedef {import("coveo").InsightEngineOptions} InsightEngineOptions */

export default class QuanticInsightInterface extends LightningElement {
  /**
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * @api
   * @type {string}
   */
  @api insightId;

  /** @type {InsightEngineOptions} */
  engineOptions;

  // unsubscribeUpdateState;

  connectedCallback() {
    loadDependencies(this, HeadlessBundleNames.insight).then((headless) => {
      if (!getHeadlessBindings(this.engineId)?.engine) {
        getHeadlessConfiguration().then((data) => {
          if (data) {
            this.engineOptions = {
              configuration: {
                ...JSON.parse(data),
                insightId: this.insightId,
              },
            };
            setEngineOptions(
              this.engineOptions,
              headless.buildInsightEngine,
              this.engineId,
              this,
              headless
            );
            setInitializedCallback(this.initialize, this.engineId);
          }
        });
      } else {
        setInitializedCallback(this.initialize, this.engineId);
      }
    });
  }

  initialize = (engine) => {
    this.engine = engine;

    this.engine.executeFirstSearch();
  };
}
