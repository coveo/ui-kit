// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';
import LOCALE from '@salesforce/i18n/locale';
import TIMEZONE from '@salesforce/i18n/timeZone';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  setInitializedCallback,
} from 'c/quanticHeadlessLoader';
import {STANDALONE_SEARCH_BOX_STORAGE_KEY} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SearchEngineOptions} SearchEngineOptions */
/** @typedef {import("coveo").UrlManager} UrlManager */

/**
 * The `QuanticSearchInterface` component handles the headless search engine and localization configurations.
 * A single instance should be used for each instance of the Coveo Headless search engine.
 *
 *
 * The `timezone` used in the search engine options is taken from the [Time Zone settings](https://help.salesforce.com/s/articleView?id=admin_supported_timezone.htm&type=5&language=en_US) of the Salesforce org.
 * It is used to correctly interpret dates in the query expression, facets, and result items.
 *
 *
 * The `locale` used in the search engine options is taken from the [Language Settings](https://help.salesforce.com/s/articleView?id=sf.setting_your_language.htm&type=5).
 * Coveo Machine Learning models use this information to provide contextually relevant output.
 * Moreover, this information can be referred to in query expressions and QPL statements by using the `$locale` object.
 * @category Search
 * @example
 * <c-quantic-search-interface engine-id={engineId} search-hub="myhub" pipeline="mypipeline" disable-state-in-url skip-first-search></c-quantic-search-interface>
 */
export default class QuanticSearchInterface extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The search interface [search hub](https://docs.coveo.com/en/1342/).
   * @api
   * @type {string}
   * @defaultValue 'default'
   */
  @api searchHub = 'default';
  /**
   * The search interface [query pipeline](https://docs.coveo.com/en/180/).
   * @api
   * @type {string}
   * @defaultValue `undefined`
   */
  @api pipeline;
  /**
   * Whether the state should not be reflected in the URL parameters.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api disableStateInUrl = false;
  /**
   * Whether not to perform a search once the interface and its components are initialized.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api skipFirstSearch = false;

  /** @type {SearchEngineOptions} */
  engineOptions;

  /** @type {UrlManager} */
  urlManager;

  /** @type {Function} */
  unsubscribeUrlManager;

  /** @type {boolean} */
  initialized = false;

  /** @type {boolean} */
  hasRendered = false;

  /** @type {boolean} */
  ariaLiveEventsBound = false;

  connectedCallback() {
    loadDependencies(this)
      .then(() => {
        if (!getHeadlessBindings(this.engineId)?.engine) {
          getHeadlessConfiguration()
            .then((data) => {
              const {organizationId, accessToken, ...rest} = JSON.parse(data);
              this.engineOptions = {
                configuration: {
                  organizationId,
                  accessToken,
                  search: {
                    searchHub: this.searchHub,
                    pipeline: this.pipeline,
                    locale: LOCALE,
                    timezone: TIMEZONE,
                  },
                  analytics: {
                    analyticsMode: 'legacy',
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
                CoveoHeadless.buildSearchEngine,
                this.engineId,
                this,
                CoveoHeadless
              );
              setInitializedCallback(this.initialize, this.engineId);
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

  disconnectedCallback() {
    this.initialized = false;
    this.unsubscribeUrlManager?.();
    window.removeEventListener('hashchange', this.onHashChange);
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
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    if (this.initialized) {
      return;
    }
    const {updateQuery} = CoveoHeadless.loadQueryActions(engine);

    if (!this.disableStateInUrl) {
      this.initUrlManager(engine);
    }

    if (!this.skipFirstSearch) {
      const redirectData = window.localStorage.getItem(
        STANDALONE_SEARCH_BOX_STORAGE_KEY
      );
      if (!redirectData) {
        engine.executeFirstSearch();
      } else {
        window.localStorage.removeItem(STANDALONE_SEARCH_BOX_STORAGE_KEY);
        const {value, analytics} = JSON.parse(redirectData);

        engine.dispatch(updateQuery({q: value}));
        engine.executeFirstSearchAfterStandaloneSearchBoxRedirect(analytics);
      }
    }
    this.initialized = true;
  };

  get fragment() {
    return window.location.hash.slice(1);
  }

  initUrlManager(engine) {
    this.urlManager = CoveoHeadless.buildUrlManager(engine, {
      initialState: {fragment: this.fragment},
    });

    const isFirstSearchExecuted = engine.state.search.response.searchUid !== '';
    if (isFirstSearchExecuted) {
      // Make sure to re-synchronize the search interface when the component gets disconnected and reconnected again.
      this.urlManager.synchronize(this.fragment);
    }

    this.unsubscribeUrlManager = this.urlManager.subscribe(() =>
      this.updateHash()
    );
    window.addEventListener('hashchange', this.onHashChange);
  }

  updateHash() {
    window.history.pushState(
      null,
      document.title,
      `#${this.urlManager.state.fragment}`
    );
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

  onHashChange = () => {
    this.urlManager.synchronize(this.fragment);
  };
}
