import LOCALE from '@salesforce/i18n/locale';
import TIMEZONE from '@salesforce/i18n/timeZone';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  setInitializedCallback,
} from 'c/quanticHeadlessLoader';
import QuanticSearchInterface from 'c/quanticSearchInterface';
import {api} from 'lwc';

/**
 * The `DemoSearchInterface` component extends `QuanticSearchInterface` to allow
 * passing `accessToken`, `organizationId`, `environment`, and `analyticsMode` directly
 * as public API properties, bypassing the Apex HeadlessController. This makes it reusable
 * across different examples that require different credentials.
 * @category Search
 * @example
 * <c-demo-search-interface engine-id={engineId} access-token="my-token" organization-id="my-org" environment="prod" search-hub="myhub" pipeline="mypipeline"></c-demo-search-interface>
 */
export default class DemoSearchInterface extends QuanticSearchInterface {
  /**
   * The access token to use for authentication.
   * @api
   * @type {string}
   */
  @api accessToken;
  /**
   * The Coveo organization ID.
   * @api
   * @type {string}
   */
  @api organizationId;
  /**
   * The Coveo environment (e.g., 'prod').
   * @api
   * @type {string}
   */
  @api environment = 'prod';
  /**
   * The analytics mode to use (e.g., 'legacy' or 'next').
   * @api
   * @type {'legacy'|'next'}
   */
  @api analyticsMode = 'legacy';

  connectedCallback() {
    loadDependencies(this)
      .then(() => {
        if (!getHeadlessBindings(this.engineId)?.engine) {
          this.engineOptions = {
            configuration: {
              organizationId: this.organizationId,
              accessToken: this.accessToken,
              environment: /** @type {import('coveo').PlatformEnvironment} */ (
                this.environment
              ),
              search: {
                searchHub: this.searchHub,
                pipeline: this.pipeline,
                locale: LOCALE,
                timezone: TIMEZONE,
              },
              analytics: {
                analyticsMode: this.analyticsMode,
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
        } else {
          setInitializedCallback(this.initialize, this.engineId);
        }
      })
      .catch((error) => {
        console.error('Error loading Headless dependencies', error);
      });
  }
}
