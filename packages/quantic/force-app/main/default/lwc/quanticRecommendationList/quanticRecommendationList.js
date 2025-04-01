import invalidPositiveIntegerProperty from '@salesforce/label/c.quantic_InvalidPositiveIntegerProperty';
import loadingRecommendations from '@salesforce/label/c.quantic_LoadingRecommendations';
import slide from '@salesforce/label/c.quantic_Slide';
import topDocumentsForYou from '@salesforce/label/c.quantic_TopDocumentsForYou';
import xOfY from '@salesforce/label/c.quantic_XOfY';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {I18nUtils, AriaLiveRegion} from 'c/quanticUtils';
import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import carouselLayout from './templates/carousel.html';
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
 * @fires CustomEvent#quantic__registerrecommendationtemplates
 * @category Recommendation
 * @example
 * <c-quantic-recommendation-list engine-id={engineId} recommendation={recommendationId} fields-to-include="objecttype,filetype" number-of-recommendations="3" recommendations-per-row="10" heading-level="1"></c-quantic-recommendation-list>
 */
export default class QuanticRecommendationList extends LightningElement {
  labels = {
    xOfY,
    topDocumentsForYou,
    slide,
    invalidPositiveIntegerProperty,
    loadingRecommendations,
  };

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
   * @defaultValue `'Top documents for you'`
   */
  @api label = this.labels.topDocumentsForYou;
  /**
   * The Heading level to use for the heading label, accepted values are integers from 1 to 6.
   * @api
   * @type {number}
   * @default {3}
   */
  @api headingLevel = 3;
  /**
   * The variant of the component. Accepted variants are `grid` and `carousel`.
   * @api
   * @type {'grid' | 'carousel'}
   */
  @api variant = 'grid';
  /**
   * The number of recommendations to display, per row.
   * Each recommendation in the row will be displayed as
   * 1/recommendationsPerRow of the container width.
   * @api
   * @type {number}
   * @default {3}
   */
  @api
  get recommendationsPerRow() {
    return this._recommendationsPerRow;
  }
  set recommendationsPerRow(value) {
    if (Number.isInteger(Number(value)) && Number(value) > 0) {
      this._recommendationsPerRow = Number(value);
    } else {
      this.setInitializationError();
      console.error(
        I18nUtils.format(
          this.labels.invalidPositiveIntegerProperty,
          'recommendationsPerRow'
        )
      );
    }
  }

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
  /** @type {import('c/quanticUtils').AriaLiveUtils} */
  loadingAriaLiveMessage;

  /** @type {number} */
  _recommendationsPerRow = 3;

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
    this.loadingAriaLiveMessage = AriaLiveRegion(
      'loading recommendations',
      this
    );
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
      new CustomEvent('quantic__registerrecommendationtemplates', {
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
    if (this.showPlaceholder) {
      this.loadingAriaLiveMessage.dispatchMessage(
        this.labels.loadingRecommendations
      );
    }
  }

  setRecommendationWidth() {
    const styles = this.template.host?.style;
    styles.setProperty(
      '--recommendationItemWidth',
      `${100 / this._recommendationsPerRow}%`
    );
  }

  get placeholders() {
    const numberOfPlaceHolders =
      this.variant === 'carousel'
        ? this._recommendationsPerRow
        : this.numberOfRecommendations;
    return Array.from({length: numberOfPlaceHolders}, (_item, index) => ({
      index,
    }));
  }

  get recommendations() {
    return (
      this.state?.recommendations.map(this.prepareRecommendation.bind(this)) ||
      []
    );
  }

  prepareRecommendation(rec, index, recs) {
    if (this.variant === 'grid') {
      return rec;
    }
    return {
      ...rec,
      class: this.generateCSSClassForCarouselRecommendation(index),
      label: I18nUtils.format(this.labels.xOfY, index + 1, recs.length),
    };
  }

  generateCSSClassForCarouselRecommendation(index) {
    let recCSSClass = 'recommendation-item__container slds-var-p-top_x-small ';

    if (this._recommendationsPerRow === 1) {
      return recCSSClass;
    }

    const recIsFirstInThePage = index % this._recommendationsPerRow === 0;
    const recIsLastInThePage =
      index % this._recommendationsPerRow === this._recommendationsPerRow - 1;

    if (recIsFirstInThePage) {
      recCSSClass = recCSSClass + 'slds-var-p-right_x-small';
    } else if (recIsLastInThePage) {
      recCSSClass = recCSSClass + 'slds-var-p-left_x-small';
    } else {
      recCSSClass = recCSSClass + 'slds-var-p-horizontal_xx-small';
    }

    return recCSSClass;
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
    if (this.variant === 'carousel') {
      return carouselLayout;
    }
    return gridLayout;
  }
}
