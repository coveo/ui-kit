import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import carouselLayout from './templates/carousel.html';
// @ts-ignore
import gridLayout from './templates/grid.html';
// @ts-ignore
import loadingTemplate from './templates/loading.html';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").RecommendationList} RecommendationList */
/** @typedef {import("coveo").RecommendationListState} RecommendationListState */
/** @typedef {import("coveo").RecommendationEngine} RecommendationEngine */

export default class QuanticRecommendationList extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The Recommendation identifier used by the Coveo platform to retrieve recommended documents.
   * @api
   * @type {string}
   * @default {'recommendation'}
   */
  @api recommendationId = 'recommendation';
  /**
   * The total number of recommendations to fetch.
   * @api
   * @type {number}
   * @default {10}
   */
  @api numberOfRecommendations = 10;
  /**
   * The number of recommendations to display, per page.
   * @api
   * @type {number}
   * @default {3}
   */
  @api numberOfRecommendationsPerRaw = 3;
  /**
   * The variant of the component. Accepted variants are ‘grid’ and carousel
   * @type {'grid' | 'carousel'}
   */
  @api variant = 'grid';
  /**
   * A list of fields to include in the query results, separated by commas.
   * @api
   * @type {string}
   * @defaultValue `'date,author,source,language,filetype,parents,sfknowledgearticleid,sfid,sfkbid,sfkavid'`
   */
  @api fieldsToInclude =
    'date,author,source,language,filetype,parents,sfknowledgearticleid,sfid,sfkbid,sfkavid';
  @api label = 'Top documents for you';

  @track state;

  /** @type {RecommendationList} */
  recommendationList;
  /** @type {boolean} */
  showPlaceholder = false;
  /** @type {Function} */
  unsubscribe;
  resultTemplatesManager;
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {number} */
  currentPage = 0;

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
        id: this.recommendationId,
        numberOfRecommendations: Number(this.numberOfRecommendations),
      },
    });
    this.unsubscribe = this.recommendationList.subscribe(() =>
      this.updateState()
    );

    this.resultTemplatesManager =
      this.headless.buildResultTemplatesManager(engine);

    this.actions = {
      ...this.headless.loadFieldActions(engine),
    };

    engine.dispatch(this.actions.registerFieldsToInclude(this.fields));
  };

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
      `${100 / this.numberOfRecommendationsPerRaw}%`
    );
  }

  updateCarouselPage(event) {
    this.currentPage = event.detail.page;
    const styles = this.template.host?.style;
    styles.setProperty(
      '--horizontalTransformationPercentage',
      `-${100 * this.currentPage}%`
    );
  }

  get placeholders() {
    const numberOfPlaceHolders =
      this.variant === 'carousel'
        ? this.numberOfRecommendationsPerRaw
        : this.numberOfRecommendations;
    return Array.from({length: numberOfPlaceHolders}, (v, i) => ({index: i}));
  }

  render() {
    if (this.showPlaceholder) {
      return loadingTemplate;
    }
    if (this.variant === 'carousel') {
      return carouselLayout;
    }
    return gridLayout;
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

  get numberOfPages() {
    return Math.ceil(
      this.recommendations?.length / this.numberOfRecommendationsPerRaw
    );
  }
}
