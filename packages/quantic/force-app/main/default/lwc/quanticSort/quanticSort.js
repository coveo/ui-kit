import invalidCustomSortConfig from '@salesforce/label/c.quantic_InvalidCustomSortConfiguration';
import newest from '@salesforce/label/c.quantic_Newest';
import oldest from '@salesforce/label/c.quantic_Oldest';
import relevancy from '@salesforce/label/c.quantic_Relevancy';
import sortBy from '@salesforce/label/c.quantic_SortBy';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
  registerSortOptionsToStore,
  getBueno,
} from 'c/quanticHeadlessLoader';
import {LightningElement, track, api} from 'lwc';

/** @typedef {import("coveo").Sort} Sort */
/** @typedef {import("coveo").SortState} SortState */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SortCriterion} SortCriterion */
/**
 * @typedef SortOption
 * @property {string} label
 * @property {string} value
 * @property {SortCriterion} criterion
 * @example {label: 'Youtube views ascending', value: '@ytviewcount ascending', criterion: {by: 'field', field: '@ytviewcount', order: 'ascending'}
 */

/**
 * The `QuanticSort` component renders a dropdown that the end user can interact with to select the criterion to use when sorting query results.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-sort engine-id={engineId}>
 *  <c-quantic-sort-option
      slot="sortOption"
      label={sortOptionLabel}
      value={sortOptionValue}
      criterion={sortOptionCriterion}
    ></c-quantic-sort-option></c-quantic-sort>
 */

export default class QuanticSort extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  /** @type {boolean} */
  @track hasResults;
  /** @type {SortState} */
  @track state;

  /** @type {SortOption[]} */
  defaultSortOptions;
  /** @type {Sort} */
  sort;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {Function} */
  unsubscribeSort;
  /** @type {Function} */
  unsubscribeSearchStatus;
  /** @type {Array.<SortOption>} */
  options;
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  hasInitializationError = false;

  /** @type {string} */
  errorMessage;

  schemas = {};

  labels = {
    sortBy,
    relevancy,
    newest,
    oldest,
    invalidCustomSortConfig,
  };

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.defaultSortOptions = [
      {
        label: this.labels.relevancy,
        value: this.headless.buildCriterionExpression(this.relevancy),
        criterion: this.relevancy,
      },
      {
        label: this.labels.newest,
        value: this.headless.buildCriterionExpression(this.dateDescending),
        criterion: this.dateDescending,
      },
      {
        label: this.labels.oldest,
        value: this.headless.buildCriterionExpression(this.dateAscending),
        criterion: this.dateAscending,
      },
    ];
    this.options = this.buildOptions();
    this.sort = this.headless.buildSort(engine, {
      initialState: {
        criterion: this.hasCustomSortOptions
          ? this.customSortOptions[0].criterion
          : this.defaultSortOptions[0].criterion,
      },
    });
    this.searchStatus = this.headless.buildSearchStatus(engine);
    getBueno(this).then(() => {
      this.generateSchemas();
      this.customSortOptions.forEach((option) => {
        this.validateSortOption(option);
      });
    });
    this.unsubscribeSort = this.sort.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );
    registerSortOptionsToStore(this.engineId, this.options);
  };

  disconnectedCallback() {
    this.unsubscribeSort?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.state = this.sort?.state;
    this.hasResults = this.searchStatus?.state?.hasResults;
  }

  buildOptions() {
    return this.hasCustomSortOptions
      ? this.customSortOptions
      : this.defaultSortOptions;
  }

  /**
   * @param {CustomEvent<{value: string}>} e
   */
  handleChange(e) {
    this.sort.sortBy(
      this.options.find((option) => option.value === e.detail.value).criterion
    );
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  /**
   * Sets the error when custom sort options have an invalid configuration.
   */
  setSortOptionsConfigurationError() {
    this.errorMessage = this.labels.invalidCustomSortConfig;
  }

  /**
   * Generates the schemas for the validation of the sort options with Bueno.
   */
  generateSchemas() {
    const requiredNonEmptyString = new Bueno.StringValue({
      required: true,
      emptyAllowed: false,
    });

    this.schemas.sortOptionSchema = new Bueno.Schema({
      label: requiredNonEmptyString,
      value: requiredNonEmptyString,
      criterion: new Bueno.RecordValue({
        options: {
          required: true,
        },
        values: {
          by: requiredNonEmptyString,
        },
      }),
    });

    this.schemas.sortByDateCriterionSchema = new Bueno.Schema({
      by: requiredNonEmptyString,
      order: requiredNonEmptyString,
    });

    this.schemas.sortByFieldCriterionSchema = new Bueno.Schema({
      by: requiredNonEmptyString,
      field: requiredNonEmptyString,
      order: requiredNonEmptyString,
    });
  }

  /**
   * Validates that a sort option respects the required schema of a SortOption.
   */
  validateSortOption(sortOption) {
    try {
      this.schemas.sortOptionSchema.validate(sortOption);
      if (sortOption.criterion.by === 'date') {
        this.schemas.sortByDateCriterionSchema.validate(sortOption.criterion);
      }
      if (sortOption.criterion.by === 'field') {
        this.schemas.sortByFieldCriterionSchema.validate(sortOption.criterion);
      }
    } catch (error) {
      console.error(
        `The ${this.template.host.localName} component has an error with the ${sortOption.label} sort configuration, ${error.message}`
      );
      this.setSortOptionsConfigurationError();
    }
  }

  get relevancy() {
    return this.headless.buildRelevanceSortCriterion();
  }

  get dateDescending() {
    return this.headless.buildDateSortCriterion(
      this.headless.SortOrder.Descending
    );
  }

  get dateAscending() {
    return this.headless.buildDateSortCriterion(
      this.headless.SortOrder.Ascending
    );
  }

  get value() {
    return this.state?.sortCriteria;
  }

  get hasCustomSortOptions() {
    return this.customSortOptions.length > 0;
  }

  get hasError() {
    return this.hasInitializationError || !!this.errorMessage;
  }

  /**
   * Returns an array of custom sort options passed via slots.
   * @returns {SortOption[]} The specified custom sort options.
   */
  get customSortOptions() {
    /** @type {SortOption[]} */
    return Array.from(this.querySelectorAll('c-quantic-sort-option')).map(
      // @ts-ignore
      ({label, value, criterion}) => ({label, value, criterion})
    );
  }
}
