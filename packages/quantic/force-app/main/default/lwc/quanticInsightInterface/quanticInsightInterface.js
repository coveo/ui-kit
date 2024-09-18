// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/InsightController.getHeadlessConfiguration';
import LOCALE from '@salesforce/i18n/locale';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  HeadlessBundleNames,
  destroyEngine,
  setInitializedCallback,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

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
  /** @type {boolean} */
  hasRendered = false;
  /** @type {boolean} */
  ariaLiveEventsBound = false;

  disconnectedCallback() {
    destroyEngine(this.engineId);
    if (this.ariaLiveEventsBound) {
      this.removeEventListener(
        'quantic__arialivemessage',
        this.handleAriaLiveMessage
      );
      this.removeEventListener(
        'quantic__registerregion',
        this.handleRegisterAriaLiveRegion
      );
    }
  }

  connectedCallback() {
    loadDependencies(this, HeadlessBundleNames.insight)
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
                    insightId: this.insightId,
                    search: {
                      locale: LOCALE,
                    },
                    analytics: {
                      analyticsMode: 'legacy',
                      ...(document.referrer && {
                        originLevel3: document.referrer,
                      }),
                    },
                    ...rest,
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

  renderedCallback() {
    if (!this.hasRendered && this.querySelector('c-quantic-aria-live')) {
      this.bindAriaLiveEvents();
    }
    this.hasRendered = true;
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

  bindAriaLiveEvents() {
    this.template.addEventListener(
      'quantic__arialivemessage',
      this.handleAriaLiveMessage.bind(this)
    );
    this.template.addEventListener(
      'quantic__registerregion',
      this.handleRegisterAriaLiveRegion.bind(this)
    );
    this.ariaLiveEventsBound = true;
  }

  handleAriaLiveMessage(event) {
    /** @type {import('quanticAriaLive/quanticAriaLive').IQuanticAriaLive} */
    const ariaLiveRegion = this.querySelector('c-quantic-aria-live');
    if (ariaLiveRegion) {
      ariaLiveRegion.updateMessage(
        event.detail.regionName,
        event.detail.message,
        event.detail.assertive
      );
    }
  }

  handleRegisterAriaLiveRegion(event) {
    /** @type {import('quanticAriaLive/quanticAriaLive').IQuanticAriaLive} */
    const ariaLiveRegion = this.querySelector('c-quantic-aria-live');
    if (ariaLiveRegion) {
      ariaLiveRegion.registerRegion(
        event.detail.regionName,
        event.detail.assertive
      );
    }
  }
}
