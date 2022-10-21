import {LightningElement, api, track} from 'lwc';
import {
  getHeadlessBundle,
  getHeadlessEnginePromise,
  HeadlessBundleNames,
  isHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {I18nUtils, getLastFocusableElement} from 'c/quanticUtils';

import close from '@salesforce/label/c.quantic_Close';
import openPreview from '@salesforce/label/c.quantic_OpenPreview';
import noPreview from '@salesforce/label/c.quantic_NoPreviewAvailable';
import openFileForPreview from '@salesforce/label/c.quantic_OpenFileForPreview';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").Quickview} Quickview */
/** @typedef {import("coveo").QuickviewState} QuickviewState */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticResultQuickview` component renders a button which the end user can click to open a modal box containing certain information about a result.
 * @category Result Template
 * @fires CustomEvent#haspreview
 * @example
 * <c-quantic-result-quickview engine-id={engineId} result={result} maximum-preview-size="100" use-case="search"></c-quantic-result-quickview>
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
   * @type {Result}
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
   * @type {undefined|'brand'|'outline-brand'}
   * @defaultValue `undefined`
   */
  @api previewButtonVariant;
  /**
   * Indicates the use case where this quickview component is used.
   * @api
   * @type {'search'|'case-assist'}
   * @deprecated The component uses the same Headless bundle as the interface it is bound to.
   * @defaultValue `'search'`
   */
  @api useCase = 'search';

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
  }

  renderedCallback() {
    if (this.contentContainer && this.state?.resultHasPreview) {
      // eslint-disable-next-line @lwc/lwc/no-inner-html
      this.contentContainer.innerHTML = this.state.content;
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
    this.headless = getHeadlessBundle(this.engineId);
    const options = {
      result: this.result,
      maximumPreviewSize: Number(this.maximumPreviewSize),
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
    this.quickview.fetchResultContent();
    if (!isHeadlessBundle(this.engineId, HeadlessBundleNames.caseAssist)) {
      this.addRecentResult();
    }
    this.sendResultPreviewEvent(true);
  }

  addRecentResult() {
    getHeadlessEnginePromise(this.engineId).then((engine) => {
      const {pushRecentResult} = this.headless.loadRecentResultsActions(engine);
      engine.dispatch(
        pushRecentResult(JSON.parse(JSON.stringify(this.result)))
      );
    });
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
      new CustomEvent('haspreview', {
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

  get isLoading() {
    return this.state?.isLoading;
  }

  get hasNoPreview() {
    return !this.state?.resultHasPreview;
  }

  get hasIcon() {
    return !!this.previewButtonIcon;
  }

  /** @type {HTMLElement} */
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
    return [
      'slds-button',
      this.previewButtonVariant
        ? `slds-button_${this.previewButtonVariant}`
        : 'quickview__button-base',
    ].join(' ');
  }

  get buttonIconClass() {
    return [
      'slds-current-color',
      this.previewButtonLabel && 'slds-button__icon_right',
    ].join(' ');
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
}
