import close from '@salesforce/label/c.quantic_Close';
import noPreview from '@salesforce/label/c.quantic_NoPreviewAvailable';
import openFileForPreview from '@salesforce/label/c.quantic_OpenFileForPreview';
import openPreview from '@salesforce/label/c.quantic_OpenPreview';
import {
  getHeadlessBundle,
  getHeadlessEnginePromise,
  HeadlessBundleNames,
  isHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {I18nUtils, getLastFocusableElement} from 'c/quanticUtils';
import {LightningElement, api, track} from 'lwc';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").Quickview} Quickview */
/** @typedef {import("coveo").QuickviewState} QuickviewState */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * @typedef {Object} ResultWithFolding
 * @mixes Result
 * @property {Result} parentResult
 * @property {Result[]} childResults
 */

/**
 * The `QuanticResultQuickview` component renders a button which the end user can click to open a modal box containing certain information about a result.
 * @category Result Template
 * @fires CustomEvent#quantic__haspreview
 * @example
 * <c-quantic-result-quickview engine-id={engineId} result={result} maximum-preview-size="100" onquantic__haspreview={handleHasPreview}></c-quantic-result-quickview>
 */
export default class QuanticResultQuickview extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The result to retrieve a quickview for.
   * @api
   * @type {ResultWithFolding}
   */
  @api result;
  /**
   * The maximum preview size to retrieve, in bytes. By default, the full preview is retrieved.
   * @api
   * @type {number}
   * @defaultValue `undefined`
   */
  @api maximumPreviewSize;
  /**
   * The icon to be shown in the preview button.
   * @api
   * @type {string}
   * @defaultValue `'utility:preview'`
   */
  @api previewButtonIcon = 'utility:preview';
  /**
   * The label to be shown in the preview button.
   * @api
   * @type {string}
   * @defaultValue `undefined`
   */
  @api previewButtonLabel;
  /**
   * The variant of the preview button.
   * @api
   * @type {undefined|'brand'|'outline-brand'|'result-action'}
   * @defaultValue `undefined`
   */
  @api previewButtonVariant;
  /**
   * The label displayed in the tooltip of the quick view button.
   * @api
   * @type {boolean}
   * @defaultValue `undefined`
   */
  @api tooltip;

  /** @type {QuickviewState} */
  @track state;

  /** @type {Quickview} */
  quickview;
  /** @type {boolean} */
  isQuickviewOpen = false;
  /** @type {Function} */
  unsubscribe;
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  isFirstPreviewRender = true;
  /** @type {string} */
  resultActionOrderClasses;
  /** @type {boolean} */
  _isLoading = false;
  /** @type {AnyHeadless} */
  engine;

  labels = {
    close,
    openPreview,
    noPreview,
    openFileForPreview,
  };

  connectedCallback() {
    getHeadlessEnginePromise(this.engineId)
      .then((engine) => {
        this.initialize(engine);
      })
      .catch((error) => {
        console.error(error.message);
      });

    if (this.isResultAction) {
      const resultActionRegister = new CustomEvent(
        'quantic__resultactionregister',
        {
          bubbles: true,
          composed: true,
          detail: {
            applyCssOrderClass: this.applyCssOrderClass,
          },
        }
      );
      this.dispatchEvent(resultActionRegister);
    }
  }

  renderedCallback() {
    if (this.contentContainer && this.state?.resultHasPreview) {
      if (this.isQuickviewOpen && this.isFirstPreviewRender) {
        this.isFirstPreviewRender = false;
        this.setFocusToHeader();
      }
    }
    this.injectIdToSlots();
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    this.headless = getHeadlessBundle(this.engineId);
    const options = {
      result: this.result,
      maximumPreviewSize: Number(this.maximumPreviewSize),
      onlyContentURL: true,
    };
    this.quickview = this.headless.buildQuickview(engine, {options});
    this.unsubscribe = this.quickview.subscribe(() => this.updateState());

    this.dispatchHasPreview(this.quickview.state.resultHasPreview);
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = this.quickview?.state;
  }

  openQuickview() {
    this.isQuickviewOpen = true;
    this._isLoading = true;
    if (isHeadlessBundle(this.engineId, HeadlessBundleNames.search)) {
      this.addRecentResult();
    }
    this.quickview.fetchResultContent();
    this.sendResultPreviewEvent(true);
  }

  addRecentResult() {
    const {pushRecentResult} = this.headless.loadRecentResultsActions(
      this.engine
    );

    // Exclude parentResult and childResults to prevent Salesforce Proxy extensibility errors.
    // These nested result objects remain proxied after spreading, causing 'isExtensible' trap violations when accessed by the Headless library.
    // eslint-disable-next-line no-unused-vars
    const {parentResult, childResults, ...result} = this.result;
    this.engine.dispatch(pushRecentResult({...result, raw: {...result.raw}}));
  }

  closeQuickview() {
    this.isQuickviewOpen = false;
    this.isFirstPreviewRender = true;
    this.sendResultPreviewEvent(false);
  }

  stopPropagation(evt) {
    evt.stopPropagation();
  }

  dispatchHasPreview(hasPreview) {
    this.dispatchEvent(
      new CustomEvent('quantic__haspreview', {
        detail: {
          hasPreview,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  injectIdToSlots() {
    const slots = this.template.querySelectorAll('slot');
    slots.forEach((slot) => {
      let slotContent = slot;
      while (slotContent?.tagName === 'SLOT') {
        // @ts-ignore
        slotContent = slotContent.assignedNodes()[0];
      }
      if (slotContent) {
        slotContent.dataset.id = this.result.uniqueId;
      }
    });
  }

  handleLoadingStateChange(event) {
    event.stopPropagation();
    this._isLoading = false;
  }

  showTooltip() {
    this.tooltipComponent?.showTooltip();
  }

  hideTooltip() {
    this.tooltipComponent?.hideTooltip();
  }

  /**
   * @returns {Object}
   */
  get tooltipComponent() {
    return this.template.querySelector('c-quantic-tooltip');
  }

  get contentURL() {
    return this.state.contentURL?.includes(
      encodeURIComponent(this.result.uniqueId)
    )
      ? this.state.contentURL
      : undefined;
  }

  get isLoading() {
    return this._isLoading;
  }

  get hasNoPreview() {
    return !this.state?.resultHasPreview;
  }

  get hasIcon() {
    return !!this.previewButtonIcon;
  }

  /** @type {HTMLIFrameElement} */
  get contentContainer() {
    return this.template.querySelector('.quickview__content-container');
  }

  get backdropClass() {
    return `slds-backdrop ${this.isQuickviewOpen ? 'slds-backdrop_open' : ''}`;
  }

  get buttonLabel() {
    return this.hasNoPreview ? this.labels.noPreview : this.labels.openPreview;
  }

  get buttonClass() {
    let variantClass = 'quickview__button-base';
    if (this.isResultAction) {
      variantClass = `slds-button_icon-border-filled ${this.resultActionOrderClasses}`;
    } else if (this.previewButtonVariant) {
      variantClass = `slds-button_${this.previewButtonVariant}`;
    }
    return ['slds-button', variantClass].join(' ');
  }

  get buttonIconClass() {
    return [
      'slds-current-color',
      this.previewButtonLabel && 'slds-button__icon_right',
    ].join(' ');
  }

  get buttonContainerClass() {
    return `slds-is-relative slds-show_inline result-action_container ${
      this.isResultAction ? 'result-action_white-container' : ''
    }`;
  }

  get buttonAriaLabelValue() {
    return I18nUtils.format(this.labels.openFileForPreview, this.result.title);
  }

  get hasButtonLabel() {
    return !!this.previewButtonLabel;
  }

  setFocusToHeader() {
    const focusTarget = this.template.querySelector('c-quantic-result-link');

    if (focusTarget) {
      // @ts-ignore
      focusTarget.setFocus();
    }
  }

  setFocusToTop() {
    /** @type {HTMLElement} */
    const focusTarget = this.template.querySelector(
      `.slds-button.slds-button_icon`
    );

    if (focusTarget) {
      focusTarget.focus();
    }
  }

  /**
   * @param {KeyboardEvent} evt
   */
  onCloseKeyDown(evt) {
    if (evt.shiftKey && evt.code === 'Tab') {
      evt.preventDefault();
      const lastFocusableElement =
        this.lastFocusableElementInFooterSlot ||
        this.lastFocusableElementInQuickview;
      if (lastFocusableElement) {
        lastFocusableElement.focus();
      } else {
        this.setFocusToHeader();
      }
    }
  }

  get lastFocusableElementInFooterSlot() {
    /** @type {HTMLElement} */
    const footerSlot = this.template.querySelector('slot[name=footer]');
    if (footerSlot) {
      const lastElement = getLastFocusableElement(footerSlot);
      if (lastElement) return lastElement;
    }
    return null;
  }

  get lastFocusableElementInQuickview() {
    const element = this.contentContainer;
    if (element) {
      const lastElement = getLastFocusableElement(element);
      return lastElement;
    }
    return null;
  }

  /**
   * Sends the "quantic__resultpreviewtoggle" event.
   * @param {boolean} isOpen
   */
  sendResultPreviewEvent(isOpen) {
    const resultPreviewEvent = new CustomEvent('quantic__resultpreviewtoggle', {
      composed: true,
      bubbles: true,
      detail: {
        isOpen,
        ...(isOpen && {resultId: this.result.uniqueId}),
      },
    });
    this.dispatchEvent(resultPreviewEvent);
  }

  /**
   * Applies the proper CSS order class.
   * This method is inspired from how the lightning-button-group component works:
   * https://github.com/salesforce/base-components-recipes/blob/master/force-app/main/default/lwc/buttonGroup/buttonGroup.js
   * @param {'first' | 'middle' | 'last'} order
   */
  applyCssOrderClass = (order) => {
    const commonButtonClass = 'result-action_button';
    let orderClass = '';

    if (order === 'first') {
      orderClass = 'result-action_first';
    } else if (order === 'middle') {
      orderClass = 'result-action_middle';
    } else if (order === 'last') {
      orderClass = 'result-action_last';
    }
    this.resultActionOrderClasses = orderClass
      ? `${commonButtonClass} ${orderClass}`
      : commonButtonClass;
  };

  get buttonTitle() {
    return this.tooltip ? null : this.buttonLabel;
  }

  /**
   * Indicates whether the quickview button is used as a result action.
   * @return {boolean}
   */
  get isResultAction() {
    return this.previewButtonVariant === 'result-action';
  }
}
