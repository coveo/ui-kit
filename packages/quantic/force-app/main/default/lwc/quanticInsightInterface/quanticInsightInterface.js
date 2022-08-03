import {LightningElement, api} from 'lwc';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  HeadlessBundleNames,
} from 'c/quanticHeadlessLoader';

// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/InsightController.getHeadlessConfiguration';

/** @typedef {import("coveo").InsightEngine} InsightEngine */
/** @typedef {import("coveo").InsightEngineOptions} InsightEngineOptions */

/**
 * The `QuanticInsightInterface` component handles the headless insight engine configuration.
 * A single instance should be used for each instance of the Coveo Headless insight engine.
 * @category Insight Panel
 * @example
 * <c-quantic-insight-interface engine-id={engineId} insight-id={insightId}></c-quantic-insight-interface>
 */
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
          }
        });
      }
    });
  }
}
