import {LightningElement, api} from 'lwc';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  setInitializedCallback
} from 'c/quanticHeadlessLoader';
// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';

/** @typedef {import("coveo").CaseAssistEngine} CaseAssistEngine */
/** @typedef {import("coveo").CaseAssistEngineOptions} CaseAssistEngineOptions */

/**
 * The `QuanticCaseAssistInterface` component handles the headless case assist engine.
 * A single instance should be used for each instance of the Coveo Headless case assist engine.
 *
 * @example
 * <c-quantic-case-assist-interface engine-id={engineId} case-assist-id={caseAssistId}></c-quantic-case-assist-interface>
 */
export default class QuanticSearchInterface extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  /**
   * The ID of Case Assist configuration.
   * @api
   * @type {string}
   */
  @api caseAssistId;

  /** @type {CaseAssistEngineOptions} */
  engineOptions;

  connectedCallback() {
    loadDependencies(this, 'case-assist').then(() => {
      if (!getHeadlessBindings(this.engineId).engine) {
        getHeadlessConfiguration().then((data) => {
          if (data) {
            this.engineOptions = {
              configuration: {
                ...JSON.parse(data),
                caseAssistId: this.caseAssistId,
              },
            };
            setEngineOptions(
              this.engineOptions,
              CoveoHeadlessCaseAssist.buildCaseAssistEngine,
              this.engineId,
              this
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
   * @param {CaseAssistEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    this.actions = {
      ...CoveoHeadlessCaseAssist.loadCaseAssistAnalyticsActions(engine),
    };
    this.engine.dispatch(this.actions.logCaseStart());
  };
}
