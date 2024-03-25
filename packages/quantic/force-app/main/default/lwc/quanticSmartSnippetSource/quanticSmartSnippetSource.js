import {LinkUtils} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/**
 * The `QuanticSmartSnippetSource` component displays the uri and the title of the smart snippet source.
 * @category Search
 * @example
 *  <c-quantic-smart-snippet-source uri={uri} title={title} actions={actions}></c-quantic-smart-snippet-source>
 * @internal
 */
export default class QuanticSmartSnippetSource extends LightningElement {
  /**
   * The click uri of the smart snippet source.
   * @api
   * @type {string}
   */
  @api uri;
  /**
   * The title of the smart snippet source.
   * @api
   * @type {string}
   */
  @api title;
  /**
   * The actions that need to be bound to the links of the smart snippet source.
   * @api
   * @type {{select: function, beginDelayedSelect: function, cancelPendingSelect: function  }}
   */
  @api actions;

  /** @type {boolean} */
  isInitialRender = true;
  /** @type {function} */
  removeUriBindings;
  /** @type {function} */
  removeTitleBindings;

  renderedCallback() {
    if (this.isInitialRender) {
      this.isInitialRender = false;
      this.bindAnalyticsToSmartSnippetSource();
    }
  }

  disconnectedCallback() {
    this.removeTitleBindings?.();
    this.removeUriBindings?.();
  }

  bindAnalyticsToSmartSnippetSource() {
    /** @type {HTMLAnchorElement} */
    const snippetSourceUrlElement = this.template.querySelector(
      '.smart-snippet__source-uri'
    );
    /** @type {HTMLAnchorElement} */
    const snippetSourceTitleElement = this.template.querySelector(
      '.smart-snippet__source-title'
    );

    if (snippetSourceUrlElement) {
      this.removeUriBindings = LinkUtils.bindAnalyticsToLink(
        snippetSourceUrlElement,
        this.actions
      );
    }
    if (snippetSourceTitleElement) {
      this.removeTitleBindings = LinkUtils.bindAnalyticsToLink(
        snippetSourceTitleElement,
        this.actions
      );
    }
  }
}
