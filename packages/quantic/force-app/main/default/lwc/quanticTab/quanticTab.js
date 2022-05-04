import {LightningElement, api, track} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").Tab} Tab */

/**
 * The `QuanticTab` component allows the end user to view a subset of results.
 * @category Search
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

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    this.dispatchEvent(new CustomEvent('tab_rendered', {bubbles: true}));
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.tab = CoveoHeadless.buildTab(engine, {
      options: {
        expression: this.expression,
        id: this.label,
      },
      initialState: {
        isActive: this.isActive,
      },
    });
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);

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
    return `slds-tabs_default__item ${this.isActive ? 'slds-is-active' : ''}`;
  }
}
