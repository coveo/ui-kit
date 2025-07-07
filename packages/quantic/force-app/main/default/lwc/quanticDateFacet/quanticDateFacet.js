import LOCALE from '@salesforce/i18n/locale';
import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import clearFilterFacet from '@salesforce/label/c.quantic_ClearFilterFacet';
import clearFilter_plural from '@salesforce/label/c.quantic_ClearFilter_plural';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';
import {
  registerComponentForInit,
  initializeWithHeadless,
  registerToStore,
  getHeadlessBundle,
  getBueno,
} from 'c/quanticHeadlessLoader';
import {
  I18nUtils,
  fromSearchApiDate,
  Store,
  generateFacetDependencyConditions,
} from 'c/quanticUtils';
import {LightningElement, track, api} from 'lwc';

/** @typedef {import("coveo").DateFacetState} DateFacetState */
/** @typedef {import("coveo").DateFacet} DateFacet */
/** @typedef {import("coveo").DateFacetValue} DateFacetValue */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").FacetConditionsManager} FacetConditionsManager */
/** @typedef {import('../quanticUtils/facetDependenciesUtils').DependsOn} DependsOn */
/**
 * @typedef FocusTarget
 * @type {object}
 * @property {'facetValue' | 'facetHeader'} type
 * @property {string} [value]
 * @property {number} [index]
 */

/**
 * The `QuanticDateFacet` component displays facet values as date ranges.
 * @category Search
 * @example
 * <c-quantic-date-facet engine-id={engineId} facet-id="myfacet" field="date" label="Date" number-of-values="5" formatting-function={formattingFunction} is-collapsed></c-quantic-date-facet>
 */
export default class QuanticDateFacet extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * A unique identifier for the facet.
   * @api
   * @type {string}
   * @defaultValue Defaults to the `field` value.
   */
  @api facetId;
  /**
   * The index field whose values the facet should use.
   * @api
   * @type {string}
   */
  @api field;
  /**
   * The non-localized label for the facet. This label is displayed in the facet header.
   * @api
   * @type {string}
   */
  @api label = 'no-label';
  /**
   * The number of values to request for this facet, when there are no manual ranges.
   * @api
   * @type {number}
   * @defaultValue `8`
   */
  @api numberOfValues = 8;
  /**
   * The function used to format the date facet value label.
   * The default result format is the following: `[start] - [end]`
   * @api
   * @type {Function}
   * @param {DateFacetValue} item
   * @returns {string}
   */
  @api formattingFunction = (item) =>
    `${new Intl.DateTimeFormat(LOCALE).format(
      new Date(fromSearchApiDate(item.start))
    )} - ${new Intl.DateTimeFormat(LOCALE).format(
      new Date(fromSearchApiDate(item.end))
    )}`;
  /**
   * This property defines the relationship between this facet and a parent facet, indicating
   * the specific parent facet that this facet relies on and the selected value required
   * from that parent facet for this facet to be displayed.
   *
   * When this property is defined, the facet will only display if the specified `parentFacetId`
   * has the `expectedValue` selected. If `expectedValue` is omitted or set to `undefined`,
   * the facet will display as long as any value is selected in the parent facet.
   *
   * **Supported facets:** Dependencies can only be created on a basic or category facet.
   * Dependencies on numeric, timeframe, or date facets are not supported.
   *
   * For example usage and more details, see:
   * https://docs.coveo.com/en/quantic/latest/usage/display-facet-based-on-selection-of-another-facet/
   *
   * @api
   * @type {DependsOn}
   */
  @api dependsOn;
  /**
   * Whether the facet is collapsed.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(collapsed) {
    this._isCollapsed = collapsed;
  }
  /** @type {boolean} */
  _isCollapsed = false;

  static attributes = [
    'facetId',
    'field',
    'label',
    'numberOfValues',
    'dependsOn',
  ];

  /** @type {DateFacetState} */
  @track state;

  /** @type {DateFacet} */
  facet;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {boolean} */
  showPlaceholder = true;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeSearchStatus;
  /** @type {AnyHeadless} */
  headless;
  /** @type {FocusTarget} */
  focusTarget;
  /** @type {boolean} */
  focusShouldBeInFacet = false;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {FacetConditionsManager} */
  dateFacetConditionsManager;

  labels = {
    clearFilter,
    clearFilter_plural,
    clearFilterFacet,
    collapseFacet,
    expandFacet,
  };

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    if (this.focusShouldBeInFacet && !this.facet?.state?.isLoading) {
      this.setFocusOnTarget();
      this.focusTarget = null;
    }
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.searchStatus = this.headless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );

    this.facet = this.headless.buildDateFacet(engine, {
      options: {
        field: this.field,
        numberOfValues: Number(this.numberOfValues),
        generateAutomaticRanges: true,
        facetId: this.facetId ?? this.field,
      },
    });
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
    registerToStore(this.engineId, Store.facetTypes.DATEFACETS, {
      label: this.label,
      facetId: this.facet.state.facetId,
      format: this.formattingFunction,
      element: this.template.host,
    });
    if (this.dependsOn) {
      this.validateDependsOnProperty();
      this.initFacetConditionManager(engine);
    }
  };

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
    this.dateFacetConditionsManager?.stopWatching();
  }

  updateState() {
    this.state = this.facet?.state;
    this.showPlaceholder =
      this.searchStatus?.state?.isLoading &&
      !this.searchStatus?.state?.hasError &&
      !this.searchStatus?.state?.firstSearchExecuted;

    const renderFacetEvent = new CustomEvent('quantic__renderfacet', {
      detail: {
        id: this.facetId ?? this.field,
        shouldRenderFacet: this.hasValues,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(renderFacetEvent);
  }

  validateDependsOnProperty() {
    if (this.dependsOn) {
      getBueno(this).then(() => {
        const {parentFacetId, expectedValue} = this.dependsOn;
        if (!Bueno.isString(parentFacetId)) {
          console.error(
            `The ${this.field} ${this.template.host.localName} requires dependsOn.parentFacetId to be a valid string.`
          );
          this.setInitializationError();
        }
        if (expectedValue && !Bueno.isString(expectedValue)) {
          console.error(
            `The ${this.field} ${this.template.host.localName} requires dependsOn.expectedValue to be a valid string.`
          );
          this.setInitializationError();
        }
      });
    }
  }

  initFacetConditionManager(engine) {
    this.dateFacetConditionsManager = this.headless.buildFacetConditionsManager(
      engine,
      {
        facetId: this.facet.state.facetId,
        conditions: generateFacetDependencyConditions({
          [this.dependsOn.parentFacetId]: this.dependsOn.expectedValue,
        }),
      }
    );
  }

  get values() {
    return (
      this.state?.values
        .filter((value) => value.numberOfResults || value.state === 'selected')
        .map((value) => {
          return {
            ...value,
            checked: value.state === 'selected',
          };
        }) || []
    );
  }

  get isFacetEnabled() {
    return this.state?.enabled;
  }

  get hasValues() {
    return this.values.length !== 0;
  }

  get hasActiveValues() {
    return this.state?.hasActiveValues;
  }

  get actionButtonIcon() {
    return this.isCollapsed ? 'utility:add' : 'utility:dash';
  }

  get actionButtonCssClasses() {
    return this.isCollapsed ? 'facet__expand' : 'facet__collapse';
  }

  get actionButtonLabel() {
    const label = this.isCollapsed
      ? this.labels.expandFacet
      : this.labels.collapseFacet;
    return I18nUtils.format(label, this.label);
  }

  get numberOfSelectedValues() {
    return this.state.values.filter(({state}) => state === 'selected').length;
  }

  get clearFilterLabel() {
    if (this.hasActiveValues) {
      const labelName = I18nUtils.getLabelNameWithCount(
        'clearFilter',
        this.numberOfSelectedValues
      );
      return `${I18nUtils.format(
        this.labels[labelName],
        this.numberOfSelectedValues
      )}`;
    }
    return '';
  }

  get clearFilterAriaLabelValue() {
    return `${I18nUtils.format(this.labels.clearFilterFacet, this.field)}`;
  }

  /**
   * @param {CustomEvent<{value: string}>} evt
   */
  onSelectValue(evt) {
    const item = this.values.find(
      (value) => this.formattingFunction(value) === evt.detail.value
    );
    this.facet.toggleSelect(item);

    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'facetValue',
      value: evt.detail.value,
    };
  }

  clearSelections() {
    this.facet.deselectAll();
    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'facetHeader',
    };
  }

  toggleFacetVisibility() {
    this._isCollapsed = !this.isCollapsed;
  }

  preventDefault(evt) {
    evt.preventDefault();
  }

  /**
   * Sets the focus on the target element.
   */
  setFocusOnTarget() {
    this.focusShouldBeInFacet = false;
    if (!this.focusTarget) {
      return;
    }
    if (this.focusTarget.type === 'facetHeader') {
      this.setFocusOnHeader();
    } else if (this.focusTarget.type === 'facetValue') {
      if (this.focusTarget.value) {
        const facetValueIndex = this.values.findIndex(
          (value) => this.formattingFunction(value) === this.focusTarget.value
        );
        this.focusTarget.index = facetValueIndex >= 0 ? facetValueIndex : 0;
        this.setFocusOnFacetValue();
      }
    }
  }

  /**
   * Sets the focus on the target facet value.
   */
  setFocusOnFacetValue() {
    const facetValues = this.template.querySelectorAll('c-quantic-facet-value');
    const focusTarget = facetValues[this.focusTarget.index];
    if (focusTarget) {
      // @ts-ignore
      focusTarget.setFocus();
    }
  }

  /**
   * Sets the focus on the facet header.
   */
  setFocusOnHeader() {
    const focusTarget = this.template.querySelector('c-quantic-card-container');
    if (focusTarget) {
      // @ts-ignore
      focusTarget.setFocusOnHeader();
    }
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
