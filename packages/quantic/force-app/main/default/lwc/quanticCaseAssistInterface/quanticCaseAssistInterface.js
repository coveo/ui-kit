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
   * Whether or not we want to prevent logging a case start analytics event when initializing this component.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api preventLogCaseStartOnInit = false;
  /**
   * Whether or not we want to prevent fetching classifications when initializing this component.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api preventFetchClassificationOnInit = false;

  /** @type {CaseAssistEngineOptions} */
  engineOptions;

  connectedCallback() {
    loadDependencies(this, HeadlessBundleNames.caseAssist).then(() => {
      if (!getHeadlessBindings(this.engineId)?.engine) {
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
      ...CoveoHeadlessCaseAssist.loadCaseFieldActions(engine),
    };
    if (!this.preventLogCaseStartOnInit) {
      this.engine.dispatch(this.actions.logCaseStart());
    }
    if (!this.preventFetchClassificationOnInit) {
      this.engine.dispatch(this.actions.fetchCaseClassifications());
    }
  };
}
