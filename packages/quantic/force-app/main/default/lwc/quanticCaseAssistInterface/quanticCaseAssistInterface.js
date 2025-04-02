// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  setInitializedCallback,
  HeadlessBundleNames,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

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
  /** @type {string} */
  analyticsOriginContext = 'CaseAssist';

  connectedCallback() {
    loadDependencies(this, HeadlessBundleNames.caseAssist)
      .then(() => {
        if (!getHeadlessBindings(this.engineId)?.engine) {
          getHeadlessConfiguration()
            .then((data) => {
              if (data) {
                const {organizationId, accessToken, ...rest} = JSON.parse(data);
                this.engineOptions = {
                  configuration: {
                    organizationId,
                    accessToken,
                    caseAssistId: this.caseAssistId,
                    searchHub: this.searchHub,
                    analytics: {
                      analyticsMode: 'legacy',
                      originContext: this.analyticsOriginContext,
                      ...(document.referrer && {
                        originLevel3: document.referrer.substring(0, 256),
                      }),
                      analyticsClientMiddleware: (_event, payload) => {
                        if (!payload.customData) {
                          payload.customData = {};
                        }
                        payload.customData.coveoQuanticVersion =
                          window.coveoQuanticVersion;
                        return payload;
                      },
                    },
                    ...rest,
                  },
                };
                setEngineOptions(
                  this.engineOptions,
                  CoveoHeadlessCaseAssist.buildCaseAssistEngine,
                  this.engineId,
                  this,
                  CoveoHeadlessCaseAssist
                );
                setInitializedCallback(this.initialize, this.engineId);
              }
            })
            .catch((error) => {
              console.error(
                'Error loading Headless endpoint configuration',
                error
              );
            });
        } else {
          setInitializedCallback(this.initialize, this.engineId);
        }
      })
      .catch((error) => {
        console.error('Error loading Headless dependencies', error);
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
