// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/RecommendationsController.getHeadlessConfiguration';
import LOCALE from '@salesforce/i18n/locale';
import TIMEZONE from '@salesforce/i18n/timeZone';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  setInitializedCallback,
  HeadlessBundleNames,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").RecommendationEngine} RecommendationEngine */
/** @typedef {import("coveo").RecommendationEngineOptions} RecommendationEngineOptions */

/**
 * The `QuanticRecommendationInterface` component initializes the headless recommendation engine and handles localization configurations.
 * A single instance should be used for each instance of the Coveo Headless recommendation engine.
 *
 *
 * The `timezone` used in the recommendation engine options is taken from the [Time Zone settings](https://help.salesforce.com/s/articleView?id=admin_supported_timezone.htm&type=5&language=en_US) of the Salesforce org.
 * It is used to correctly interpret dates in the query expression, facets, and result items.
 *
 *
 * The `locale` used in the search engine options is taken from the [Language Settings](https://help.salesforce.com/s/articleView?id=sf.setting_your_language.htm&type=5).
 * Coveo Machine Learning models use this information to provide contextually relevant output.
 * Moreover, this information can be referred to in query expressions and QPL statements by using the `$locale` object.
 * @category Recommendation
 * @example
 * <c-quantic-recommendation-interface engine-id={engineId} search-hub="myhub" pipeline="mypipeline"></c-quantic-recommendation-interface>
 */
export default class QuanticRecommendationInterface extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The recommendation interface [search hub](https://docs.coveo.com/en/1342/).
   * @api
   * @type {string}
   * @defaultValue 'default'
   */
  @api searchHub = 'default';
  /**
   * The recommendation interface [query pipeline](https://docs.coveo.com/en/180/).
   * @api
   * @type {string}
   */
  @api pipeline;

  /** @type {RecommendationEngineOptions} */
  engineOptions;
  /** @type {boolean} */
  initialized = false;
  /** @type {boolean} */
  hasRendered = false;
  /** @type {boolean} */
  ariaLiveEventsBound = false;
  /** @type {string} */
  analyticsOriginContext = 'quantic_recommendation';

  connectedCallback() {
    loadDependencies(this, HeadlessBundleNames.recommendation).then(() => {
      if (!getHeadlessBindings(this.engineId)?.engine) {
        getHeadlessConfiguration().then((data) => {
          if (data) {
            const {organizationId, accessToken, ...rest} = JSON.parse(data);
            this.engineOptions = {
              configuration: {
                organizationId,
                accessToken,
                searchHub: this.searchHub,
                pipeline: this.pipeline,
                locale: LOCALE,
                timezone: TIMEZONE,
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
              CoveoHeadlessRecommendation.buildRecommendationEngine,
              this.engineId,
              this,
              CoveoHeadlessRecommendation
            );
            setInitializedCallback(this.initialize, this.engineId);
          }
        });
      } else {
        setInitializedCallback(this.initialize, this.engineId);
      }
    });
  }

  renderedCallback() {
    if (!this.hasRendered && this.querySelector('c-quantic-aria-live')) {
      this.bindAriaLiveEvents();
    }
    this.hasRendered = true;
  }

  disconnectedCallback() {
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

  /**
   * @param {RecommendationEngine} engine
   */
  initialize = (engine) => {
    if (this.initialized) {
      return;
    }
    this.actions = {
      ...CoveoHeadlessRecommendation.loadRecommendationActions(engine),
    };
    engine.dispatch(this.actions.getRecommendations());
    this.initialized = true;
  };

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
