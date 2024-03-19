import {LinkUtils} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/**
 * The `QuanticSmartSnippetAnswer` component displays the smart snippet answer.
 * @category Search
 * @example
 *  <c-quantic-smart-snippet-answer answer={answer} actions={actions}></c-quantic-smart-snippet-answer>
 * @internal
 */
export default class QuanticSmartSnippetAnswer extends LightningElement {
  /**
   * The smart snippet answer.
   * @api
   * @type {string}
   */
  @api
  get answer() {
    return this._answer;
  }
  set answer(value) {
    this._answer = value;
    if (!this.isInitialRender) {
      this.updateSmartSnippetAnswer();
    }
  }

  /**
   * The actions that need to be bound to the links of the smart snippet source.
   * @api
   * @type {{select: function, beginDelayedSelect: function, cancelPendingSelect: function  }}
   */
  @api actions;

  /** @type {boolean} */
  isInitialRender = true;
  /** @type {string} */
  _answer;
  /**
   * @type {Array<function>}
   */
  bindingsRemovalFunctions = [];

  renderedCallback() {
    this.updateSmartSnippetAnswer();
    this.isInitialRender = false;
  }

  disconnectedCallback() {
    this.bindingsRemovalFunctions.forEach((removeBindings) => {
      removeBindings?.();
    });
  }

  updateSmartSnippetAnswer() {
    const snippetAnswerElement = this.template.querySelector(
      '.smart-snippet-answer'
    );
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    snippetAnswerElement.innerHTML = this?.answer;
    this.bindAnalyticsToSmartSnippetInlineLinks();
  }

  /**
   * Binds the inline links to the proper actions.
   * @returns {void}
   */
  bindAnalyticsToSmartSnippetInlineLinks() {
    const disabledCSSClass = 'inline-link--disabled';
    this.inlineLinks.forEach((link) => {
      link.target = '_blank';
      if (link?.href) {
        const linkInfo = {
          linkText: link?.innerText,
          linkURL: link.href,
        };

        const actions = {
          select: () => {
            this.actions.select(linkInfo);
          },
          beginDelayedSelect: () => {
            this.actions.beginDelayedSelect(linkInfo);
          },
          cancelPendingSelect: () => {
            this.actions.cancelPendingSelect(linkInfo);
          },
        };

        const removeBindings = LinkUtils.bindAnalyticsToLink(link, actions);
        this.bindingsRemovalFunctions.push(removeBindings);
      } else {
        link.classList.add(disabledCSSClass);
      }
    });
  }

  /**
   * Returns the inline links of the smart snippet answer.
   * @returns {HTMLAnchorElement[]}
   */
  get inlineLinks() {
    return Array.from(
      this.template.querySelectorAll('.smart-snippet-answer a')
    );
  }
}
