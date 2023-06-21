import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import defaultRecommendationTemplate from './templates/defaultRecommendation.html';
// @ts-ignore
import gridLayout from './templates/grid.html';
// @ts-ignore
import initializationErrorTemplate from './templates/initializationError.html';
// @ts-ignore
import loadingTemplate from './templates/loading.html';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").RecommendationList} RecommendationList */
/** @typedef {import("coveo").RecommendationListState} RecommendationListState */
/** @typedef {import("coveo").RecommendationEngine} RecommendationEngine */
/** @typedef {import("coveo").ResultTemplatesManager} ResultTemplatesManager */

/**
 * The `QuanticRecommendationList` component displays recommendations by applying one or more result templates in different layouts.
 * @fires CustomEvent#registerrecommendationtemplates
 * @category Recommendation
 * @example
 * <c-quantic-recommendation-list engine-id={engineId} recommendation={recommendationId} fields-to-include="objecttype,filetype" number-of-recommendations="3" recommendations-per-row="10" heading-level="1"></c-quantic-recommendation-list>
 */
export default class QuanticRecommendationList extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The recommendation identifier used by the Coveo platform to retrieve recommended documents.
   * @api
   * @type {string}
   * @default {'recommendation'}
   */
  @api recommendation = 'recommendation';
  /**
   * The total number of recommendations to fetch.
   * @api
   * @type {number}
   * @default {10}
   */
  @api numberOfRecommendations = 10;
  /**
   * The number of recommendations to display, per row.
   * Each recommendation in the row will be displayed as
   * 1/recommendationsPerRow of the container width.
   * @api
   * @type {number}
   * @default {3}
   */
  @api recommendationsPerRow = 3;
  /**
   * A list of fields to include in the query results, separated by commas.
   * @api
   * @type {string}
   * @defaultValue `'date,author,source,language,filetype,parents,sfknowledgearticleid,sfid,sfkbid,sfkavid'`
   */
  @api fieldsToInclude =
    'date,author,source,language,filetype,parents,sfknowledgearticleid,sfid,sfkbid,sfkavid';
  /**
   * The label of the component. This label is displayed in the component header.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The Heading level to use for the heading label, accepted values are integers from 1 to 6.
   * @type {number}
   * @default {1}
   */
  @api headingLevel = 3;

  /** @type {RecommendationListState} */
  @track state;
  /** @type {RecommendationList} */
  recommendationList;
  /** @type {boolean} */
  showPlaceholder = false;
  /** @type {Function} */
  unsubscribe;
  /** @type {ResultTemplatesManager} */
  resultTemplatesManager;
  /** @type {CoveoHeadlessRecommendation} */
  headless;
  /** @type {boolean} */
  hasInitializationError = false;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.setRecommendationWidth();
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {RecommendationEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.recommendationList = this.headless.buildRecommendationList(engine, {
      options: {
        id: this.recommendation,
        numberOfRecommendations: Number(this.numberOfRecommendations),
      },
    });
    this.unsubscribe = this.recommendationList.subscribe(() =>
      this.updateState()
    );

    this.resultTemplatesManager =
      this.headless.buildResultTemplatesManager(engine);
    this.registerTemplates();

    this.actions = {
      ...this.headless.loadFieldActions(engine),
    };

    engine.dispatch(this.actions.registerFieldsToInclude(this.fields));
  };

  registerTemplates() {
    this.resultTemplatesManager.registerTemplates({
      content: defaultRecommendationTemplate,
      conditions: [],
    });
    this.dispatchEvent(
      new CustomEvent('registerrecommendationtemplates', {
        bubbles: true,
        detail: this.resultTemplatesManager,
      })
    );
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = this.recommendationList?.state;
    this.showPlaceholder =
      this.recommendationList?.state?.isLoading &&
      !this.recommendationList?.state?.recommendations?.length &&
      !this.recommendationList?.state?.error;
  }

  setRecommendationWidth() {
    const styles = this.template.host?.style;
    styles.setProperty(
      '--recommendationItemWidth',
      `${100 / this.recommendationsPerRow}%`
    );
  }

  get placeholders() {
    return Array.from(
      {length: this.numberOfRecommendations},
      (_item, index) => ({
        index,
      })
    );
  }

  get recommendations() {
    return this.state?.recommendations || [];
  }

  get fields() {
    return this.fieldsToInclude
      .split(',')
      .map((field) => field.trim())
      .filter((field) => field.length > 0);
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  render() {
    if (this.hasInitializationError) {
      return initializationErrorTemplate;
    }
    if (this.showPlaceholder) {
      return loadingTemplate;
    }
    return gridLayout;
  }
}
