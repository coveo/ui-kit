import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api, track} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").Tab} Tab */

/**
 * The `QuanticTab` component allows the end user to view a subset of results.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-tab engine-id={engineId} label="Community" expression="@objecttype==&quot;Message&quot;" is-active></c-quantic-tab>
 */
export default class QuanticTab extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The non-localized label for the tab.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The constant query expression or filter that the Tab should add to any outgoing query.
   * @api
   * @type {string}
   */
  @api expression = '';
  /**
   * Whether the tab should be active.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api get isActive() {
    return this._isActive;
  }
  set isActive(isActive) {
    this._isActive = isActive;
  }
  _isActive = false;

  /** @type {boolean} */
  @track shouldDisplay;

  /** @type {Tab} */
  tab;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeSearchStatus;
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  hasInitializationError = false;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    this.dispatchEvent(
      new CustomEvent('quantic__tabrendered', {bubbles: true})
    );
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.tab = this.headless.buildTab(engine, {
      options: {
        expression: this.expression,
        id: this.label,
      },
      initialState: {
        isActive: this.isActive,
      },
    });
    this.searchStatus = this.headless.buildSearchStatus(engine);

    this.unsubscribe = this.tab.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );
  };

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this._isActive = this.tab?.state?.isActive;
    this.shouldDisplay = this.searchStatus?.state?.firstSearchExecuted;
  }

  @api select() {
    this.tab.select();
  }

  get tabClass() {
    return `slds-button slds-tabs_default__item tab_button ${
      this.isActive ? 'slds-is-active' : ''
    }`;
  }

  get isPressed() {
    // convert type boolean to type string for attribute aria-pressed
    return `${this.isActive}`;
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
