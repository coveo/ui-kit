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

/** @typedef {import("coveo").CaseAssistEngine} CaseAssistEngine */
/** @typedef {import("coveo").CaseAssistEngineOptions} CaseAssistEngineOptions */

/**
 * The `QuanticCaseAssistInterface` component handles the headless case assist engine.
 * A single instance should be used for each instance of the Coveo Headless case assist engine.
 * @category Case Assist
 * @example
 * <c-quantic-case-assist-interface engine-id={engineId} case-assist-id={caseAssistId}></c-quantic-case-assist-interface>
 */
export default class QuanticCaseAssistInterface extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The Case Assist configuration ID.
   * @api
   * @type {string}
   */
  @api caseAssistId;
  /**
   * The first level of origin of the request, typically the identifier of the graphical case assist interface from which the request originates.
   * @api
   * @type {string}
   * @defaultValue 'default'
   */
  @api searchHub = 'default';

  /** @type {CaseAssistEngineOptions} */
  engineOptions;
  /** @type {boolean} */
  isCaseStartLogged = false;

  connectedCallback() {
    loadDependencies(this, HeadlessBundleNames.caseAssist).then(() => {
      if (!getHeadlessBindings(this.engineId)?.engine) {
        getHeadlessConfiguration().then((data) => {
          if (data) {
            this.engineOptions = {
              configuration: {
                ...JSON.parse(data),
                caseAssistId: this.caseAssistId,
                searchHub: this.searchHub,
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
    if (!this.isCaseStartLogged) {
      this.engine.dispatch(this.actions.logCaseStart());
      this.isCaseStartLogged = true;
    }
  };
}
