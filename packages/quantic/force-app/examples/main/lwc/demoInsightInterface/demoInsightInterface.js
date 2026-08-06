import LOCALE from '@salesforce/i18n/locale';
import {
  getHeadlessBindings,
  loadDependencies,
  setEngineOptions,
  HeadlessBundleNames,
  setInitializedCallback,
} from 'c/quanticHeadlessLoader';
import QuanticInsightInterface from 'c/quanticInsightInterface';
import {api} from 'lwc';

/**
 * The `DemoInsightInterface` component extends `QuanticInsightInterface` to allow
 * passing `accessToken`, `organizationId`, `insightId`, and `environment` directly as
 * public API properties, bypassing the Apex InsightController. This makes it reusable
 * across different examples that require different credentials.
 * @category Insight Panel
 * @example
 * <c-demo-insight-interface engine-id={engineId} access-token="my-token" organization-id="my-org" insight-id="my-insight-id" environment="prod"></c-demo-insight-interface>
 */
export default class DemoInsightInterface extends QuanticInsightInterface {
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
  /**
   * The search hub to use for the insight interface.
   * @api
   * @type {string}
   */
  @api searchHub = 'default';
  /**
   * The query pipeline to use for the insight interface.
   * @api
   * @type {string}
   */
  @api pipeline = 'genqatest';

  connectedCallback() {
    loadDependencies(this, HeadlessBundleNames.insight)
      .then(() => {
        if (!getHeadlessBindings(this.engineId)?.engine) {
          this.engineOptions = {
            configuration: {
              organizationId: this.organizationId,
              accessToken: this.accessToken,
              environment: /** @type {import('coveo').PlatformEnvironment} */ (
                this.environment
              ),
              insightId: this.insightId,
              search: {
                locale: LOCALE,
                ...(this.pipeline && {pipeline: this.pipeline}),
              },
              analytics: {
                analyticsMode: this.analyticsMode,
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
        } else {
          setInitializedCallback(this.initialize, this.engineId);
        }
      })
      .catch((error) => {
        console.error('Error loading Headless dependencies', error);
      });
  }
}
