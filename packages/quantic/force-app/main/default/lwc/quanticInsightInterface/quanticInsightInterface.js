import {LightningElement, api} from 'lwc';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  setInitializedCallback,
  HeadlessBundleNames,
} from 'c/quanticHeadlessLoader';

// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/InsightController.getHeadlessConfiguration';

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

  connectedCallback() {
    loadDependencies(this, HeadlessBundleNames.insight).then(() => {
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
              CoveoHeadlessInsight.buildInsightEngine,
              this.engineId,
              this,
              CoveoHeadlessInsight
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
  };
}
