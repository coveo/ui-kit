import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {
  transformMarkdownToHtml,
  loadMarkdownDependencies,
  LinkUtils,
  getAbsoluteHeight,
} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import generatedMarkdownContentTemplate from './templates/generatedMarkdownContent.html';
// @ts-ignore
import generatedTextContentTemplate from './templates/generatedTextContent.html';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").InsightEngine} InsightEngine */

const INLINE_LINK_ICON = `
  <svg
    class="slds-icon answer-content__link-icon-svg"
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 52 52"
  >
    <path d="M48.5 2h-15c-.8 0-1.5.7-1.5 1.5v3c0 .8.7 1.5 1.5 1.5h6.4L22.1 25.8c-.6.6-.6 1.5 0 2.1l2.1 2.1c.6.6 1.5.6 2.1 0L44 12.3v6.2c0 .8.7 1.5 1.5 1.5h3c.8 0 1.5-.7 1.5-1.5v-15c0-.8-.7-1.5-1.5-1.5z"></path>
    <path d="M38 28.5V46H8V16h17.5c.8 0 1.5-.7 1.5-1.5v-3c0-.8-.7-1.5-1.5-1.5H6c-2.2 0-4 1.8-4 4v34c0 2.2 1.8 4 4 4h34c2.2 0 4-1.8 4-4V28.5c0-.8-.7-1.5-1.5-1.5h-3c-.8 0-1.5.7-1.5 1.5z"></path>
  </svg>
`;

/**
 * The `QuanticGeneratedAnswerContent` component displays the generated answer content.
 * @category Internal
 * @fires CustomEvent#quantic__answercontentupdated
 * @example
 * <c-quantic-generated-answer-content answer-content-format={answerContentFormat} answer={answer} is-streaming={isStreaming}></c-quantic-generated-answer-content>
 */
export default class QuanticGeneratedAnswerContent extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The unique identifier of the generated answer.
   * @api
   * @type {string}
   */
  @api answerId;
  /**
   * If the answer is streaming, it will render a blinking cursor at the end of the answer.
   * @api
   * @type {boolean}
   */
  @api isStreaming;
  /**
   * The format of the answer content. Can be either `text/plain` or `text/markdown`.
   * When `text/markdown` is selected, the answer content will be converted from markdown to HTML.
   * @api
   * @type {'text/plain' | 'text/markdown'}
   * @default {'text/plain'}
   */
  @api
  get answerContentFormat() {
    return this._answerContentFormat;
  }
  set answerContentFormat(value) {
    this._answerContentFormat = value;
    if (
      this._answerContentFormat === 'text/markdown' &&
      !this._markdownDependenciesLoaded
    ) {
      this.loadMarkdownDependencies();
    }
  }
  /**
   * The answer content to display.
   * @api
   * @type {string}
   */
  @api
  get answer() {
    return this._answer;
  }
  set answer(value) {
    this._answer = value;
    if (
      this.answerContentFormat === 'text/markdown' &&
      this._markdownDependenciesLoaded
    ) {
      this.updateHtmlContent();
    }
  }

  _answer;
  /** @type {'text/plain' | 'text/markdown'} */
  _answerContentFormat = 'text/plain';
  _markdownDependenciesLoaded = false;
  /** @type {Array<function>} */
  _inlineLinkBindings = [];
  /** @type {AnyHeadless} */
  headless;
  /** @type {SearchEngine | InsightEngine} */
  engine;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine | InsightEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.engine = engine;
  };

  disconnectedCallback() {
    this.cleanUpInlineLinkBindings();
  }

  loadMarkdownDependencies() {
    if (
      !this._markdownDependenciesLoaded &&
      this.answerContentFormat === 'text/markdown'
    ) {
      loadMarkdownDependencies(this)
        .then(() => {
          this._markdownDependenciesLoaded = true;
          this.updateHtmlContent();
        })
        .catch((error) => {
          console.error('Error loading the Marked library.', error);
        });
    }
  }

  updateHtmlContent() {
    const answerContainer = this.template.querySelector(
      '.generated-answer-content__answer'
    );
    if (this._markdownDependenciesLoaded) {
      // Transform the markdown answer to HTML and update the innerHTML of the container
      const newHTMLContent =
        // @ts-ignore
        (window.marked &&
          this.answer &&
          // @ts-ignore
          transformMarkdownToHtml(this.answer, window.marked)) ||
        '';
      if (answerContainer) {
        try {
          // @ts-ignore
          // eslint-disable-next-line @lwc/lwc/no-inner-html
          answerContainer.innerHTML = DOMPurify.sanitize(newHTMLContent);
        } catch (error) {
          // DOMPurify is not compatible with Locker Service, but Locker already sanitizes HTML.
          // eslint-disable-next-line @lwc/lwc/no-inner-html
          answerContainer.innerHTML = newHTMLContent;
        }
        this.processInlineLinks(answerContainer);
      }
    }
    // Fallback to display answer as text if the Marked library failed to load
    else {
      answerContainer.textContent = this.answer;
    }
    this.dispatchEvent(
      new CustomEvent('quantic__answercontentupdated', {
        bubbles: true,
        composed: true,
        detail: {height: getAbsoluteHeight(answerContainer)},
      })
    );
  }

  /**
   * Decorates each inline link with an icon and binds analytics, replacing any previous bindings.
   * @param {Element|null} answerContainer
   */
  processInlineLinks(answerContainer) {
    if (!answerContainer) {
      return;
    }
    this.cleanUpInlineLinkBindings();
    /** @type {NodeListOf<HTMLAnchorElement>} */
    const anchors = answerContainer.querySelectorAll(
      'a[data-answer-inline-link]'
    );
    anchors.forEach((anchor) => {
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      this.bindAnalyticsToInlineLink(anchor);
      this.appendInlineLinkIcon(anchor);
    });
  }

  /**
   * Appends the external link icon to the given anchor.
   * @param {HTMLAnchorElement} anchor
   */
  appendInlineLinkIcon(anchor) {
    const icon = document.createElement('span');
    icon.classList.add(
      'slds-icon_container',
      'slds-icon-utility-new_window',
      'slds-current-color',
      'slds-m-left_xxx-small',
      'answer-content__link-icon'
    );
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    icon.innerHTML = INLINE_LINK_ICON;
    anchor.appendChild(icon);
  }

  /**
   * Creates an `InteractiveGeneratedAnswerInlineLink` controller for the given anchor
   * and binds analytics event listeners to it.
   * @param {HTMLAnchorElement} anchor
   */
  bindAnalyticsToInlineLink(anchor) {
    if (
      !this.headless?.buildInteractiveGeneratedAnswerInlineLink ||
      !this.engine
    ) {
      return;
    }
    const controller = this.headless.buildInteractiveGeneratedAnswerInlineLink(
      this.engine,
      {
        options: {
          link: {
            linkURL: anchor.getAttribute('href') || '',
            linkText: anchor.textContent?.trim() || '',
          },
          answerId: this.answerId,
        },
      }
    );
    this._inlineLinkBindings.push(
      LinkUtils.bindAnalyticsToLink(anchor, controller)
    );
  }

  /**
   * Cleans up all inline link bindings.
   */
  cleanUpInlineLinkBindings() {
    this._inlineLinkBindings.forEach((remove) => remove());
    this._inlineLinkBindings = [];
  }

  get generatedAnswerContentClass() {
    return `generated-answer-content__answer ${this.isStreaming ? 'generated-answer-content__answer--streaming' : ''}`;
  }

  get contentAsText() {
    return this._answer;
  }

  render() {
    return this.answerContentFormat === 'text/markdown'
      ? generatedMarkdownContentTemplate
      : generatedTextContentTemplate;
  }
}
