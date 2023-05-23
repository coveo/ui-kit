import {LightningElement, api} from 'lwc';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  HeadlessBundleNames,
  destroyEngine,
  setInitializedCallback,
} from 'c/quanticHeadlessLoader';

// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/InsightController.getHeadlessConfiguration';

/** @typedef {import("coveo").InsightEngine} InsightEngine */
/** @typedef {import("coveo").InsightEngineOptions} InsightEngineOptions */

/**
 * The `QuanticInsightInterface` component handles the headless insight engine configuration.
 * A single instance should be used for each instance of the Coveo Headless insight engine.
 * @fires CustomEvent#quantic__insightinterfaceinitialized
 * @category Insight Panel
 * @example
 * <c-quantic-insight-interface engine-id={engineId} insight-id={insightId}></c-quantic-insight-interface>
 */
export default class QuanticInsightInterface extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The ID of the Insight Panel configuration to use.
   * @api
   * @type {string}
   */
  @api insightId;

  /** @type {InsightEngineOptions} */
  engineOptions;
  /** @type {boolean} */
  initialized;

  disconnectedCallback() {
    destroyEngine(this.engineId);
  }

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
            this.input.setAttribute('is-initialized', 'true');
            setInitializedCallback(this.initialize, this.engineId);
          }
        });
      }
    });
  }

  initialize = () => {
    if (this.initialized) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent(`quantic__insightinterfaceinitialized`, {
        detail: {
          engineId: this.engineId,
          insightId: this.insightId,
        },
        bubbles: true,
        composed: true,
      })
    );
    this.initialized = true;
  };

  /**
   * @returns {HTMLInputElement}
   */
  get input() {
    return this.template.querySelector('input');
  }
}
