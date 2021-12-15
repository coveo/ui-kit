import {LightningElement, api} from 'lwc';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  setInitializedCallback
} from 'c/quanticHeadlessLoader';
// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';
import LOCALE from '@salesforce/i18n/locale';

/** @typedef {import("coveo").CaseAssistEngine} CaseAssistEngine */
/** @typedef {import("coveo").CaseAssistEngineOptions} CaseAssistEngineOptions */

/**
 * The `QuanticCaseAssistInterface` component handles the headless search engine and localization configurations.
 * A single instance should be used for each instance of the Coveo Headless search engine.
 *
 * The `locale` used in the search engine options is taken from the [Language Settings](https://help.salesforce.com/s/articleView?id=sf.setting_your_language.htm&type=5).
 * Coveo Machine Learning models use this information to provide contextually relevant output.
 * Moreover, this information can be referred to in query expressions and QPL statements by using the `$locale` object.
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
    loadDependencies(this, 'case-assist').then((CoveoHeadlessCaseAssist) => {
      if (!getHeadlessBindings(this.engineId).engine) {
        getHeadlessConfiguration().then((data) => {
          if (data) {
            this.engineOptions = {
              configuration: {
                ...JSON.parse(data),
                caseAssistId: this.caseAssistId,
                locale: LOCALE,
              },
            };
            setEngineOptions(
              this.engineOptions,
              CoveoHeadlessCaseAssist.buildCaseAssistEngine,
              this.engineId,
              this
            );
          }
        });
      } else {
        setInitializedCallback(this.initialize, this.engineId);
      }
    });
  }
}
